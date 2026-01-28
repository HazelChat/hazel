import type { ConfigError } from "effect"
import { Config, Effect, Fiber, Layer, Metric, Schedule, type Scope } from "effect"
import {
	createEventLogContext,
	generateEventId,
	withLogContext,
	type BotIdentity,
	type EventId,
} from "../log-context.ts"
import { composeMiddleware, type Middleware } from "../middleware.ts"
import type { EventOperation, EventType } from "../types/events.ts"
import type { EventHandler, EventHandlerRegistry } from "../types/handlers.ts"
import { ElectricEventQueue } from "./electric-event-queue.ts"

/**
 * Configuration for event dispatcher
 */
export interface EventDispatcherConfig {
	/**
	 * Maximum number of retry attempts for failed handlers
	 * @default 3
	 */
	readonly maxRetries: number

	/**
	 * Base delay for exponential backoff (in milliseconds)
	 * @default 100
	 */
	readonly retryBaseDelay: number

	/**
	 * Middleware to apply to all handlers
	 * @default []
	 */
	readonly middleware?: readonly Middleware[]

	/**
	 * Maximum concurrent handler executions per event type
	 * Use "unbounded" for unlimited concurrency (not recommended for production)
	 * @default 10
	 */
	readonly maxConcurrentHandlers?: number | "unbounded"

	/**
	 * Bot identity for log context (optional)
	 * If provided, enables rich correlation logging with bot ID and name
	 */
	readonly botIdentity?: BotIdentity
}

/**
 * Default dispatcher configuration
 */
export const defaultEventDispatcherConfig: EventDispatcherConfig = {
	maxRetries: 3,
	retryBaseDelay: 100,
	maxConcurrentHandlers: 10,
}

/**
 * Metrics for event dispatcher
 */
const handlerExecutionsCounter = Metric.counter("bot_handler_executions")
const handlerFailuresCounter = Metric.counter("bot_handler_failures")
const handlerRetriesCounter = Metric.counter("bot_handler_retries")

/**
 * Service that dispatches events to registered handlers
 */
export class EventDispatcher extends Effect.Service<EventDispatcher>()("EventDispatcher", {
	accessors: true,
	effect: Effect.fn(function* (config: EventDispatcherConfig) {
		const queue = yield* ElectricEventQueue

		// Registry of event handlers (Map-based for dynamic event types)
		const registry: EventHandlerRegistry = new Map()

		// Retry policy with exponential backoff and metrics
		const retryPolicy = Schedule.exponential(config.retryBaseDelay).pipe(
			Schedule.intersect(Schedule.recurs(config.maxRetries)),
			Schedule.tapOutput((attempt) =>
				Effect.gen(function* () {
					if (typeof attempt === "number" && attempt > 0) {
						yield* Metric.increment(handlerRetriesCounter)
					}
				}),
			),
		)

		// Resolve concurrency setting
		const concurrency = config.maxConcurrentHandlers ?? 10

		// Helper to get or create handler set for an event type
		const getHandlers = (eventType: EventType): Set<EventHandler<any, any, any>> => {
			let handlers = registry.get(eventType)
			if (!handlers) {
				handlers = new Set()
				registry.set(eventType, handlers)
			}
			return handlers
		}

		// Compose all middleware
		const composedMiddleware = composeMiddleware(config.middleware || [])

		// Extract table and operation from eventType (e.g., "messages.insert" -> table="messages", operation="insert")
		const parseEventType = (eventType: EventType): { table: string; operation: EventOperation } => {
			const [table, operation] = eventType.split(".") as [string, EventOperation]
			return { table, operation }
		}

		// Helper to dispatch event to handlers
		const dispatchToHandlers = (eventType: EventType, value: any, eventId: EventId) =>
			Effect.gen(function* () {
				const handlers = registry.get(eventType)
				if (!handlers || handlers.size === 0) {
					return
				}

				const handlerCount = handlers.size
				yield* Effect.logDebug("Dispatching event to handlers", {
					eventType,
					eventId,
					handlerCount,
				}).pipe(Effect.annotateLogs("service", "EventDispatcher"))

				// Create log context if bot identity is available
				const { table, operation } = parseEventType(eventType)
				const logContext = config.botIdentity
					? createEventLogContext({
							...config.botIdentity,
							eventId,
							eventType,
							table,
							operation,
						})
					: null

				// Execute all handlers with bounded concurrency
				yield* Effect.forEach(
					Array.from(handlers),
					(handler) => {
						// Wrap handler with middleware
						const wrappedHandler = composedMiddleware(
							value,
							eventType,
							handler(value) as Effect.Effect<void, any, never>,
						)

						const handlerEffect = wrappedHandler.pipe(
							Effect.tap(() => Metric.increment(handlerExecutionsCounter)),
							Effect.retry(retryPolicy),
							Effect.catchAllCause((cause) =>
								Effect.gen(function* () {
									yield* Metric.increment(handlerFailuresCounter).pipe(
										Effect.tagMetrics("event_type", eventType),
									)
									yield* Effect.logError("Handler failed after retries", {
										cause,
										eventType,
										eventId,
									}).pipe(Effect.annotateLogs("service", "EventDispatcher"))
								}),
							),
						)

						// Wrap with log context if available
						return logContext
							? withLogContext(logContext, "bot.event.handle", handlerEffect)
							: handlerEffect.pipe(
									Effect.withSpan("bot.event.handle", {
										attributes: { eventType, eventId },
									}),
								)
					},
					{ concurrency },
				)
			}) as Effect.Effect<void, never>

		// Helper to start consuming events for a specific event type
		const consumeEvents = (eventType: EventType): Effect.Effect<void, never, Scope.Scope> =>
			Effect.gen(function* () {
				yield* Effect.logDebug(`Starting event consumer`, { eventType }).pipe(
					Effect.annotateLogs("service", "EventDispatcher"),
				)

				// Continuously take events from queue and dispatch
				const fiber = yield* Effect.forkScoped(
					Effect.forever(
						Effect.gen(function* () {
							// Take next event (blocks until available)
							const event = yield* queue.take(eventType).pipe(
								Effect.catchAll((error) =>
									Effect.gen(function* () {
										yield* Effect.logError("Failed to take event from queue", {
											error,
											eventType,
										}).pipe(Effect.annotateLogs("service", "EventDispatcher"))
										// Wait a bit before retrying
										yield* Effect.sleep(1000)
										// Return null to skip this iteration
										return null as any
									}),
								),
							)

							if (!event) {
								return
							}

							// Generate event ID for correlation
							const eventId = generateEventId()

							// Dispatch to handlers based on event type
							yield* dispatchToHandlers(eventType, event.value, eventId).pipe(
								Effect.withSpan("bot.event.dispatch", {
									attributes: { eventType, eventId },
								}),
							)
						}),
					),
				)

				// Interrupt fiber on scope close
				yield* Effect.addFinalizer(() =>
					Effect.gen(function* () {
						yield* Effect.logDebug(`Stopping event consumer`, { eventType }).pipe(
							Effect.annotateLogs("service", "EventDispatcher"),
						)
						yield* Fiber.interrupt(fiber)
					}),
				)
			})

		return {
			/**
			 * Register a generic event handler for a specific event type
			 */
			on: <A, E, R>(eventType: EventType, handler: EventHandler<A, E, R>) =>
				Effect.sync(() => {
					getHandlers(eventType).add(handler as EventHandler<any, any, any>)
				}),

			/**
			 * Unregister a handler for a specific event type
			 */
			off: <A, E, R>(eventType: EventType, handler: EventHandler<A, E, R>) =>
				Effect.sync(() => {
					const handlers = registry.get(eventType)
					if (handlers) {
						handlers.delete(handler as EventHandler<any, any, any>)
					}
				}),

			/**
			 * Start the event dispatcher - begins consuming events for all registered handlers
			 */
			start: Effect.gen(function* () {
				// Start consumers for all registered event types
				const eventTypes = Array.from(registry.keys())

				if (eventTypes.length === 0) {
					yield* Effect.logWarning("No handlers registered, dispatcher has nothing to do").pipe(
						Effect.annotateLogs("service", "EventDispatcher"),
					)
					return
				}

				// Count total handlers across all event types
				const totalHandlers = eventTypes.reduce((sum, eventType) => {
					const handlers = registry.get(eventType)
					return sum + (handlers?.size ?? 0)
				}, 0)

				yield* Effect.logInfo("Starting event dispatcher", {
					eventTypesCount: eventTypes.length,
					totalHandlers,
					concurrency: concurrency === "unbounded" ? "unbounded" : concurrency,
				}).pipe(Effect.annotateLogs("service", "EventDispatcher"))

				yield* Effect.forEach(eventTypes, consumeEvents, {
					concurrency: "unbounded",
				})

				yield* Effect.logDebug(`Event consumers started for all event types`, {
					eventTypes: eventTypes.join(", "),
				}).pipe(Effect.annotateLogs("service", "EventDispatcher"))
			}),

			/**
			 * Get registered event types
			 */
			registeredEventTypes: Effect.sync(() => Array.from(registry.keys())),

			/**
			 * Get handler count for an event type
			 */
			handlerCount: (eventType: EventType) =>
				Effect.sync(() => {
					const handlers = registry.get(eventType)
					return handlers ? handlers.size : 0
				}),
		}
	}),
}) {
	/**
	 * Create a layer from Effect Config
	 */
	static readonly layerConfig = (
		config: Config.Config.Wrap<EventDispatcherConfig>,
	): Layer.Layer<EventDispatcher, ConfigError.ConfigError, ElectricEventQueue> =>
		Layer.unwrapEffect(Config.unwrap(config).pipe(Effect.map((cfg) => EventDispatcher.Default(cfg))))
}

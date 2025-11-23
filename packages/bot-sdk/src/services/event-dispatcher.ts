import { Config, Effect, Fiber, Layer, Schedule, type Scope } from "effect"
import type { ConfigError } from "effect"
import { HandlerError } from "../errors.ts"
import type { EventType } from "../types/events.ts"
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
}

/**
 * Default dispatcher configuration
 */
export const defaultEventDispatcherConfig: EventDispatcherConfig = {
	maxRetries: 3,
	retryBaseDelay: 100,
}

/**
 * Service that dispatches events to registered handlers
 */
export class EventDispatcher extends Effect.Service<EventDispatcher>()("EventDispatcher", {
	accessors: true,
	effect: Effect.fn(function* (config: EventDispatcherConfig) {
		const queue = yield* ElectricEventQueue

		// Registry of event handlers (Map-based for dynamic event types)
		const registry: EventHandlerRegistry = new Map()

		// Retry policy with exponential backoff
		const retryPolicy = Schedule.exponential(config.retryBaseDelay).pipe(
			Schedule.intersect(Schedule.recurs(config.maxRetries)),
		)

		// Helper to get or create handler set for an event type
		const getHandlers = (eventType: EventType): Set<EventHandler<any, any>> => {
			let handlers = registry.get(eventType)
			if (!handlers) {
				handlers = new Set()
				registry.set(eventType, handlers)
			}
			return handlers
		}

		// Helper to dispatch event to handlers
		const dispatchToHandlers = (eventType: EventType, value: any) =>
			Effect.gen(function* () {
				const handlers = registry.get(eventType)
				if (!handlers || handlers.size === 0) {
					return
				}

				// Execute all handlers in parallel
				yield* Effect.forEach(
					Array.from(handlers),
					(handler) =>
						handler(value).pipe(
							Effect.retry(retryPolicy),
							Effect.catchAllCause((cause) =>
								Effect.logError("Handler failed after retries", {
									cause,
									eventType,
								}),
							),
						),
					{ concurrency: "unbounded" },
				)
			}) as Effect.Effect<void, never>

		// Helper to start consuming events for a specific event type
		const consumeEvents = (eventType: EventType): Effect.Effect<void, never, Scope.Scope> =>
			Effect.gen(function* () {
				yield* Effect.log(`Starting event consumer for: ${eventType}`)

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
										})
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

							// Dispatch to handlers based on event type
							yield* dispatchToHandlers(eventType, event.value)
						}),
					),
				)

				// Interrupt fiber on scope close
				yield* Effect.addFinalizer(() =>
					Effect.gen(function* () {
						yield* Effect.log(`Stopping event consumer for: ${eventType}`)
						yield* Fiber.interrupt(fiber)
					}),
				)
			})

		return {
			/**
			 * Register a generic event handler for a specific event type
			 */
			on: <A, R>(eventType: EventType, handler: EventHandler<A, R>) =>
				Effect.sync(() => {
					getHandlers(eventType).add(handler as EventHandler<any, any>)
				}),

			/**
			 * Start the event dispatcher - begins consuming events for all registered handlers
			 */
			start: Effect.gen(function* () {
				yield* Effect.log("Starting event dispatcher")

				// Start consumers for all registered event types
				const eventTypes = Array.from(registry.keys())

				if (eventTypes.length === 0) {
					yield* Effect.logWarning("No handlers registered, dispatcher has nothing to do")
					return
				}

				yield* Effect.forEach(eventTypes, consumeEvents, {
					concurrency: "unbounded",
				})

				yield* Effect.log(`Event dispatcher started for ${eventTypes.length} event types`)
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
		Layer.unwrapEffect(
			Config.unwrap(config).pipe(Effect.map((cfg) => EventDispatcher.Default(cfg))),
		)
}

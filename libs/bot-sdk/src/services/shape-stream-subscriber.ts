import { isChangeMessage, type ChangeMessage, type Message, ShapeStream } from "@electric-sql/client"
import type { ConfigError } from "effect"
import { Config, Effect, Layer, Metric, Option, Schema, Stream } from "effect"
import { ConnectionError, ValidationError } from "../errors.ts"
import { generateEventId } from "../log-context.ts"
import { RetryStrategy } from "../retry.ts"
import { createElectricEvent, type EventOperation } from "../types/events.ts"
import { ElectricEventQueue } from "./electric-event-queue.ts"

/**
 * Configuration for a shape stream subscription
 */
export interface ShapeSubscriptionConfig<A = any, I = any, R = never> {
	/**
	 * Table name to subscribe to
	 */
	readonly table: string

	/**
	 * Schema for runtime validation and type safety
	 */
	readonly schema: Schema.Schema<A, I, R>

	/**
	 * Optional WHERE clause for filtering
	 */
	readonly where?: string

	/**
	 * Optional column selection
	 */
	readonly columns?: readonly string[]

	/**
	 * Start from current position (ignore historical data)
	 * @default true
	 */
	readonly startFromNow?: boolean
}

export interface ShapeStreamSubscriberConfig {
	readonly electricUrl: string

	readonly botToken: string

	readonly subscriptions: readonly ShapeSubscriptionConfig[]
}

/**
 * Create an authenticated fetch client for Electric SQL
 */
const createAuthenticatedFetch = (botToken: string) =>
	Object.assign(
		(input: string | URL | Request, init?: RequestInit) =>
			fetch(input, {
				...init,
				headers: {
					...init?.headers,
					Authorization: `Bearer ${botToken}`,
				},
			}),
		{ preconnect: fetch.preconnect },
	)

/**
 * Metrics for shape stream subscriber
 */
const validationErrorsCounter = Metric.counter("bot_schema_validation_errors")
const eventsReceivedCounter = Metric.counter("bot_shape_stream_events_received")

/**
 * Service that subscribes to Electric SQL shape streams
 */
export class ShapeStreamSubscriber extends Effect.Service<ShapeStreamSubscriber>()("ShapeStreamSubscriber", {
	accessors: true,
	effect: Effect.fn(function* (config: ShapeStreamSubscriberConfig) {
		const queue = yield* ElectricEventQueue

		/**
		 * Create a scoped ShapeStream resource using Effect.acquireRelease
		 */
		const acquireShapeStream = (subscription: ShapeSubscriptionConfig) =>
			Effect.acquireRelease(
				Effect.gen(function* () {
					yield* Effect.logDebug(`Creating shape stream`, {
						table: subscription.table,
						where: subscription.where,
						columns: subscription.columns?.join(", "),
					}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

					const stream = new ShapeStream({
						url: config.electricUrl,
						params: {
							table: subscription.table,
							...(subscription.where && { where: subscription.where }),
							...(subscription.columns && { columns: subscription.columns as string[] }),
						},
						offset: subscription.startFromNow !== false ? "now" : undefined,
						fetchClient: createAuthenticatedFetch(config.botToken),
					})

					return stream
				}).pipe(
					Effect.retry(RetryStrategy.connectionErrors),
					Effect.catchAll((error) =>
						Effect.fail(
							new ConnectionError({
								message: `Failed to create shape stream for table: ${subscription.table}`,
								service: "electric",
								cause: error,
							}),
						),
					),
				),
				(stream) =>
					Effect.gen(function* () {
						yield* Effect.logDebug(`Releasing shape stream`, {
							table: subscription.table,
						}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))
						yield* Effect.sync(() => stream.unsubscribeAll())
					}),
			)

		/**
		 * Convert a ShapeStream to an Effect Stream
		 */
		const shapeStreamToEffectStream = (
			shapeStream: ShapeStream,
			table: string,
		): Stream.Stream<Message, never> =>
			Stream.async<Message>((emit) => {
				const unsubscribe = shapeStream.subscribe((messages) => {
					for (const message of messages) {
						emit.single(message)
					}
				})
				// Note: cleanup is handled by acquireRelease, not here
				return Effect.sync(() => unsubscribe())
			})

		/**
		 * Validate and transform a message using the subscription schema
		 * Expects a ChangeMessage (filtered upstream)
		 */
		const validateAndTransform = (subscription: ShapeSubscriptionConfig, message: ChangeMessage<any>) =>
			Effect.gen(function* () {
				// Generate event ID for correlation
				const eventId = generateEventId()
				const operation = message.headers.operation as EventOperation

				// Log at DEBUG level with event details
				yield* Effect.logDebug("Shape event received", {
					table: subscription.table,
					operation,
					eventId,
				}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

				// Track received events
				yield* Metric.increment(eventsReceivedCounter).pipe(
					Effect.tagMetrics("table", subscription.table),
				)

				// Validate using schema with typed error handling
				const parseResult = yield* Schema.decodeUnknown(subscription.schema)(message.value).pipe(
					Effect.mapError(
						(error) =>
							new ValidationError({
								message: error.message,
								table: subscription.table,
								cause: error,
							}),
					),
				)

				// Create immutable event using Data.Class factory
				const event = createElectricEvent({
					operation,
					table: subscription.table,
					value: parseResult,
				})

				yield* queue.offer(event)
			}).pipe(
				Effect.withSpan("bot.shapeStream.event", {
					attributes: {
						table: subscription.table,
						operation: message.headers.operation,
					},
				}),
			)

		/**
		 * Handle validation errors with proper logging and metrics
		 */
		const handleValidationError = Effect.fn("ShapeStreamSubscriber.handleValidationError")(function* (
			error: ValidationError,
		) {
			yield* Effect.logWarning("Schema validation failed, skipping message", {
				table: error.table,
				error: error.message,
			}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

			yield* Metric.increment(validationErrorsCounter).pipe(Effect.tagMetrics("table", error.table))
		})

		/**
		 * Process a single subscription stream
		 */
		const processSubscription = (subscription: ShapeSubscriptionConfig) =>
			Effect.gen(function* () {
				const shapeStream = yield* acquireShapeStream(subscription)

				yield* Effect.logInfo(`Shape stream subscription active`, {
					table: subscription.table,
				}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

				yield* shapeStreamToEffectStream(shapeStream, subscription.table).pipe(
					Stream.filter(isChangeMessage),
					Stream.mapEffect((message) =>
						validateAndTransform(subscription, message).pipe(
							// Handle validation errors gracefully - log and continue
							Effect.catchTag("ValidationError", (error) =>
								handleValidationError(error).pipe(Effect.as(Option.none())),
							),
							Effect.map(Option.some),
						),
					),
					// Filter out None values (validation failures)
					Stream.filterMap((option) => option),
					Stream.runDrain,
				)
			}).pipe(Effect.scoped)

		return {
			/**
			 * Start shape stream subscriptions, optionally filtered to only required tables.
			 * If no filter is provided, all configured subscriptions are started.
			 * If an empty set is provided, no streams are opened (useful for command-only bots).
			 */
			start: (requiredTables?: ReadonlySet<string>) =>
				Effect.gen(function* () {
					const activeSubscriptions = requiredTables
						? config.subscriptions.filter((s) => requiredTables.has(s.table))
						: config.subscriptions

					// Log which tables were filtered out
					if (requiredTables) {
						const skippedTables = config.subscriptions
							.filter((s) => !requiredTables.has(s.table))
							.map((s) => s.table)
						if (skippedTables.length > 0) {
							yield* Effect.logInfo(`Skipping shape streams for unused tables`, {
								skippedTables: skippedTables.join(", "),
							}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))
						}
					}

					if (activeSubscriptions.length === 0) {
						yield* Effect.logWarning(
							"No shape stream subscriptions to start (no event handlers registered for any table)",
						).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))
						return
					}

					yield* Effect.logInfo(`Starting shape stream subscriptions`, {
						tablesCount: activeSubscriptions.length,
						tables: activeSubscriptions.map((s) => s.table).join(", "),
					}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

					// Start each subscription in a forked fiber
					yield* Effect.forEach(
						activeSubscriptions,
						(subscription) => Effect.forkScoped(processSubscription(subscription)),
						{ concurrency: "unbounded" },
					)

					yield* Effect.logInfo("All shape stream subscriptions started successfully").pipe(
						Effect.annotateLogs("service", "ShapeStreamSubscriber"),
					)
				}),
		}
	}),
}) {
	/**
	 * Create a layer from Effect Config
	 */
	static readonly layerConfig = (
		config: Config.Config.Wrap<ShapeStreamSubscriberConfig>,
	): Layer.Layer<ShapeStreamSubscriber, ConfigError.ConfigError, ElectricEventQueue> =>
		Layer.unwrapEffect(
			Config.unwrap(config).pipe(Effect.map((cfg) => ShapeStreamSubscriber.Default(cfg))),
		)
}

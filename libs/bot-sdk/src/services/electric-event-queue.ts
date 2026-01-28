import type { ConfigError } from "effect"
import { Config, Effect, Layer, Metric, Option, Queue, Ref } from "effect"
import { QueueError } from "../errors.ts"
import { generateCorrelationId } from "../log-context.ts"
import type { ElectricEvent, EventType } from "../types/events.ts"

/**
 * Configuration for the event queue
 */
export interface EventQueueConfig {
	/**
	 * Maximum number of events to buffer per event type
	 * @default 1000
	 */
	readonly capacity: number

	/**
	 * Strategy when queue is full
	 * - "drop-oldest": Remove oldest event and add new one
	 * - "drop-newest": Ignore new event
	 * - "sliding": Use sliding queue (drops oldest automatically)
	 * @default "sliding"
	 */
	readonly backpressureStrategy: "drop-oldest" | "drop-newest" | "sliding"
}

/**
 * Default queue configuration
 */
export const defaultEventQueueConfig: EventQueueConfig = {
	capacity: 1000,
	backpressureStrategy: "sliding",
}

/**
 * Metrics for event queue
 */
const droppedEventsCounter = Metric.counter("bot_queue_events_dropped")
const enqueuedEventsCounter = Metric.counter("bot_queue_events_enqueued")
const dequeuedEventsCounter = Metric.counter("bot_queue_events_dequeued")
const queueSizeGauge = Metric.gauge("bot_queue_size")

/**
 * Service that manages Effect queues for different event types
 * Uses immutable Ref for queue storage and proper cleanup on scope finalization
 */
export class ElectricEventQueue extends Effect.Service<ElectricEventQueue>()("ElectricEventQueue", {
	accessors: true,
	scoped: Effect.fn(function* (config: EventQueueConfig) {
		// Use Ref for immutable queue storage
		const queuesRef = yield* Ref.make(new Map<EventType, Queue.Queue<ElectricEvent>>())

		// Register cleanup on scope finalization
		yield* Effect.addFinalizer(() =>
			Effect.gen(function* () {
				const queues = yield* Ref.get(queuesRef)

				yield* Effect.logDebug(`Shutting down all queues`, {
					queueCount: queues.size,
				}).pipe(Effect.annotateLogs("service", "ElectricEventQueue"))

				// Shutdown all queues
				yield* Effect.forEach(Array.from(queues.values()), Queue.shutdown, {
					concurrency: "unbounded",
				})

				// Clear the ref
				yield* Ref.set(queuesRef, new Map())

				yield* Effect.logDebug("All queues shutdown successfully").pipe(
					Effect.annotateLogs("service", "ElectricEventQueue"),
				)
			}),
		)

		// Helper to get event type from event using the new Data.Class getter
		const getEventTypeFromEvent = (event: ElectricEvent): EventType => event.eventType

		// Helper to get or create queue for event type
		const getQueue = (eventType: EventType): Effect.Effect<Queue.Queue<ElectricEvent>, QueueError> =>
			Effect.gen(function* () {
				const queues = yield* Ref.get(queuesRef)
				const existing = queues.get(eventType)

				if (existing) {
					return existing
				}

				yield* Effect.logDebug(`Creating queue`, {
					eventType,
					capacity: config.capacity,
					backpressureStrategy: config.backpressureStrategy,
				}).pipe(Effect.annotateLogs("service", "ElectricEventQueue"))

				const queue = yield* (
					config.backpressureStrategy === "sliding"
						? Queue.sliding<ElectricEvent>(config.capacity)
						: Queue.bounded<ElectricEvent>(config.capacity)
				).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new QueueError({
								message: `Failed to create queue for event type: ${eventType}`,
								cause: error,
							}),
						),
					),
				)

				// Update the ref with the new queue
				yield* Ref.update(queuesRef, (map) => {
					const newMap = new Map(map)
					newMap.set(eventType, queue)
					return newMap
				})

				return queue
			})

		// Helper to update queue size metric
		const updateQueueSizeMetric = (queue: Queue.Queue<ElectricEvent>, eventType: EventType) =>
			Effect.gen(function* () {
				const size = yield* Queue.size(queue)
				yield* Metric.set(queueSizeGauge, size).pipe(Effect.tagMetrics("event_type", eventType))
			})

		return {
			/**
			 * Offer an event to the appropriate queue based on its event type
			 */
			offer: Effect.fn(function* (event: ElectricEvent) {
				const eventType = getEventTypeFromEvent(event)
				const queue = yield* getQueue(eventType)

				// Offer to queue
				const offered = yield* Queue.offer(queue, event).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new QueueError({
								message: `Failed to offer event to queue: ${eventType}`,
								cause: error,
							}),
						),
					),
				)

				// Handle backpressure for bounded queues with drop-oldest strategy
				if (!offered && config.backpressureStrategy === "drop-oldest") {
					// Generate correlation ID for tracking this backpressure event
					const correlationId = generateCorrelationId()

					yield* Effect.logWarning(`Queue full, dropping oldest event`, {
						eventType,
						correlationId,
						capacity: config.capacity,
					}).pipe(Effect.annotateLogs("service", "ElectricEventQueue"))

					yield* Metric.increment(droppedEventsCounter).pipe(
						Effect.tagMetrics("event_type", eventType),
					)

					// Take one from queue and try again
					yield* Queue.take(queue).pipe(Effect.ignore)
					yield* Queue.offer(queue, event).pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new QueueError({
									message: `Failed to offer event after dropping oldest: ${eventType}`,
									cause: error,
								}),
							),
						),
					)
				}

				// Track enqueued events
				yield* Metric.increment(enqueuedEventsCounter).pipe(
					Effect.tagMetrics("event_type", eventType),
				)

				// Update queue size gauge
				yield* updateQueueSizeMetric(queue, eventType)
			}),

			/**
			 * Take the next event from the queue (blocks until available)
			 */
			take: (eventType: EventType) =>
				Effect.gen(function* () {
					const queue = yield* getQueue(eventType)
					const event = yield* Queue.take(queue).pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new QueueError({
									message: `Failed to take event from queue: ${eventType}`,
									cause: error,
								}),
							),
						),
					)

					// Track dequeued events
					yield* Metric.increment(dequeuedEventsCounter).pipe(
						Effect.tagMetrics("event_type", eventType),
					)

					// Update queue size gauge
					yield* updateQueueSizeMetric(queue, eventType)

					return event
				}),

			/**
			 * Poll for an event without blocking (returns Option)
			 */
			poll: (eventType: EventType) =>
				Effect.gen(function* () {
					const queue = yield* getQueue(eventType)
					const result = yield* Queue.poll(queue).pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new QueueError({
									message: `Failed to poll event from queue: ${eventType}`,
									cause: error,
								}),
							),
						),
					)

					// Use Option.match for cleaner handling
					return Option.match(result, {
						onNone: () => null,
						onSome: (event) => event,
					})
				}),

			/**
			 * Get the current size of a queue
			 */
			size: (eventType: EventType) =>
				Effect.gen(function* () {
					const queue = yield* getQueue(eventType)
					return yield* Queue.size(queue).pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new QueueError({
									message: `Failed to get queue size: ${eventType}`,
									cause: error,
								}),
							),
						),
					)
				}),

			/**
			 * Get all registered event types
			 */
			eventTypes: Effect.gen(function* () {
				const queues = yield* Ref.get(queuesRef)
				return Array.from(queues.keys())
			}),
		}
	}),
}) {
	/**
	 * Create a layer from Effect Config
	 */
	static readonly layerConfig = (
		config: Config.Config.Wrap<EventQueueConfig>,
	): Layer.Layer<ElectricEventQueue, ConfigError.ConfigError> =>
		Layer.unwrapEffect(Config.unwrap(config).pipe(Effect.map((cfg) => ElectricEventQueue.Default(cfg))))
}

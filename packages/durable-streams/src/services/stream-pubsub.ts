import { Context, Effect, Layer, PubSub, type Queue, type Scope } from "effect"
import type { StreamId, StreamNotification, StreamPath } from "../api/schemas"

// =============================================================================
// Service Interface
// =============================================================================

/**
 * StreamPubSub service - handles real-time notifications for stream updates
 * Used for long-poll and SSE live modes
 */
export interface StreamPubSubService {
	/**
	 * Publish a notification when a stream is updated
	 */
	readonly publish: (notification: StreamNotification) => Effect.Effect<boolean>

	/**
	 * Subscribe to notifications for a specific stream by ID
	 * Returns a dequeue that emits notifications
	 */
	readonly subscribeById: (
		streamId: StreamId,
	) => Effect.Effect<Queue.Dequeue<StreamNotification>, never, Scope.Scope>

	/**
	 * Subscribe to notifications for a specific stream by path
	 * Returns a dequeue that emits notifications
	 */
	readonly subscribeByPath: (
		path: StreamPath,
	) => Effect.Effect<Queue.Dequeue<StreamNotification>, never, Scope.Scope>
}

// =============================================================================
// Service Tag
// =============================================================================

export class StreamPubSub extends Context.Tag("@DurableStreams/StreamPubSub")<
	StreamPubSub,
	StreamPubSubService
>() {}

// =============================================================================
// In-Memory Implementation
// =============================================================================

/**
 * In-memory PubSub implementation using Effect's PubSub
 */
export const StreamPubSubLive = Layer.scoped(
	StreamPubSub,
	Effect.gen(function* () {
		// Create an unbounded PubSub for stream notifications
		const pubsub = yield* PubSub.unbounded<StreamNotification>()

		return {
			publish: (notification) => PubSub.publish(pubsub, notification),

			subscribeById: (_streamId) =>
				Effect.gen(function* () {
					// Subscribe to all notifications
					const queue = yield* PubSub.subscribe(pubsub)
					// Filter for the specific stream
					// Note: Effect PubSub doesn't have built-in filtering,
					// so consumers need to filter manually or we return all and let caller filter
					// For now, we return all and let the handler filter
					return queue
				}),

			subscribeByPath: (_path) =>
				Effect.gen(function* () {
					const queue = yield* PubSub.subscribe(pubsub)
					return queue
				}),
		}
	}),
)

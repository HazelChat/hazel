/**
 * In-Memory Durable Stream Storage
 *
 * Reference implementation using Effect's Ref, HashMap, and PubSub.
 * Suitable for development, testing, and single-server deployments.
 */

import { Effect, Ref, HashMap, PubSub, Stream, Layer, Option, Chunk, Queue } from "effect"
import { DurableStreamStorage, type DurableStreamStorageService, type StreamState } from "./storage.ts"
import { OffsetUtils, type Offset, type OffsetParam } from "../offset.ts"
import type { StreamId, StreamMetadata, StreamMessage, CreateStreamOptions, ReadResult } from "../message.ts"
import { StreamNotFoundError, WriteConflictError, OffsetOutOfRangeError } from "../errors.ts"

/**
 * Internal state for a stream including its PubSub for live subscriptions.
 */
interface InternalStreamState extends StreamState {
	readonly pubsub: PubSub.PubSub<StreamMessage<Uint8Array>>
}

/**
 * Create an in-memory storage implementation.
 */
const make = Effect.gen(function* () {
	// Main state: map of stream ID to stream state
	const streams = yield* Ref.make(HashMap.empty<StreamId, InternalStreamState>())

	const storage: DurableStreamStorageService = {
		create: (streamId, options) =>
			Effect.gen(function* () {
				const map = yield* Ref.get(streams)
				const existing = HashMap.get(map, streamId)

				if (Option.isSome(existing)) {
					// Check if configuration matches
					const state = existing.value
					const existingContentType = state.metadata.contentType
					const requestedContentType = options?.contentType

					if (existingContentType !== requestedContentType) {
						return yield* Effect.fail(
							new WriteConflictError({
								streamId,
								reason: "stream_exists",
								message: `Stream exists with different content type: ${existingContentType}`,
							}),
						)
					}

					// Idempotent - return existing metadata
					return state.metadata
				}

				// Create new stream
				const pubsub = yield* PubSub.unbounded<StreamMessage<Uint8Array>>()
				const now = Date.now()
				const metadata: StreamMetadata = {
					streamId,
					contentType: options?.contentType,
					tailOffset: OffsetUtils.initial(),
					createdAt: now,
					messageCount: 0,
				}

				const newState: InternalStreamState = {
					metadata,
					messages: [],
					lastSeq: undefined,
					pubsub,
				}

				yield* Ref.update(streams, HashMap.set(streamId, newState))
				return metadata
			}),

		append: (streamId, data, options) =>
			Effect.gen(function* () {
				const map = yield* Ref.get(streams)
				const existing = HashMap.get(map, streamId)

				if (Option.isNone(existing)) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId }))
				}

				const state = existing.value

				// Check sequence if provided
				if (options?.seq !== undefined) {
					if (state.lastSeq !== undefined && options.seq <= state.lastSeq) {
						return yield* Effect.fail(
							new WriteConflictError({
								streamId,
								reason: "seq_regression",
								message: `Sequence ${options.seq} is not greater than last seq ${state.lastSeq}`,
							}),
						)
					}
				}

				const timestamp = Date.now()
				const sequence = state.messages.length
				const offset = OffsetUtils.make(BigInt(timestamp), sequence)

				const message: StreamMessage<Uint8Array> = {
					data,
					offset,
					timestamp,
				}

				const newMetadata: StreamMetadata = {
					...state.metadata,
					tailOffset: offset,
					messageCount: state.metadata.messageCount + 1,
				}

				const newState: InternalStreamState = {
					...state,
					metadata: newMetadata,
					messages: [...state.messages, message],
					lastSeq: options?.seq ?? state.lastSeq,
				}

				yield* Ref.update(streams, HashMap.set(streamId, newState))

				// Publish to subscribers
				yield* PubSub.publish(state.pubsub, message)

				return { offset, timestamp }
			}),

		read: (streamId, fromOffset, limit = 100) =>
			Effect.gen(function* () {
				const map = yield* Ref.get(streams)
				const existing = HashMap.get(map, streamId)

				if (Option.isNone(existing)) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId }))
				}

				const state = existing.value
				const isStart = OffsetUtils.isStart(fromOffset)

				// Filter messages after the given offset
				const filteredMessages = isStart
					? state.messages.slice(0, limit)
					: state.messages
							.filter((m) => OffsetUtils.isAfter(m.offset, fromOffset as Offset))
							.slice(0, limit)

				const lastMessage = filteredMessages[filteredMessages.length - 1]
				const nextOffset = lastMessage?.offset ?? (isStart ? OffsetUtils.initial() : (fromOffset as Offset))

				const result: ReadResult<Uint8Array> = {
					messages: filteredMessages,
					nextOffset,
					upToDate: filteredMessages.length < limit,
				}

				return result
			}),

		subscribe: (streamId, fromOffset) =>
			Stream.unwrapScoped(
				Effect.gen(function* () {
					const map = yield* Ref.get(streams)
					const existing = HashMap.get(map, streamId)

					if (Option.isNone(existing)) {
						return Stream.fail(new StreamNotFoundError({ streamId }))
					}

					const state = existing.value
					const isStart = OffsetUtils.isStart(fromOffset)

					// Get historical messages from offset
					const historical = isStart
						? state.messages
						: state.messages.filter((m) => OffsetUtils.isAfter(m.offset, fromOffset as Offset))

					const historicalStream = Stream.fromIterable(historical)

					// Create a dequeue for live messages (requires Scope - hence unwrapScoped)
					const dequeue = yield* PubSub.subscribe(state.pubsub)

					// Track the last offset we've seen
					const lastHistoricalOffset = historical[historical.length - 1]?.offset

					// Live stream filters to only emit messages after historical
					const liveStream = Stream.fromQueue(dequeue).pipe(
						Stream.filter((m) => {
							if (lastHistoricalOffset === undefined) {
								return true
							}
							return OffsetUtils.isAfter(m.offset, lastHistoricalOffset)
						}),
					)

					// Concatenate historical and live streams
					return Stream.concat(historicalStream, liveStream)
				}),
			),

		head: (streamId) =>
			Effect.gen(function* () {
				const map = yield* Ref.get(streams)
				const existing = HashMap.get(map, streamId)

				if (Option.isNone(existing)) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId }))
				}

				return existing.value.metadata
			}),

		delete: (streamId) =>
			Effect.gen(function* () {
				const map = yield* Ref.get(streams)

				if (!HashMap.has(map, streamId)) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId }))
				}

				// Get state to shutdown pubsub
				const existing = HashMap.get(map, streamId)
				if (Option.isSome(existing)) {
					yield* PubSub.shutdown(existing.value.pubsub)
				}

				yield* Ref.update(streams, HashMap.remove(streamId))
			}),

		exists: (streamId) => Ref.get(streams).pipe(Effect.map((map) => HashMap.has(map, streamId))),
	}

	return storage
})

/**
 * Layer providing in-memory durable stream storage.
 */
export const InMemoryStorageLayer = Layer.effect(DurableStreamStorage, make)

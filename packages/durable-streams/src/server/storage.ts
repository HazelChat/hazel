/**
 * Durable Stream Storage Interface
 *
 * Defines the contract for stream storage implementations.
 */

import { Context, Effect, Stream } from "effect"
import type { Offset, OffsetParam } from "../offset.ts"
import type {
	StreamId,
	StreamMetadata,
	StreamMessage,
	CreateStreamOptions,
	ReadResult,
} from "../message.ts"
import type {
	StreamNotFoundError,
	OffsetOutOfRangeError,
	WriteConflictError,
} from "../errors.ts"

/**
 * Internal stream state stored by implementations.
 */
export interface StreamState {
	readonly metadata: StreamMetadata
	readonly messages: ReadonlyArray<StreamMessage<Uint8Array>>
	readonly lastSeq: string | undefined
}

/**
 * Durable Stream Storage interface.
 *
 * Implementations must provide these methods for stream persistence
 * and real-time subscriptions.
 */
export interface DurableStreamStorageService {
	/**
	 * Create a new stream.
	 *
	 * If the stream already exists with matching configuration, returns
	 * the existing metadata (idempotent).
	 *
	 * @param streamId - Unique stream identifier
	 * @param options - Optional creation options (contentType, TTL)
	 * @returns Stream metadata
	 * @throws WriteConflictError if stream exists with different config
	 */
	readonly create: (
		streamId: StreamId,
		options?: CreateStreamOptions,
	) => Effect.Effect<StreamMetadata, WriteConflictError>

	/**
	 * Append data to a stream.
	 *
	 * @param streamId - Stream to append to
	 * @param data - Data bytes to append
	 * @param options - Optional append options (seq for writer coordination)
	 * @returns The offset and timestamp of the appended data
	 * @throws StreamNotFoundError if stream doesn't exist
	 * @throws WriteConflictError if seq is lower than last appended
	 */
	readonly append: (
		streamId: StreamId,
		data: Uint8Array,
		options?: { seq?: string },
	) => Effect.Effect<{ offset: Offset; timestamp: number }, StreamNotFoundError | WriteConflictError>

	/**
	 * Read messages from a stream starting at an offset.
	 *
	 * @param streamId - Stream to read from
	 * @param fromOffset - Starting offset ("-1" for start)
	 * @param limit - Maximum number of messages to return
	 * @returns Messages, next offset, and whether caught up
	 * @throws StreamNotFoundError if stream doesn't exist
	 * @throws OffsetOutOfRangeError if offset is invalid
	 */
	readonly read: (
		streamId: StreamId,
		fromOffset: OffsetParam,
		limit?: number,
	) => Effect.Effect<ReadResult<Uint8Array>, StreamNotFoundError | OffsetOutOfRangeError>

	/**
	 * Subscribe to live updates from a stream.
	 *
	 * Returns a Stream that first yields historical messages from the
	 * given offset, then yields new messages as they are appended.
	 *
	 * @param streamId - Stream to subscribe to
	 * @param fromOffset - Starting offset ("-1" for start)
	 * @returns Effect Stream of messages
	 */
	readonly subscribe: (
		streamId: StreamId,
		fromOffset: OffsetParam,
	) => Stream.Stream<StreamMessage<Uint8Array>, StreamNotFoundError>

	/**
	 * Get stream metadata.
	 *
	 * @param streamId - Stream to query
	 * @returns Stream metadata
	 * @throws StreamNotFoundError if stream doesn't exist
	 */
	readonly head: (streamId: StreamId) => Effect.Effect<StreamMetadata, StreamNotFoundError>

	/**
	 * Delete a stream.
	 *
	 * @param streamId - Stream to delete
	 * @throws StreamNotFoundError if stream doesn't exist
	 */
	readonly delete: (streamId: StreamId) => Effect.Effect<void, StreamNotFoundError>

	/**
	 * Check if a stream exists.
	 *
	 * @param streamId - Stream to check
	 * @returns true if stream exists
	 */
	readonly exists: (streamId: StreamId) => Effect.Effect<boolean>
}

/**
 * Context tag for DurableStreamStorage service.
 */
export class DurableStreamStorage extends Context.Tag("@DurableStreams/Storage")<
	DurableStreamStorage,
	DurableStreamStorageService
>() {}

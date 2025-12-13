import { Context, type Effect, type Option, type Stream } from "effect"
import type * as Errors from "../api/errors"
import type { StreamId, StreamMessage, StreamMetadata, StreamOffset, StreamPath } from "../api/schemas"

// =============================================================================
// Service Interface
// =============================================================================

/**
 * Result of appending data to a stream
 */
export interface AppendResult {
	readonly offset: StreamOffset
	readonly seq: number
}

/**
 * Result of reading from a stream
 */
export interface ReadResult {
	readonly data: Uint8Array
	readonly offset: StreamOffset
	readonly hasMore: boolean
}

/**
 * StreamStore service interface - defines operations for durable stream storage
 */
export interface StreamStoreService {
	/**
	 * Create a new stream at the given path
	 */
	readonly create: (
		path: StreamPath,
		contentType: string,
		ttlSeconds?: number,
	) => Effect.Effect<StreamMetadata, Errors.StreamAlreadyExistsError | Errors.InternalStreamError>

	/**
	 * Delete a stream by path (soft delete)
	 */
	readonly delete: (
		path: StreamPath,
	) => Effect.Effect<void, Errors.StreamNotFoundError | Errors.InternalStreamError>

	/**
	 * Get stream metadata by path
	 */
	readonly getMetadata: (
		path: StreamPath,
	) => Effect.Effect<Option.Option<StreamMetadata>, Errors.InternalStreamError>

	/**
	 * Get stream metadata by ID
	 */
	readonly getMetadataById: (
		id: StreamId,
	) => Effect.Effect<Option.Option<StreamMetadata>, Errors.InternalStreamError>

	/**
	 * Append data to a stream
	 * @param path - Stream path
	 * @param data - Data to append
	 * @param expectedSeq - Optional expected sequence for optimistic concurrency
	 */
	readonly append: (
		path: StreamPath,
		data: Uint8Array,
		expectedSeq?: number,
	) => Effect.Effect<
		AppendResult,
		| Errors.StreamNotFoundError
		| Errors.SequenceConflictError
		| Errors.StreamExpiredError
		| Errors.InternalStreamError
	>

	/**
	 * Read data from a stream starting at the given offset
	 * @param path - Stream path
	 * @param fromOffset - Starting offset (defaults to beginning)
	 * @param limit - Maximum bytes to read
	 */
	readonly read: (
		path: StreamPath,
		fromOffset?: StreamOffset,
		limit?: number,
	) => Effect.Effect<
		ReadResult,
		| Errors.StreamNotFoundError
		| Errors.OffsetOutOfRangeError
		| Errors.StreamExpiredError
		| Errors.InternalStreamError
	>

	/**
	 * Read data as a stream for SSE mode
	 * Returns individual messages/chunks
	 */
	readonly readStream: (
		path: StreamPath,
		fromOffset?: StreamOffset,
	) => Effect.Effect<
		Stream.Stream<StreamMessage, Errors.InternalStreamError>,
		Errors.StreamNotFoundError | Errors.StreamExpiredError | Errors.InternalStreamError
	>

	/**
	 * Clean up expired streams
	 * @returns Number of streams deleted
	 */
	readonly cleanupExpired: () => Effect.Effect<number, Errors.InternalStreamError>

	/**
	 * List all active stream paths
	 */
	readonly listStreams: () => Effect.Effect<Array<StreamPath>, Errors.InternalStreamError>
}

// =============================================================================
// Service Tag
// =============================================================================

export class StreamStore extends Context.Tag("@DurableStreams/StreamStore")<
	StreamStore,
	StreamStoreService
>() {}

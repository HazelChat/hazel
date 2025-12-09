/**
 * Message and Metadata Schemas
 *
 * Following the Electric Durable Stream Protocol specification.
 */

import { Schema } from "effect"
import { Offset, OffsetParam } from "./offset.ts"

/**
 * Stream identifier - a unique path identifying a stream.
 * Example: "conversation/123/response/456"
 */
export const StreamId = Schema.String.pipe(Schema.brand("@DurableStreams/StreamId"))
export type StreamId = typeof StreamId.Type

/**
 * Live mode options for reading from a stream.
 */
export const LiveMode = Schema.Union(
	Schema.Literal("none"),
	Schema.Literal("long-poll"),
	Schema.Literal("sse"),
)
export type LiveMode = typeof LiveMode.Type

/**
 * A single message in a durable stream.
 * Generic over the data type A.
 */
export const StreamMessage = <A extends Schema.Schema.Any>(dataSchema: A) =>
	Schema.Struct({
		/** The message data */
		data: dataSchema,
		/** The offset after this message (next read position) */
		offset: Offset,
		/** Unix timestamp in milliseconds when this message was appended */
		timestamp: Schema.Number,
	})

export type StreamMessage<A> = {
	readonly data: A
	readonly offset: Offset
	readonly timestamp: number
}

/**
 * Stream metadata returned by HEAD and create operations.
 */
export const StreamMetadata = Schema.Struct({
	/** The stream identifier */
	streamId: StreamId,
	/** MIME content type of the stream */
	contentType: Schema.optional(Schema.String),
	/** Current tail offset (position after last message) */
	tailOffset: Offset,
	/** Unix timestamp in milliseconds when stream was created */
	createdAt: Schema.Number,
	/** Number of messages in the stream */
	messageCount: Schema.Number,
})
export type StreamMetadata = typeof StreamMetadata.Type

/**
 * Result from a read operation.
 */
export const ReadResult = <A extends Schema.Schema.Any>(dataSchema: A) =>
	Schema.Struct({
		/** Array of messages read */
		messages: Schema.Array(StreamMessage(dataSchema)),
		/** Next offset to use for subsequent reads */
		nextOffset: Offset,
		/** True if the response contains all data up to current tail */
		upToDate: Schema.Boolean,
		/** Cursor for CDN request collapsing (optional) */
		cursor: Schema.optional(Schema.String),
	})

export type ReadResult<A> = {
	readonly messages: ReadonlyArray<StreamMessage<A>>
	readonly nextOffset: Offset
	readonly upToDate: boolean
	readonly cursor?: string
}

/**
 * Options for creating a stream.
 */
export const CreateStreamOptions = Schema.Struct({
	/** MIME content type for the stream */
	contentType: Schema.optional(Schema.String),
	/** Time-to-live in seconds (relative TTL) */
	ttlSeconds: Schema.optional(Schema.Number),
	/** Absolute expiry time as RFC3339 string */
	expiresAt: Schema.optional(Schema.String),
})
export type CreateStreamOptions = typeof CreateStreamOptions.Type

/**
 * Options for appending to a stream.
 */
export const AppendOptions = Schema.Struct({
	/** Writer sequence for coordination (monotonic, lexicographic) */
	seq: Schema.optional(Schema.String),
	/** Content type (must match stream's content type) */
	contentType: Schema.optional(Schema.String),
})
export type AppendOptions = typeof AppendOptions.Type

/**
 * Options for reading from a stream.
 */
export const ReadOptions = Schema.Struct({
	/** Starting offset (default: "-1" for start of stream) */
	offset: Schema.optional(OffsetParam),
	/** Live mode: "none", "long-poll", or "sse" */
	liveMode: Schema.optional(LiveMode),
	/** Timeout for long-poll in milliseconds */
	timeout: Schema.optional(Schema.Number),
	/** Limit on number of messages to return */
	limit: Schema.optional(Schema.Number),
	/** Cursor for CDN request collapsing */
	cursor: Schema.optional(Schema.String),
})
export type ReadOptions = typeof ReadOptions.Type

/**
 * Result from a HEAD operation.
 */
export const HeadResult = Schema.Struct({
	/** Whether the stream exists */
	exists: Schema.Literal(true),
	/** Stream content type */
	contentType: Schema.optional(Schema.String),
	/** Current tail offset */
	offset: Schema.optional(Offset),
	/** ETag for caching */
	etag: Schema.optional(Schema.String),
	/** Cache-Control header value */
	cacheControl: Schema.optional(Schema.String),
})
export type HeadResult = typeof HeadResult.Type

/**
 * A chunk yielded from stream reading.
 * Contains raw bytes and metadata.
 */
export const StreamChunk = Schema.Struct({
	/** Raw data bytes */
	data: Schema.Uint8Array,
	/** Offset after this chunk */
	offset: Offset,
	/** True if caught up to stream tail */
	upToDate: Schema.Boolean,
	/** Cursor for CDN collapsing */
	cursor: Schema.optional(Schema.String),
	/** Content type */
	contentType: Schema.optional(Schema.String),
})
export type StreamChunk = typeof StreamChunk.Type

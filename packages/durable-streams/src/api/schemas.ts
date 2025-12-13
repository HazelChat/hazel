import { Schema } from "effect"

// =============================================================================
// Branded Types
// =============================================================================

/**
 * Stream path identifier - alphanumeric with /, -, _
 * Examples: "user/123/events", "chat-room-456"
 */
export const StreamPath = Schema.String.pipe(
	Schema.pattern(/^[a-zA-Z0-9/\-_]+$/),
	Schema.brand("@DurableStreams/StreamPath"),
).annotations({
	description: "Path identifier for a stream (alphanumeric with /, -, _)",
	title: "Stream Path",
})
export type StreamPath = typeof StreamPath.Type

/**
 * Offset token in format "readSeq_byteOffset"
 * Lexicographically sortable for ordering
 * Clients should treat as opaque strings
 */
export const StreamOffset = Schema.String.pipe(
	Schema.pattern(/^\d+_\d+$/),
	Schema.brand("@DurableStreams/StreamOffset"),
).annotations({
	description: "Opaque offset token in format 'readSeq_byteOffset'",
	title: "Stream Offset",
})
export type StreamOffset = typeof StreamOffset.Type

/**
 * Stream ID (UUID)
 */
export const StreamId = Schema.UUID.pipe(Schema.brand("@DurableStreams/StreamId"))
export type StreamId = typeof StreamId.Type

// =============================================================================
// Offset Utilities
// =============================================================================

export interface ParsedOffset {
	readonly readSeq: number
	readonly byteOffset: number
}

export const parseOffset = (offset: StreamOffset): ParsedOffset => {
	const [seq, bytes] = offset.split("_").map(Number)
	return { readSeq: seq, byteOffset: bytes }
}

export const createOffset = (readSeq: number, byteOffset: number): StreamOffset => {
	return `${readSeq}_${byteOffset}` as StreamOffset
}

export const initialOffset = (): StreamOffset => createOffset(0, 0)

export const compareOffsets = (a: StreamOffset, b: StreamOffset): number => {
	return a.localeCompare(b)
}

// =============================================================================
// Entity Schemas
// =============================================================================

/**
 * Stream metadata
 */
export class StreamMetadata extends Schema.Class<StreamMetadata>("StreamMetadata")({
	id: StreamId,
	path: StreamPath,
	contentType: Schema.String,
	/** Current write sequence number */
	writeSeq: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	/** Total byte size of stream */
	totalBytes: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	/** Current readable offset */
	currentOffset: StreamOffset,
	/** TTL in seconds (optional) */
	ttlSeconds: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
	/** Absolute expiration time (optional) */
	expiresAt: Schema.optional(Schema.DateTimeUtc),
	createdAt: Schema.DateTimeUtc,
	updatedAt: Schema.DateTimeUtc,
}) {}

/**
 * Individual stream message/chunk
 */
export class StreamMessage extends Schema.Class<StreamMessage>("StreamMessage")({
	streamId: StreamId,
	sequence: Schema.Number.pipe(Schema.int(), Schema.positive()),
	offset: StreamOffset,
	data: Schema.Uint8ArrayFromSelf,
	size: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	/** For JSON mode - marks message boundaries */
	isJsonBoundary: Schema.optional(Schema.Boolean),
	createdAt: Schema.DateTimeUtc,
}) {}

// =============================================================================
// Request/Response Schemas
// =============================================================================

/**
 * Create stream request body
 */
export class CreateStreamRequest extends Schema.Class<CreateStreamRequest>("CreateStreamRequest")({
	contentType: Schema.optional(Schema.String),
	ttlSeconds: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
}) {}

/**
 * Live mode options for reading
 */
export const LiveMode = Schema.Literal("catch-up", "long-poll", "sse")
export type LiveMode = typeof LiveMode.Type

/**
 * Read stream query parameters
 */
export class ReadStreamQuery extends Schema.Class<ReadStreamQuery>("ReadStreamQuery")({
	offset: Schema.optional(StreamOffset),
	live: Schema.optional(LiveMode),
	/** Long-poll timeout in milliseconds (default: 30000) */
	timeout: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
}) {}

/**
 * Append response
 */
export class AppendResponse extends Schema.Class<AppendResponse>("AppendResponse")({
	offset: StreamOffset,
	seq: Schema.Number.pipe(Schema.int(), Schema.positive()),
}) {}

/**
 * Read response for catch-up/long-poll modes
 */
export class ReadResponse extends Schema.Class<ReadResponse>("ReadResponse")({
	data: Schema.Uint8ArrayFromSelf,
	offset: StreamOffset,
	hasMore: Schema.Boolean,
}) {}

/**
 * Stream notification (for PubSub)
 */
export class StreamNotification extends Schema.Class<StreamNotification>("StreamNotification")({
	streamId: StreamId,
	path: StreamPath,
	newOffset: StreamOffset,
	seq: Schema.Number.pipe(Schema.int(), Schema.positive()),
}) {}

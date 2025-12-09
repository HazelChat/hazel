/**
 * Durable Streams Error Types
 *
 * Following Effect Schema TaggedError pattern for type-safe errors.
 */

import { Schema } from "effect"
import { Offset } from "./offset.ts"

/**
 * Stream identifier schema for errors.
 */
const StreamId = Schema.String

/**
 * Error thrown when a stream is not found.
 */
export class StreamNotFoundError extends Schema.TaggedError<StreamNotFoundError>()(
	"StreamNotFoundError",
	{
		streamId: StreamId,
		message: Schema.optional(Schema.String),
	},
) {}

/**
 * Error thrown when a requested offset is out of range.
 * This can happen when requesting an offset that has been
 * truncated due to retention policies.
 */
export class OffsetOutOfRangeError extends Schema.TaggedError<OffsetOutOfRangeError>()(
	"OffsetOutOfRangeError",
	{
		streamId: StreamId,
		requestedOffset: Schema.String,
		validRange: Schema.optional(
			Schema.Struct({
				start: Offset,
				end: Offset,
			}),
		),
		message: Schema.optional(Schema.String),
	},
) {}

/**
 * Error thrown when a write operation conflicts.
 * This can happen when:
 * - Stream-Seq is lower than last appended seq (409 Conflict)
 * - Content-Type doesn't match stream's type
 */
export class WriteConflictError extends Schema.TaggedError<WriteConflictError>()(
	"WriteConflictError",
	{
		streamId: StreamId,
		reason: Schema.Union(
			Schema.Literal("seq_regression"),
			Schema.Literal("content_type_mismatch"),
			Schema.Literal("stream_exists"),
		),
		message: Schema.optional(Schema.String),
	},
) {}

/**
 * Error thrown when a stream operation times out.
 * Typically from long-poll timeout (204 No Content).
 */
export class StreamTimeoutError extends Schema.TaggedError<StreamTimeoutError>()(
	"StreamTimeoutError",
	{
		streamId: StreamId,
		message: Schema.optional(Schema.String),
	},
) {}

/**
 * Error thrown when SSE is requested for an incompatible content type.
 */
export class SSENotSupportedError extends Schema.TaggedError<SSENotSupportedError>()(
	"SSENotSupportedError",
	{
		streamId: StreamId,
		contentType: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

/**
 * Error thrown for bad requests (400).
 */
export class BadRequestError extends Schema.TaggedError<BadRequestError>()(
	"BadRequestError",
	{
		message: Schema.String,
	},
) {}

/**
 * Error thrown for rate limiting (429).
 */
export class RateLimitedError extends Schema.TaggedError<RateLimitedError>()(
	"RateLimitedError",
	{
		retryAfter: Schema.optional(Schema.Number),
		message: Schema.optional(Schema.String),
	},
) {}

/**
 * Generic network/fetch error.
 */
export class FetchError extends Schema.TaggedError<FetchError>()(
	"FetchError",
	{
		status: Schema.optional(Schema.Number),
		statusText: Schema.optional(Schema.String),
		message: Schema.String,
	},
) {}

/**
 * Union of all durable stream errors.
 */
export const DurableStreamError = Schema.Union(
	StreamNotFoundError,
	OffsetOutOfRangeError,
	WriteConflictError,
	StreamTimeoutError,
	SSENotSupportedError,
	BadRequestError,
	RateLimitedError,
	FetchError,
)
export type DurableStreamError = typeof DurableStreamError.Type

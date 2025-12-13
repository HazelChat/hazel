import { HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"

/**
 * Stream not found (404)
 */
export class StreamNotFoundError extends Schema.TaggedError<StreamNotFoundError>("StreamNotFoundError")(
	"StreamNotFoundError",
	{
		path: Schema.String,
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 404 }),
) {}

/**
 * Stream already exists (409)
 */
export class StreamAlreadyExistsError extends Schema.TaggedError<StreamAlreadyExistsError>(
	"StreamAlreadyExistsError",
)(
	"StreamAlreadyExistsError",
	{
		path: Schema.String,
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 409 }),
) {}

/**
 * Offset out of range - requested offset is beyond retained data (410)
 */
export class OffsetOutOfRangeError extends Schema.TaggedError<OffsetOutOfRangeError>("OffsetOutOfRangeError")(
	"OffsetOutOfRangeError",
	{
		requestedOffset: Schema.String,
		earliestOffset: Schema.String,
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 410 }),
) {}

/**
 * Sequence conflict - Stream-Seq header mismatch (409)
 */
export class SequenceConflictError extends Schema.TaggedError<SequenceConflictError>("SequenceConflictError")(
	"SequenceConflictError",
	{
		expectedSeq: Schema.Number,
		actualSeq: Schema.Number,
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 409 }),
) {}

/**
 * Stream has expired due to TTL (410)
 */
export class StreamExpiredError extends Schema.TaggedError<StreamExpiredError>("StreamExpiredError")(
	"StreamExpiredError",
	{
		path: Schema.String,
		expiredAt: Schema.String,
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 410 }),
) {}

/**
 * Content-Type mismatch on append (400)
 */
export class InvalidContentTypeError extends Schema.TaggedError<InvalidContentTypeError>(
	"InvalidContentTypeError",
)(
	"InvalidContentTypeError",
	{
		expected: Schema.String,
		received: Schema.String,
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 400 }),
) {}

/**
 * Invalid offset format (400)
 */
export class InvalidOffsetError extends Schema.TaggedError<InvalidOffsetError>("InvalidOffsetError")(
	"InvalidOffsetError",
	{
		offset: Schema.String,
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 400 }),
) {}

/**
 * Internal server error (500)
 */
export class InternalStreamError extends Schema.TaggedError<InternalStreamError>("InternalStreamError")(
	"InternalStreamError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
	HttpApiSchema.annotations({ status: 500 }),
) {}

/**
 * Streaming errors for the bot SDK
 */

import { Schema } from "effect"

/**
 * Error thrown when streaming operations fail
 */
export class StreamError extends Schema.TaggedError<StreamError>()("StreamError", {
	message: Schema.String,
	operation: Schema.String,
	cause: Schema.Unknown,
}) {}

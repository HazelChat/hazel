import { Schema } from "effect"

/**
 * Error thrown when queue operations fail
 */
export class QueueError extends Schema.TaggedError<QueueError>()("QueueError", {
	message: Schema.String,
	cause: Schema.Unknown,
}) {}

/**
 * Error thrown when shape stream subscription fails
 */
export class ShapeStreamError extends Schema.TaggedError<ShapeStreamError>()("ShapeStreamError", {
	message: Schema.String,
	table: Schema.String,
	cause: Schema.Unknown,
}) {}

/**
 * Error thrown when event handler execution fails
 */
export class HandlerError extends Schema.TaggedError<HandlerError>()("HandlerError", {
	message: Schema.String,
	eventType: Schema.String,
	cause: Schema.Unknown,
}) {}

/**
 * Error thrown when bot authentication fails
 */
export class AuthenticationError extends Schema.TaggedError<AuthenticationError>()("AuthenticationError", {
	message: Schema.String,
	cause: Schema.Unknown,
}) {}

/**
 * Error thrown when bot client fails to start
 */
export class BotStartError extends Schema.TaggedError<BotStartError>()("BotStartError", {
	message: Schema.String,
	cause: Schema.Unknown,
}) {}

/**
 * Error thrown when message operations fail
 */
export class MessageOperationError extends Schema.TaggedError<MessageOperationError>()(
	"MessageOperationError",
	{
		message: Schema.String,
		operation: Schema.String,
		cause: Schema.Unknown,
	},
) {}

/**
 * Error thrown when event dispatcher operations fail
 */
export class DispatchError extends Schema.TaggedError<DispatchError>()("DispatchError", {
	message: Schema.String,
	eventType: Schema.String,
	cause: Schema.Unknown,
}) {}

/**
 * Error thrown for transient failures that can be retried
 */
export class TransientError extends Schema.TaggedError<TransientError>()("TransientError", {
	message: Schema.String,
	cause: Schema.Unknown,
}) {
	readonly retryable = true
}

/**
 * Error thrown when connection to external service fails
 */
export class ConnectionError extends Schema.TaggedError<ConnectionError>()("ConnectionError", {
	message: Schema.String,
	service: Schema.Literal("electric", "backend", "durable-stream"),
	cause: Schema.Unknown,
}) {
	readonly retryable = true
}

/**
 * Error thrown when schema validation fails
 */
export class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", {
	message: Schema.String,
	table: Schema.String,
	cause: Schema.Unknown,
}) {
	readonly retryable = false
}

/**
 * Check if an error is retryable
 */
export const isRetryable = (error: unknown): boolean => {
	if (typeof error === "object" && error !== null && "retryable" in error) {
		return Boolean(error.retryable)
	}
	return false
}

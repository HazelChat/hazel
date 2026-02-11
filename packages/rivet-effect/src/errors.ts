import { Schema } from "effect"

export class RuntimeNotConfiguredError extends Schema.TaggedError<RuntimeNotConfiguredError>()(
	"RuntimeNotConfiguredError",
	{
		message: Schema.String,
		operation: Schema.optional(Schema.String),
	},
) {}

export class RuntimeExecutionError extends Schema.TaggedError<RuntimeExecutionError>()(
	"RuntimeExecutionError",
	{
		message: Schema.String,
		operation: Schema.optional(Schema.String),
		cause: Schema.optional(Schema.Unknown),
	},
) {}

export class QueueUnavailableError extends Schema.TaggedError<QueueUnavailableError>()(
	"QueueUnavailableError",
	{
		message: Schema.String,
		queueName: Schema.optional(Schema.String),
	},
) {}

export class QueueReceiveError extends Schema.TaggedError<QueueReceiveError>()("QueueReceiveError", {
	message: Schema.String,
	queueName: Schema.optional(Schema.String),
	cause: Schema.optional(Schema.Unknown),
}) {}

export class StatePersistenceError extends Schema.TaggedError<StatePersistenceError>()(
	"StatePersistenceError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

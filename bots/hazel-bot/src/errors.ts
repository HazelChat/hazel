import { Schema } from "effect"

export class StreamIdleTimeoutError extends Schema.TaggedErrorClass<StreamIdleTimeoutError>()(
	"StreamIdleTimeoutError",
	{
		message: Schema.String,
	},
) {}

export class DegenerateOutputError extends Schema.TaggedErrorClass<DegenerateOutputError>()(
	"DegenerateOutputError",
	{
		message: Schema.String,
		pattern: Schema.String,
		repeats: Schema.Number,
	},
) {}

export class IterationTimeoutError extends Schema.TaggedErrorClass<IterationTimeoutError>()(
	"IterationTimeoutError",
	{
		message: Schema.String,
	},
) {}

export class SessionTimeoutError extends Schema.TaggedErrorClass<SessionTimeoutError>()("SessionTimeoutError", {
	message: Schema.String,
}) {}

import { Schema } from "effect"

// Error types for bot user activities
export class BotUserQueryError extends Schema.TaggedError<BotUserQueryError>()("BotUserQueryError", {
	provider: Schema.String,
	message: Schema.String,
	cause: Schema.Unknown.pipe(Schema.optional),
}) {}

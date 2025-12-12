import { HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"

/**
 * Error thrown when a user exceeds their rate limit.
 * Contains information about when they can retry.
 */
export class RateLimitExceededError extends Schema.TaggedError<RateLimitExceededError>()(
	"RateLimitExceededError",
	{
		message: Schema.String,
		retryAfterMs: Schema.Number,
		limit: Schema.Number,
		remaining: Schema.Number,
	},
	HttpApiSchema.annotations({
		status: 429,
	}),
) {}

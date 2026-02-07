import type { ChannelId } from "@hazel/schema"
import { Duration, PrimaryKey, Schema } from "effect"

/**
 * Cache configuration constants
 */
export const CACHE_STORE_ID = "electric-proxy:access-context"
export const CACHE_TTL = Duration.seconds(60)
export const IN_MEMORY_CAPACITY = 1000
export const IN_MEMORY_TTL = Duration.seconds(10)

/**
 * Schema for BotAccessContext - the cached value for bot requests
 */
export const BotAccessContextSchema = Schema.Struct({
	channelIds: Schema.Array(Schema.String),
})

export type BotAccessContext = {
	channelIds: readonly ChannelId[]
}

/**
 * Cache lookup error - when we fail to fetch from database
 */
export class AccessContextLookupError extends Schema.TaggedError<AccessContextLookupError>()(
	"AccessContextLookupError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
		entityId: Schema.String,
		entityType: Schema.Literal("user", "bot"),
	},
) {}

/**
 * Cache request for bot access context.
 * Implements Schema.TaggedRequest (provides WithResult) and PrimaryKey.
 */
export class BotAccessContextRequest extends Schema.TaggedRequest<BotAccessContextRequest>()(
	"BotAccessContextRequest",
	{
		failure: AccessContextLookupError,
		success: BotAccessContextSchema,
		payload: {
			botId: Schema.String,
			userId: Schema.String,
		},
	},
) {
	[PrimaryKey.symbol]() {
		return `bot:${this.botId}`
	}
}

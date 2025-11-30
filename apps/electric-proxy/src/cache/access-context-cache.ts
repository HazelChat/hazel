import type { ChannelId, OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import { Duration, PrimaryKey, Schema } from "effect"

/**
 * Cache configuration constants
 */
export const CACHE_STORE_ID = "electric-proxy:access-context"
export const CACHE_TTL = Duration.seconds(60)
export const IN_MEMORY_CAPACITY = 1000
export const IN_MEMORY_TTL = Duration.seconds(10)

/**
 * Schema for UserAccessContext - the cached value for user requests
 */
export const UserAccessContextSchema = Schema.Struct({
	organizationIds: Schema.Array(Schema.String),
	channelIds: Schema.Array(Schema.String),
	memberIds: Schema.Array(Schema.String),
	coOrgUserIds: Schema.Array(Schema.String),
})

export type UserAccessContext = {
	organizationIds: readonly OrganizationId[]
	channelIds: readonly ChannelId[]
	memberIds: readonly OrganizationMemberId[]
	coOrgUserIds: readonly UserId[]
}

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
		entityId: Schema.String,
		entityType: Schema.Literal("user", "bot"),
	},
) {}

/**
 * Cache request for user access context.
 * Implements Schema.TaggedRequest (provides WithResult) and PrimaryKey.
 */
export class UserAccessContextRequest extends Schema.TaggedRequest<UserAccessContextRequest>()(
	"UserAccessContextRequest",
	{
		failure: AccessContextLookupError,
		success: UserAccessContextSchema,
		payload: {
			userId: Schema.String,
		},
	},
) {
	[PrimaryKey.symbol]() {
		return `user:${this.userId}`
	}
}

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

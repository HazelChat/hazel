import { PersistedCache, type Persistence } from "@effect/experimental"
import { and, Database, eq, isNull, schema } from "@hazel/db"
import type { BotId, ChannelId, OrganizationId, UserId } from "@hazel/schema"
import { Effect } from "effect"
import {
	AccessContextLookupError,
	type BotAccessContext,
	BotAccessContextRequest,
	CACHE_STORE_ID,
	CACHE_TTL,
	IN_MEMORY_CAPACITY,
	IN_MEMORY_TTL,
	type UserAccessContext,
	UserAccessContextRequest,
} from "./access-context-cache"

/**
 * Service interface for access context caching.
 * Provides get/invalidate methods for both user and bot contexts.
 */
export interface AccessContextCache {
	readonly getUserContext: (
		userId: UserId,
	) => Effect.Effect<UserAccessContext, AccessContextLookupError | Persistence.PersistenceError>

	readonly getBotContext: (
		botId: BotId,
		userId: UserId,
	) => Effect.Effect<BotAccessContext, AccessContextLookupError | Persistence.PersistenceError>

	readonly invalidateUser: (userId: UserId) => Effect.Effect<void, Persistence.PersistenceError>

	readonly invalidateBot: (botId: BotId) => Effect.Effect<void, Persistence.PersistenceError>
}

/**
 * Access context caching service.
 * Uses PersistedCache to cache user and bot access contexts with Redis persistence.
 *
 * Note: Database.Database is intentionally NOT included in dependencies
 * as it's a global infrastructure layer provided at the application root.
 */
export class AccessContextCacheService extends Effect.Service<AccessContextCacheService>()(
	"AccessContextCacheService",
	{
		accessors: true,
		scoped: Effect.gen(function* () {
			const db = yield* Database.Database

			// Create user access context cache
			const userCache = yield* PersistedCache.make({
				storeId: `${CACHE_STORE_ID}:user`,

				lookup: (request: UserAccessContextRequest) =>
					Effect.gen(function* () {
						const userId = request.userId as UserId

						// Query organization memberships
						const orgMembers = yield* db
							.execute((client) =>
								client
									.select({
										organizationId: schema.organizationMembersTable.organizationId,
									})
									.from(schema.organizationMembersTable)
									.where(
										and(
											eq(schema.organizationMembersTable.userId, userId),
											isNull(schema.organizationMembersTable.deletedAt),
										),
									),
							)
							.pipe(
								Effect.catchTag(
									"DatabaseError",
									(error) =>
										new AccessContextLookupError({
											message: "Failed to query user's organizations",
											detail: error.message,
											entityId: userId,
											entityType: "user",
										}),
								),
							)

						const organizationIds = orgMembers.map((m) => m.organizationId)

						return {
							organizationIds,
						}
					}),

				timeToLive: () => CACHE_TTL,
				inMemoryCapacity: IN_MEMORY_CAPACITY,
				inMemoryTTL: IN_MEMORY_TTL,
			})

			// Create bot access context cache
			const botCache = yield* PersistedCache.make({
				storeId: `${CACHE_STORE_ID}:bot`,

				lookup: (request: BotAccessContextRequest) =>
					Effect.gen(function* () {
						const botId = request.botId as BotId

						// Query channels in all orgs where the bot is installed.
						// Bots are org-level (not channel members), so we join
						// bot_installations → channels by organizationId.
						const channels = yield* db
							.execute((client) =>
								client
									.selectDistinct({ channelId: schema.channelsTable.id })
									.from(schema.botInstallationsTable)
									.innerJoin(
										schema.channelsTable,
										and(
											eq(
												schema.channelsTable.organizationId,
												schema.botInstallationsTable.organizationId,
											),
											isNull(schema.channelsTable.deletedAt),
										),
									)
									.where(eq(schema.botInstallationsTable.botId, botId)),
							)
							.pipe(
								Effect.catchTag(
									"DatabaseError",
									(error) =>
										new AccessContextLookupError({
											message: "Failed to query bot's channels",
											detail: error.message,
											entityId: request.botId,
											entityType: "bot",
										}),
								),
							)

						const channelIds = channels.map((c) => c.channelId)

						return { channelIds }
					}),

				timeToLive: () => CACHE_TTL,
				inMemoryCapacity: IN_MEMORY_CAPACITY,
				inMemoryTTL: IN_MEMORY_TTL,
			})

			return {
				getUserContext: (userId: UserId) =>
					userCache.get(new UserAccessContextRequest({ userId })).pipe(
						Effect.map((result) => ({
							organizationIds: result.organizationIds as readonly OrganizationId[],
						})),
					),

				getBotContext: (botId: BotId, userId: UserId) =>
					botCache.get(new BotAccessContextRequest({ botId, userId })).pipe(
						Effect.map((result) => ({
							channelIds: result.channelIds as readonly ChannelId[],
						})),
					),

				invalidateUser: (userId: UserId) =>
					userCache.invalidate(new UserAccessContextRequest({ userId })),

				invalidateBot: (botId: BotId) =>
					// Note: We don't have userId here, but invalidation only uses the primary key (botId)
					botCache.invalidate(new BotAccessContextRequest({ botId, userId: "" as UserId })),
			} satisfies AccessContextCache
		}),
	},
) {}

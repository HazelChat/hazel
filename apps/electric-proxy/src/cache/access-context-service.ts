import { PersistedCache, type Persistence } from "@effect/experimental"
import { and, Database, eq, isNull, schema } from "@hazel/db"
import type { BotId, ChannelId, UserId } from "@hazel/schema"
import { Effect } from "effect"
import {
	AccessContextLookupError,
	type BotAccessContext,
	BotAccessContextRequest,
	CACHE_STORE_ID,
	CACHE_TTL,
	IN_MEMORY_CAPACITY,
	IN_MEMORY_TTL,
} from "./access-context-cache"

/**
 * Service interface for access context caching.
 * Provides get/invalidate methods for bot contexts.
 */
export interface AccessContextCache {
	readonly getBotContext: (
		botId: BotId,
		userId: UserId,
	) => Effect.Effect<BotAccessContext, AccessContextLookupError | Persistence.PersistenceError>

	readonly invalidateBot: (botId: BotId) => Effect.Effect<void, Persistence.PersistenceError>
}

/**
 * Access context caching service.
 * Uses PersistedCache to cache bot access contexts with Redis persistence.
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
				getBotContext: (botId: BotId, userId: UserId) =>
					botCache.get(new BotAccessContextRequest({ botId, userId })).pipe(
						Effect.map((result) => ({
							channelIds: result.channelIds as readonly ChannelId[],
						})),
					),

				invalidateBot: (botId: BotId) =>
					// Note: We don't have userId here, but invalidation only uses the primary key (botId)
					botCache.invalidate(new BotAccessContextRequest({ botId, userId: "" as UserId })),
			} satisfies AccessContextCache
		}),
	},
) {}

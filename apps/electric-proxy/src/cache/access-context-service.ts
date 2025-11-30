import { PersistedCache, type Persistence } from "@effect/experimental"
import { and, Database, eq, inArray, isNull, schema } from "@hazel/db"
import type { BotId, ChannelId, OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import { Context, Effect, Layer } from "effect"
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
 * Service tag for dependency injection
 */
export class AccessContextCacheService extends Context.Tag("AccessContextCacheService")<
	AccessContextCacheService,
	AccessContextCache
>() {}

/**
 * Implementation that uses PersistedCache internally
 */
const makeAccessContextCache = Effect.gen(function* () {
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
								id: schema.organizationMembersTable.id,
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
						Effect.mapError(
							(error) =>
								new AccessContextLookupError({
									message: `Failed to query user's organizations: ${String(error)}`,
									entityId: userId,
									entityType: "user",
								}),
						),
					)

				const organizationIds = orgMembers.map((m) => m.organizationId)
				const memberIds = orgMembers.map((m) => m.id)

				// Query channel memberships
				const channelMembers = yield* db
					.execute((client) =>
						client
							.select({ channelId: schema.channelMembersTable.channelId })
							.from(schema.channelMembersTable)
							.where(
								and(
									eq(schema.channelMembersTable.userId, userId),
									isNull(schema.channelMembersTable.deletedAt),
								),
							),
					)
					.pipe(
						Effect.mapError(
							(error) =>
								new AccessContextLookupError({
									message: `Failed to query user's channels: ${String(error)}`,
									entityId: userId,
									entityType: "user",
								}),
						),
					)

				const channelIds = channelMembers.map((m) => m.channelId)

				// Query co-organization users
				const coOrgUsers =
					organizationIds.length > 0
						? yield* db
								.execute((client) =>
									client
										.selectDistinct({ userId: schema.organizationMembersTable.userId })
										.from(schema.organizationMembersTable)
										.where(
											and(
												inArray(
													schema.organizationMembersTable.organizationId,
													organizationIds,
												),
												isNull(schema.organizationMembersTable.deletedAt),
											),
										),
								)
								.pipe(
									Effect.mapError(
										(error) =>
											new AccessContextLookupError({
												message: `Failed to query co-organization users: ${String(error)}`,
												entityId: userId,
												entityType: "user",
											}),
									),
								)
						: []

				const coOrgUserIds = coOrgUsers.map((u) => u.userId)

				return {
					organizationIds,
					channelIds,
					memberIds,
					coOrgUserIds,
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
				const botUserId = request.userId as UserId

				// Query channel memberships for the bot's userId
				const channelMembers = yield* db
					.execute((client) =>
						client
							.select({ channelId: schema.channelMembersTable.channelId })
							.from(schema.channelMembersTable)
							.where(
								and(
									eq(schema.channelMembersTable.userId, botUserId),
									isNull(schema.channelMembersTable.deletedAt),
								),
							),
					)
					.pipe(
						Effect.mapError(
							(error) =>
								new AccessContextLookupError({
									message: `Failed to query bot's channels: ${String(error)}`,
									entityId: request.botId,
									entityType: "bot",
								}),
						),
					)

				const channelIds = channelMembers.map((m) => m.channelId)

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
					channelIds: result.channelIds as readonly ChannelId[],
					memberIds: result.memberIds as readonly OrganizationMemberId[],
					coOrgUserIds: result.coOrgUserIds as readonly UserId[],
				})),
			),

		getBotContext: (botId: BotId, userId: UserId) =>
			botCache.get(new BotAccessContextRequest({ botId, userId })).pipe(
				Effect.map((result) => ({
					channelIds: result.channelIds as readonly ChannelId[],
				})),
			),

		invalidateUser: (userId: UserId) => userCache.invalidate(new UserAccessContextRequest({ userId })),

		invalidateBot: (botId: BotId) =>
			// Note: We don't have userId here, but invalidation only uses the primary key (botId)
			botCache.invalidate(new BotAccessContextRequest({ botId, userId: "" as UserId })),
	} satisfies AccessContextCache
})

/**
 * Layer that provides AccessContextCacheService.
 * Requires: Persistence.ResultPersistence, Database.Database
 */
export const AccessContextCacheLive = Layer.scoped(AccessContextCacheService, makeAccessContextCache)

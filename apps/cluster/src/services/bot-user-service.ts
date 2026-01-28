import { Database, eq, schema } from "@hazel/db"
import { Cluster, Integrations, type UserId } from "@hazel/domain"
import { Effect, Layer, Option } from "effect"

/**
 * Service for cached bot user lookups.
 *
 * Bot users are created once during integration setup and rarely change.
 * This service caches the bot user ID at initialization to avoid
 * repeated database queries on every webhook.
 */
export class BotUserService extends Effect.Service<BotUserService>()("BotUserService", {
	accessors: true,
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		// Cache for bot user IDs by external ID
		const cache = new Map<string, UserId>()

		/**
		 * Get the bot user ID for a provider, with caching.
		 * Falls back to database lookup if not cached.
		 */
		const getBotUserId = (provider: "github" | "linear" | "figma" | "notion" | "rss") =>
			Effect.gen(function* () {
				const externalId = Integrations.makeIntegrationBotExternalId(provider)

				// Check cache first
				const cached = cache.get(externalId)
				if (cached) {
					return Option.some(cached)
				}

				// Query database
				const results = yield* db
					.execute((client) =>
						client
							.select({ id: schema.usersTable.id })
							.from(schema.usersTable)
							.where(eq(schema.usersTable.externalId, externalId))
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.BotUserQueryError({
										provider,
										message: `Failed to query bot user for ${provider}`,
										cause: err,
									}),
								),
						}),
					)

				if (results.length === 0) {
					yield* Effect.logWarning(`Bot user not found for provider: ${provider}`, {
						externalId,
					})
					return Option.none<UserId>()
				}

				const userId = results[0]!.id as UserId

				// Cache the result
				cache.set(externalId, userId)

				yield* Effect.logDebug(`Cached bot user ID for ${provider}`, {
					externalId,
					userId,
				})

				return Option.some(userId)
			})

		/**
		 * Get GitHub bot user ID.
		 * Returns None if the bot user has not been created.
		 */
		const getGitHubBotUserId = () => getBotUserId("github")

		/**
		 * Get RSS bot user ID.
		 * Returns None if the bot user has not been created.
		 */
		const getRssBotUserId = () => getBotUserId("rss")

		/**
		 * Pre-warm the cache by loading common bot user IDs.
		 * Call this at service initialization if needed.
		 */
		const warmCache = Effect.gen(function* () {
			yield* Effect.logDebug("Warming bot user cache...")
			const providers = ["github", "linear", "figma", "notion", "rss"] as const
			yield* Effect.forEach(providers, (p) => getBotUserId(p), { concurrency: "unbounded" })
			yield* Effect.logDebug(`Bot user cache warmed with ${cache.size} entries`)
		})

		return {
			getBotUserId,
			getGitHubBotUserId,
			getRssBotUserId,
			warmCache,
		}
	}),
}) {}

/**
 * Layer that provides BotUserService with Database dependency.
 */
export const BotUserServiceLive = BotUserService.Default

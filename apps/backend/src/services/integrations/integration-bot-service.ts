import { BotInstallationRepo, BotRepo, OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import { Integrations } from "@hazel/domain"
import type { OrganizationId } from "@hazel/schema"
import type { IntegrationConnection } from "@hazel/domain/models"
import { ServiceMap, Effect, Layer, Option } from "effect"

/**
 * Integration Bot Service
 *
 * Manages global bot users for integration providers.
 * Each provider has a single shared bot user across all organizations.
 */
export class IntegrationBotService extends ServiceMap.Service<IntegrationBotService>()("IntegrationBotService", {
	make: Effect.gen(function* () {
		const userRepo = yield* UserRepo
		const orgMemberRepo = yield* OrganizationMemberRepo
		const botRepo = yield* BotRepo
		const botInstallationRepo = yield* BotInstallationRepo

		/**
		 * Get or create a global bot user for an OAuth integration provider.
		 * Bot users are machine users with predictable external IDs.
		 * Also ensures the bot is a member of the given organization so it appears in Electric sync.
		 */
		const getOrCreateBotUser = (
			provider: IntegrationConnection.IntegrationProvider,
			organizationId: OrganizationId,
		) =>
			Effect.gen(function* () {
				const externalId = `integration-bot-${provider}`

				// Try to find existing bot user
				const existing = yield* userRepo.findByExternalId(externalId)
				const botUser = Option.isSome(existing)
					? existing.value
					: yield* Effect.gen(function* () {
							// Create new machine user for this integration
							const botConfig = Integrations.getBotConfig(provider)
							const newUser = yield* userRepo.insert({
								externalId,
								email: `${provider}-bot@integrations.internal`,
								firstName: botConfig.name,
								lastName: "",
								avatarUrl: botConfig.avatarUrl,
								userType: "machine",
								settings: null,
								isOnboarded: true,
								timezone: null,
								deletedAt: null,
							})

							return newUser[0]
						})

				// Ensure bot is a member of this organization (so it shows in Electric sync)
				yield* orgMemberRepo.upsertByOrgAndUser({
					organizationId,
					userId: botUser.id,
					role: "member",
					nickname: null,
					joinedAt: new Date(),
					invitedBy: null,
					deletedAt: null,
				})

				return botUser
			})

		/**
		 * Get or create a global bot user for a webhook-based integration provider.
		 * Similar to OAuth providers but uses WEBHOOK_BOT_CONFIGS.
		 */
		const getOrCreateWebhookBotUser = (
			provider: Integrations.WebhookProvider,
			organizationId: OrganizationId,
		) =>
			Effect.gen(function* () {
				const externalId = `integration-bot-${provider}`

				// Try to find existing bot user
				const existing = yield* userRepo.findByExternalId(externalId)
				const botUser = Option.isSome(existing)
					? existing.value
					: yield* Effect.gen(function* () {
							// Create new machine user for this webhook integration
							const botConfig = Integrations.getWebhookBotConfig(provider)
							const newUser = yield* userRepo.insert({
								externalId,
								email: `${provider}-bot@webhooks.internal`,
								firstName: botConfig.name,
								lastName: "",
								avatarUrl: botConfig.avatarUrl,
								userType: "machine",
								settings: null,
								isOnboarded: true,
								timezone: null,
								deletedAt: null,
							})

							return newUser[0]
						})

				// Ensure bot is a member of this organization (so it shows in Electric sync)
				yield* orgMemberRepo.upsertByOrgAndUser({
					organizationId,
					userId: botUser.id,
					role: "member",
					nickname: null,
					joinedAt: new Date(),
					invitedBy: null,
					deletedAt: null,
				})

				return botUser
			})

		/**
		 * Add an existing seeded bot to an organization.
		 * Unlike getOrCreateBotUser, this does NOT create the bot user - it must already exist from seeding.
		 * Creates org membership and bot installation.
		 * Returns Option.some(botUser) if found and added, Option.none() if bot not found.
		 */
		const addBotToOrg = (
			provider: IntegrationConnection.IntegrationProvider,
			organizationId: OrganizationId,
		) =>
			Effect.gen(function* () {
				const externalId = `internal-bot-${provider}`

				// Find existing bot user (must already exist from seed script)
				const existingUser = yield* userRepo.findByExternalId(externalId)
				if (Option.isNone(existingUser)) {
					yield* Effect.logWarning("Bot user not found - has seed script been run?", {
						provider,
						externalId,
					})
					return Option.none()
				}

				const botUser = existingUser.value

				// Find the bot record
				const existingBot = yield* botRepo.findByUserId(botUser.id)
				if (Option.isNone(existingBot)) {
					yield* Effect.logWarning("Bot record not found for user - has seed script been run?", {
						provider,
						userId: botUser.id,
					})
					return Option.none()
				}

				const bot = existingBot.value

				// Add bot to org membership (so it shows in Electric sync)
				yield* orgMemberRepo.upsertByOrgAndUser({
					organizationId,
					userId: botUser.id,
					role: "member",
					nickname: null,
					joinedAt: new Date(),
					invitedBy: null,
					deletedAt: null,
				})

				// Create bot installation (idempotent - check if exists first)
				const existingInstallation = yield* botInstallationRepo.findByBotAndOrg(
					bot.id,
					organizationId,
				)

				if (Option.isNone(existingInstallation)) {
					yield* botInstallationRepo.insert({
						botId: bot.id,
						organizationId,
						installedBy: botUser.id,
					})
				}

				return Option.some(botUser)
			})

		return { getOrCreateBotUser, getOrCreateWebhookBotUser, addBotToOrg }
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(UserRepo.layer),
		Layer.provide(OrganizationMemberRepo.layer),
		Layer.provide(BotRepo.layer),
		Layer.provide(BotInstallationRepo.layer),
	)
}

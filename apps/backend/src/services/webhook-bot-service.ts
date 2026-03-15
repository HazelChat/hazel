import { OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import type { ChannelWebhookId, OrganizationId, UserId } from "@hazel/schema"
import { ServiceMap, Effect, Layer } from "effect"

/**
 * Webhook Bot Service
 *
 * Manages machine users for channel webhooks.
 * Each webhook has its own unique bot user identity.
 */
export class WebhookBotService extends ServiceMap.Service<WebhookBotService>()("WebhookBotService", {
	make: Effect.gen(function* () {
		const userRepo = yield* UserRepo
		const orgMemberRepo = yield* OrganizationMemberRepo

		/**
		 * Create a machine user for a webhook.
		 * Each webhook gets its own unique bot user.
		 */
		const createWebhookBot = (
			webhookId: ChannelWebhookId,
			name: string,
			avatarUrl: string | null,
			organizationId: OrganizationId,
		) =>
			Effect.gen(function* () {
				const externalId = `webhook-bot-${webhookId}`

				// Create machine user for this webhook
				const [botUser] = yield* userRepo.insert({
					externalId,
					email: `webhook-${webhookId}@webhooks.internal`,
					firstName: name,
					lastName: "",
					avatarUrl: avatarUrl ?? "",
					userType: "machine",
					settings: null,
					isOnboarded: true,
					timezone: null,
					deletedAt: null,
				})

				// Add bot to organization so it shows in Electric sync
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
		 * Update webhook bot's display info (name, avatar).
		 */
		const updateWebhookBot = (userId: UserId, name: string, avatarUrl: string | null) =>
			userRepo.update({
				id: userId,
				firstName: name,
				avatarUrl: avatarUrl ?? "",
			})

		return { createWebhookBot, updateWebhookBot }
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(UserRepo.layer),
		Layer.provide(OrganizationMemberRepo.layer),
	)
}

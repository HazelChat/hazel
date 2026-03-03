import { ChannelRepo, ChannelWebhookRepo } from "@hazel/backend-core"
import { ErrorUtils } from "@hazel/domain"
import type { ChannelId, ChannelWebhookId } from "@hazel/schema"
import { Effect } from "effect"
import { OrgResolver } from "../services/org-resolver"

/** @effect-leakable-service */
export class ChannelWebhookPolicy extends Effect.Service<ChannelWebhookPolicy>()(
	"ChannelWebhookPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "ChannelWebhook" as const

			const channelRepo = yield* ChannelRepo
			const webhookRepo = yield* ChannelWebhookRepo
			const orgResolver = yield* OrgResolver

			const canCreate = (channelId: ChannelId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					channelRepo.with(channelId, (channel) =>
						orgResolver.requireAdminOrOwner(
							channel.organizationId,
							"channel-webhooks:write",
							policyEntity,
							"create",
						),
					),
				)

			const canRead = (channelId: ChannelId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(
					channelRepo.with(channelId, (channel) =>
						orgResolver.requireAdminOrOwner(
							channel.organizationId,
							"channel-webhooks:read",
							policyEntity,
							"select",
						),
					),
				)

			const canUpdate = (webhookId: ChannelWebhookId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					webhookRepo.with(webhookId, (webhook) =>
						orgResolver.requireAdminOrOwner(
							webhook.organizationId,
							"channel-webhooks:write",
							policyEntity,
							"update",
						),
					),
				)

			const canDelete = (webhookId: ChannelWebhookId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					webhookRepo.with(webhookId, (webhook) =>
						orgResolver.requireAdminOrOwner(
							webhook.organizationId,
							"channel-webhooks:write",
							policyEntity,
							"delete",
						),
					),
				)

			return { canCreate, canRead, canUpdate, canDelete } as const
		}),
		dependencies: [ChannelRepo.Default, ChannelWebhookRepo.Default, OrgResolver.Default],
		accessors: true,
	},
) {}

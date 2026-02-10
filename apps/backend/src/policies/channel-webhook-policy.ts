import { ChannelRepo, ChannelWebhookRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { ChannelId, ChannelWebhookId } from "@hazel/schema"
import { Effect } from "effect"
import { makeOrganizationScopeChecks, makePolicy, withPolicyUnauthorized } from "../lib/policy-utils"

/** @effect-leakable-service */
export class ChannelWebhookPolicy extends Effect.Service<ChannelWebhookPolicy>()(
	"ChannelWebhookPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "ChannelWebhook" as const

			const channelRepo = yield* ChannelRepo
			const webhookRepo = yield* ChannelWebhookRepo
			const orgMemberRepo = yield* OrganizationMemberRepo
			const authorize = makePolicy(policyEntity)
			const orgScope = makeOrganizationScopeChecks((organizationId, actorId) =>
				orgMemberRepo.findByOrgAndUser(organizationId, actorId).pipe(withSystemActor),
			)

			// Can create webhook on a channel (org admin only)
			const canCreate = (channelId: ChannelId) =>
				withPolicyUnauthorized(
					policyEntity,
					"create",
					channelRepo.with(channelId, (channel) =>
						authorize("create", (actor) =>
							orgScope.isAdminOrOwner(channel.organizationId, actor.id),
						),
					),
				)

			// Can read webhooks for a channel (org admin only)
			const canRead = (channelId: ChannelId) =>
				withPolicyUnauthorized(
					policyEntity,
					"select",
					channelRepo.with(channelId, (channel) =>
						authorize("select", (actor) =>
							orgScope.isAdminOrOwner(channel.organizationId, actor.id),
						),
					),
				)

			// Can update a webhook (org admin only)
			const canUpdate = (webhookId: ChannelWebhookId) =>
				withPolicyUnauthorized(
					policyEntity,
					"update",
					webhookRepo.with(webhookId, (webhook) =>
						authorize("update", (actor) =>
							orgScope.isAdminOrOwner(webhook.organizationId, actor.id),
						),
					),
				)

			// Can delete a webhook (org admin only)
			const canDelete = (webhookId: ChannelWebhookId) =>
				withPolicyUnauthorized(
					policyEntity,
					"delete",
					webhookRepo.with(webhookId, (webhook) =>
						authorize("delete", (actor) =>
							orgScope.isAdminOrOwner(webhook.organizationId, actor.id),
						),
					),
				)

			return { canCreate, canRead, canUpdate, canDelete } as const
		}),
		dependencies: [ChannelRepo.Default, ChannelWebhookRepo.Default, OrganizationMemberRepo.Default],
		accessors: true,
	},
) {}

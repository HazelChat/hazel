import { ChannelRepo, RssSubscriptionRepo } from "@hazel/backend-core"
import { ErrorUtils } from "@hazel/domain"
import type { ChannelId, OrganizationId, RssSubscriptionId } from "@hazel/schema"
import { Effect } from "effect"
import { OrgResolver } from "../services/org-resolver"

/** @effect-leakable-service */
export class RssSubscriptionPolicy extends Effect.Service<RssSubscriptionPolicy>()(
	"RssSubscriptionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "RssSubscription" as const

			const channelRepo = yield* ChannelRepo
			const subscriptionRepo = yield* RssSubscriptionRepo
			const orgResolver = yield* OrgResolver

			const canCreate = (channelId: ChannelId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					channelRepo.with(channelId, (channel) =>
						orgResolver.requireAdminOrOwner(
							channel.organizationId,
							"rss-subscriptions:write",
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
							"rss-subscriptions:read",
							policyEntity,
							"select",
						),
					),
				)

			const canUpdate = (subscriptionId: RssSubscriptionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					subscriptionRepo.with(subscriptionId, (subscription) =>
						orgResolver.requireAdminOrOwner(
							subscription.organizationId,
							"rss-subscriptions:write",
							policyEntity,
							"update",
						),
					),
				)

			const canDelete = (subscriptionId: RssSubscriptionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					subscriptionRepo.with(subscriptionId, (subscription) =>
						orgResolver.requireAdminOrOwner(
							subscription.organizationId,
							"rss-subscriptions:write",
							policyEntity,
							"delete",
						),
					),
				)

			const canReadByOrganization = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(
					orgResolver.requireAdminOrOwner(
						organizationId,
						"rss-subscriptions:read",
						policyEntity,
						"select",
					),
				)

			return { canCreate, canRead, canReadByOrganization, canUpdate, canDelete } as const
		}),
		dependencies: [ChannelRepo.Default, RssSubscriptionRepo.Default, OrgResolver.Default],
		accessors: true,
	},
) {}

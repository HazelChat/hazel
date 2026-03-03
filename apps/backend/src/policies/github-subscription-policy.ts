import { ChannelRepo, GitHubSubscriptionRepo } from "@hazel/backend-core"
import { ErrorUtils } from "@hazel/domain"
import type { ChannelId, GitHubSubscriptionId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { OrgResolver } from "../services/org-resolver"

/** @effect-leakable-service */
export class GitHubSubscriptionPolicy extends Effect.Service<GitHubSubscriptionPolicy>()(
	"GitHubSubscriptionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "GitHubSubscription" as const

			const channelRepo = yield* ChannelRepo
			const subscriptionRepo = yield* GitHubSubscriptionRepo
			const orgResolver = yield* OrgResolver

			const canCreate = (channelId: ChannelId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					channelRepo.with(channelId, (channel) =>
						orgResolver.requireAdminOrOwner(
							channel.organizationId,
							"github-subscriptions:write",
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
							"github-subscriptions:read",
							policyEntity,
							"select",
						),
					),
				)

			const canUpdate = (subscriptionId: GitHubSubscriptionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					subscriptionRepo.with(subscriptionId, (subscription) =>
						orgResolver.requireAdminOrOwner(
							subscription.organizationId,
							"github-subscriptions:write",
							policyEntity,
							"update",
						),
					),
				)

			const canDelete = (subscriptionId: GitHubSubscriptionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					subscriptionRepo.with(subscriptionId, (subscription) =>
						orgResolver.requireAdminOrOwner(
							subscription.organizationId,
							"github-subscriptions:write",
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
						"github-subscriptions:read",
						policyEntity,
						"select",
					),
				)

			return { canCreate, canRead, canReadByOrganization, canUpdate, canDelete } as const
		}),
		dependencies: [ChannelRepo.Default, GitHubSubscriptionRepo.Default, OrgResolver.Default],
		accessors: true,
	},
) {}

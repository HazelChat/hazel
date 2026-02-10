import { ChannelRepo, GitHubSubscriptionRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { ChannelId, GitHubSubscriptionId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { makeOrganizationScopeChecks, makePolicy, withPolicyUnauthorized } from "../lib/policy-utils"

/** @effect-leakable-service */
export class GitHubSubscriptionPolicy extends Effect.Service<GitHubSubscriptionPolicy>()(
	"GitHubSubscriptionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "GitHubSubscription" as const

			const channelRepo = yield* ChannelRepo
			const subscriptionRepo = yield* GitHubSubscriptionRepo
			const orgMemberRepo = yield* OrganizationMemberRepo
			const authorize = makePolicy(policyEntity)
			const orgScope = makeOrganizationScopeChecks((organizationId, actorId) =>
				orgMemberRepo.findByOrgAndUser(organizationId, actorId).pipe(withSystemActor),
			)

			// Can create subscription on a channel (org admin only)
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

			// Can read subscriptions for a channel (org admin only)
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

			// Can update a subscription (org admin only)
			const canUpdate = (subscriptionId: GitHubSubscriptionId) =>
				withPolicyUnauthorized(
					policyEntity,
					"update",
					subscriptionRepo.with(subscriptionId, (subscription) =>
						authorize("update", (actor) =>
							orgScope.isAdminOrOwner(subscription.organizationId, actor.id),
						),
					),
				)

			// Can delete a subscription (org admin only)
			const canDelete = (subscriptionId: GitHubSubscriptionId) =>
				withPolicyUnauthorized(
					policyEntity,
					"delete",
					subscriptionRepo.with(subscriptionId, (subscription) =>
						authorize("delete", (actor) =>
							orgScope.isAdminOrOwner(subscription.organizationId, actor.id),
						),
					),
				)

			// Can read subscriptions for an organization (org admin only)
			const canReadByOrganization = (organizationId: OrganizationId) =>
				authorize("select", (actor) => orgScope.isAdminOrOwner(organizationId, actor.id))

			return { canCreate, canRead, canReadByOrganization, canUpdate, canDelete } as const
		}),
		dependencies: [ChannelRepo.Default, GitHubSubscriptionRepo.Default, OrganizationMemberRepo.Default],
		accessors: true,
	},
) {}

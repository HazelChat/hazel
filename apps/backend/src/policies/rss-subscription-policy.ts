import { ChannelRepo, OrganizationMemberRepo, RssSubscriptionRepo } from "@hazel/backend-core"
import {
	type ChannelId,
	ErrorUtils,
	type OrganizationId,
	policy,
	type RssSubscriptionId,
	type UserId,
	withSystemActor,
} from "@hazel/domain"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"

/** @effect-leakable-service */
export class RssSubscriptionPolicy extends Effect.Service<RssSubscriptionPolicy>()(
	"RssSubscriptionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "RssSubscription" as const

			const channelRepo = yield* ChannelRepo
			const subscriptionRepo = yield* RssSubscriptionRepo
			const orgMemberRepo = yield* OrganizationMemberRepo

			// Helper: check if user is org admin
			const isOrgAdmin = (organizationId: OrganizationId, actorId: UserId) =>
				Effect.gen(function* () {
					const member = yield* orgMemberRepo
						.findByOrgAndUser(organizationId, actorId)
						.pipe(withSystemActor)

					if (Option.isNone(member)) {
						return false
					}

					return isAdminOrOwner(member.value.role)
				})

			// Can create subscription on a channel (org admin only)
			const canCreate = (channelId: ChannelId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					channelRepo.with(channelId, (channel) =>
						policy(
							policyEntity,
							"create",
							Effect.fn(`${policyEntity}.create`)(function* (actor) {
								return yield* isOrgAdmin(channel.organizationId, actor.id)
							}),
						),
					),
				)

			// Can read subscriptions for a channel (org admin only)
			const canRead = (channelId: ChannelId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(
					channelRepo.with(channelId, (channel) =>
						policy(
							policyEntity,
							"select",
							Effect.fn(`${policyEntity}.select`)(function* (actor) {
								return yield* isOrgAdmin(channel.organizationId, actor.id)
							}),
						),
					),
				)

			// Can update a subscription (org admin only)
			const canUpdate = (subscriptionId: RssSubscriptionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					subscriptionRepo.with(subscriptionId, (subscription) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								return yield* isOrgAdmin(subscription.organizationId, actor.id)
							}),
						),
					),
				)

			// Can delete a subscription (org admin only)
			const canDelete = (subscriptionId: RssSubscriptionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					subscriptionRepo.with(subscriptionId, (subscription) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								return yield* isOrgAdmin(subscription.organizationId, actor.id)
							}),
						),
					),
				)

			// Can read subscriptions for an organization (org admin only)
			const canReadByOrganization = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(
					policy(
						policyEntity,
						"select",
						Effect.fn(`${policyEntity}.selectByOrganization`)(function* (actor) {
							return yield* isOrgAdmin(organizationId, actor.id)
						}),
					),
				)

			return { canCreate, canRead, canReadByOrganization, canUpdate, canDelete } as const
		}),
		dependencies: [ChannelRepo.Default, RssSubscriptionRepo.Default, OrganizationMemberRepo.Default],
		accessors: true,
	},
) {}

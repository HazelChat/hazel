import { ErrorUtils, type OrganizationId, policy, type UserId, withSystemActor } from "@hazel/domain"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"
import { OrganizationMemberRepo } from "../repositories/organization-member-repo"

/** @effect-leakable-service */
export class DiscordPolicy extends Effect.Service<DiscordPolicy>()("DiscordPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Discord" as const

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

		// Can list Discord guilds (org admin only)
		const canListGuilds = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"select",
			)(
				policy(
					policyEntity,
					"select",
					Effect.fn(`${policyEntity}.listGuilds`)(function* (actor) {
						return yield* isOrgAdmin(organizationId, actor.id)
					}),
				),
			)

		// Can list Discord channels (org admin only)
		const canListChannels = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"select",
			)(
				policy(
					policyEntity,
					"select",
					Effect.fn(`${policyEntity}.listChannels`)(function* (actor) {
						return yield* isOrgAdmin(organizationId, actor.id)
					}),
				),
			)

		// Can create Discord webhook (org admin only)
		const canCreateWebhook = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				policy(
					policyEntity,
					"create",
					Effect.fn(`${policyEntity}.createWebhook`)(function* (actor) {
						return yield* isOrgAdmin(organizationId, actor.id)
					}),
				),
			)

		return { canListGuilds, canListChannels, canCreateWebhook } as const
	}),
	dependencies: [OrganizationMemberRepo.Default],
	accessors: true,
}) {}

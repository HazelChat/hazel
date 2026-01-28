import {
	type ChannelId,
	ErrorUtils,
	type ExternalChannelLinkId,
	type OrganizationId,
	policy,
	type UserId,
	withSystemActor,
} from "@hazel/domain"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"
import { ChannelRepo } from "../repositories/channel-repo"
import { ExternalChannelLinkRepo } from "../repositories/external-channel-link-repo"
import { OrganizationMemberRepo } from "../repositories/organization-member-repo"

/** @effect-leakable-service */
export class ExternalChannelLinkPolicy extends Effect.Service<ExternalChannelLinkPolicy>()(
	"ExternalChannelLinkPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "ExternalChannelLink" as const

			const channelRepo = yield* ChannelRepo
			const linkRepo = yield* ExternalChannelLinkRepo
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

			// Can create link on a channel (org admin only)
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

			// Can read links for a channel (org admin only)
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

			// Can read links for an organization (org admin only)
			const canReadOrg = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(
					policy(
						policyEntity,
						"select",
						Effect.fn(`${policyEntity}.select`)(function* (actor) {
							return yield* isOrgAdmin(organizationId, actor.id)
						}),
					),
				)

			// Can update a link (org admin only)
			const canUpdate = (linkId: ExternalChannelLinkId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					linkRepo.with(linkId, (link) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								return yield* isOrgAdmin(link.organizationId, actor.id)
							}),
						),
					),
				)

			// Can delete a link (org admin only)
			const canDelete = (linkId: ExternalChannelLinkId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					linkRepo.with(linkId, (link) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								return yield* isOrgAdmin(link.organizationId, actor.id)
							}),
						),
					),
				)

			return { canCreate, canRead, canReadOrg, canUpdate, canDelete } as const
		}),
		dependencies: [ChannelRepo.Default, ExternalChannelLinkRepo.Default, OrganizationMemberRepo.Default],
		accessors: true,
	},
) {}

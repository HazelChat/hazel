import { InvitationRepo, OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { InvitationId, OrganizationId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

/**
 * @effect-leakable-service
 */
export class InvitationPolicy extends Effect.Service<InvitationPolicy>()("InvitationPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Invitation" as const

		const invitationRepo = yield* InvitationRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const userRepo = yield* UserRepo
		const orgResolver = yield* OrgResolver

		const canRead = (_invitationId: InvitationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"select",
			)(
				policy(
					policyEntity,
					"select",
					Effect.fn(`${policyEntity}.select`)(function* (_actor) {
						return yield* Effect.succeed(true)
					}),
				),
			)

		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(orgResolver.requireAdminOrOwner(organizationId, "invitations:write", policyEntity, "create"))

		const canUpdate = (id: InvitationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				invitationRepo.with(id, (invitation) =>
					policy(
						policyEntity,
						"update",
						Effect.fn(`${policyEntity}.update`)(function* (actor) {
							// Creator can update
							if (actor.id === invitation.invitedBy) {
								return yield* Effect.succeed(true)
							}

							// Org admin/owner can update
							const orgMember = yield* organizationMemberRepo.findByOrgAndUser(
								invitation.organizationId,
								actor.id,
							)

							if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
								return yield* Effect.succeed(true)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		const canDelete = (id: InvitationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				invitationRepo.with(id, (invitation) =>
					policy(
						policyEntity,
						"delete",
						Effect.fn(`${policyEntity}.delete`)(function* (actor) {
							// Creator can delete
							if (actor.id === invitation.invitedBy) {
								return yield* Effect.succeed(true)
							}

							// Org admin/owner can delete
							const orgMember = yield* organizationMemberRepo.findByOrgAndUser(
								invitation.organizationId,
								actor.id,
							)

							if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
								return yield* Effect.succeed(true)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		const canAccept = (id: InvitationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"accept",
			)(
				invitationRepo.with(id, (invitation) =>
					policy(
						policyEntity,
						"accept",
						Effect.fn(`${policyEntity}.accept`)(function* (actor) {
							const user = yield* userRepo.findById(actor.id)

							if (Option.isNone(user)) {
								return yield* Effect.succeed(false)
							}

							if (user.value.email === invitation.email) {
								return yield* Effect.succeed(true)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		const canList = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"list",
			)(orgResolver.requireAdminOrOwner(organizationId, "invitations:read", policyEntity, "list"))

		return { canRead, canCreate, canUpdate, canDelete, canAccept, canList } as const
	}),
	dependencies: [
		InvitationRepo.Default,
		OrganizationMemberRepo.Default,
		UserRepo.Default,
		OrgResolver.Default,
	],
	accessors: true,
}) {}

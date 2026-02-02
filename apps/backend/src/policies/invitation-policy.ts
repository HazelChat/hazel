import { InvitationRepo, OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import {
	ErrorUtils,
	type InvitationId,
	type OrganizationId,
	policy,
	policyCompose,
	type UserId,
	withSystemActor,
} from "@hazel/domain"
import { Effect, Option, pipe } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"

/**
 * @effect-leakable-service
 */
export class InvitationPolicy extends Effect.Service<InvitationPolicy>()("InvitationPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Invitation" as const

		const invitationRepo = yield* InvitationRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const userRepo = yield* UserRepo

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
			)(
				policy(
					policyEntity,
					"create",
					Effect.fn(`${policyEntity}.create`)(function* (actor) {
						// Only organization admins can create invitations
						const orgMember = yield* organizationMemberRepo
							.findByOrgAndUser(organizationId, actor.id)
							.pipe(withSystemActor)

						if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
							return yield* Effect.succeed(true)
						}

						return yield* Effect.succeed(false)
					}),
				),
			)

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
							// Invitation creator can update it
							if (actor.id === invitation.invitedBy) {
								return yield* Effect.succeed(true)
							}

							// Organization admins and owners can update any invitation
							const orgMember = yield* organizationMemberRepo
								.findByOrgAndUser(invitation.organizationId, actor.id)
								.pipe(withSystemActor)

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
							// Invitation creator can delete it
							if (actor.id === invitation.invitedBy) {
								return yield* Effect.succeed(true)
							}

							// Organization admins and owners can delete any invitation
							const orgMember = yield* organizationMemberRepo
								.findByOrgAndUser(invitation.organizationId, actor.id)
								.pipe(withSystemActor)

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
							// Only the invited user can accept the invitation
							// Check if the actor's email matches the invitation email
							const user = yield* userRepo.findById(actor.id).pipe(withSystemActor)

							if (Option.isNone(user)) {
								return yield* Effect.succeed(false)
							}

							// Check if user's email matches the invitation email
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
			)(
				policy(
					policyEntity,
					"list",
					Effect.fn(`${policyEntity}.list`)(function* (actor) {
						// Organization admins and owners can list invitations
						const orgMember = yield* organizationMemberRepo
							.findByOrgAndUser(organizationId, actor.id)
							.pipe(withSystemActor)

						if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
							return yield* Effect.succeed(true)
						}

						return yield* Effect.succeed(false)
					}),
				),
			)

		return { canRead, canCreate, canUpdate, canDelete, canAccept, canList } as const
	}),
	dependencies: [InvitationRepo.Default, OrganizationMemberRepo.Default, UserRepo.Default],
	accessors: true,
}) {}

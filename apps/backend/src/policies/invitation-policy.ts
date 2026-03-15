import { InvitationRepo, OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import { ErrorUtils, policy } from "@hazel/domain"
import type { InvitationId, OrganizationId } from "@hazel/schema"
import { ServiceMap, Effect, Layer, Option } from "effect"
import { isAdminOrOwner, withAnnotatedScope } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

/**
 * @effect-leakable-service
 */
export class InvitationPolicy extends ServiceMap.Service<InvitationPolicy>()("InvitationPolicy/Policy", {
	make: Effect.gen(function* () {
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
			)(
				withAnnotatedScope((scope) =>
					orgResolver.requireAdminOrOwner(organizationId, scope, policyEntity, "create"),
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
			)(
				withAnnotatedScope((scope) =>
					orgResolver.requireAdminOrOwner(organizationId, scope, policyEntity, "list"),
				),
			)

		return { canRead, canCreate, canUpdate, canDelete, canAccept, canList } as const
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(InvitationRepo.Default),
		Layer.provide(OrganizationMemberRepo.Default),
		Layer.provide(UserRepo.Default),
		Layer.provide(OrgResolver.Default),
	)
}

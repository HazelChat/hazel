import { OrganizationMemberRepo } from "@hazel/backend-core"
import { ErrorUtils, type OrganizationId, policy, withSystemActor } from "@hazel/domain"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"

export class OrganizationPolicy extends Effect.Service<OrganizationPolicy>()("OrganizationPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Organization" as const

		const organziationMemberRepo = yield* OrganizationMemberRepo

		const canCreate = () =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(policy(policyEntity, "create", (_actor) => Effect.succeed(true)))

		const canUpdate = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				policy(
					policyEntity,
					"update",
					Effect.fn(`${policyEntity}.update`)(function* (actor) {
						const currentMember = yield* organziationMemberRepo
							.findByOrgAndUser(id, actor.id)
							.pipe(withSystemActor)

						if (Option.isNone(currentMember)) {
							return yield* Effect.succeed(false)
						}

						const currentMemberValue = currentMember.value

						return yield* Effect.succeed(isAdminOrOwner(currentMemberValue.role))
					}),
				),
			)

		const isMember = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"isMember",
			)(
				policy(
					policyEntity,
					"isMember",
					Effect.fn(`${policyEntity}.isMember`)(function* (actor) {
						const currentMember = yield* organziationMemberRepo
							.findByOrgAndUser(id, actor.id)
							.pipe(withSystemActor)

						return yield* Effect.succeed(Option.isSome(currentMember))
					}),
				),
			)

		const canDelete = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				policy(
					policyEntity,
					"delete",
					Effect.fn(`${policyEntity}.delete`)(function* (actor) {
						const currentMember = yield* organziationMemberRepo
							.findByOrgAndUser(id, actor.id)
							.pipe(withSystemActor)

						if (Option.isNone(currentMember)) {
							return yield* Effect.succeed(false)
						}

						const currentMemberValue = currentMember.value

						return yield* Effect.succeed(currentMemberValue.role === "owner")
					}),
				),
			)

		const canManagePublicInvite = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"managePublicInvite",
			)(
				policy(
					policyEntity,
					"managePublicInvite",
					Effect.fn(`${policyEntity}.managePublicInvite`)(function* (actor) {
						const currentMember = yield* organziationMemberRepo
							.findByOrgAndUser(id, actor.id)
							.pipe(withSystemActor)

						if (Option.isNone(currentMember)) {
							return yield* Effect.succeed(false)
						}

						const currentMemberValue = currentMember.value

						return yield* Effect.succeed(isAdminOrOwner(currentMemberValue.role))
					}),
				),
			)

		return { canUpdate, canDelete, canCreate, isMember, canManagePublicInvite } as const
	}),
	dependencies: [OrganizationMemberRepo.Default],
	accessors: true,
}) {}

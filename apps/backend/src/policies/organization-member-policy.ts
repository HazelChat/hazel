import { OrganizationMemberRepo } from "@hazel/backend-core"
import {
	ErrorUtils,
	type OrganizationId,
	type OrganizationMemberId,
	policy,
	policyCompose,
	type UserId,
	withSystemActor,
} from "@hazel/domain"
import { Effect, Option, pipe } from "effect"

export class OrganizationMemberPolicy extends Effect.Service<OrganizationMemberPolicy>()(
	"OrganizationMemberPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const organizationMemberRepo = yield* OrganizationMemberRepo
			const policyEntity = "OrganizationMember" as const

			const canCreate = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					policy(
						policyEntity,
						"create",
						Effect.fn(`${policyEntity}.create`)(function* (actor) {
							// Check if user is already a member or admin of the organization
							const currentMember = yield* organizationMemberRepo
								.findByOrgAndUser(organizationId, actor.id)
								.pipe(withSystemActor)

							// If user is already a member, they can't create another membership
							if (Option.isSome(currentMember)) {
								return yield* Effect.succeed(false)
							}

							// For now, allow users to join organizations
							// This might be restricted to invitation-based flow later
							return yield* Effect.succeed(true)
						}),
					),
				)

			const canUpdate = (id: OrganizationMemberId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					organizationMemberRepo.with(id, (member) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								if (actor.id === member.userId) {
									return yield* Effect.succeed(true)
								}

								const currentMember = yield* organizationMemberRepo
									.findByOrgAndUser(member.organizationId, actor.id)
									.pipe(withSystemActor)

								if (Option.isNone(currentMember)) {
									return yield* Effect.succeed(false)
								}

								const currentMemberValue = currentMember.value

								return yield* Effect.succeed(currentMemberValue.role === "admin")
							}),
						),
					),
				)

			const canDelete = (id: OrganizationMemberId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					organizationMemberRepo.with(id, (member) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								if (actor.id === member.userId) {
									return yield* Effect.succeed(true)
								}

								const currentMember = yield* organizationMemberRepo
									.findByOrgAndUser(member.organizationId, actor.id)
									.pipe(withSystemActor)

								if (Option.isNone(currentMember)) {
									return yield* Effect.succeed(false)
								}

								const currentMemberValue = currentMember.value

								return yield* Effect.succeed(currentMemberValue.role === "admin")
							}),
						),
					),
				)

			return { canCreate, canUpdate, canDelete } as const
		}),
		dependencies: [OrganizationMemberRepo.Default],
		accessors: true,
	},
) {}

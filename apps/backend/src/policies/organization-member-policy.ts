import {
	type OrganizationId,
	type OrganizationMemberId,
	policy,
	policyCompose,
	UnauthorizedError,
	type UserId,
} from "@hazel/effect-lib"
import { Effect, Option, pipe } from "effect"
import { OrganizationMemberRepo } from "../repositories/organization-member-repo"

export class OrganizationMemberPolicy extends Effect.Service<OrganizationMemberPolicy>()(
	"OrganizationMemberPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const organizationMemberRepo = yield* OrganizationMemberRepo
			const policyEntity = "OrganizationMember" as const

			const canUpdate = (id: OrganizationMemberId) =>
				UnauthorizedError.refail(
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

								const currentMember = yield* organizationMemberRepo.findByOrgAndUser(
									member.organizationId,
									actor.id,
								)

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
				UnauthorizedError.refail(
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

								const currentMember = yield* organizationMemberRepo.findByOrgAndUser(
									member.organizationId,
									actor.id,
								)

								if (Option.isNone(currentMember)) {
									return yield* Effect.succeed(false)
								}

								const currentMemberValue = currentMember.value

								return yield* Effect.succeed(currentMemberValue.role === "admin")
							}),
						),
					),
				)

			return { canUpdate, canDelete } as const
		}),
		dependencies: [OrganizationMemberRepo.Default],
		accessors: true,
	},
) {}

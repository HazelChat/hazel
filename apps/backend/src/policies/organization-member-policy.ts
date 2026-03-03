import { OrganizationMemberRepo } from "@hazel/backend-core"
import { ErrorUtils, policy, withSystemActor } from "@hazel/domain"
import type { OrganizationId, OrganizationMemberId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { OrgResolver } from "../services/org-resolver"

export class OrganizationMemberPolicy extends Effect.Service<OrganizationMemberPolicy>()(
	"OrganizationMemberPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "OrganizationMember" as const

			const organizationMemberRepo = yield* OrganizationMemberRepo
			const orgResolver = yield* OrgResolver

			const canCreate = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					policy(
						policyEntity,
						"create",
						Effect.fn(`${policyEntity}.create`)(function* (actor) {
							// Check if user is already a member
							const currentMember = yield* organizationMemberRepo
								.findByOrgAndUser(organizationId, actor.id)
								.pipe(withSystemActor)

							// If already a member, can't create another membership
							if (Option.isSome(currentMember)) {
								return yield* Effect.succeed(false)
							}

							// Allow users to join organizations
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
								// Self-update always allowed
								if (actor.id === member.userId) {
									return yield* Effect.succeed(true)
								}

								// Admins can update other members
								const currentMember = yield* organizationMemberRepo
									.findByOrgAndUser(member.organizationId, actor.id)
									.pipe(withSystemActor)

								if (Option.isNone(currentMember)) {
									return yield* Effect.succeed(false)
								}

								return yield* Effect.succeed(currentMember.value.role === "admin")
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
								// Self-removal always allowed
								if (actor.id === member.userId) {
									return yield* Effect.succeed(true)
								}

								// Admins can remove members
								const currentMember = yield* organizationMemberRepo
									.findByOrgAndUser(member.organizationId, actor.id)
									.pipe(withSystemActor)

								if (Option.isNone(currentMember)) {
									return yield* Effect.succeed(false)
								}

								return yield* Effect.succeed(currentMember.value.role === "admin")
							}),
						),
					),
				)

			return { canCreate, canUpdate, canDelete } as const
		}),
		dependencies: [OrganizationMemberRepo.Default, OrgResolver.Default],
		accessors: true,
	},
) {}

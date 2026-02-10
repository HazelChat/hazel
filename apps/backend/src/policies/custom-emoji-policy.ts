import { CustomEmojiRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { ErrorUtils, policy, withSystemActor } from "@hazel/domain"
import type { CustomEmojiId, OrganizationId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"

export class CustomEmojiPolicy extends Effect.Service<CustomEmojiPolicy>()("CustomEmojiPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "CustomEmoji" as const

		const customEmojiRepo = yield* CustomEmojiRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo

		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				policy(
					policyEntity,
					"create",
					Effect.fn(`${policyEntity}.create`)(function* (actor) {
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

		const canUpdate = (id: CustomEmojiId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				customEmojiRepo.with(id, (emoji) =>
					policy(
						policyEntity,
						"update",
						Effect.fn(`${policyEntity}.update`)(function* (actor) {
							const orgMember = yield* organizationMemberRepo
								.findByOrgAndUser(emoji.organizationId, actor.id)
								.pipe(withSystemActor)

							if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
								return yield* Effect.succeed(true)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		const canDelete = (id: CustomEmojiId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				customEmojiRepo.with(id, (emoji) =>
					policy(
						policyEntity,
						"delete",
						Effect.fn(`${policyEntity}.delete`)(function* (actor) {
							const orgMember = yield* organizationMemberRepo
								.findByOrgAndUser(emoji.organizationId, actor.id)
								.pipe(withSystemActor)

							if (Option.isSome(orgMember) && isAdminOrOwner(orgMember.value.role)) {
								return yield* Effect.succeed(true)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		return { canCreate, canUpdate, canDelete } as const
	}),
	dependencies: [CustomEmojiRepo.Default, OrganizationMemberRepo.Default],
	accessors: true,
}) {}

import { CustomEmojiRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { CustomEmojiId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { makeOrganizationScopeChecks, makePolicy, withPolicyUnauthorized } from "../lib/policy-utils"

export class CustomEmojiPolicy extends Effect.Service<CustomEmojiPolicy>()("CustomEmojiPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "CustomEmoji" as const

		const customEmojiRepo = yield* CustomEmojiRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const authorize = makePolicy(policyEntity)
		const orgScope = makeOrganizationScopeChecks((organizationId, actorId) =>
			organizationMemberRepo.findByOrgAndUser(organizationId, actorId).pipe(withSystemActor),
		)

		const canCreate = (organizationId: OrganizationId) =>
			authorize("create", (actor) => orgScope.isAdminOrOwner(organizationId, actor.id))

		const canUpdate = (id: CustomEmojiId) =>
			withPolicyUnauthorized(
				policyEntity,
				"update",
				customEmojiRepo.with(id, (emoji) =>
					authorize("update", (actor) => orgScope.isAdminOrOwner(emoji.organizationId, actor.id)),
				),
			)

		const canDelete = (id: CustomEmojiId) =>
			withPolicyUnauthorized(
				policyEntity,
				"delete",
				customEmojiRepo.with(id, (emoji) =>
					authorize("delete", (actor) => orgScope.isAdminOrOwner(emoji.organizationId, actor.id)),
				),
			)

		return { canCreate, canUpdate, canDelete } as const
	}),
	dependencies: [CustomEmojiRepo.Default, OrganizationMemberRepo.Default],
	accessors: true,
}) {}

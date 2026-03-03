import { CustomEmojiRepo } from "@hazel/backend-core"
import { ErrorUtils } from "@hazel/domain"
import type { CustomEmojiId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { OrgResolver } from "../services/org-resolver"

export class CustomEmojiPolicy extends Effect.Service<CustomEmojiPolicy>()("CustomEmojiPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "CustomEmoji" as const

		const orgResolver = yield* OrgResolver
		const customEmojiRepo = yield* CustomEmojiRepo

		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(orgResolver.requireAdminOrOwner(organizationId, "custom-emojis:write", policyEntity, "create"))

		const canUpdate = (id: CustomEmojiId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				customEmojiRepo.with(id, (emoji) =>
					orgResolver.requireAdminOrOwner(
						emoji.organizationId,
						"custom-emojis:write",
						policyEntity,
						"update",
					),
				),
			)

		const canDelete = (id: CustomEmojiId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				customEmojiRepo.with(id, (emoji) =>
					orgResolver.requireAdminOrOwner(
						emoji.organizationId,
						"custom-emojis:write",
						policyEntity,
						"delete",
					),
				),
			)

		return { canCreate, canUpdate, canDelete } as const
	}),
	dependencies: [CustomEmojiRepo.Default, OrgResolver.Default],
	accessors: true,
}) {}

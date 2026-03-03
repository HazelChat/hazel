import { ChannelRepo } from "@hazel/backend-core"
import { ErrorUtils } from "@hazel/domain"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { OrgResolver } from "../services/org-resolver"

export class ChannelPolicy extends Effect.Service<ChannelPolicy>()("ChannelPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Channel" as const

		const orgResolver = yield* OrgResolver
		const channelRepo = yield* ChannelRepo

		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(orgResolver.requireScope(organizationId, "channels:write", policyEntity, "create"))

		const canUpdate = (id: ChannelId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				channelRepo.with(id, (channel) =>
					orgResolver.requireAdminOrOwner(
						channel.organizationId,
						"channels:write",
						policyEntity,
						"update",
					),
				),
			)

		const canDelete = (id: ChannelId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				channelRepo.with(id, (channel) =>
					orgResolver.requireAdminOrOwner(
						channel.organizationId,
						"channels:write",
						policyEntity,
						"delete",
					),
				),
			)

		return { canUpdate, canDelete, canCreate } as const
	}),
	dependencies: [ChannelRepo.Default, OrgResolver.Default],
	accessors: true,
}) {}

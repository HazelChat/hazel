import { ChannelRepo } from "@hazel/backend-core"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { remapPolicyScope, withPolicyUnauthorized } from "../lib/policy-utils"
import { OrganizationPolicy } from "./organization-policy"

export class ChannelPolicy extends Effect.Service<ChannelPolicy>()("ChannelPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Channel" as const

		const organizationPolicy = yield* OrganizationPolicy

		const channelRepo = yield* ChannelRepo

		const canCreate = (organizationId: OrganizationId) =>
			organizationPolicy.isMember(organizationId).pipe(remapPolicyScope(policyEntity, "create"))

		const canUpdate = (id: ChannelId) =>
			withPolicyUnauthorized(
				policyEntity,
				"update",
				channelRepo.with(id, (channel) =>
					organizationPolicy
						.canUpdate(channel.organizationId)
						.pipe(remapPolicyScope(policyEntity, "update")),
				),
			)

		const canDelete = (id: ChannelId) =>
			withPolicyUnauthorized(
				policyEntity,
				"delete",
				channelRepo.with(id, (channel) =>
					organizationPolicy
						.canUpdate(channel.organizationId)
						.pipe(remapPolicyScope(policyEntity, "delete")),
				),
			)

		return { canUpdate, canDelete, canCreate } as const
	}),
	dependencies: [ChannelRepo.Default, OrganizationPolicy.Default],
	accessors: true,
}) {}

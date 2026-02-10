import { ChannelSectionRepo } from "@hazel/backend-core"
import type { ChannelSectionId, OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { remapPolicyScope, withPolicyUnauthorized } from "../lib/policy-utils"
import { OrganizationPolicy } from "./organization-policy"

export class ChannelSectionPolicy extends Effect.Service<ChannelSectionPolicy>()(
	"ChannelSectionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "ChannelSection" as const

			const organizationPolicy = yield* OrganizationPolicy
			const channelSectionRepo = yield* ChannelSectionRepo

			// Only org admins/owners can create sections
			const canCreate = (organizationId: OrganizationId) =>
				organizationPolicy.canUpdate(organizationId).pipe(remapPolicyScope(policyEntity, "create"))

			// Only org admins/owners can update sections
			const canUpdate = (id: ChannelSectionId) =>
				withPolicyUnauthorized(
					policyEntity,
					"update",
					channelSectionRepo.with(id, (section) =>
						organizationPolicy
							.canUpdate(section.organizationId)
							.pipe(remapPolicyScope(policyEntity, "update")),
					),
				)

			// Only org admins/owners can delete sections
			const canDelete = (id: ChannelSectionId) =>
				withPolicyUnauthorized(
					policyEntity,
					"delete",
					channelSectionRepo.with(id, (section) =>
						organizationPolicy
							.canUpdate(section.organizationId)
							.pipe(remapPolicyScope(policyEntity, "delete")),
					),
				)

			// Only org admins/owners can reorder sections
			const canReorder = (organizationId: OrganizationId) =>
				organizationPolicy.canUpdate(organizationId).pipe(remapPolicyScope(policyEntity, "reorder"))

			return { canCreate, canUpdate, canDelete, canReorder } as const
		}),
		dependencies: [ChannelSectionRepo.Default, OrganizationPolicy.Default],
		accessors: true,
	},
) {}

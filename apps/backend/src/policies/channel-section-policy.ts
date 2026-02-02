import { ChannelSectionRepo } from "@hazel/backend-core"
import { type ChannelSectionId, ErrorUtils, type OrganizationId, policy, policyCompose } from "@hazel/domain"
import { Effect, pipe } from "effect"
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
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					pipe(
						organizationPolicy.canUpdate(organizationId),
						policyCompose(policy(policyEntity, "create", (_actor) => Effect.succeed(true))),
					),
				)

			// Only org admins/owners can update sections
			const canUpdate = (id: ChannelSectionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					channelSectionRepo.with(id, (section) =>
						pipe(
							organizationPolicy.canUpdate(section.organizationId),
							policyCompose(policy(policyEntity, "update", (_actor) => Effect.succeed(true))),
						),
					),
				)

			// Only org admins/owners can delete sections
			const canDelete = (id: ChannelSectionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					channelSectionRepo.with(id, (section) =>
						pipe(
							organizationPolicy.canUpdate(section.organizationId),
							policyCompose(policy(policyEntity, "delete", (_actor) => Effect.succeed(true))),
						),
					),
				)

			// Only org admins/owners can reorder sections
			const canReorder = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"reorder",
				)(
					pipe(
						organizationPolicy.canUpdate(organizationId),
						policyCompose(policy(policyEntity, "reorder", (_actor) => Effect.succeed(true))),
					),
				)

			return { canCreate, canUpdate, canDelete, canReorder } as const
		}),
		dependencies: [ChannelSectionRepo.Default, OrganizationPolicy.Default],
		accessors: true,
	},
) {}

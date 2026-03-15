import { ChannelSectionRepo } from "@hazel/backend-core"
import { ErrorUtils } from "@hazel/domain"
import type { ChannelSectionId, OrganizationId } from "@hazel/schema"
import { ServiceMap, Effect } from "effect"
import { withAnnotatedScope } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

export class ChannelSectionPolicy extends ServiceMap.Service<ChannelSectionPolicy>()(
	"ChannelSectionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "ChannelSection" as const

			const orgResolver = yield* OrgResolver
			const channelSectionRepo = yield* ChannelSectionRepo

			const canCreate = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(
					withAnnotatedScope((scope) =>
						orgResolver.requireAdminOrOwner(organizationId, scope, policyEntity, "create"),
					),
				)

			const canUpdate = (id: ChannelSectionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					channelSectionRepo.with(id, (section) =>
						withAnnotatedScope((scope) =>
							orgResolver.requireAdminOrOwner(
								section.organizationId,
								scope,
								policyEntity,
								"update",
							),
						),
					),
				)

			const canDelete = (id: ChannelSectionId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					channelSectionRepo.with(id, (section) =>
						withAnnotatedScope((scope) =>
							orgResolver.requireAdminOrOwner(
								section.organizationId,
								scope,
								policyEntity,
								"delete",
							),
						),
					),
				)

			const canReorder = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"reorder",
				)(
					withAnnotatedScope((scope) =>
						orgResolver.requireAdminOrOwner(organizationId, scope, policyEntity, "reorder"),
					),
				)

			return { canCreate, canUpdate, canDelete, canReorder } as const
		}),
		dependencies: [ChannelSectionRepo.Default, OrgResolver.Default],
	},
) {}

import { ErrorUtils } from "@hazel/domain"
import type { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { OrgResolver } from "../services/org-resolver"

export class IntegrationConnectionPolicy extends Effect.Service<IntegrationConnectionPolicy>()(
	"IntegrationConnectionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "IntegrationConnection" as const

			const orgResolver = yield* OrgResolver

			const canSelect = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(
					orgResolver.requireScope(
						organizationId,
						"integration-connections:read",
						policyEntity,
						"select",
					),
				)

			const canInsert = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"insert",
				)(
					orgResolver.requireAdminOrOwner(
						organizationId,
						"integration-connections:write",
						policyEntity,
						"insert",
					),
				)

			const canUpdate = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					orgResolver.requireAdminOrOwner(
						organizationId,
						"integration-connections:write",
						policyEntity,
						"update",
					),
				)

			const canDelete = (organizationId: OrganizationId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					orgResolver.requireAdminOrOwner(
						organizationId,
						"integration-connections:write",
						policyEntity,
						"delete",
					),
				)

			return { canSelect, canInsert, canUpdate, canDelete } as const
		}),
		dependencies: [OrgResolver.Default],
		accessors: true,
	},
) {}

import { OrganizationMemberRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { makeOrganizationScopeChecks, makePolicy } from "../lib/policy-utils"

export class IntegrationConnectionPolicy extends Effect.Service<IntegrationConnectionPolicy>()(
	"IntegrationConnectionPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "IntegrationConnection" as const

			const orgMemberRepo = yield* OrganizationMemberRepo
			const authorize = makePolicy(policyEntity)
			const orgScope = makeOrganizationScopeChecks((organizationId, actorId) =>
				orgMemberRepo.findByOrgAndUser(organizationId, actorId).pipe(withSystemActor),
			)

			// For select, any org member can view integrations
			const canSelect = (organizationId: OrganizationId) =>
				authorize("select", (actor) => orgScope.isMember(organizationId, actor.id))

			// For insert, only admins and owners can connect integrations
			const canInsert = (organizationId: OrganizationId) =>
				authorize("insert", (actor) => orgScope.isAdminOrOwner(organizationId, actor.id))

			// For update, only admins and owners can modify integrations
			const canUpdate = (organizationId: OrganizationId) =>
				authorize("update", (actor) => orgScope.isAdminOrOwner(organizationId, actor.id))

			// For delete, only admins and owners can disconnect integrations
			const canDelete = (organizationId: OrganizationId) =>
				authorize("delete", (actor) => orgScope.isAdminOrOwner(organizationId, actor.id))

			return { canSelect, canInsert, canUpdate, canDelete } as const
		}),
		dependencies: [OrganizationMemberRepo.Default],
		accessors: true,
	},
) {}

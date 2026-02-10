import { OrganizationMemberRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { makeOrganizationScopeChecks, makePolicy } from "../lib/policy-utils"

export class OrganizationPolicy extends Effect.Service<OrganizationPolicy>()("OrganizationPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Organization" as const

		const organizationMemberRepo = yield* OrganizationMemberRepo
		const authorize = makePolicy(policyEntity)
		const orgScope = makeOrganizationScopeChecks((organizationId, actorId) =>
			organizationMemberRepo.findByOrgAndUser(organizationId, actorId).pipe(withSystemActor),
		)

		const canCreate = () => authorize("create", (_actor) => Effect.succeed(true))

		const canUpdate = (id: OrganizationId) =>
			authorize("update", (actor) => orgScope.isAdminOrOwner(id, actor.id))

		const isMember = (id: OrganizationId) =>
			authorize("isMember", (actor) => orgScope.isMember(id, actor.id))

		const canDelete = (id: OrganizationId) =>
			authorize("delete", (actor) => orgScope.isOwner(id, actor.id))

		const canManagePublicInvite = (id: OrganizationId) =>
			authorize("managePublicInvite", (actor) => orgScope.isAdminOrOwner(id, actor.id))

		return { canUpdate, canDelete, canCreate, isMember, canManagePublicInvite } as const
	}),
	dependencies: [OrganizationMemberRepo.Default],
	accessors: true,
}) {}

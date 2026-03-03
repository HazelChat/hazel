import { ErrorUtils } from "@hazel/domain"
import type { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { makePolicy } from "../lib/policy-utils"
import { OrgResolver } from "../services/org-resolver"

export class OrganizationPolicy extends Effect.Service<OrganizationPolicy>()("OrganizationPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Organization" as const
		const authorize = makePolicy(policyEntity)

		const orgResolver = yield* OrgResolver

		const canCreate = () => authorize("create", (_actor) => Effect.succeed(true))

		const canUpdate = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(orgResolver.requireAdminOrOwner(id, "organizations:write", policyEntity, "update"))

		const isMember = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"isMember",
			)(orgResolver.requireScope(id, "organizations:read", policyEntity, "isMember"))

		const canDelete = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(orgResolver.requireOwner(id, "organizations:write", policyEntity, "delete"))

		const canManagePublicInvite = (id: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"managePublicInvite",
			)(orgResolver.requireAdminOrOwner(id, "organizations:write", policyEntity, "managePublicInvite"))

		return { canUpdate, canDelete, canCreate, isMember, canManagePublicInvite } as const
	}),
	dependencies: [OrgResolver.Default],
	accessors: true,
}) {}

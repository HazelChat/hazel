import { ErrorUtils, type AuthorizedActor, authorizedActor, policy } from "@hazel/domain"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"

export type OrganizationRole = "admin" | "member" | "owner"
export type OrganizationScope = "member" | "admin" | "admin-or-owner" | "owner"

type PolicyActor = Parameters<typeof authorizedActor>[0]

/**
 * Check if an organization member role has admin privileges
 * @param role - The organization member role ("admin", "member", or "owner")
 * @returns true if role is "admin" or "owner"
 */
export const isAdminOrOwner = (role: OrganizationRole): boolean => {
	return role === "admin" || role === "owner"
}

type OrganizationMemberLike = { readonly role: OrganizationRole }
type OrganizationMemberLoader<Member extends OrganizationMemberLike, E, R> = (
	organizationId: OrganizationId,
	actorId: UserId,
) => Effect.Effect<Option.Option<Member>, E, R>

const hasOrganizationScope = <Member extends OrganizationMemberLike>(
	member: Option.Option<Member>,
	scope: OrganizationScope,
): boolean => {
	if (Option.isNone(member)) {
		return false
	}

	switch (scope) {
		case "member":
			return true
		case "admin":
			return member.value.role === "admin"
		case "admin-or-owner":
			return isAdminOrOwner(member.value.role)
		case "owner":
			return member.value.role === "owner"
	}
}

export const makeOrganizationScopeChecks = <Member extends OrganizationMemberLike, E, R>(
	loadMember: OrganizationMemberLoader<Member, E, R>,
) => {
	const hasScope = (organizationId: OrganizationId, actorId: UserId, scope: OrganizationScope) =>
		loadMember(organizationId, actorId).pipe(Effect.map((member) => hasOrganizationScope(member, scope)))

	return {
		hasScope,
		isMember: (organizationId: OrganizationId, actorId: UserId) =>
			hasScope(organizationId, actorId, "member"),
		isAdmin: (organizationId: OrganizationId, actorId: UserId) =>
			hasScope(organizationId, actorId, "admin"),
		isAdminOrOwner: (organizationId: OrganizationId, actorId: UserId) =>
			hasScope(organizationId, actorId, "admin-or-owner"),
		isOwner: (organizationId: OrganizationId, actorId: UserId) =>
			hasScope(organizationId, actorId, "owner"),
	} as const
}

export const makePolicy =
	<Entity extends string>(entity: Entity) =>
	<Action extends string, E, R>(
		action: Action,
		check: (actor: PolicyActor) => Effect.Effect<boolean, E, R>,
	) =>
		ErrorUtils.refailUnauthorized(entity, action)(policy(entity, action, check))

export const remapPolicyScope =
	<Entity extends string, Action extends string>(_entity: Entity, _action: Action) =>
	<Actor extends AuthorizedActor<any, any>, E, R>(
		effect: Effect.Effect<Actor, E, R>,
	): Effect.Effect<AuthorizedActor<Entity, Action>, E, R> =>
		effect.pipe(Effect.map((actor) => authorizedActor<Entity, Action>(actor)))

export const withPolicyUnauthorized = <A, E, R>(
	entity: string,
	action: string,
	effect: Effect.Effect<A, E, R>,
) => ErrorUtils.refailUnauthorized(entity, action)(effect)

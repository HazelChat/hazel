import { ErrorUtils, authorizedActor, policy } from "@hazel/domain"
import { Effect } from "effect"

export type OrganizationRole = "admin" | "member" | "owner"

type PolicyActor = Parameters<typeof authorizedActor>[0]

/**
 * Check if an organization member role has admin privileges
 * @param role - The organization member role ("admin", "member", or "owner")
 * @returns true if role is "admin" or "owner"
 */
export const isAdminOrOwner = (role: OrganizationRole): boolean => {
	return role === "admin" || role === "owner"
}

export const makePolicy =
	<Entity extends string>(entity: Entity) =>
	<Action extends string, E, R>(
		action: Action,
		check: (actor: PolicyActor) => Effect.Effect<boolean, E, R>,
	) =>
		ErrorUtils.refailUnauthorized(entity, action)(policy(entity, action, check))

export const withPolicyUnauthorized = <A, E, R>(
	entity: string,
	action: string,
	effect: Effect.Effect<A, E, R>,
) => ErrorUtils.refailUnauthorized(entity, action)(effect)

import type { OrganizationId, UserId } from "@hazel/schema"

/**
 * Authenticated user context returned by electric-proxy auth.
 * Includes the internal database user ID.
 */
export interface AuthenticatedUserContext {
	/** External identity provider user ID (Clerk user ID, e.g. `user_2...`). */
	externalId: string
	/** Internal database user UUID. */
	internalUserId: UserId
	/** User email address. */
	email: string
	/** Internal organization UUID if the JWT carries one. */
	organizationId?: OrganizationId
	/** User role within the organization. */
	role?: string
}

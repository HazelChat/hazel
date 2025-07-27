import usePresence from "@convex-dev/presence/react"
import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"

// Re-export the PresenceState type from the package
export interface PresenceState {
	userId: string
	online: boolean
	lastDisconnected: number
	name?: string
	image?: string
}

/**
 * Hook to access presence data for the current organization
 * @param organizationId - The organization ID to get presence data for
 * @param userId - The current user ID
 * @returns Array of user presence data
 */
export function usePresenceData(organizationId?: Id<"organizations">, userId?: Id<"users">) {
	// Use the Convex presence hook to get raw presence data
	const presenceData = usePresence(
		api.presence,
		organizationId ?? ("" as Id<"organizations">),
		userId ?? ("" as Id<"users">),
		10000, // 10 second heartbeat interval
	)

	// Return the presence data directly
	return presenceData || []
}

/**
 * Hook to check if a specific user is online
 * @param userId - The user ID to check
 * @param organizationId - The organization ID to check presence in
 * @param currentUserId - The current user ID
 * @returns Boolean indicating if the user is online
 */
export function useIsUserOnline(
	userId?: Id<"users">,
	organizationId?: Id<"organizations">,
	currentUserId?: Id<"users">,
) {
	const presenceData = usePresenceData(organizationId, currentUserId)

	if (!userId) return false

	const userPresence = presenceData.find((p) => p.userId === userId)
	return userPresence?.online ?? false
}

/**
 * Hook to get online users count
 * @param organizationId - The organization ID to get count for
 * @param userId - The current user ID
 * @returns Number of online users
 */
export function useOnlineUsersCount(organizationId?: Id<"organizations">, userId?: Id<"users">) {
	const presenceData = usePresenceData(organizationId, userId)
	return presenceData.filter((p) => p.online).length
}

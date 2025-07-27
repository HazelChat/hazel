import usePresence from "@convex-dev/presence/react"
import { convexQuery } from "@convex-dev/react-query"
import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

interface PresenceProviderProps {
	children: ReactNode
}

interface PresenceTrackerProps {
	organizationId: Id<"organizations">
	userId: Id<"users">
	children: ReactNode
}

// Inner component that actually calls the usePresence hook
function PresenceTracker({ organizationId, userId, children }: PresenceTrackerProps) {
	usePresence(
		api.presence,
		organizationId,
		userId,
		10000, // 10 second heartbeat interval
	)

	return <>{children}</>
}

export function PresenceProvider({ children }: PresenceProviderProps) {
	// Fetch organization and user data
	const organizationQuery = useQuery(convexQuery(api.me.getOrganization, {}))
	const userQuery = useQuery(convexQuery(api.me.getCurrentUser, {}))

	const organizationId =
		organizationQuery.data?.directive === "success" ? organizationQuery.data.data._id : undefined
	const userId = userQuery.data?._id

	// Only render PresenceTracker when both IDs are available
	if (!organizationId || !userId) {
		return <>{children}</>
	}

	return (
		<PresenceTracker organizationId={organizationId} userId={userId}>
			{children}
		</PresenceTracker>
	)
}

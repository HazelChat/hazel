import { eq, useLiveQuery } from "@tanstack/react-db"
import { useMemo } from "react"
import { canPerform, RPC_SCOPE_MAP } from "@hazel/domain/scopes"
import { organizationMemberCollection } from "~/db/collections"
import { useAuth } from "~/lib/auth"
import { useOrganization } from "./use-organization"

/**
 * Hook that provides permission checking based on declared RPC scopes.
 *
 * Replaces ad-hoc `role === "owner" || role === "admin"` checks with
 * a declarative `can("message.create")` API backed by the scope map.
 *
 * @example
 * ```tsx
 * function CreateChannelButton() {
 *   const { can, isLoading } = usePermission()
 *   return (
 *     <Button isDisabled={!can("channel.create") || isLoading}>
 *       Create Channel
 *     </Button>
 *   )
 * }
 * ```
 */
export function usePermission() {
	const { user, isLoading: isAuthLoading } = useAuth()
	const { organizationId } = useOrganization()

	const { data: members, isLoading: isMembersLoading } = useLiveQuery(
		(q) =>
			organizationId
				? q
						.from({ m: organizationMemberCollection })
						.where(({ m }) => eq(m.organizationId, organizationId))
						.where(({ m }) => eq(m.userId, user?.id))
						.findOne()
				: null,
		[organizationId, user?.id],
	)

	const role = members?.role as "owner" | "admin" | "member" | undefined

	const can = useMemo(() => {
		if (!role) {
			return (_action: string) => false
		}
		return (action: string) => canPerform(RPC_SCOPE_MAP, role, action)
	}, [role])

	return {
		can,
		role,
		isLoading: isAuthLoading || isMembersLoading,
	}
}

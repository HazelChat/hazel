import { useAuth as useClerkAuth, useClerk } from "@clerk/react"
import { useAtomValue } from "@effect/atom-react"
import { AsyncResult } from "effect/unstable/reactivity"
import type { OrganizationId } from "@hazel/schema"
import { HazelRpcClient } from "./services/common/rpc-atom-client"

interface LoginOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface LogoutOptions {
	redirectTo?: string
}

/**
 * Trigger Clerk's hosted sign-in. Works outside React because Clerk exposes
 * the singleton on `window.Clerk`.
 */
export const restartWebLogin = (options?: LoginOptions) => {
	const redirectUrl =
		options?.returnTo || window.location.pathname + window.location.search + window.location.hash
	if (typeof window !== "undefined" && window.Clerk?.redirectToSignIn) {
		void window.Clerk.redirectToSignIn({ redirectUrl })
		return
	}
	window.location.assign(redirectUrl)
}

/**
 * Query atom for the Hazel DB user (internal UUID, membership, etc.).
 * Clerk's JWT gives us identity; this gives us app-level user data.
 */
export const userAtom = HazelRpcClient.query("user.me", void 0, {
	reactivityKeys: ["currentUser"],
})

/**
 * Unified auth hook. Clerk owns session lifecycle and sign-in UI; we surface
 * the DB user (via user.me) on top of that.
 */
export function useAuth() {
	const clerk = useClerk()
	const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth()
	const userResult = useAtomValue(userAtom)

	const userLoading = userResult._tag === "Initial" || userResult.waiting
	const isLoading = !clerkLoaded || (isSignedIn === true && userLoading)

	const login = (options?: LoginOptions) => {
		const redirectUrl =
			options?.returnTo || window.location.pathname + window.location.search + window.location.hash
		void clerk.redirectToSignIn({ redirectUrl })
	}

	const logout = async (options?: LogoutOptions) => {
		await clerk.signOut({ redirectUrl: options?.redirectTo ?? "/" })
	}

	return {
		user: AsyncResult.getOrElse(userResult, () => null),
		error: AsyncResult.error(userResult),
		isLoading,
		login,
		logout,
	}
}

import { useAuth as useClerkAuth, useClerk } from "@clerk/react"
import { Atom, AsyncResult } from "effect/unstable/reactivity"
import { useAtomValue } from "@effect/atom-react"
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
 * Trigger Clerk's hosted sign-in (no in-app /auth/login page needed).
 * Works outside React because Clerk exposes the singleton on `window.Clerk`.
 */
export const restartWebLogin = (options?: LoginOptions) => {
	const redirectUrl =
		options?.returnTo || window.location.pathname + window.location.search + window.location.hash
	if (typeof window !== "undefined" && window.Clerk?.redirectToSignIn) {
		void window.Clerk.redirectToSignIn({ redirectUrl })
		return
	}
	// Fallback: reload; ClerkProvider will hydrate and redirect us.
	window.location.assign(redirectUrl)
}

/**
 * Query atom that fetches the current user from the API.
 * RPC middleware attaches the Clerk session token automatically.
 */
export const currentUserQueryAtom = HazelRpcClient.query("user.me", void 0, {
	reactivityKeys: ["currentUser"],
})

const authStateAtom = Atom.make((get) => {
	const result = get(currentUserQueryAtom)
	return {
		user: result,
		isLoading: result._tag === "Initial" || result.waiting,
	}
})

export const userAtom = Atom.make((get) => get(authStateAtom).user)

/**
 * Unified auth hook. Clerk handles session lifecycle and sign-in UI;
 * we just surface the current user (from our DB via user.me).
 */
export function useAuth() {
	const clerk = useClerk()
	const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth()
	const { user: userResult, isLoading: userLoading } = useAtomValue(authStateAtom)

	const isLoading = !clerkLoaded || (isSignedIn === true && userLoading)

	const login = (options?: LoginOptions) => {
		const redirectUrl =
			options?.returnTo ||
			window.location.pathname + window.location.search + window.location.hash
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

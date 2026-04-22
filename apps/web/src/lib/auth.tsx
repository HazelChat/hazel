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
 * Build the Clerk sign-in URL with an optional returnTo.
 * Used by callers that want to redirect unauthenticated users.
 */
const buildLoginHref = (options?: LoginOptions): string => {
	const returnTo = options?.returnTo || window.location.pathname + window.location.search + window.location.hash
	const params = new URLSearchParams({ returnTo })
	if (options?.organizationId) params.set("organizationId", options.organizationId)
	if (options?.invitationToken) params.set("invitationToken", options.invitationToken)
	return `/auth/login?${params.toString()}`
}

/** Redirect the browser to /auth/login (Clerk's <SignIn/>). */
export const restartWebLogin = (options?: LoginOptions) => {
	window.location.assign(buildLoginHref(options))
}

/**
 * Query atom that fetches the current user from the API.
 * Runs once we know Clerk is authenticated — the RPC middleware attaches
 * the Clerk session token automatically.
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
 * Unified auth hook backed by Clerk.
 *
 * - `isLoading`: true until Clerk finishes loading, then until user.me resolves.
 * - `user`: our DB user row (from user.me), or null.
 * - `login(options)`: redirect to Clerk sign-in.
 * - `logout(options)`: sign out of Clerk and redirect.
 */
export function useAuth() {
	const clerk = useClerk()
	const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth()
	const { user: userResult, isLoading: userLoading } = useAtomValue(authStateAtom)

	// If Clerk isn't loaded yet OR Clerk is loaded-signed-in but user.me hasn't
	// resolved, keep the "loading" state so route guards don't prematurely
	// redirect (which was causing the sign-in → app → sign-in loop).
	const isLoading = !clerkLoaded || (isSignedIn === true && userLoading)

	const login = (options?: LoginOptions) => {
		window.location.assign(buildLoginHref(options))
	}

	const logout = async (options?: LogoutOptions) => {
		await clerk.signOut({ redirectUrl: options?.redirectTo ?? "/auth/login" })
	}

	return {
		user: AsyncResult.getOrElse(userResult, () => null),
		error: AsyncResult.error(userResult),
		isLoading,
		login,
		logout,
	}
}

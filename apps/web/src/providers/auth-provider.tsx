import { Atom, Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { Effect, Exit } from "effect"
import type { ReactNode } from "react"
import { HazelApiClient } from "~/lib/services/common/atom-client"

interface LoginOptions {
	returnTo?: string
	workosOrganizationId?: string
	invitationToken?: string
}

// ============================================================================
// Atoms
// ============================================================================

/**
 * Atom that tracks whether the current route is a public route
 * (i.e., starts with /auth)
 */
const isPublicRouteAtom = Atom.make((get) => {
	const checkRoute = () => window.location.pathname.startsWith("/auth")

	// Set up event listeners for route changes
	const onRouteChange = () => {
		get.setSelf(checkRoute())
	}

	window.addEventListener("popstate", onRouteChange)
	window.addEventListener("pushstate", onRouteChange)

	get.addFinalizer(() => {
		window.removeEventListener("popstate", onRouteChange)
		window.removeEventListener("pushstate", onRouteChange)
	})

	return checkRoute()
}).pipe(Atom.keepAlive)

/**
 * Query atom that fetches the current user from the API
 */
const currentUserQueryAtom = HazelApiClient.query("users", "me", {
	reactivityKeys: ["currentUser"],
})

/**
 * Derived atom that returns the current user
 * Returns null if on a public route or if the query failed
 */
const userAtom = Atom.make((get) => {
	const isPublicRoute = get(isPublicRouteAtom)
	if (isPublicRoute) {
		return null
	}

	const result = get(currentUserQueryAtom)
	return Result.getOrElse(result, () => null)
})

/**
 * Derived atom that returns whether the auth state is loading
 */
const isLoadingAtom = Atom.make((get) => {
	const isPublicRoute = get(isPublicRouteAtom)
	if (isPublicRoute) {
		return false
	}

	const result = get(currentUserQueryAtom)
	return result._tag === "Initial" || result.waiting
})

/**
 * Login mutation atom
 */
const loginAtom = HazelApiClient.mutation("auth", "login")

/**
 * Logout function atom
 */
const logoutAtom = Atom.fn(
	Effect.fnUntraced(function* () {
		window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`
	}),
)

// ============================================================================
// Provider & Hook
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
	// No state needed - atoms handle everything!
	return <>{children}</>
}

export function useAuth() {
	const user = useAtomValue(userAtom)
	const isLoading = useAtomValue(isLoadingAtom)
	const loginMutation = useAtomSet(loginAtom, { mode: "promiseExit" })
	const logoutFn = useAtomSet(logoutAtom)
	const refresh = useAtomRefresh(currentUserQueryAtom)

	const login = async (options?: LoginOptions) => {
		const exit = await loginMutation({
			urlParams: {
				...options,
				returnTo: options?.returnTo || location.href,
			},
		})

		Exit.match(exit, {
			onSuccess: (data) => {
				window.location.href = data.authorizationUrl
			},
			onFailure: (cause) => {
				console.error("Login failed:", cause)
			},
		})
	}

	const logout = () => {
		logoutFn()
	}

	const refreshUser = async () => {
		refresh()
	}

	return {
		user,
		isLoading,
		login,
		logout,
		refreshUser,
	}
}

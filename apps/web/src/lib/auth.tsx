import { Atom, Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import {
	desktopInitAtom,
	desktopLoginAtom,
	desktopLogoutAtom,
	desktopTokenSchedulerAtom,
} from "~/atoms/desktop-auth"
import { webInitAtom, webLogoutAtom, webTokenSchedulerAtom } from "~/atoms/web-auth"
import { router } from "~/main"
import { HazelRpcClient } from "./services/common/rpc-atom-client"
import { isTauri } from "./tauri"

interface LoginOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface LogoutOptions {
	redirectTo?: string
}

/**
 * Check if a pathname is a public route
 * Public routes: /auth/*, /join/*
 */
const isPublicPath = (pathname: string) => pathname.startsWith("/auth") || pathname.startsWith("/join")

/**
 * Atom that tracks whether the current route is a public route
 * (i.e., starts with /auth or /join)
 */
const isPublicRouteAtom = Atom.make((get) => {
	const unsubscribe = router.subscribe("onResolved", (event) => {
		get.setSelf(isPublicPath(event.toLocation.pathname))
	})

	get.addFinalizer(unsubscribe)

	return isPublicPath(router.state.location.pathname)
}).pipe(Atom.keepAlive)

/**
 * Query atom that fetches the current user from the API
 */
export const currentUserQueryAtom = HazelRpcClient.query("user.me", void 0, {
	reactivityKeys: ["currentUser"],
})

/**
 * Combined auth state atom - reads currentUserQueryAtom only once
 * to avoid triggering duplicate RPC calls
 */
const authStateAtom = Atom.make((get) => {
	const result = get(currentUserQueryAtom)
	return {
		user: result,
		isLoading: result._tag === "Initial" || result.waiting,
	}
})

/**
 * Derived atom that returns the current user
 * Returns null if on a public route or if the query failed
 */
export const userAtom = Atom.make((get) => get(authStateAtom).user)

export function useAuth() {
	const { user: userResult, isLoading } = useAtomValue(authStateAtom)

	// Initialize auth atoms for both platforms
	// Each atom internally checks platform and returns early if not applicable
	// Desktop: loads stored tokens from Tauri store, starts refresh scheduler
	useAtomValue(desktopInitAtom)
	useAtomValue(desktopTokenSchedulerAtom)
	// Web: loads stored tokens from localStorage, starts refresh scheduler
	useAtomValue(webInitAtom)
	useAtomValue(webTokenSchedulerAtom)

	// Desktop auth action atoms
	const desktopLogin = useAtomSet(desktopLoginAtom)
	const desktopLogout = useAtomSet(desktopLogoutAtom)

	// Web auth action atoms
	const webLogout = useAtomSet(webLogoutAtom)

	const login = (options?: LoginOptions) => {
		let returnTo = options?.returnTo || location.pathname + location.search + location.hash

		// Ensure returnTo is a relative path (defense in depth)
		// If a full URL was passed, extract just the path portion
		if (returnTo.startsWith("http://") || returnTo.startsWith("https://")) {
			try {
				const url = new URL(returnTo)
				returnTo = url.pathname + url.search + url.hash
			} catch {
				returnTo = "/"
			}
		}

		// Desktop auth flow - uses atom-based OAuth flow
		if (isTauri()) {
			desktopLogin({
				returnTo,
				organizationId: options?.organizationId,
				invitationToken: options?.invitationToken,
			})
			return
		}

		// Web auth flow - redirect to backend login endpoint
		// This endpoint redirects to WorkOS, then to /auth/callback,
		// which redirects to frontend /auth/callback with code/state params
		const loginUrl = new URL("/auth/login", import.meta.env.VITE_BACKEND_URL)
		loginUrl.searchParams.set("returnTo", returnTo)

		if (options?.organizationId) {
			loginUrl.searchParams.set("organizationId", options.organizationId)
		}
		if (options?.invitationToken) {
			loginUrl.searchParams.set("invitationToken", options.invitationToken)
		}

		window.location.href = loginUrl.toString()
	}

	const logout = async (options?: LogoutOptions) => {
		// Desktop logout - uses atom-based cleanup
		if (isTauri()) {
			desktopLogout(options)
			return
		}

		// Web logout - clear localStorage tokens and redirect
		// No need to call backend since we're using JWT (no server-side session)
		webLogout(options)
	}

	return {
		user: Result.getOrElse(userResult, () => null),
		error: Result.error(userResult),
		isLoading,
		login,
		logout,
	}
}

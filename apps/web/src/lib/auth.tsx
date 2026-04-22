import { useClerk } from "@clerk/react"
import { Atom, AsyncResult } from "effect/unstable/reactivity"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { desktopInitAtom, desktopLogoutAtom, desktopTokenSchedulerAtom } from "~/atoms/desktop-auth"
import { webInitAtom, webLogoutAtom, webTokenSchedulerAtom } from "~/atoms/web-auth"
import { normalizeAuthReturnTo, startLogin } from "~/lib/auth-flow"
import { hasClerkSession } from "~/lib/clerk-token"
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
 * Redirect the browser to the Clerk-hosted sign-in page, preserving an optional returnTo.
 * Replaces the old WorkOS redirect flow — Clerk's <SignIn> component on /auth/login
 * handles the OAuth round-trip itself.
 */
export const restartWebLogin = (options?: LoginOptions) => {
	const returnTo = normalizeAuthReturnTo(
		options?.returnTo || location.pathname + location.search + location.hash,
	)
	const search = new URLSearchParams({ returnTo })
	window.location.assign(`/auth/login?${search.toString()}`)
}

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
	const clerk = useClerk()

	// Initialize auth atoms for both platforms
	// Each atom internally checks platform and returns early if not applicable
	// Desktop: loads stored tokens from Tauri store, starts refresh scheduler
	useAtomValue(desktopInitAtom)
	useAtomValue(desktopTokenSchedulerAtom)
	// Web: loads stored tokens from localStorage, starts refresh scheduler (legacy WorkOS path)
	useAtomValue(webInitAtom)
	useAtomValue(webTokenSchedulerAtom)

	const desktopLogout = useAtomSet(desktopLogoutAtom)
	const webLogout = useAtomSet(webLogoutAtom)

	const login = (options?: LoginOptions) => {
		const returnTo = normalizeAuthReturnTo(
			options?.returnTo || location.pathname + location.search + location.hash,
		)

		// Web: route to our Clerk sign-in page. Desktop still uses the legacy WorkOS flow
		// until the desktop migration follow-up lands.
		if (!isTauri()) {
			const search = new URLSearchParams({ returnTo })
			window.location.assign(`/auth/login?${search.toString()}`)
			return
		}

		void startLogin("desktop", {
			returnTo,
			organizationId: options?.organizationId,
			invitationToken: options?.invitationToken,
		})
	}

	const logout = async (options?: LogoutOptions) => {
		if (isTauri()) {
			desktopLogout(options)
			return
		}

		// If we have a Clerk session, sign out of Clerk; otherwise run the legacy
		// WorkOS logout path. During the overlap, both may be set — be defensive.
		if (hasClerkSession()) {
			await clerk.signOut({ redirectUrl: options?.redirectTo ?? "/auth/login" })
			return
		}
		webLogout(options)
	}

	return {
		user: AsyncResult.getOrElse(userResult, () => null),
		error: AsyncResult.error(userResult),
		isLoading,
		login,
		logout,
	}
}

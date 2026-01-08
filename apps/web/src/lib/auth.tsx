import { Atom, Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { router } from "~/main"
import { HazelRpcClient } from "./services/common/rpc-atom-client"
import { isTauri } from "./platform"

interface LoginOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface LogoutOptions {
	redirectTo?: string
}

/**
 * Atom that tracks whether the current route is a public route
 * (i.e., starts with /auth)
 */
const isPublicRouteAtom = Atom.make((get) => {
	const unsubscribe = router.subscribe("onResolved", (event) => {
		get.setSelf(event.toLocation.pathname.startsWith("/auth"))
	})

	get.addFinalizer(unsubscribe)

	return router.state.location.pathname.startsWith("/auth")
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
	const isPublicRoute = get(isPublicRouteAtom)
	if (isPublicRoute) {
		return {
			user: Result.success(null),
			isLoading: false,
		}
	}

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

/**
 * Logout function atom
 */
const logoutAtom = Atom.fn(
	Effect.fnUntraced(function* (options?: LogoutOptions) {
		if (isTauri()) {
			// Desktop logout - clear tokens and redirect
			const { desktopAuth } = yield* Effect.promise(() => import("./desktop-auth"))
			yield* Effect.promise(() => desktopAuth.logout())
			// Navigate to login page
			const redirectTo = options?.redirectTo || "/"
			router.navigate({ to: redirectTo })
		} else {
			// Web logout - redirect to backend
			const redirectTo = options?.redirectTo || "/"
			const logoutUrl = new URL("/auth/logout", import.meta.env.VITE_BACKEND_URL)
			logoutUrl.searchParams.set("redirectTo", redirectTo)
			window.location.href = logoutUrl.toString()
		}
	}),
)

/**
 * Desktop login handler
 */
async function handleDesktopLogin(options?: LoginOptions): Promise<void> {
	const { desktopLogin } = await import("./desktop-auth")

	return new Promise((resolve, reject) => {
		desktopLogin({
			organizationId: options?.organizationId,
			onSuccess: () => {
				// Navigate to return URL after successful login
				const returnTo = options?.returnTo || "/"
				router.navigate({ to: returnTo })
				resolve()
			},
			onError: (error) => {
				reject(error)
			},
		})
	})
}

/**
 * Web login handler
 */
function handleWebLogin(options?: LoginOptions): void {
	const loginUrl = new URL("/auth/login", import.meta.env.VITE_BACKEND_URL)

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

	loginUrl.searchParams.set("returnTo", returnTo)

	if (options?.organizationId) {
		loginUrl.searchParams.set("organizationId", options.organizationId)
	}
	if (options?.invitationToken) {
		loginUrl.searchParams.set("invitationToken", options.invitationToken)
	}

	window.location.href = loginUrl.toString()
}

export function useAuth() {
	const { user: userResult, isLoading } = useAtomValue(authStateAtom)
	const logoutFn = useAtomSet(logoutAtom)

	const login = (options?: LoginOptions) => {
		if (isTauri()) {
			handleDesktopLogin(options).catch(console.error)
		} else {
			handleWebLogin(options)
		}
	}

	const logout = (options?: LogoutOptions) => {
		logoutFn(options)
	}

	return {
		user: Result.getOrElse(userResult, () => null),
		error: Result.error(userResult),
		isLoading,
		login,
		logout,
	}
}

/**
 * Hook to initialize desktop auth on app start
 * Checks for stored tokens and validates them
 */
export function useDesktopAuthInit() {
	// Desktop auth initialization is now handled in registry.ts
	// This hook is kept for backwards compatibility but does nothing
}

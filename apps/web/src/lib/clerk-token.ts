/**
 * Clerk bearer-token helpers.
 *
 * Clerk's React SDK exposes the `Clerk` singleton on `window.Clerk` once
 * `<ClerkProvider>` has mounted and loaded. We use it here so non-React
 * callers (RPC middleware, auth-fetch) can obtain a JWT without threading
 * hooks through their call sites.
 */

interface ClerkLike {
	loaded?: boolean
	session?: {
		getToken: (options?: { template?: string }) => Promise<string | null>
	} | null
	redirectToSignIn?: (options: { redirectUrl: string }) => Promise<void>
}

declare global {
	interface Window {
		Clerk?: ClerkLike
	}
}

/**
 * Returns a Clerk session token if the user is signed in with Clerk, otherwise null.
 * Never throws — callers should fall back to the legacy WorkOS token path on null.
 */
export const getClerkToken = async (): Promise<string | null> => {
	if (typeof window === "undefined") return null
	const clerk = window.Clerk
	if (!clerk?.loaded || !clerk.session) return null
	try {
		return (await clerk.session.getToken()) ?? null
	} catch {
		return null
	}
}

/** Synchronous check: is a Clerk session currently active? */
export const hasClerkSession = (): boolean => {
	if (typeof window === "undefined") return false
	return !!window.Clerk?.loaded && !!window.Clerk?.session
}

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
 * Wait for Clerk to finish loading (up to `timeoutMs`). Returns the Clerk
 * singleton once loaded, or null on timeout / if Clerk is absent.
 */
const waitForClerkLoaded = async (timeoutMs = 5000): Promise<ClerkLike | null> => {
	if (typeof window === "undefined") return null
	if (window.Clerk?.loaded) return window.Clerk
	const start = Date.now()
	while (Date.now() - start < timeoutMs) {
		await new Promise((resolve) => setTimeout(resolve, 50))
		if (window.Clerk?.loaded) return window.Clerk
	}
	return window.Clerk ?? null
}

/**
 * Returns a Clerk session token if the user is signed in, otherwise null.
 * Waits briefly for Clerk to finish hydrating so callers racing with the
 * initial Clerk load don't miss the session on the first page render.
 */
export const getClerkToken = async (): Promise<string | null> => {
	const clerk = await waitForClerkLoaded()
	if (!clerk?.session) return null
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

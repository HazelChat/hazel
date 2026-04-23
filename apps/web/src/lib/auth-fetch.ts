/**
 * Authenticated fetch. Clerk manages the session; we attach a bearer token on
 * each request. On a persistent 401 we redirect to Clerk sign-in — guarded so
 * we only fire once, and only after Clerk has confirmed there's no session.
 */

import { clerkReady, getClerkToken } from "./clerk-token"

let redirectInFlight = false

const redirectToSignInIfSignedOut = async (): Promise<void> => {
	if (typeof window === "undefined") return
	if (redirectInFlight) return
	const clerk = await clerkReady()
	// If Clerk still has a session, the 401 isn't an auth-state issue — don't
	// bounce the user to sign-in, let the caller surface the error.
	if (clerk?.session) return
	redirectInFlight = true
	const redirectUrl = window.location.pathname + window.location.search + window.location.hash
	if (clerk?.redirectToSignIn) {
		void clerk.redirectToSignIn({ redirectUrl })
		return
	}
	window.location.assign(redirectUrl)
}

export const authenticatedFetch = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	const token = await getClerkToken()
	if (!token) {
		void redirectToSignInIfSignedOut()
		return new Response(null, { status: 401 })
	}

	const response = await fetch(input, {
		...init,
		headers: { ...init?.headers, Authorization: `Bearer ${token}` },
	})

	if (response.status === 401) {
		// Token might have rotated; Clerk's getToken refreshes automatically on
		// the next call, so try once more.
		const retryToken = await getClerkToken()
		if (retryToken && retryToken !== token) {
			const retry = await fetch(input, {
				...init,
				headers: { ...init?.headers, Authorization: `Bearer ${retryToken}` },
			})
			if (retry.status === 401) void redirectToSignInIfSignedOut()
			return retry
		}
		void redirectToSignInIfSignedOut()
	}

	return response
}

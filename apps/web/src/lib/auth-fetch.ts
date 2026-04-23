/**
 * Authenticated fetch. Clerk manages the session; we just attach a bearer
 * token on each request and dispatch `auth:session-expired` on 401 so the
 * app can redirect to sign-in.
 */

import { getClerkToken } from "./clerk-token"

const SESSION_EXPIRED_EVENT = "auth:session-expired"

const dispatchSessionExpired = (): void => {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
	}
}

export const authenticatedFetch = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	const token = await getClerkToken()
	if (!token) {
		dispatchSessionExpired()
		return new Response(null, { status: 401 })
	}

	const response = await fetch(input, {
		...init,
		headers: { ...init?.headers, Authorization: `Bearer ${token}` },
	})

	if (response.status === 401) {
		// Token might have rotated; Clerk's getToken refreshes automatically on the
		// next call, so try once more.
		const retryToken = await getClerkToken()
		if (retryToken && retryToken !== token) {
			const retry = await fetch(input, {
				...init,
				headers: { ...init?.headers, Authorization: `Bearer ${retryToken}` },
			})
			if (retry.status === 401) dispatchSessionExpired()
			return retry
		}
		dispatchSessionExpired()
	}

	return response
}

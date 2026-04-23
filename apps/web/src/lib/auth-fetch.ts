/**
 * Authenticated fetch. Attaches the Clerk bearer token and returns the
 * response as-is. Auth state (signed-in vs. signed-out) is handled by the
 * React tree via `<SignedIn>` / `<SignedOut>`, not here.
 */

import { getClerkToken } from "./clerk-token"

export const authenticatedFetch = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	const token = await getClerkToken()
	if (!token) return new Response(null, { status: 401 })
	return fetch(input, {
		...init,
		headers: { ...init?.headers, Authorization: `Bearer ${token}` },
	})
}

/**
 * Authenticated fetch for Electric SQL. Attaches the Hazel access token: the proxy is on another
 * host, so it cannot see the API's session cookie.
 *
 * Retries live in the Electric client, not here. Its fetch wrapper backs off on 5xx, 429 and
 * network errors without limit; every other error reaches `electricOnError`.
 */
import { FetchError } from "@electric-sql/client"
import { invalidateAccessToken, readAccessToken } from "./access-token"

export const electricFetchClient = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	const token = await readAccessToken()
	// The API did not answer: a 503 sends this request through Electric's fetch backoff, which
	// retries without limit. A 401 would count against `onError`'s 50-retry cap, and an outage
	// that outlasted it would leave the shape stopped after the API came back.
	if (token === "unavailable") return new Response(null, { status: 503 })
	// No session: `electricOnError` retries the 401; the app re-reads the session meanwhile.
	if (token === null) return new Response(null, { status: 401 })
	const response = await fetch(input, {
		...init,
		headers: { ...init?.headers, Authorization: `Bearer ${token}` },
	})
	// The proxy rejected this token (expired, or its session has ended); the next attempt exchanges again.
	if (response.status === 401) invalidateAccessToken(token)
	return response
}

/**
 * `shapeOptions.onError` for every collection. Without one, the first error stops a shape for
 * good, and a collection that never becomes ready leaves its live queries waiting. A 401 is
 * retried with a fresh token: right after sign-in the token exchange can fail once. Electric
 * paces these retries and gives up after 50 in a row. Any other 4xx means the request itself is
 * wrong (a table the proxy does not allow, a bad parameter), so the shape stops.
 */
export const electricOnError = (error: Error): Record<string, never> | undefined =>
	error instanceof FetchError && error.status !== 401 ? undefined : {}

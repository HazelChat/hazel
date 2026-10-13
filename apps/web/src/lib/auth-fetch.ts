/**
 * Authenticated fetch for the Hazel API. The session is an HttpOnly cookie on the API
 * host, so the request only has to carry credentials; the backend checks the Origin.
 */

export const authenticatedFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
	fetch(input, { ...init, credentials: "include" })

/**
 * Authenticated fetch client for Electric SQL
 *
 * Handles both Tauri desktop (Bearer token) and web (cookies) authentication.
 * - Tauri: Reads access token from localStorage and sends as Authorization header
 * - Web: Uses credentials: "include" to send cookies
 */
export const electricFetchClient = (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
	const token = typeof window !== "undefined" ? localStorage.getItem("hazel_access_token") : null

	if (token) {
		// Tauri desktop: use Bearer token
		return fetch(url, {
			...init,
			headers: {
				...init?.headers,
				Authorization: `Bearer ${token}`,
			},
		})
	}

	// Web: use cookies
	return fetch(url, { ...init, credentials: "include" })
}

/**
 * @module Shared authenticated fetch for desktop and web
 * @description Platform-aware fetch that uses Bearer tokens for desktop and cookies for web
 */

import { isTauri } from "./tauri"
import { clearTokens, getAccessToken } from "./token-storage"

/**
 * Authenticated fetch that handles both Tauri (Bearer token) and web (cookies)
 * - Tauri: Reads access token from Tauri store and sends as Authorization header
 * - Web: Uses credentials: "include" to send cookies
 */
export const authenticatedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
	// Desktop: use Bearer token from Tauri store
	if (isTauri()) {
		const token = await getAccessToken()
		if (token) {
			const response = await fetch(input, {
				...init,
				headers: {
					...init?.headers,
					Authorization: `Bearer ${token}`,
				},
			})

			// If 401 (expired/invalid token), clear tokens so app redirects to login
			if (response.status === 401) {
				try {
					await clearTokens()
				} catch (error) {
					console.error("[auth-fetch] Failed to clear tokens:", error)
				}
			}

			return response
		}
	}

	// Web: use cookies
	return fetch(input, { ...init, credentials: "include" })
}

/**
 * @module Shared authenticated fetch for desktop and web
 * @description Platform-aware fetch that uses Bearer tokens for desktop and cookies for web
 */

import { isTauri } from "./tauri"
import { clearTokens, LOCAL_STORAGE_TOKEN_KEY } from "./token-storage"

/**
 * Authenticated fetch that handles both Tauri (Bearer token) and web (cookies)
 * - Tauri: Reads access token from localStorage (synced from Tauri store) and sends as Authorization header
 * - Web: Uses credentials: "include" to send cookies
 */
export const authenticatedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
	// Desktop: use Bearer token from localStorage (synced from Tauri store)
	const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)

	if (token) {
		const response = await fetch(input, {
			...init,
			headers: {
				...init?.headers,
				Authorization: `Bearer ${token}`,
			},
		})

		// If 401 (expired/invalid token), clear tokens so app redirects to login
		if (response.status === 401 && isTauri()) {
			await clearTokens()
		}

		return response
	}

	// Web: use cookies
	return fetch(input, { ...init, credentials: "include" })
}

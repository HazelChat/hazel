/**
 * @module Shared authenticated fetch for desktop and web
 * @description Platform-aware fetch that uses Bearer tokens for both desktop and web
 *
 * Auth flow (both platforms):
 * 1. Wait for any in-progress token refresh before making request
 * 2. On 401, attempt token refresh and retry once
 * 3. Only clear tokens if retry also fails
 */

import { Effect, Option } from "effect"
import {
	forceRefresh as forceDesktopRefresh,
	waitForRefresh as waitForDesktopRefresh,
} from "~/atoms/desktop-auth"
import { forceWebRefresh, getWebAccessToken, waitForWebRefresh } from "~/atoms/web-auth"
import { TokenStorage } from "./services/desktop/token-storage"
import { WebTokenStorage } from "./services/web/token-storage"
import { isTauri } from "./tauri"

const DesktopTokenStorageLive = TokenStorage.Default
const WebTokenStorageLive = WebTokenStorage.Default

/**
 * Get access token from appropriate storage (desktop or web)
 */
const getAccessToken = async (): Promise<string | null> => {
	if (isTauri()) {
		// Desktop: use Tauri store
		return Effect.runPromise(
			Effect.gen(function* () {
				const tokenStorage = yield* TokenStorage
				const tokenOpt = yield* tokenStorage.getAccessToken
				return Option.getOrNull(tokenOpt)
			}).pipe(
				Effect.provide(DesktopTokenStorageLive),
				Effect.catchAll(() => Effect.succeed(null)),
			),
		)
	}

	// Web: use localStorage
	return getWebAccessToken()
}

/**
 * Clear tokens from appropriate storage (desktop or web)
 */
const clearTokens = async (): Promise<void> => {
	if (isTauri()) {
		// Desktop: clear Tauri store
		return Effect.runPromise(
			Effect.gen(function* () {
				const tokenStorage = yield* TokenStorage
				yield* tokenStorage.clearTokens
			}).pipe(
				Effect.provide(DesktopTokenStorageLive),
				Effect.catchAll(() => Effect.void),
			),
		)
	}

	// Web: clear localStorage
	return Effect.runPromise(
		Effect.gen(function* () {
			const tokenStorage = yield* WebTokenStorage
			yield* tokenStorage.clearTokens
		}).pipe(
			Effect.provide(WebTokenStorageLive),
			Effect.catchAll(() => Effect.void),
		),
	)
}

/**
 * Wait for any in-progress token refresh to complete
 */
const waitForRefresh = async (): Promise<boolean> => {
	if (isTauri()) {
		return waitForDesktopRefresh()
	}
	return waitForWebRefresh()
}

/**
 * Force an immediate token refresh
 */
const forceRefresh = async (): Promise<boolean> => {
	if (isTauri()) {
		return forceDesktopRefresh()
	}
	return forceWebRefresh()
}

/**
 * Make an authenticated request with a token
 */
const makeAuthenticatedRequest = async (
	input: RequestInfo | URL,
	init: RequestInit | undefined,
	token: string,
): Promise<Response> => {
	return fetch(input, {
		...init,
		headers: {
			...init?.headers,
			Authorization: `Bearer ${token}`,
		},
	})
}

/**
 * Authenticated fetch that handles both Tauri and web using Bearer tokens
 * - Desktop: Reads access token from Tauri store
 * - Web: Reads access token from localStorage
 *
 * Both platforms:
 * - Wait for any in-progress refresh before making request
 * - On 401, attempt token refresh and retry once
 * - Dispatch auth:session-expired event if auth fails completely
 */
export const authenticatedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
	// Wait for any in-progress token refresh before making the request
	await waitForRefresh()

	const token = await getAccessToken()

	// If we have a token, use Bearer authentication
	if (token) {
		const response = await makeAuthenticatedRequest(input, init, token)

		// If 401 (expired/invalid token), try to refresh and retry once
		if (response.status === 401) {
			console.log("[auth-fetch] Got 401, attempting token refresh...")

			// Try to refresh the token
			const refreshed = await forceRefresh()

			if (refreshed) {
				// Get the new token and retry the request
				const newToken = await getAccessToken()
				if (newToken) {
					console.log("[auth-fetch] Token refreshed, retrying request...")
					const retryResponse = await makeAuthenticatedRequest(input, init, newToken)

					// If retry also fails with 401, clear tokens and dispatch session expired
					if (retryResponse.status === 401) {
						console.error("[auth-fetch] Retry failed with 401, clearing tokens")
						try {
							await clearTokens()
						} catch (error) {
							console.error("[auth-fetch] Failed to clear tokens:", error)
						}
						window.dispatchEvent(new CustomEvent("auth:session-expired"))
					}

					return retryResponse
				}
			}

			// Refresh failed or no new token available, clear tokens and dispatch session expired
			console.error("[auth-fetch] Token refresh failed, clearing tokens")
			try {
				await clearTokens()
			} catch (error) {
				console.error("[auth-fetch] Failed to clear tokens:", error)
			}
			window.dispatchEvent(new CustomEvent("auth:session-expired"))
		}

		return response
	}

	// No token available - skip the request and trigger login redirect
	window.dispatchEvent(new CustomEvent("auth:session-expired"))
	return new Response(null, { status: 401 })
}

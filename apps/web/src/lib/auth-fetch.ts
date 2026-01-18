/**
 * @module Shared authenticated fetch for desktop and web
 * @description Platform-aware fetch that uses Bearer tokens for desktop and cookies for web
 */

import { Effect, Option } from "effect"
import { TokenStorage } from "./services/desktop/token-storage"
import { isTauri } from "./tauri"

const TokenStorageLive = TokenStorage.Default

/**
 * Get access token from Tauri store (Promise-based for fetch compatibility)
 */
const getAccessToken = async (): Promise<string | null> => {
	if (!isTauri()) return null

	return Effect.runPromise(
		Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			const tokenOpt = yield* tokenStorage.getAccessToken
			return Option.getOrNull(tokenOpt)
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)
}

/**
 * Clear tokens from Tauri store (Promise-based for fetch compatibility)
 */
const clearTokens = async (): Promise<void> => {
	if (!isTauri()) return

	return Effect.runPromise(
		Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			yield* tokenStorage.clearTokens
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.catchAll(() => Effect.void),
		),
	)
}

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
	const response = await fetch(input, { ...init, credentials: "include" })

	// If 401 (expired/invalid session), trigger session expired event for redirect to login
	if (response.status === 401) {
		window.dispatchEvent(new CustomEvent("auth:session-expired"))
	}

	return response
}

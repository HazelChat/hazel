/**
 * @module Web authentication atoms
 * @platform web
 * @description Effect Atom-based state management for web JWT authentication
 *
 * This module mirrors the desktop auth architecture:
 * - Uses atoms for all auth state (tokens, refresh timer)
 * - Uses atom finalizers for cleanup
 * - Proper Result types for React integration
 */

import { Atom } from "@effect-atom/atom-react"
import { FetchHttpClient } from "@effect/platform"
import { Deferred, Duration, Effect, Layer, Option, Ref, Schema } from "effect"
import { runtime } from "~/lib/services/common/runtime"
import { TokenExchange } from "~/lib/services/desktop/token-exchange"
import { WebTokenStorage } from "~/lib/services/web/token-storage"
import { isTauri } from "~/lib/tauri"

// ============================================================================
// Types
// ============================================================================

export interface WebTokens {
	accessToken: string
	refreshToken: string
	expiresAt: number
}

export type WebAuthStatus = "idle" | "loading" | "authenticated" | "error"

export interface WebAuthError {
	_tag: string
	message: string
}

// ============================================================================
// Errors
// ============================================================================

/**
 * Error type for JWT decoding failures
 */
class JwtDecodeError extends Schema.TaggedError<JwtDecodeError>()("JwtDecodeError", {
	message: Schema.String,
}) {}

// ============================================================================
// JWT Helpers
// ============================================================================

/**
 * Decode the session ID from a JWT access token
 */
const decodeJwtSessionId = (token: string): Effect.Effect<string, JwtDecodeError> =>
	Effect.try({
		try: () => {
			const parts = token.split(".")
			if (parts.length !== 3 || !parts[1]) {
				throw new Error("Invalid JWT format")
			}
			const base64Url = parts[1]
			const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
			const payload = JSON.parse(atob(base64)) as { sid?: string }
			if (!payload.sid) {
				throw new Error("No session ID in JWT payload")
			}
			return payload.sid
		},
		catch: (error) => new JwtDecodeError({ message: String(error) }),
	})

/**
 * Build the WorkOS logout URL with session ID and return URL
 */
const buildWorkosLogoutUrl = (sessionId: string, returnTo: string): URL => {
	const url = new URL("https://api.workos.com/user_management/sessions/logout")
	url.searchParams.set("session_id", sessionId)
	url.searchParams.set("return_to", returnTo)
	return url
}

// ============================================================================
// Constants
// ============================================================================

// Refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000

// Retry configuration for transient errors
const MAX_REFRESH_RETRIES = 3
const BASE_BACKOFF_MS = 1000 // 1s, 2s, 4s

// ============================================================================
// Layers
// ============================================================================

const WebTokenStorageLive = WebTokenStorage.Default
const TokenExchangeLive = TokenExchange.Default.pipe(Layer.provide(FetchHttpClient.layer))

// ============================================================================
// Core State Atoms
// ============================================================================

/**
 * Writable atom holding the current web tokens
 * Null when not authenticated
 */
export const webTokensAtom = Atom.make<WebTokens | null>(null).pipe(Atom.keepAlive)

/**
 * Writable atom holding the current auth status
 */
export const webAuthStatusAtom = Atom.make<WebAuthStatus>("idle").pipe(Atom.keepAlive)

/**
 * Writable atom holding the last auth error (if any)
 */
export const webAuthErrorAtom = Atom.make<WebAuthError | null>(null).pipe(Atom.keepAlive)

/**
 * Ref to track if refresh is in progress (prevents concurrent refreshes)
 */
const isRefreshingRef = Ref.unsafeMake(false)

/**
 * Ref holding a Deferred that resolves when current refresh completes
 * Allows callers to wait for an in-progress refresh
 */
const refreshDeferredRef = Ref.unsafeMake<Deferred.Deferred<boolean> | null>(null)

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Derived atom that returns whether the user is authenticated on web
 */
export const isWebAuthenticatedAtom = Atom.make((get) => get(webTokensAtom) !== null)

// ============================================================================
// Token Refresh Logic
// ============================================================================

/**
 * Getter interface for atom actions (matches what Atom.make provides)
 */
interface AtomGetter {
	<T>(atom: Atom.Atom<T>): T
	set<T>(atom: Atom.Writable<T>, value: T): void
	addFinalizer(fn: () => void): void
	refresh<T>(atom: Atom.Atom<T>): void
}

/**
 * Check if an error is a fatal error (refresh token revoked/invalid)
 * Fatal errors should not be retried
 */
export const isFatalRefreshError = (error: { _tag?: string; message?: string; detail?: string }): boolean => {
	// 401 from refresh endpoint means refresh token is revoked/invalid
	if (error.detail?.includes("HTTP 401")) return true
	// 403 means forbidden - token blacklisted or similar
	if (error.detail?.includes("HTTP 403")) return true
	return false
}

/**
 * Check if an error is transient (timeout, network) and can be retried
 */
export const isTransientError = (error: { _tag?: string; message?: string }): boolean => {
	const message = error.message?.toLowerCase() ?? ""
	return (
		message.includes("timed out") ||
		message.includes("timeout") ||
		message.includes("network error") ||
		error._tag === "TimeoutException" ||
		error._tag === "RequestError"
	)
}

/**
 * Effect that performs the actual token refresh with retry logic
 * Returns true if refresh succeeded, false if failed/skipped
 */
const doRefresh = (get: AtomGetter) =>
	Effect.gen(function* () {
		// Prevent concurrent refreshes - but allow caller to wait
		const alreadyRefreshing = yield* Ref.get(isRefreshingRef)
		if (alreadyRefreshing) {
			yield* Effect.log("[web-auth] Already refreshing, skipping")
			return false
		}

		yield* Ref.set(isRefreshingRef, true)

		// Create a Deferred so callers can wait for this refresh
		const deferred = yield* Deferred.make<boolean>()
		yield* Ref.set(refreshDeferredRef, deferred)

		// Use a Ref to store the result so we can access it in the finalizer
		const resultRef = yield* Ref.make<boolean>(false)

		yield* Effect.gen(function* () {
			const tokenStorage = yield* WebTokenStorage
			const tokenExchange = yield* TokenExchange

			// Get refresh token
			const refreshTokenOpt = yield* tokenStorage.getRefreshToken
			if (Option.isNone(refreshTokenOpt)) {
				yield* Effect.log("[web-auth] No refresh token found, user needs to re-login")
				// Clear state and dispatch session expired event
				get.set(webTokensAtom, null)
				get.set(webAuthStatusAtom, "error")
				get.set(webAuthErrorAtom, {
					_tag: "TokenNotFoundError",
					message: "No refresh token found",
				})

				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("auth:session-expired"))
				}
				yield* Ref.set(resultRef, false)
				return
			}

			yield* Effect.log("[web-auth] Refreshing tokens...")

			// Attempt refresh with retries for transient errors
			const attemptRefresh = (attempt: number): Effect.Effect<boolean> =>
				Effect.gen(function* () {
					const refreshResult = yield* tokenExchange.refreshToken(refreshTokenOpt.value).pipe(
						Effect.map((tokens) => ({ success: true as const, tokens })),
						Effect.catchAll((error) => Effect.succeed({ success: false as const, error })),
					)

					if (refreshResult.success) {
						const { tokens } = refreshResult
						// Store new tokens
						yield* tokenStorage
							.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
							.pipe(Effect.orDie)

						// Update atom state
						const expiresAt = Date.now() + tokens.expiresIn * 1000
						get.set(webTokensAtom, {
							accessToken: tokens.accessToken,
							refreshToken: tokens.refreshToken,
							expiresAt,
						})
						get.set(webAuthErrorAtom, null)

						yield* Effect.log("[web-auth] Tokens refreshed successfully")
						return true
					}

					const { error } = refreshResult

					// Fatal error - don't retry, logout immediately
					if (isFatalRefreshError(error)) {
						yield* Effect.log(
							`[web-auth] Fatal refresh error (attempt ${attempt}): ${error.message}`,
						)
						console.error("[web-auth] Fatal token refresh error:", error)
						get.set(webAuthErrorAtom, {
							_tag: error._tag ?? "UnknownError",
							message: error.message ?? "Token refresh failed",
						})
						if (typeof window !== "undefined") {
							window.dispatchEvent(new CustomEvent("auth:session-expired"))
						}
						return false
					}

					// Transient error - retry with backoff
					if (isTransientError(error) && attempt < MAX_REFRESH_RETRIES) {
						const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1)
						yield* Effect.log(
							`[web-auth] Transient error (attempt ${attempt}/${MAX_REFRESH_RETRIES}), retrying in ${backoffMs}ms: ${error.message}`,
						)
						yield* Effect.sleep(Duration.millis(backoffMs))
						return yield* attemptRefresh(attempt + 1)
					}

					// Max retries exhausted or non-transient error
					yield* Effect.log(`[web-auth] Refresh failed after ${attempt} attempts: ${error.message}`)
					console.error("[web-auth] Token refresh failed after retries:", error)
					get.set(webAuthErrorAtom, {
						_tag: error._tag ?? "UnknownError",
						message: error.message ?? "Token refresh failed",
					})
					if (typeof window !== "undefined") {
						window.dispatchEvent(new CustomEvent("auth:session-expired"))
					}
					return false
				})

			const refreshed = yield* attemptRefresh(1)
			yield* Ref.set(resultRef, refreshed)
		}).pipe(
			Effect.provide(WebTokenStorageLive),
			Effect.provide(TokenExchangeLive),
			Effect.ensuring(
				Effect.gen(function* () {
					yield* Ref.set(isRefreshingRef, false)
					// Resolve the Deferred so waiters get the result
					const currentDeferred = yield* Ref.get(refreshDeferredRef)
					const finalResult = yield* Ref.get(resultRef)
					if (currentDeferred) {
						yield* Deferred.succeed(currentDeferred, finalResult)
					}
					yield* Ref.set(refreshDeferredRef, null)
				}),
			),
			Effect.catchAll((error) => {
				// Catch any unexpected errors
				console.error("[web-auth] Unexpected error during refresh:", error)
				get.set(webAuthErrorAtom, {
					_tag: "UnknownError",
					message: "Unexpected error during token refresh",
				})
				return Effect.void
			}),
		)

		return yield* Ref.get(resultRef)
	})

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Action atom that performs web logout
 * Clears tokens from storage, resets atom state, and redirects through WorkOS logout
 * to clear the WorkOS session (prevents silent re-authentication)
 */
export const webLogoutAtom = Atom.fn(
	Effect.fnUntraced(function* (options?: { redirectTo?: string }, get?) {
		// Skip if in Tauri environment (use desktop logout instead)
		if (isTauri()) {
			yield* Effect.log("[web-auth] In Tauri environment, skipping web logout")
			return
		}

		yield* Effect.gen(function* () {
			const tokenStorage = yield* WebTokenStorage

			// Get the access token BEFORE clearing to extract session ID
			const accessTokenOption = yield* tokenStorage.getAccessToken

			// Clear localStorage tokens
			yield* tokenStorage.clearTokens.pipe(
				Effect.catchAll((error) => Effect.logError("[web-auth] Failed to clear tokens", error)),
			)

			// Reset atom state
			get?.set(webTokensAtom, null)
			get?.set(webAuthStatusAtom, "idle")
			get?.set(webAuthErrorAtom, null)

			const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
			const redirectTo = options?.redirectTo || "/"
			const returnTo = `${frontendUrl}${redirectTo}`

			// Try to extract session ID and redirect through WorkOS logout
			yield* Option.match(accessTokenOption, {
				onNone: () =>
					Effect.gen(function* () {
						yield* Effect.log(`[web-auth] No access token, redirecting to: ${returnTo}`)
						yield* Effect.sync(() => {
							window.location.href = returnTo
						})
					}),
				onSome: (accessToken) =>
					decodeJwtSessionId(accessToken).pipe(
						Effect.flatMap((sessionId) =>
							Effect.gen(function* () {
								const workosLogoutUrl = buildWorkosLogoutUrl(sessionId, returnTo)
								yield* Effect.log("[web-auth] Redirecting to WorkOS logout to clear session")
								yield* Effect.sync(() => {
									window.location.href = workosLogoutUrl.toString()
								})
							}),
						),
						Effect.catchTag("JwtDecodeError", (error) =>
							Effect.gen(function* () {
								yield* Effect.logError("[web-auth] Failed to parse JWT for session ID", error)
								yield* Effect.log(`[web-auth] Falling back to direct redirect: ${returnTo}`)
								yield* Effect.sync(() => {
									window.location.href = returnTo
								})
							}),
						),
					),
			})
		}).pipe(Effect.provide(WebTokenStorageLive))
	}),
)

/**
 * Action atom that forces an immediate token refresh
 * Useful when you need fresh tokens for a specific operation
 */
export const webForceRefreshAtom = Atom.fn(
	Effect.fnUntraced(function* (_: void, get) {
		if (isTauri()) return false
		return yield* doRefresh(get)
	}),
)

// ============================================================================
// Initialization Atom
// ============================================================================

/**
 * Initialization atom that loads stored tokens into atom state on startup
 * Should be mounted once at app startup
 */
export const webInitAtom = Atom.make((get) => {
	// Skip if in Tauri environment (use desktop auth instead)
	if (isTauri()) return null

	// Load tokens from storage asynchronously
	const loadTokens = Effect.gen(function* () {
		const tokenStorage = yield* WebTokenStorage
		const accessTokenOpt = yield* tokenStorage.getAccessToken
		const refreshTokenOpt = yield* tokenStorage.getRefreshToken
		const expiresAtOpt = yield* tokenStorage.getExpiresAt

		if (Option.isSome(accessTokenOpt) && Option.isSome(refreshTokenOpt) && Option.isSome(expiresAtOpt)) {
			get.set(webTokensAtom, {
				accessToken: accessTokenOpt.value,
				refreshToken: refreshTokenOpt.value,
				expiresAt: expiresAtOpt.value,
			})
			get.set(webAuthStatusAtom, "authenticated")
			yield* Effect.log("[web-auth] Loaded tokens from storage")
		} else {
			get.set(webAuthStatusAtom, "idle")
			yield* Effect.log("[web-auth] No stored tokens found")
		}
	}).pipe(
		Effect.provide(WebTokenStorageLive),
		Effect.catchAll((error) => {
			console.error("[web-auth] Failed to load tokens:", error)
			get.set(webAuthStatusAtom, "error")
			get.set(webAuthErrorAtom, {
				_tag: error._tag ?? "UnknownError",
				message: error.message ?? "Failed to load tokens",
			})
			return Effect.void
		}),
	)

	// Run token loading
	const fiber = runtime.runFork(loadTokens)

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return null
}).pipe(Atom.keepAlive)

// ============================================================================
// Token Refresh Scheduler Atom
// ============================================================================

/**
 * Scheduler atom that automatically refreshes tokens before they expire
 * Uses fiber + finalizer for cleanup (no module-level setTimeout)
 */
export const webTokenSchedulerAtom = Atom.make((get) => {
	const tokens = get(webTokensAtom)

	// Skip if not authenticated or in Tauri
	if (!tokens || isTauri()) return null

	const timeUntilRefresh = tokens.expiresAt - Date.now() - REFRESH_BUFFER_MS

	if (timeUntilRefresh <= 0) {
		// Token expired or about to expire, refresh immediately
		runtime.runFork(
			Effect.gen(function* () {
				yield* Effect.log("[web-auth] Token expired or expiring soon, refreshing now")
				yield* doRefresh(get)
			}),
		)
		return { scheduledFor: Date.now(), immediate: true }
	}

	// Schedule refresh using Effect.sleep
	const minutes = Math.round(timeUntilRefresh / 1000 / 60)
	const scheduledFor = tokens.expiresAt - REFRESH_BUFFER_MS

	const refreshSchedule = Effect.gen(function* () {
		yield* Effect.log(`[web-auth] Scheduling refresh in ${minutes} minutes`)
		yield* Effect.sleep(Duration.millis(timeUntilRefresh))
		yield* Effect.log("[web-auth] Scheduled refresh triggered")
		yield* doRefresh(get)
	})

	const fiber = runtime.runFork(refreshSchedule)

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return { scheduledFor, immediate: false }
}).pipe(Atom.keepAlive)

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the current access token (for use in HTTP headers)
 * Returns null if not authenticated
 */
export const getWebAccessToken = (): Promise<string | null> => {
	if (isTauri()) return Promise.resolve(null)

	return Effect.runPromise(
		Effect.gen(function* () {
			const tokenStorage = yield* WebTokenStorage
			const tokenOpt = yield* tokenStorage.getAccessToken
			return Option.getOrNull(tokenOpt)
		}).pipe(
			Effect.provide(WebTokenStorageLive),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)
}

/**
 * Wait for any in-progress token refresh to complete
 * Returns true if refresh succeeded, false otherwise, or true if no refresh in progress
 */
export const waitForWebRefresh = (): Promise<boolean> => {
	if (isTauri()) return Promise.resolve(true)

	return Effect.runPromise(
		Effect.gen(function* () {
			const deferred = yield* Ref.get(refreshDeferredRef)
			if (deferred) {
				yield* Effect.log("[web-auth] Waiting for in-progress refresh...")
				return yield* Deferred.await(deferred)
			}
			return true
		}).pipe(Effect.catchAll(() => Effect.succeed(true))),
	)
}

/**
 * Force an immediate token refresh (Promise-based for use by auth-fetch)
 * Returns true if refresh succeeded, false otherwise
 */
export const forceWebRefresh = (): Promise<boolean> => {
	if (isTauri()) return Promise.resolve(false)

	return Effect.runPromise(
		Effect.gen(function* () {
			// Check if a refresh is already in progress
			const alreadyRefreshing = yield* Ref.get(isRefreshingRef)
			if (alreadyRefreshing) {
				// Wait for the in-progress refresh instead of starting a new one
				const deferred = yield* Ref.get(refreshDeferredRef)
				if (deferred) {
					yield* Effect.log("[web-auth] forceRefresh: waiting for in-progress refresh")
					return yield* Deferred.await(deferred)
				}
				return false
			}

			// Get refresh token to check if we can refresh
			const tokenStorage = yield* WebTokenStorage
			const refreshTokenOpt = yield* tokenStorage.getRefreshToken
			if (Option.isNone(refreshTokenOpt)) {
				yield* Effect.log("[web-auth] forceRefresh: no refresh token available")
				return false
			}

			// Perform the refresh
			const tokenExchange = yield* TokenExchange

			yield* Effect.log("[web-auth] forceRefresh: starting refresh...")
			yield* Ref.set(isRefreshingRef, true)

			const result = yield* tokenExchange.refreshToken(refreshTokenOpt.value).pipe(
				Effect.flatMap((tokens) =>
					Effect.gen(function* () {
						yield* tokenStorage.storeTokens(
							tokens.accessToken,
							tokens.refreshToken,
							tokens.expiresIn,
						)
						yield* Effect.log("[web-auth] forceRefresh: tokens refreshed successfully")
						return true
					}),
				),
				Effect.catchAll((error) => {
					console.error("[web-auth] forceRefresh failed:", error)
					return Effect.succeed(false)
				}),
				Effect.ensuring(Ref.set(isRefreshingRef, false)),
			)

			return result
		}).pipe(
			Effect.provide(WebTokenStorageLive),
			Effect.provide(TokenExchangeLive),
			Effect.catchAll(() => Effect.succeed(false)),
		),
	)
}

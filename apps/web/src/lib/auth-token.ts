/**
 * @module Unified auth token operations
 * @description Single AuthToken module that consolidates ALL token operations.
 * Effect consumers use the Effect-based functions directly (no Promise roundtrip).
 * React/async consumers use the exported Promise wrappers.
 */

import { Deferred, Duration, Effect, Option, Ref } from "effect"
import { appRegistry } from "~/lib/registry"
import { webTokensAtom, webAuthErrorAtom } from "~/atoms/web-auth"
import { desktopTokensAtom, desktopAuthErrorAtom } from "~/atoms/desktop-auth"
import { TokenExchange } from "~/lib/services/desktop/token-exchange"
import { WebTokenStorage } from "~/lib/services/web/token-storage"
import { TokenStorage } from "~/lib/services/desktop/token-storage"
import { runtime } from "~/lib/services/common/runtime"
import { isTauri } from "~/lib/tauri"

// ============================================================================
// Constants
// ============================================================================

const MAX_REFRESH_RETRIES = 3
const BASE_BACKOFF_MS = 1000 // 1s, 2s, 4s

// ============================================================================
// Shared Refs (prevents concurrent refreshes across all callers)
// ============================================================================

const isRefreshingRef = Ref.unsafeMake(false)
const refreshDeferredRef = Ref.unsafeMake<Deferred.Deferred<boolean> | null>(null)

// ============================================================================
// Platform-specific layers
// ============================================================================

const webStorageLive = WebTokenStorage.Default
const desktopStorageLive = TokenStorage.Default
const tokenExchangeLive = TokenExchange.Default

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Check if an error is a fatal error (refresh token revoked/invalid)
 * Fatal errors should not be retried
 */
export const isFatalRefreshError = (error: { _tag?: string; message?: string; detail?: string }): boolean => {
	if (error.detail?.includes("HTTP 401")) return true
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

// ============================================================================
// Platform helpers (each branch fully provided so R=never)
// ============================================================================

const tokensAtom = () => (isTauri() ? desktopTokensAtom : webTokensAtom)
const errorAtom = () => (isTauri() ? desktopAuthErrorAtom : webAuthErrorAtom)
const platformTag = () => (isTauri() ? "desktop" : "web")

/** Read access token from the correct platform storage */
const readAccessToken = Effect.fn("readAccessToken")(function* () {
	if (isTauri()) {
		return Option.getOrNull(yield* TokenStorage.getAccessToken.pipe(Effect.provide(desktopStorageLive)))
	}
	return Option.getOrNull(yield* WebTokenStorage.getAccessToken.pipe(Effect.provide(webStorageLive)))
})

/** Read refresh token from the correct platform storage */
const readRefreshToken = Effect.fn("readRefreshToken")(function* () {
	if (isTauri()) {
		return yield* TokenStorage.getRefreshToken.pipe(Effect.provide(desktopStorageLive))
	}
	return yield* WebTokenStorage.getRefreshToken.pipe(Effect.provide(webStorageLive))
})

/** Store tokens in the correct platform storage */
const storeTokens = Effect.fn("storeTokens")(function* (
	accessToken: string,
	refreshToken: string,
	expiresIn: number,
) {
	if (isTauri()) {
		yield* TokenStorage.storeTokens(accessToken, refreshToken, expiresIn).pipe(
			Effect.provide(desktopStorageLive),
			Effect.orDie,
		)
	} else {
		yield* WebTokenStorage.storeTokens(accessToken, refreshToken, expiresIn).pipe(
			Effect.provide(webStorageLive),
			Effect.orDie,
		)
	}
})

// ============================================================================
// Core Effects
// ============================================================================

/**
 * Get the current access token from the appropriate platform storage.
 * Returns null if not authenticated.
 */
const getAccessTokenEffect: Effect.Effect<string | null> = readAccessToken().pipe(
	Effect.catchAll(() => Effect.succeed(null)),
	Effect.withSpan("getAccessToken"),
)

/**
 * Wait for any in-progress token refresh to complete.
 * Returns true if refresh succeeded, or true if no refresh is in progress.
 */
const waitForRefreshEffect: Effect.Effect<boolean> = Effect.gen(function* () {
	const deferred = yield* Ref.get(refreshDeferredRef)
	if (deferred) {
		yield* Effect.log(`[auth-token:${platformTag()}] Waiting for in-progress refresh...`)
		return yield* Deferred.await(deferred)
	}
	return true
}).pipe(
	Effect.catchAll(() => Effect.succeed(true)),
	Effect.withSpan("waitForRefresh"),
)

/**
 * Force an immediate token refresh with retry logic and deferred coordination.
 * Returns true if refresh succeeded, false otherwise.
 */
const forceRefreshEffect: Effect.Effect<boolean> = Effect.gen(function* () {
	const tag = platformTag()

	// If already refreshing, wait for the in-progress refresh
	const alreadyRefreshing = yield* Ref.get(isRefreshingRef)
	if (alreadyRefreshing) {
		const deferred = yield* Ref.get(refreshDeferredRef)
		if (deferred) {
			yield* Effect.log(`[auth-token:${tag}] forceRefresh: waiting for in-progress refresh`)
			return yield* Deferred.await(deferred)
		}
		return false
	}

	// Get refresh token to check if we can refresh
	const refreshTokenOpt = yield* readRefreshToken().pipe(
		Effect.catchAll(() => Effect.succeed(Option.none<string>())),
	)

	if (Option.isNone(refreshTokenOpt)) {
		yield* Effect.log(`[auth-token:${tag}] forceRefresh: no refresh token available`)
		return false
	}

	yield* Effect.log(`[auth-token:${tag}] forceRefresh: starting refresh...`)
	yield* Ref.set(isRefreshingRef, true)

	const deferred = yield* Deferred.make<boolean>()
	yield* Ref.set(refreshDeferredRef, deferred)

	const resultRef = yield* Ref.make<boolean>(false)

	const attemptRefresh = (attempt: number): Effect.Effect<boolean, never, TokenExchange> =>
		Effect.gen(function* () {
			const tokenExchange = yield* TokenExchange

			const refreshResult = yield* tokenExchange.refreshToken(refreshTokenOpt.value).pipe(
				Effect.map((tokens) => ({ success: true as const, tokens })),
				Effect.catchAll((error) => Effect.succeed({ success: false as const, error })),
			)

			if (refreshResult.success) {
				const { tokens } = refreshResult

				// Store new tokens (each branch is fully provided)
				yield* storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)

				// Sync atom state
				const expiresAt = Date.now() + tokens.expiresIn * 1000
				appRegistry.set(tokensAtom(), {
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					expiresAt,
				})
				appRegistry.set(errorAtom(), null)

				yield* Effect.log(`[auth-token:${tag}] forceRefresh: tokens refreshed successfully`)
				return true
			}

			const { error } = refreshResult

			// Fatal error - don't retry
			if (isFatalRefreshError(error)) {
				yield* Effect.log(
					`[auth-token:${tag}] Fatal refresh error (attempt ${attempt}): ${error.message}`,
				)
				console.error(`[auth-token:${tag}] Fatal token refresh error:`, error)
				appRegistry.set(errorAtom(), {
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
					`[auth-token:${tag}] Transient error (attempt ${attempt}/${MAX_REFRESH_RETRIES}), retrying in ${backoffMs}ms: ${error.message}`,
				)
				yield* Effect.sleep(Duration.millis(backoffMs))
				return yield* attemptRefresh(attempt + 1)
			}

			// Max retries exhausted or non-transient error
			yield* Effect.log(
				`[auth-token:${tag}] Refresh failed after ${attempt} attempts: ${error.message}`,
			)
			console.error(`[auth-token:${tag}] Token refresh failed after retries:`, error)
			appRegistry.set(errorAtom(), {
				_tag: error._tag ?? "UnknownError",
				message: error.message ?? "Token refresh failed",
			})
			if (typeof window !== "undefined") {
				window.dispatchEvent(new CustomEvent("auth:session-expired"))
			}
			return false
		}).pipe(Effect.withSpan("attemptRefresh"))

	yield* attemptRefresh(1).pipe(
		Effect.provide(tokenExchangeLive),
		Effect.tap((result) => Ref.set(resultRef, result)),
		Effect.catchAll((error) => {
			console.error(`[auth-token:${tag}] Unexpected error during refresh:`, error)
			return Effect.void
		}),
		Effect.ensuring(
			Effect.gen(function* () {
				yield* Ref.set(isRefreshingRef, false)
				const finalResult = yield* Ref.get(resultRef)
				yield* Deferred.succeed(deferred, finalResult)
				yield* Ref.set(refreshDeferredRef, null)
			}),
		),
	)

	return yield* Ref.get(resultRef)
}).pipe(
	Effect.catchAll(() => Effect.succeed(false)),
	Effect.withSpan("forceRefresh"),
)

// ============================================================================
// Promise Wrappers (for React components / async callers)
// ============================================================================

/**
 * Force an immediate token refresh.
 * Returns true if refresh succeeded, false otherwise.
 */
export const forceRefresh = (): Promise<boolean> => runtime.runPromise(forceRefreshEffect)

/**
 * Wait for any in-progress token refresh to complete.
 * Returns true if refresh succeeded, or true if no refresh in progress.
 */
export const waitForRefresh = (): Promise<boolean> => runtime.runPromise(waitForRefreshEffect)

/**
 * Get the current access token.
 * Returns null if not authenticated.
 */
export const getAccessToken = (): Promise<string | null> => runtime.runPromise(getAccessTokenEffect)

// ============================================================================
// Effect Exports (for Effect-based callers like RPC middleware)
// ============================================================================

export { forceRefreshEffect, waitForRefreshEffect, getAccessTokenEffect, isRefreshingRef, refreshDeferredRef }

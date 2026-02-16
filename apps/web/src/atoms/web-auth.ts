/**
 * @module Web authentication atoms
 * @platform web
 * @description Effect Atom-based state management for web JWT authentication
 *
 * Token refresh logic is consolidated in ~/lib/auth-token.ts.
 * This module owns atom definitions, init, logout, and the scheduler.
 */

import { Atom } from "@effect-atom/atom-react"
import { Duration, Effect, Option, Schema } from "effect"
import { runtime } from "~/lib/services/common/runtime"
import { WebTokenStorage } from "~/lib/services/web/token-storage"
import { isTauri } from "~/lib/tauri"
import { forceRefreshEffect } from "~/lib/auth-token"
import { resetCallbackState } from "~/atoms/web-callback-atoms"

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

class JwtDecodeError extends Schema.TaggedError<JwtDecodeError>()("JwtDecodeError", {
	message: Schema.String,
}) {}

// ============================================================================
// JWT Helpers
// ============================================================================

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

const buildWorkosLogoutUrl = (sessionId: string, returnTo: string): URL => {
	const url = new URL("https://api.workos.com/user_management/sessions/logout")
	url.searchParams.set("session_id", sessionId)
	url.searchParams.set("return_to", returnTo)
	return url
}

// ============================================================================
// Constants
// ============================================================================

const REFRESH_BUFFER_MS = 5 * 60 * 1000

// ============================================================================
// Layers
// ============================================================================

const WebTokenStorageLive = WebTokenStorage.Default

// ============================================================================
// Core State Atoms
// ============================================================================

export const webTokensAtom = Atom.make<WebTokens | null>(null).pipe(Atom.keepAlive)
export const webAuthStatusAtom = Atom.make<WebAuthStatus>("idle").pipe(Atom.keepAlive)
export const webAuthErrorAtom = Atom.make<WebAuthError | null>(null).pipe(Atom.keepAlive)

// ============================================================================
// Derived Atoms
// ============================================================================

export const isWebAuthenticatedAtom = Atom.make((get) => get(webTokensAtom) !== null)

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Action atom that performs web logout
 * Clears tokens from storage, resets atom state, and redirects through WorkOS logout
 */
export const webLogoutAtom = Atom.fn(
	Effect.fnUntraced(function* (options?: { redirectTo?: string }, get?) {
		if (isTauri()) {
			yield* Effect.log("[web-auth] In Tauri environment, skipping web logout")
			return
		}

		yield* Effect.gen(function* () {
			const tokenStorage = yield* WebTokenStorage

			const accessTokenOption = yield* tokenStorage.getAccessToken

			yield* tokenStorage.clearTokens.pipe(
				Effect.catchAll((error) => Effect.logError("[web-auth] Failed to clear tokens", error)),
			)

			get?.set(webTokensAtom, null)
			get?.set(webAuthStatusAtom, "idle")
			get?.set(webAuthErrorAtom, null)
			resetCallbackState()

			const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
			const redirectTo = options?.redirectTo || "/"
			const returnTo = `${frontendUrl}${redirectTo}`

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
 * Action atom that forces an immediate token refresh via AuthToken
 */
export const webForceRefreshAtom = Atom.fn(
	Effect.fnUntraced(function* (_: void) {
		if (isTauri()) return false
		return yield* forceRefreshEffect
	}),
)

// ============================================================================
// Initialization Atom
// ============================================================================

export const webInitAtom = Atom.make((get) => {
	if (isTauri()) return null

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

	const fiber = runtime.runFork(loadTokens)

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return null
}).pipe(Atom.keepAlive)

// ============================================================================
// Token Refresh Scheduler Atom
// ============================================================================

export const webTokenSchedulerAtom = Atom.make((get) => {
	const tokens = get(webTokensAtom)

	if (!tokens || isTauri()) return null

	const timeUntilRefresh = tokens.expiresAt - Date.now() - REFRESH_BUFFER_MS

	if (timeUntilRefresh <= 0) {
		runtime.runFork(
			Effect.gen(function* () {
				yield* Effect.log("[web-auth] Token expired or expiring soon, refreshing now")
				yield* forceRefreshEffect
			}),
		)
		return { scheduledFor: Date.now(), immediate: true }
	}

	const minutes = Math.round(timeUntilRefresh / 1000 / 60)
	const scheduledFor = tokens.expiresAt - REFRESH_BUFFER_MS

	const refreshSchedule = Effect.gen(function* () {
		yield* Effect.log(`[web-auth] Scheduling refresh in ${minutes} minutes`)
		yield* Effect.sleep(Duration.millis(timeUntilRefresh))
		yield* Effect.log("[web-auth] Scheduled refresh triggered")
		yield* forceRefreshEffect
	})

	const fiber = runtime.runFork(refreshSchedule)

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return { scheduledFor, immediate: false }
}).pipe(Atom.keepAlive)

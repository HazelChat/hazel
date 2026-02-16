/**
 * @module Desktop authentication atoms
 * @platform desktop
 * @description Effect Atom-based state management for desktop OAuth authentication
 *
 * Token refresh logic is consolidated in ~/lib/auth-token.ts.
 * This module owns atom definitions, init, login, logout, and the scheduler.
 */

import { Atom } from "@effect-atom/atom-react"
import { Clipboard } from "@effect/platform-browser"
import type { OrganizationId } from "@hazel/schema"
import { Duration, Effect, Layer, Option, Schema } from "effect"
import { runtime } from "~/lib/services/common/runtime"
import { TauriAuth } from "~/lib/services/desktop/tauri-auth"
import { TokenExchange } from "~/lib/services/desktop/token-exchange"
import { TokenStorage } from "~/lib/services/desktop/token-storage"
import { isTauri } from "~/lib/tauri"
import { forceRefreshEffect, getAccessToken as getAccessTokenPromise } from "~/lib/auth-token"

// ============================================================================
// Types
// ============================================================================

export interface DesktopTokens {
	accessToken: string
	refreshToken: string
	expiresAt: number
}

export type DesktopAuthStatus = "idle" | "loading" | "authenticated" | "error"

export interface DesktopAuthError {
	_tag: string
	message: string
}

interface DesktopLoginOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface DesktopLogoutOptions {
	redirectTo?: string
}

// ============================================================================
// Constants
// ============================================================================

const REFRESH_BUFFER_MS = 5 * 60 * 1000

// ============================================================================
// Layers
// ============================================================================

const TokenStorageLive = TokenStorage.Default
const TokenExchangeLive = TokenExchange.Default
const TauriAuthLive = TauriAuth.Default
const ClipboardLive = Clipboard.layer

// ============================================================================
// Core State Atoms
// ============================================================================

export const desktopTokensAtom = Atom.make<DesktopTokens | null>(null).pipe(Atom.keepAlive)
export const desktopAuthStatusAtom = Atom.make<DesktopAuthStatus>("idle").pipe(Atom.keepAlive)
export const desktopAuthErrorAtom = Atom.make<DesktopAuthError | null>(null).pipe(Atom.keepAlive)

// ============================================================================
// Derived Atoms
// ============================================================================

export const isDesktopAuthenticatedAtom = Atom.make((get) => get(desktopTokensAtom) !== null)

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Action atom that initiates the desktop OAuth flow
 */
export const desktopLoginAtom = Atom.fn(
	Effect.fnUntraced(function* (options: DesktopLoginOptions, get) {
		if (!isTauri()) {
			yield* Effect.log("[desktop-auth] Not in Tauri environment, skipping desktop login")
			return
		}

		get.set(desktopAuthStatusAtom, "loading")
		get.set(desktopAuthErrorAtom, null)

		const result = yield* Effect.gen(function* () {
			const auth = yield* TauriAuth
			const authResult = yield* auth.initiateAuth(options)

			const accessTokenOpt = yield* TokenStorage.getAccessToken
			const refreshTokenOpt = yield* TokenStorage.getRefreshToken
			const expiresAtOpt = yield* TokenStorage.getExpiresAt

			if (
				Option.isSome(accessTokenOpt) &&
				Option.isSome(refreshTokenOpt) &&
				Option.isSome(expiresAtOpt)
			) {
				get.set(desktopTokensAtom, {
					accessToken: accessTokenOpt.value,
					refreshToken: refreshTokenOpt.value,
					expiresAt: expiresAtOpt.value,
				})
				get.set(desktopAuthStatusAtom, "authenticated")
			}

			return authResult
		}).pipe(
			Effect.provide(Layer.mergeAll(TauriAuthLive, TokenStorageLive)),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Login failed:", error)
				get.set(desktopAuthStatusAtom, "error")
				get.set(desktopAuthErrorAtom, {
					_tag: error._tag ?? "UnknownError",
					message: error.message ?? "Login failed",
				})
				return Effect.fail(error)
			}),
		)

		yield* Effect.log(`[desktop-auth] Login successful, navigating to: ${result.returnTo}`)
		window.location.href = result.returnTo
	}),
)

/**
 * Action atom that performs desktop logout
 */
export const desktopLogoutAtom = Atom.fn(
	Effect.fnUntraced(function* (options?: DesktopLogoutOptions, get?) {
		if (!isTauri()) {
			yield* Effect.log("[desktop-auth] Not in Tauri environment, skipping desktop logout")
			return
		}

		yield* TokenStorage.clearTokens.pipe(
			Effect.provide(TokenStorageLive),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Failed to clear tokens:", error)
				return Effect.void
			}),
		)

		get?.set(desktopTokensAtom, null)
		get?.set(desktopAuthStatusAtom, "idle")
		get?.set(desktopAuthErrorAtom, null)

		const redirectTo = options?.redirectTo || "/"
		yield* Effect.log(`[desktop-auth] Logout complete, redirecting to: ${redirectTo}`)
		window.location.href = redirectTo
	}),
)

/**
 * Action atom that forces an immediate token refresh via AuthToken
 */
export const desktopForceRefreshAtom = Atom.fn(
	Effect.fnUntraced(function* (_: void) {
		if (!isTauri()) return false
		return yield* forceRefreshEffect
	}),
)

/**
 * Schema for clipboard auth payload
 */
const ClipboardAuthPayload = Schema.Struct({
	code: Schema.String,
	state: Schema.Unknown,
})

/**
 * Action atom that authenticates using clipboard data
 */
export const desktopLoginFromClipboardAtom = Atom.fn(
	Effect.fnUntraced(function* (_: void, get) {
		if (!isTauri()) return

		get.set(desktopAuthStatusAtom, "loading")
		get.set(desktopAuthErrorAtom, null)

		const result = yield* Effect.gen(function* () {
			const clipboard = yield* Clipboard.Clipboard
			const clipboardText = yield* clipboard.readString

			const rawJson = yield* Effect.try({
				try: () => JSON.parse(clipboardText),
				catch: () => new Error("Invalid clipboard data - not valid JSON"),
			})

			const parsed = yield* Schema.decodeUnknown(ClipboardAuthPayload)(rawJson).pipe(
				Effect.mapError(() => new Error("Invalid clipboard data - missing code or state")),
			)

			const stateString = typeof parsed.state === "string" ? parsed.state : JSON.stringify(parsed.state)

			const tokenExchange = yield* TokenExchange
			const tokens = yield* tokenExchange.exchangeCode(parsed.code, stateString)

			yield* TokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)

			return tokens
		}).pipe(
			Effect.provide(Layer.mergeAll(ClipboardLive, TokenExchangeLive, TokenStorageLive)),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Clipboard login failed:", error)
				get.set(desktopAuthStatusAtom, "error")
				get.set(desktopAuthErrorAtom, {
					_tag: "ClipboardAuthError",
					message: error instanceof Error ? error.message : "Failed to authenticate from clipboard",
				})
				return Effect.fail(error)
			}),
		)

		get.set(desktopTokensAtom, {
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
			expiresAt: Date.now() + result.expiresIn * 1000,
		})
		get.set(desktopAuthStatusAtom, "authenticated")

		yield* Effect.log("[desktop-auth] Clipboard login successful")
		window.location.href = "/"
	}),
)

// ============================================================================
// Initialization Atom
// ============================================================================

export const desktopInitAtom = Atom.make((get) => {
	if (!isTauri()) return null

	const loadTokens = Effect.gen(function* () {
		const accessTokenOpt = yield* TokenStorage.getAccessToken
		const refreshTokenOpt = yield* TokenStorage.getRefreshToken
		const expiresAtOpt = yield* TokenStorage.getExpiresAt

		if (Option.isSome(accessTokenOpt) && Option.isSome(refreshTokenOpt) && Option.isSome(expiresAtOpt)) {
			get.set(desktopTokensAtom, {
				accessToken: accessTokenOpt.value,
				refreshToken: refreshTokenOpt.value,
				expiresAt: expiresAtOpt.value,
			})
			get.set(desktopAuthStatusAtom, "authenticated")
			yield* Effect.log("[desktop-auth] Loaded tokens from storage")
		} else {
			get.set(desktopAuthStatusAtom, "idle")
			yield* Effect.log("[desktop-auth] No stored tokens found")
		}
	}).pipe(
		Effect.provide(TokenStorageLive),
		Effect.catchAll((error) => {
			console.error("[desktop-auth] Failed to load tokens:", error)
			get.set(desktopAuthStatusAtom, "error")
			get.set(desktopAuthErrorAtom, {
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

export const desktopTokenSchedulerAtom = Atom.make((get) => {
	const tokens = get(desktopTokensAtom)

	if (!tokens || !isTauri()) return null

	const timeUntilRefresh = tokens.expiresAt - Date.now() - REFRESH_BUFFER_MS

	if (timeUntilRefresh <= 0) {
		runtime.runFork(
			Effect.gen(function* () {
				yield* Effect.log("[desktop-auth] Token expired or expiring soon, refreshing now")
				yield* forceRefreshEffect
			}),
		)
		return { scheduledFor: Date.now(), immediate: true }
	}

	const minutes = Math.round(timeUntilRefresh / 1000 / 60)
	const scheduledFor = tokens.expiresAt - REFRESH_BUFFER_MS

	const refreshSchedule = Effect.gen(function* () {
		yield* Effect.log(`[desktop-auth] Scheduling refresh in ${minutes} minutes`)
		yield* Effect.sleep(Duration.millis(timeUntilRefresh))
		yield* Effect.log("[desktop-auth] Scheduled refresh triggered")
		yield* forceRefreshEffect
	})

	const fiber = runtime.runFork(refreshSchedule)

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return { scheduledFor, immediate: false }
}).pipe(Atom.keepAlive)

// ============================================================================
// Utility Functions (re-exported from auth-token for desktop-login.tsx)
// ============================================================================

export const getDesktopAccessToken = (): Promise<string | null> => {
	if (!isTauri()) return Promise.resolve(null)
	return getAccessTokenPromise()
}

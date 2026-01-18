/**
 * @module Desktop authentication atoms
 * @platform desktop
 * @description Effect Atom-based state management for desktop OAuth authentication
 *
 * This module replaces the Promise-based wrappers with a clean Effect Atom architecture:
 * - Uses atoms for all auth state (tokens, refresh timer, OAuth flow)
 * - Uses atom finalizers for cleanup (no module-level timers)
 * - Proper Result types for React integration
 */

import { Atom } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { Deferred, Duration, Effect, Exit, Layer, Option, Ref } from "effect"
import { runtime } from "~/lib/services/common/runtime"
import { TauriAuth } from "~/lib/services/desktop/tauri-auth"
import { TokenExchange } from "~/lib/services/desktop/token-exchange"
import { TokenStorage } from "~/lib/services/desktop/token-storage"
import { isTauri } from "~/lib/tauri"

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

// Refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000

// ============================================================================
// Layers
// ============================================================================

const TokenStorageLive = TokenStorage.Default
const TokenExchangeLive = TokenExchange.Default.pipe(Layer.provide(TokenStorageLive))
const TauriAuthLive = TauriAuth.Default.pipe(
	Layer.provide(TokenStorageLive),
	Layer.provide(TokenExchangeLive),
)

// ============================================================================
// Core State Atoms
// ============================================================================

/**
 * Writable atom holding the current desktop tokens
 * Null when not authenticated
 */
export const desktopTokensAtom = Atom.make<DesktopTokens | null>(null).pipe(Atom.keepAlive)

/**
 * Writable atom holding the current auth status
 */
export const desktopAuthStatusAtom = Atom.make<DesktopAuthStatus>("idle").pipe(Atom.keepAlive)

/**
 * Writable atom holding the last auth error (if any)
 */
export const desktopAuthErrorAtom = Atom.make<DesktopAuthError | null>(null).pipe(Atom.keepAlive)

/**
 * Ref to track if refresh is in progress (prevents concurrent refreshes)
 */
const isRefreshingRef = Ref.unsafeMake(false)

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Derived atom that returns whether the user is authenticated on desktop
 */
export const isDesktopAuthenticatedAtom = Atom.make((get) => get(desktopTokensAtom) !== null)

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
 * Effect that performs the actual token refresh
 * Returns true if refresh succeeded, false if skipped (already refreshing)
 */
const doRefresh = (get: AtomGetter) =>
	Effect.gen(function* () {
		// Prevent concurrent refreshes
		const alreadyRefreshing = yield* Ref.get(isRefreshingRef)
		if (alreadyRefreshing) {
			yield* Effect.log("[desktop-auth] Already refreshing, skipping")
			return false
		}

		yield* Ref.set(isRefreshingRef, true)

		const result = yield* Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			const tokenExchange = yield* TokenExchange

			// Get refresh token
			const refreshTokenOpt = yield* tokenStorage.getRefreshToken
			if (Option.isNone(refreshTokenOpt)) {
				yield* Effect.log("[desktop-auth] No refresh token found, user needs to re-login")
				// Clear state and dispatch session expired event
				get.set(desktopTokensAtom, null)
				get.set(desktopAuthStatusAtom, "error")
				get.set(desktopAuthErrorAtom, {
					_tag: "TokenNotFoundError",
					message: "No refresh token found",
				})

				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("auth:session-expired"))
				}
				return false
			}

			yield* Effect.log("[desktop-auth] Refreshing tokens...")

			// Exchange refresh token for new tokens
			const tokens = yield* tokenExchange.refreshToken(refreshTokenOpt.value)

			// Store new tokens
			yield* tokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)

			// Update atom state
			const expiresAt = Date.now() + tokens.expiresIn * 1000
			get.set(desktopTokensAtom, {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				expiresAt,
			})
			get.set(desktopAuthErrorAtom, null)

			yield* Effect.log("[desktop-auth] Tokens refreshed successfully")
			return true
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.provide(TokenExchangeLive),
			Effect.ensuring(Ref.set(isRefreshingRef, false)),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Token refresh failed:", error)
				get.set(desktopAuthErrorAtom, {
					_tag: error._tag ?? "UnknownError",
					message: error.message ?? "Token refresh failed",
				})
				// Dispatch session expired on refresh failure
				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("auth:session-expired"))
				}
				return Effect.succeed(false)
			}),
		)

		return result
	})

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Action atom that initiates the desktop OAuth flow
 * Opens system browser, waits for callback, stores tokens
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
			return yield* auth.initiateAuth(options)
		}).pipe(
			Effect.provide(TauriAuthLive),
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

		// Load the newly stored tokens into atom state
		yield* Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			const accessTokenOpt = yield* tokenStorage.getAccessToken
			const refreshTokenOpt = yield* tokenStorage.getRefreshToken
			const expiresAtOpt = yield* tokenStorage.getExpiresAt

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
		}).pipe(Effect.provide(TokenStorageLive))

		// Navigate to return path
		yield* Effect.log(`[desktop-auth] Login successful, navigating to: ${result.returnTo}`)
		window.location.href = result.returnTo
	}),
)

/**
 * Action atom that performs desktop logout
 * Clears tokens from storage and resets atom state
 */
export const desktopLogoutAtom = Atom.fn(
	Effect.fnUntraced(function* (options?: DesktopLogoutOptions, get?) {
		if (!isTauri()) {
			yield* Effect.log("[desktop-auth] Not in Tauri environment, skipping desktop logout")
			return
		}

		yield* Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			yield* tokenStorage.clearTokens
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Failed to clear tokens:", error)
				return Effect.void
			}),
		)

		// Reset atom state
		get?.set(desktopTokensAtom, null)
		get?.set(desktopAuthStatusAtom, "idle")
		get?.set(desktopAuthErrorAtom, null)

		// Navigate to redirect path
		const redirectTo = options?.redirectTo || "/"
		yield* Effect.log(`[desktop-auth] Logout complete, redirecting to: ${redirectTo}`)
		window.location.href = redirectTo
	}),
)

/**
 * Action atom that forces an immediate token refresh
 * Useful when you need fresh tokens for a specific operation
 */
export const desktopForceRefreshAtom = Atom.fn(
	Effect.fnUntraced(function* (_: void, get) {
		if (!isTauri()) return false
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
export const desktopInitAtom = Atom.make((get) => {
	// Skip if not in Tauri environment
	if (!isTauri()) return null

	// Load tokens from storage asynchronously
	const loadTokens = Effect.gen(function* () {
		const tokenStorage = yield* TokenStorage
		const accessTokenOpt = yield* tokenStorage.getAccessToken
		const refreshTokenOpt = yield* tokenStorage.getRefreshToken
		const expiresAtOpt = yield* tokenStorage.getExpiresAt

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
export const desktopTokenSchedulerAtom = Atom.make((get) => {
	const tokens = get(desktopTokensAtom)

	// Skip if not authenticated or not in Tauri
	if (!tokens || !isTauri()) return null

	const timeUntilRefresh = tokens.expiresAt - Date.now() - REFRESH_BUFFER_MS

	if (timeUntilRefresh <= 0) {
		// Token expired or about to expire, refresh immediately
		runtime.runFork(
			Effect.gen(function* () {
				yield* Effect.log("[desktop-auth] Token expired or expiring soon, refreshing now")
				yield* doRefresh(get)
			}),
		)
		return { scheduledFor: Date.now(), immediate: true }
	}

	// Schedule refresh using Effect.sleep
	const minutes = Math.round(timeUntilRefresh / 1000 / 60)
	const scheduledFor = tokens.expiresAt - REFRESH_BUFFER_MS

	const refreshSchedule = Effect.gen(function* () {
		yield* Effect.log(`[desktop-auth] Scheduling refresh in ${minutes} minutes`)
		yield* Effect.sleep(Duration.millis(timeUntilRefresh))
		yield* Effect.log("[desktop-auth] Scheduled refresh triggered")
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
export const getDesktopAccessToken = (): Promise<string | null> => {
	if (!isTauri()) return Promise.resolve(null)

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

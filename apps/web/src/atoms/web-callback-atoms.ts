/**
 * @module Web OAuth callback atoms
 * @platform web
 * @description Effect Atom-based state management for web OAuth callback handling (JWT flow)
 */

import { Atom } from "@effect-atom/atom-react"
import {
	MissingAuthCodeError,
	OAuthCallbackError,
	OAuthCodeExpiredError,
	TokenExchangeError,
} from "@hazel/domain/errors"
import { Effect, Layer } from "effect"
import { appRegistry } from "~/lib/registry"
import { runtime } from "~/lib/services/common/runtime"
import { TokenExchange } from "~/lib/services/desktop/token-exchange"
import { WebTokenStorage } from "~/lib/services/web/token-storage"
import { webAuthStatusAtom, webTokensAtom } from "./web-auth"

// ============================================================================
// Types
// ============================================================================

/**
 * Parsed auth state
 */
interface AuthState {
	returnTo: string
}

/**
 * Search params from the OAuth callback URL
 * Note: state can be string (raw JSON) or already-parsed object (TanStack Router auto-parses JSON)
 */
export interface WebCallbackParams {
	code?: string
	state?: string | AuthState
	error?: string
	error_description?: string
}

/**
 * Discriminated union for callback status
 */
export type WebCallbackStatus =
	| { _tag: "idle" }
	| { _tag: "exchanging" }
	| { _tag: "success"; returnTo: string }
	| { _tag: "error"; message: string; isRetryable: boolean }

// ============================================================================
// State Atoms
// ============================================================================

/**
 * Holds the current callback status
 */
export const webCallbackStatusAtom = Atom.make<WebCallbackStatus>({ _tag: "idle" }).pipe(Atom.keepAlive)

// ============================================================================
// Layers
// ============================================================================

const WebTokenStorageLive = WebTokenStorage.Default
const TokenExchangeLive = TokenExchange.Default

// ============================================================================
// Error Handling
// ============================================================================

type CallbackError = OAuthCallbackError | MissingAuthCodeError | TokenExchangeError | OAuthCodeExpiredError

/**
 * Get user-friendly error info from typed error
 */
function getErrorInfo(error: CallbackError): {
	message: string
	isRetryable: boolean
} {
	switch (error._tag) {
		case "OAuthCallbackError":
			return {
				message: error.errorDescription || error.error,
				isRetryable: true,
			}
		case "MissingAuthCodeError":
			return {
				message: "No authorization code received. Please try again.",
				isRetryable: true,
			}
		case "OAuthCodeExpiredError":
			// Code expired or already used - user must restart the login flow
			return {
				message: "Login session expired. Please try logging in again.",
				isRetryable: false,
			}
		case "TokenExchangeError":
			return {
				message: error.message || "Failed to exchange authorization code.",
				isRetryable: true,
			}
	}
}

// ============================================================================
// Core Callback Logic
// ============================================================================

/**
 * Module-level Set to track codes that have been processed
 * Prevents double-execution from React StrictMode or hot reload
 */
const processedCodes = new Set<string>()

/**
 * Effect that handles the web callback - exchanges code for tokens and stores them
 */
const handleCallback = (params: WebCallbackParams) =>
	Effect.gen(function* () {
		// Guard against double-execution (React StrictMode, hot reload)
		// OAuth codes are one-time use, so we track processed codes
		if (params.code && processedCodes.has(params.code)) {
			yield* Effect.log("[web-callback] Code already processed, skipping")
			return
		}

		// Mark code as being processed
		if (params.code) {
			processedCodes.add(params.code)
		}

		appRegistry.set(webCallbackStatusAtom, { _tag: "exchanging" })

		// Check for OAuth errors from WorkOS
		if (params.error) {
			const error = new OAuthCallbackError({
				message: params.error_description || params.error,
				error: params.error,
				errorDescription: params.error_description,
			})
			const errorInfo = getErrorInfo(error)
			console.error("[web-callback] OAuth error:", error)
			appRegistry.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}

		// Validate required code
		if (!params.code) {
			const error = new MissingAuthCodeError({ message: "Missing authorization code" })
			const errorInfo = getErrorInfo(error)
			console.error("[web-callback] Missing code:", error)
			appRegistry.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}
		const code = params.code

		// Validate state
		if (!params.state) {
			const error = new MissingAuthCodeError({ message: "Missing state parameter" })
			const errorInfo = getErrorInfo(error)
			console.error("[web-callback] Missing state:", error)
			appRegistry.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}

		// Parse the state to extract returnTo
		// State can be either a string (raw JSON) or already-parsed object (TanStack Router auto-parses JSON)
		let authState: AuthState
		let stateString: string
		if (typeof params.state === "string") {
			stateString = params.state
			try {
				authState = JSON.parse(params.state)
			} catch {
				const error = new MissingAuthCodeError({ message: "Invalid state parameter" })
				const errorInfo = getErrorInfo(error)
				console.error("[web-callback] Invalid state JSON:", params.state)
				appRegistry.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
				return
			}
		} else {
			// State is already parsed by TanStack Router
			authState = params.state
			stateString = JSON.stringify(params.state)
		}

		const returnTo = authState.returnTo || "/"

		// Exchange code for tokens
		const result = yield* Effect.gen(function* () {
			const tokenExchange = yield* TokenExchange
			const tokenStorage = yield* WebTokenStorage

			yield* Effect.log("[web-callback] Exchanging code for tokens...")

			const tokens = yield* tokenExchange.exchangeCode(code, stateString)

			yield* Effect.log("[web-callback] Storing tokens...")

			// Store tokens in localStorage
			yield* tokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)

			// Update atom state via global registry (not `get.set()` which can be
			// stale if React StrictMode unmounted the atom that forked this fiber)
			const expiresAt = Date.now() + tokens.expiresIn * 1000
			appRegistry.set(webTokensAtom, {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				expiresAt,
			})
			appRegistry.set(webAuthStatusAtom, "authenticated")

			yield* Effect.log("[web-callback] Token exchange successful")

			return { success: true as const, returnTo }
		}).pipe(
			Effect.provide(Layer.mergeAll(TokenExchangeLive, WebTokenStorageLive)),
			// Preserve typed errors (OAuthCodeExpiredError, TokenExchangeError, etc.)
			Effect.catchTag("OAuthCodeExpiredError", (error) => {
				console.error("[web-callback] OAuth code expired:", error)
				return Effect.succeed({
					success: false as const,
					error,
				})
			}),
			Effect.catchTag("TokenExchangeError", (error) => {
				console.error("[web-callback] Token exchange failed:", error)
				return Effect.succeed({
					success: false as const,
					error,
				})
			}),
			Effect.catchAll((error) => {
				console.error("[web-callback] Token exchange failed:", error)
				return Effect.succeed({
					success: false as const,
					error: new TokenExchangeError({
						message: error.message || "Failed to exchange authorization code",
						detail: String(error),
					}),
				})
			}),
		)

		if (result.success) {
			appRegistry.set(webCallbackStatusAtom, { _tag: "success", returnTo: result.returnTo })
		} else {
			const errorInfo = getErrorInfo(result.error)
			// Allow retry for retryable errors by clearing the processed code
			if (errorInfo.isRetryable && code) {
				processedCodes.delete(code)
			}
			appRegistry.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
		}
	})

// ============================================================================
// Init Atom Factory
// ============================================================================

/**
 * Factory that creates an init atom for handling the callback
 * The atom runs the callback effect when mounted via useAtomValue
 */
export const createWebCallbackInitAtom = (params: WebCallbackParams) =>
	Atom.make(() => {
		// Reset for fresh login flow (handles re-login after session expiry
		// where client-side navigation preserves stale atom state)
		appRegistry.set(webCallbackStatusAtom, { _tag: "idle" })

		// No finalizer — let the OAuth exchange complete even if Strict Mode
		// unmounts/remounts. processedCodes prevents re-execution on remount.
		// All atom updates use appRegistry.set() so they survive unmount.
		runtime.runFork(handleCallback(params))

		return null
	})

// ============================================================================
// State Reset
// ============================================================================

/**
 * Reset callback state for a fresh login flow.
 * Called during logout to clear stale state that survives client-side navigation.
 */
export const resetCallbackState = () => {
	processedCodes.clear()
	appRegistry.set(webCallbackStatusAtom, { _tag: "idle" })
}

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Action atom for retry functionality
 * Takes params directly instead of reading from a params atom
 */
export const retryWebCallbackAtom = Atom.fn(
	Effect.fnUntraced(function* (params: WebCallbackParams) {
		yield* handleCallback(params)
	}),
)

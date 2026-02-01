/**
 * @module Web OAuth callback atoms
 * @platform web
 * @description Effect Atom-based state management for web OAuth callback handling (JWT flow)
 */

import { Atom } from "@effect-atom/atom-react"
import { FetchHttpClient } from "@effect/platform"
import {
	MissingAuthCodeError,
	OAuthCallbackError,
	OAuthCodeExpiredError,
	TokenExchangeError,
} from "@hazel/domain/errors"
import { Effect, Layer } from "effect"
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
const TokenExchangeLive = TokenExchange.Default.pipe(Layer.provide(FetchHttpClient.layer))

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
// Getter Interface
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
const handleCallback = (params: WebCallbackParams, get: AtomGetter) =>
	Effect.gen(function* () {
		// Guard against double-execution (React StrictMode, hot reload)
		// OAuth codes are one-time use, so we track processed codes
		if (params.code && processedCodes.has(params.code)) {
			yield* Effect.log("[web-callback] Code already processed, skipping")
			return
		}

		// Also check if we're already in a terminal state
		const currentStatus = get(webCallbackStatusAtom)
		if (currentStatus._tag === "exchanging" || currentStatus._tag === "success") {
			yield* Effect.log(`[web-callback] Already in ${currentStatus._tag} state, skipping`)
			return
		}

		// Mark code as being processed
		if (params.code) {
			processedCodes.add(params.code)
		}

		get.set(webCallbackStatusAtom, { _tag: "exchanging" })

		// Check for OAuth errors from WorkOS
		if (params.error) {
			const error = new OAuthCallbackError({
				message: params.error_description || params.error,
				error: params.error,
				errorDescription: params.error_description,
			})
			const errorInfo = getErrorInfo(error)
			console.error("[web-callback] OAuth error:", error)
			get.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}

		// Validate required code
		if (!params.code) {
			const error = new MissingAuthCodeError({ message: "Missing authorization code" })
			const errorInfo = getErrorInfo(error)
			console.error("[web-callback] Missing code:", error)
			get.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}
		const code = params.code

		// Validate state
		if (!params.state) {
			const error = new MissingAuthCodeError({ message: "Missing state parameter" })
			const errorInfo = getErrorInfo(error)
			console.error("[web-callback] Missing state:", error)
			get.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
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
				get.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
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

			// Update atom state
			const expiresAt = Date.now() + tokens.expiresIn * 1000
			get.set(webTokensAtom, {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				expiresAt,
			})
			get.set(webAuthStatusAtom, "authenticated")

			yield* Effect.log("[web-callback] Token exchange successful")

			return { success: true as const, returnTo }
		}).pipe(
			Effect.provide(TokenExchangeLive),
			Effect.provide(WebTokenStorageLive),
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
			get.set(webCallbackStatusAtom, { _tag: "success", returnTo: result.returnTo })
		} else {
			const errorInfo = getErrorInfo(result.error)
			// Allow retry for retryable errors by clearing the processed code
			if (errorInfo.isRetryable && code) {
				processedCodes.delete(code)
			}
			get.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
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
	Atom.make((get) => {
		const callbackEffect = handleCallback(params, get)

		const fiber = runtime.runFork(callbackEffect)

		get.addFinalizer(() => {
			// Check if we completed successfully before cleanup
			const status = get(webCallbackStatusAtom)
			if (status._tag !== "success") {
				// Interrupted before success - clean up so next mount can try
				if (params.code) {
					processedCodes.delete(params.code)
				}
				// Reset to idle if we were mid-exchange
				if (status._tag === "exchanging") {
					get.set(webCallbackStatusAtom, { _tag: "idle" })
				}
			}
			fiber.unsafeInterruptAsFork(fiber.id())
		})

		return null
	})

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Action atom for retry functionality
 * Takes params directly instead of reading from a params atom
 */
export const retryWebCallbackAtom = Atom.fn(
	Effect.fnUntraced(function* (params: WebCallbackParams, get) {
		yield* handleCallback(params, get)
	}),
)

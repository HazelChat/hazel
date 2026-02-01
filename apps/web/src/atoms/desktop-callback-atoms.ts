/**
 * @module Desktop OAuth callback atoms
 * @platform web (opened in browser during desktop OAuth)
 * @description Effect Atom-based state management for desktop OAuth callback handling
 */

import { Atom } from "@effect-atom/atom-react"
import {
	DesktopConnectionError,
	InvalidDesktopStateError,
	MissingAuthCodeError,
	OAuthCallbackError,
} from "@hazel/domain/errors"
import { DesktopAuthState } from "@hazel/domain/http"
import { Effect, Schedule } from "effect"
import { runtime } from "~/lib/services/common/runtime"

// ============================================================================
// Types
// ============================================================================

/**
 * Search params from the OAuth callback URL
 */
export interface DesktopCallbackParams {
	code?: string
	state?: typeof DesktopAuthState.Type
	error?: string
	error_description?: string
}

/**
 * Discriminated union for callback status
 */
export type DesktopCallbackStatus =
	| { _tag: "idle" }
	| { _tag: "connecting" }
	| { _tag: "success" }
	| { _tag: "error"; message: string; isRetryable: boolean; isConnectionError?: boolean }
	| { _tag: "copied"; message: string }

// ============================================================================
// State Atoms
// ============================================================================

/**
 * Holds the current callback status
 */
export const desktopCallbackStatusAtom = Atom.make<DesktopCallbackStatus>({ _tag: "idle" }).pipe(
	Atom.keepAlive,
)

// ============================================================================
// Error Handling
// ============================================================================

type CallbackError =
	| OAuthCallbackError
	| MissingAuthCodeError
	| InvalidDesktopStateError
	| DesktopConnectionError

/**
 * Get user-friendly error info from typed error
 */
function getErrorInfo(error: CallbackError): {
	message: string
	isRetryable: boolean
	isConnectionError?: boolean
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
		case "InvalidDesktopStateError":
			return {
				message: "Invalid authentication state. Please try again.",
				isRetryable: true,
			}
		case "DesktopConnectionError":
			return {
				message: "Could not connect to Hazel desktop app. Make sure Hazel is running.",
				isRetryable: true,
				isConnectionError: true,
			}
	}
}

// ============================================================================
// Desktop Connection
// ============================================================================

/**
 * Connect to desktop app's local OAuth server
 */
const connectToDesktop = (
	port: number,
	code: string,
	state: typeof DesktopAuthState.Type,
	nonce: string,
) =>
	Effect.tryPromise({
		try: async () => {
			console.log("[desktop-callback] Connecting to desktop app...", { port, nonce })
			const response = await fetch(`http://127.0.0.1:${port}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code,
					state: JSON.stringify(state),
					nonce,
				}),
			})
			console.log("[desktop-callback] Got response:", response.status, response.statusText)

			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: "Unknown error" }))
				console.log("[desktop-callback] Error response:", error)
				throw new Error(error.error || `HTTP ${response.status}`)
			}

			const json = await response.json()
			console.log("[desktop-callback] Success response:", json)
			return response
		},
		catch: (e) => {
			console.error("[desktop-callback] Fetch error:", e)
			return e
		},
	})

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
 * Effect that handles the desktop callback with validation and connection logic
 */
const handleCallback = (params: DesktopCallbackParams, get: AtomGetter) =>
	Effect.gen(function* () {
		get.set(desktopCallbackStatusAtom, { _tag: "connecting" })

		// Check for OAuth errors from WorkOS
		if (params.error) {
			const error = new OAuthCallbackError({
				message: params.error_description || params.error,
				error: params.error,
				errorDescription: params.error_description,
			})
			const errorInfo = getErrorInfo(error)
			console.error("[desktop-callback] OAuth error:", error)
			get.set(desktopCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}

		// Validate required code
		if (!params.code) {
			const error = new MissingAuthCodeError({ message: "Missing authorization code" })
			const errorInfo = getErrorInfo(error)
			console.error("[desktop-callback] Missing code:", error)
			get.set(desktopCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}
		const code = params.code

		// Validate state
		if (!params.state) {
			const error = new InvalidDesktopStateError({ message: "Missing state parameter" })
			const errorInfo = getErrorInfo(error)
			console.error("[desktop-callback] Missing state:", error)
			get.set(desktopCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}
		const state = params.state

		// Validate desktop connection params
		if (state.desktopPort === undefined) {
			const error = new InvalidDesktopStateError({ message: "Missing desktop port in state" })
			const errorInfo = getErrorInfo(error)
			console.error("[desktop-callback] Missing port:", error)
			get.set(desktopCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}
		const port = state.desktopPort

		if (!state.desktopNonce) {
			const error = new InvalidDesktopStateError({ message: "Missing desktop nonce in state" })
			const errorInfo = getErrorInfo(error)
			console.error("[desktop-callback] Missing nonce:", error)
			get.set(desktopCallbackStatusAtom, { _tag: "error", ...errorInfo })
			return
		}
		const nonce = state.desktopNonce

		// Connect to desktop with exponential backoff retry
		const result = yield* connectToDesktop(port, code, state, nonce).pipe(
			Effect.retry({
				times: 3,
				schedule: Schedule.exponential("500 millis"),
			}),
			Effect.map(() => ({ success: true as const })),
			Effect.catchAll((e) => {
				const error = new DesktopConnectionError({
					message: "Could not connect to Hazel",
					port,
					attempts: 3,
				})
				console.error("[desktop-callback] Connection failed:", e)
				return Effect.succeed({ success: false as const, error })
			}),
		)

		if (result.success) {
			get.set(desktopCallbackStatusAtom, { _tag: "success" })
		} else {
			const errorInfo = getErrorInfo(result.error)
			get.set(desktopCallbackStatusAtom, { _tag: "error", ...errorInfo })
		}
	})

// ============================================================================
// Init Atom Factory
// ============================================================================

/**
 * Factory that creates an init atom for handling the callback
 * The atom runs the callback effect when mounted via useAtomValue
 */
export const createCallbackInitAtom = (params: DesktopCallbackParams) =>
	Atom.make((get) => {
		const callbackEffect = handleCallback(params, get)

		const fiber = runtime.runFork(callbackEffect)

		get.addFinalizer(() => {
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
export const retryCallbackAtom = Atom.fn(
	Effect.fnUntraced(function* (params: DesktopCallbackParams, get) {
		yield* handleCallback(params, get)
	}),
)

/**
 * Action atom that copies auth credentials to clipboard
 * Takes params directly instead of reading from a params atom
 */
export const copyCallbackToClipboardAtom = Atom.fn(
	Effect.fnUntraced(function* (params: DesktopCallbackParams, get) {
		if (!params.code || !params.state) {
			return
		}

		const payload = JSON.stringify({
			code: params.code,
			state: params.state,
		})

		yield* Effect.tryPromise({
			try: () => navigator.clipboard.writeText(payload),
			catch: (e) => new Error(`Failed to copy to clipboard: ${e}`),
		})

		get.set(desktopCallbackStatusAtom, {
			_tag: "copied",
			message:
				'Copied! Open the Hazel desktop app and click "Paste from clipboard" to complete sign in.',
		})
	}),
)

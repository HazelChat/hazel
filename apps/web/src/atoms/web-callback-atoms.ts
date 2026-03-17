/**
 * @module Web OAuth callback atoms
 * @platform web
 * @description Effect Atom-based state management for web OAuth callback handling (JWT flow)
 */

import { Atom } from "effect/unstable/reactivity"
import {
	MissingAuthCodeError,
	OAuthCallbackError,
	OAuthCodeExpiredError,
	OAuthRedemptionPendingError,
	OAuthStateMismatchError,
	TokenDecodeError,
	TokenExchangeError,
} from "@hazel/domain/errors"
import { Effect, Layer, type ServiceMap } from "effect"
import { appRegistry } from "~/lib/registry"
import { getWebAuthErrorInfo, type WebAuthError } from "~/lib/auth-errors"
import {
	getWebCallbackAttemptKey as buildWebCallbackAttemptKey,
	resetAllWebCallbackAttempts,
	resetWebCallbackAttempt,
	runWebCallbackAttemptOnce,
	type WebCallbackKeyParams,
} from "~/lib/web-callback-single-flight"
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

const WebTokenStorageLive = WebTokenStorage.layer
const TokenExchangeLive = TokenExchange.layer

type TokenExchangeService = ServiceMap.Service.Shape<typeof TokenExchange>
type WebTokenStorageService = ServiceMap.Service.Shape<typeof WebTokenStorage>

// ============================================================================
// Attempt Context
// ============================================================================

const callbackAttemptIds = new Map<string, string>()

const getOrCreateCallbackAttemptId = (attemptKey: string): string => {
	const existing = callbackAttemptIds.get(attemptKey)
	if (existing) {
		return existing
	}

	const attemptId = `web_callback_${crypto.randomUUID()}`
	callbackAttemptIds.set(attemptKey, attemptId)
	return attemptId
}

const logWebCallback = (level: "Info" | "Error", message: string, fields: Record<string, unknown>): void => {
	const effect = level === "Error" ? Effect.logError(message, fields) : Effect.logInfo(message, fields)
	void Effect.runFork(effect)
}

type WebCallbackResult = { success: true; returnTo: string } | { success: false; error: WebAuthError }

/**
 * Effect that handles the web callback - exchanges code for tokens and stores them
 */
const exchangeAndStoreTokens = (code: string, stateString: string, returnTo: string, attemptId: string) =>
	Effect.gen(function* () {
		const tokenExchange: TokenExchangeService = yield* TokenExchange
		const tokenStorage: WebTokenStorageService = yield* WebTokenStorage

		yield* Effect.logInfo("[web-callback] Exchanging code for tokens", {
			attemptId,
			returnTo,
		})

		const tokens = yield* tokenExchange.exchangeCode(code, stateString, attemptId)

		yield* Effect.logInfo("[web-callback] Storing tokens", {
			attemptId,
		})
		yield* tokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)

		const expiresAt = Date.now() + tokens.expiresIn * 1000
		appRegistry.set(webTokensAtom, {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			expiresAt,
		})
		appRegistry.set(webAuthStatusAtom, "authenticated")

		yield* Effect.logInfo("[web-callback] Token exchange successful", {
			attemptId,
			returnTo,
		})

		return { success: true as const, returnTo }
	})

const parseWebCallbackState = (state: string | AuthState): { authState: AuthState; stateString: string } => {
	if (typeof state === "string") {
		return {
			authState: JSON.parse(state) as AuthState,
			stateString: state,
		}
	}

	return {
		authState: state,
		stateString: JSON.stringify(state),
	}
}

const executeWebCallback = async (
	params: WebCallbackParams,
	attemptKey: string,
	attemptId: string,
): Promise<WebCallbackResult> => {
	if (params.error) {
		const error = new OAuthCallbackError({
			message: params.error_description || params.error,
			error: params.error,
			errorDescription: params.error_description,
		})
		logWebCallback("Error", "[web-callback] OAuth provider returned an error", {
			attemptId,
			attemptKey,
			errorTag: error._tag,
			error: error.error,
			errorDescription: error.errorDescription,
		})
		return { success: false, error }
	}

	if (!params.code) {
		const error = new MissingAuthCodeError({ message: "Missing authorization code" })
		logWebCallback("Error", "[web-callback] Missing authorization code", {
			attemptId,
			attemptKey,
			errorTag: error._tag,
		})
		return { success: false, error }
	}

	if (!params.state) {
		const error = new MissingAuthCodeError({ message: "Missing state parameter" })
		logWebCallback("Error", "[web-callback] Missing state parameter", {
			attemptId,
			attemptKey,
			errorTag: error._tag,
		})
		return { success: false, error }
	}

	let authState: AuthState
	let stateString: string
	try {
		;({ authState, stateString } = parseWebCallbackState(params.state))
	} catch {
		const error = new MissingAuthCodeError({ message: "Invalid state parameter" })
		logWebCallback("Error", "[web-callback] Invalid state parameter", {
			attemptId,
			attemptKey,
			errorTag: error._tag,
		})
		return { success: false, error }
	}

	const returnTo = authState.returnTo || "/"
	return webCallbackExecutor({
		attemptId,
		code: params.code,
		stateString,
		returnTo,
	})
}

type WebCallbackExecutorArgs = {
	attemptId: string
	code: string
	stateString: string
	returnTo: string
}

type WebCallbackExecutor = (args: WebCallbackExecutorArgs) => Promise<WebCallbackResult>

const defaultWebCallbackExecutor: WebCallbackExecutor = async ({ attemptId, code, stateString, returnTo }) =>
	await exchangeAndStoreTokens(code, stateString, returnTo, attemptId)
		.pipe(
			Effect.provide(Layer.mergeAll(TokenExchangeLive, WebTokenStorageLive)),
			Effect.catchTags({
				OAuthCodeExpiredError: (error) =>
					Effect.succeed({
						success: false as const,
						error,
					}),
				OAuthStateMismatchError: (error) =>
					Effect.succeed({
						success: false as const,
						error,
					}),
				OAuthRedemptionPendingError: (error) =>
					Effect.succeed({
						success: false as const,
						error,
					}),
				TokenExchangeError: (error) =>
					Effect.succeed({
						success: false as const,
						error,
					}),
				TokenDecodeError: (error) =>
					Effect.succeed({
						success: false as const,
						error,
					}),
			}),
			Effect.catch((error: unknown) => {
				const msg =
					error && typeof error === "object" && "message" in error
						? (error as { message?: string }).message
						: undefined
				return Effect.succeed({
					success: false as const,
					error: new TokenExchangeError({
						message: msg || "Failed to exchange authorization code",
						detail: String(error),
					}),
				})
			}),
		)
		.pipe(Effect.runPromise)

let webCallbackExecutor: WebCallbackExecutor = defaultWebCallbackExecutor

export const setWebCallbackExecutorForTest = (executor: WebCallbackExecutor | null): void => {
	webCallbackExecutor = executor ?? defaultWebCallbackExecutor
}

export const getWebCallbackAttemptKey = (params: WebCallbackKeyParams): string =>
	buildWebCallbackAttemptKey(params)

export const startWebCallback = async (params: WebCallbackParams): Promise<void> => {
	const attemptKey = getWebCallbackAttemptKey(params)
	const attemptId = getOrCreateCallbackAttemptId(attemptKey)
	logWebCallback("Info", "[web-callback] Starting callback handling", {
		attemptId,
		attemptKey,
		hasCode: Boolean(params.code),
		hasState: Boolean(params.state),
		hasProviderError: Boolean(params.error),
	})

	await runWebCallbackAttemptOnce(
		attemptKey,
		async () => {
			appRegistry.set(webCallbackStatusAtom, { _tag: "exchanging" })
			const result = await executeWebCallback(params, attemptKey, attemptId)

			if (result.success) {
				appRegistry.set(webCallbackStatusAtom, { _tag: "success", returnTo: result.returnTo })
				logWebCallback("Info", "[web-callback] Callback completed", {
					attemptId,
					attemptKey,
					outcome: "success",
					returnTo: result.returnTo,
				})
			} else {
				const errorInfo = getWebAuthErrorInfo(result.error)
				appRegistry.set(webCallbackStatusAtom, { _tag: "error", ...errorInfo })
				logWebCallback("Error", "[web-callback] Callback failed", {
					attemptId,
					attemptKey,
					outcome: "error",
					errorTag: result.error._tag,
					message: errorInfo.message,
					isRetryable: errorInfo.isRetryable,
				})
			}

			return result
		},
		(result) => result.success || !getWebAuthErrorInfo(result.error).isRetryable,
	)
}

export const retryWebCallback = async (params: WebCallbackParams): Promise<void> => {
	const attemptKey = getWebCallbackAttemptKey(params)
	resetWebCallbackAttempt(attemptKey)
	await startWebCallback(params)
}

// ============================================================================
// State Reset
// ============================================================================

/**
 * Reset callback state for a fresh login flow.
 * Called during logout to clear stale state that survives client-side navigation.
 */
export const resetCallbackState = () => {
	resetAllWebCallbackAttempts()
	callbackAttemptIds.clear()
	appRegistry.set(webCallbackStatusAtom, { _tag: "idle" })
}

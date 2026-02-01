/**
 * @module Tauri desktop OAuth authentication service
 * @platform desktop
 * @description OAuth authentication for desktop apps using Effect with full error safety
 *
 * Flow: Desktop app starts local server on dynamic port, OAuth redirects to web app,
 * web app POSTs auth data back to localhost server with nonce validation.
 */

import type { OrganizationId } from "@hazel/schema"
import {
	MissingAuthCodeError,
	OAuthTimeoutError,
	TauriCommandError,
	TauriNotAvailableError,
} from "@hazel/domain/errors"
import { Deferred, Duration, Effect, FiberId } from "effect"
import { TokenExchange } from "./token-exchange"
import { TokenStorage } from "./token-storage"

type OpenerApi = typeof import("@tauri-apps/plugin-opener")
type CoreApi = typeof import("@tauri-apps/api/core")
type EventApi = typeof import("@tauri-apps/api/event")

interface DesktopAuthOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface DesktopAuthResult {
	returnTo: string
}

/**
 * Get Tauri opener API, failing if not available
 */
const getTauriOpener = Effect.gen(function* () {
	const opener: OpenerApi | undefined = (window as any).__TAURI__?.opener
	if (!opener) {
		return yield* new TauriNotAvailableError({
			message: "Tauri opener not available",
			component: "opener",
		})
	}
	return opener
})

/**
 * Get Tauri core API, failing if not available
 */
const getTauriCore = Effect.gen(function* () {
	const core: CoreApi | undefined = (window as any).__TAURI__?.core
	if (!core) {
		return yield* Effect.fail(
			new TauriNotAvailableError({
				message: "Tauri core not available",
				component: "core",
			}),
		)
	}
	return core
})

/**
 * Get Tauri event API, failing if not available
 */
const getTauriEvent = Effect.gen(function* () {
	const event: EventApi | undefined = (window as any).__TAURI__?.event
	if (!event) {
		return yield* Effect.fail(
			new TauriNotAvailableError({
				message: "Tauri event not available",
				component: "event",
			}),
		)
	}
	return event
})

export class TauriAuth extends Effect.Service<TauriAuth>()("TauriAuth", {
	accessors: true,
	dependencies: [TokenStorage.Default, TokenExchange.Default],
	effect: Effect.gen(function* () {
		const tokenStorage = yield* TokenStorage
		const tokenExchange = yield* TokenExchange

		return {
			/**
			 * Initiate desktop OAuth flow
			 *
			 * Starts local server on dynamic port, OAuth redirects to web app which POSTs back.
			 * Returns the returnTo path after successful authentication.
			 */
			initiateAuth: (options: DesktopAuthOptions = {}) =>
				Effect.gen(function* () {
					const opener = yield* getTauriOpener
					const core = yield* getTauriCore
					const event = yield* getTauriEvent

					const backendUrl = import.meta.env.VITE_BACKEND_URL
					const returnTo = options.returnTo || "/"

					yield* Effect.log("[tauri-auth] Initiating desktop auth flow")

					// Start local OAuth server with dynamic port and nonce
					const [port, nonce] = yield* Effect.tryPromise({
						try: () => core.invoke<[number, string]>("start_oauth_server"),
						catch: (e) =>
							new TauriCommandError({
								message: "Failed to start OAuth server",
								command: "start_oauth_server",
								detail: String(e),
							}),
					})

					yield* Effect.log(
						`[tauri-auth] OAuth server started on port: ${port} with nonce: ${nonce.substring(0, 8)}...`,
					)

					// Build login URL with desktop connection info
					const loginUrl = new URL("/auth/login/desktop", backendUrl)
					loginUrl.searchParams.set("returnTo", returnTo)
					loginUrl.searchParams.set("desktopPort", port.toString())
					loginUrl.searchParams.set("desktopNonce", nonce)
					if (options.organizationId) {
						loginUrl.searchParams.set("organizationId", options.organizationId)
					}
					if (options.invitationToken) {
						loginUrl.searchParams.set("invitationToken", options.invitationToken)
					}

					yield* Effect.log(`[tauri-auth] Opening URL: ${loginUrl.toString()}`)

					// Open system browser for OAuth
					yield* Effect.tryPromise({
						try: () => opener.openUrl(loginUrl.toString()),
						catch: (e) =>
							new TauriCommandError({
								message: "Failed to open browser",
								command: "openUrl",
								detail: String(e),
							}),
					})

					yield* Effect.log("[tauri-auth] Browser opened, waiting for web callback...")

					// Wait for OAuth callback with timeout and cleanup
					// Uses Deferred to ensure cleanup works even if listener setup is async
					const callbackUrl = yield* Effect.async<string, never>((resume) => {
						const unlistenDeferred = Deferred.unsafeMake<() => void, never>(FiberId.none)

						event
							.listen<string>("oauth-callback", (evt) => {
								resume(Effect.succeed(evt.payload))
							})
							.then((unlistenFn) => {
								Deferred.unsafeDone(unlistenDeferred, Effect.succeed(unlistenFn))
							})

						// Return cleanup function that waits for unlisten to be available
						return Deferred.await(unlistenDeferred).pipe(
							Effect.flatMap((fn) => Effect.sync(() => fn())),
							// If deferred isn't done yet, just skip cleanup
							Effect.timeout(Duration.millis(100)),
							Effect.ignore,
						)
					}).pipe(
						Effect.timeout(Duration.minutes(2)),
						Effect.catchTag("TimeoutException", () =>
							Effect.fail(
								new OAuthTimeoutError({
									message: "OAuth callback timeout after 2 minutes",
								}),
							),
						),
					)

					// Parse callback URL and extract code/state
					const url = new URL(callbackUrl)
					const code = url.searchParams.get("code")
					const state = url.searchParams.get("state") || "{}"

					if (!code) {
						return yield* Effect.fail(
							new MissingAuthCodeError({
								message: "No authorization code received",
							}),
						)
					}

					yield* Effect.log("[tauri-auth] Got authorization code, exchanging for token...")

					// Exchange code for tokens
					const tokens = yield* tokenExchange.exchangeCode(code, state)

					// Store tokens securely
					yield* tokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
					yield* Effect.log("[tauri-auth] Tokens stored securely")

					return { returnTo } satisfies DesktopAuthResult
				}).pipe(Effect.withSpan("TauriAuth.initiateAuth")),
		}
	}),
}) {}

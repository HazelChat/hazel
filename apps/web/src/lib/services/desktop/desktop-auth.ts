/**
 * @module Desktop OAuth authentication service
 * @platform desktop
 * @description OAuth authentication for desktop runtime apps using Effect.
 */

import type { OrganizationId } from "@hazel/schema"
import { MissingAuthCodeError, OAuthTimeoutError } from "@hazel/domain/errors"
import { Data, Deferred, Duration, Effect, FiberId } from "effect"
import { desktopBridge, onDesktopMessage } from "~/lib/desktop-bridge"
import { TokenExchange } from "./token-exchange"
import { TokenStorage } from "./token-storage"

interface DesktopAuthOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface DesktopAuthResult {
	returnTo: string
}

class DesktopBridgeError extends Data.TaggedError("DesktopBridgeError")<{
	message: string
	detail?: string
}> {}

const ensureBridge = Effect.tryPromise({
	try: () => desktopBridge.ensureReady(),
	catch: (error) =>
		new DesktopBridgeError({
			message: "Desktop bridge failed to initialize",
			detail: String(error),
		}),
}).pipe(
	Effect.flatMap((bridge) =>
		bridge
			? Effect.succeed(bridge)
			: Effect.fail(
					new DesktopBridgeError({
						message: "Desktop bridge is not available",
					}),
				),
	),
)

export class DesktopAuth extends Effect.Service<DesktopAuth>()("DesktopAuth", {
	accessors: true,
	dependencies: [TokenStorage.Default, TokenExchange.Default],
	effect: Effect.gen(function* () {
		const tokenStorage = yield* TokenStorage
		const tokenExchange = yield* TokenExchange

		return {
			initiateAuth: (options: DesktopAuthOptions = {}) =>
				Effect.gen(function* () {
					yield* ensureBridge

					const backendUrl = import.meta.env.VITE_BACKEND_URL
					const returnTo = options.returnTo || "/"

					yield* Effect.log("[desktop-auth-service] Initiating desktop auth flow")

					const { port, nonce } = yield* Effect.tryPromise({
						try: () => desktopBridge.startOAuthServer(),
						catch: (error) =>
							new DesktopBridgeError({
								message: "Failed to start OAuth server",
								detail: String(error),
							}),
					})

					yield* Effect.log(
						`[desktop-auth-service] OAuth server started on port: ${port} with nonce: ${nonce.substring(0, 8)}...`,
					)

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

					yield* Effect.log(`[desktop-auth-service] Opening URL: ${loginUrl.toString()}`)

					const opened = yield* Effect.tryPromise({
						try: () => desktopBridge.openExternal(loginUrl.toString()),
						catch: (error) =>
							new DesktopBridgeError({
								message: "Failed to open browser",
								detail: String(error),
							}),
					})

					if (!opened.ok) {
						return yield* Effect.fail(
							new DesktopBridgeError({
								message: "Desktop runtime could not open the browser",
							}),
						)
					}

					yield* Effect.log("[desktop-auth-service] Browser opened, waiting for web callback...")

					const callbackUrl = yield* Effect.async<string, never>((resume) => {
						const offDeferred = Deferred.unsafeMake<() => void, never>(FiberId.none)

						const off = onDesktopMessage("oauth.callback", ({ url }) => {
							resume(Effect.succeed(url))
						})

						Deferred.unsafeDone(offDeferred, Effect.succeed(off))

						return Deferred.await(offDeferred).pipe(
							Effect.flatMap((fn) => Effect.sync(() => fn())),
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

					yield* Effect.log("[desktop-auth-service] Got authorization code, exchanging for token...")

					const tokens = yield* tokenExchange.exchangeCode(code, state)
					yield* tokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
					yield* Effect.log("[desktop-auth-service] Tokens stored securely")

					return { returnTo } satisfies DesktopAuthResult
				}).pipe(Effect.withSpan("DesktopAuth.initiateAuth")),
		}
	}),
}) {}

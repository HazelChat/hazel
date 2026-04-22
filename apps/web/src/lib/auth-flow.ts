import { Clipboard } from "@effect/platform-browser"
import {
	getTauriCore as getBridgeTauriCore,
	getTauriEvent as getBridgeTauriEvent,
	getTauriOpener as getBridgeTauriOpener,
	type TauriCoreApi,
	type TauriEventApi,
	type TauriOpenerApi,
} from "@hazel/desktop/bridge"
import {
	DesktopConnectionError,
	MissingAuthCodeError,
	OAuthCallbackError,
	OAuthCodeExpiredError,
	OAuthRedemptionPendingError,
	OAuthStateMismatchError,
	OAuthTimeoutError,
	TauriCommandError,
	TauriNotAvailableError,
	TokenDecodeError,
	TokenExchangeError,
	TokenStoreError,
} from "@hazel/domain/errors"
import { DesktopAuthState } from "@hazel/domain/http"
import type { OrganizationId } from "@hazel/schema"
import { Duration, Effect, Layer, Option, Schedule, Schema, ServiceMap } from "effect"
import { runtime } from "~/lib/services/common/runtime"
import { TokenExchange } from "~/lib/services/desktop/token-exchange"
import { TokenStorage } from "~/lib/services/desktop/token-storage"
import { WebTokenStorage } from "~/lib/services/web/token-storage"
import { resetAllWebCallbackAttempts } from "~/lib/web-callback-single-flight"
import { resetAllWebLoginRedirects } from "~/lib/web-login-single-flight"

export type AuthPlatform = "web" | "desktop"

export const AuthLoginRequest = Schema.Struct({
	returnTo: Schema.String,
	organizationId: Schema.optional(Schema.String),
	invitationToken: Schema.optional(Schema.String),
})

export const AuthStoredSession = Schema.Struct({
	accessToken: Schema.String,
	refreshToken: Schema.String,
	expiresAt: Schema.Number,
})

export const AuthCallbackInput = Schema.Struct({
	code: Schema.String,
	state: Schema.String,
})

export const AuthRecoveryTarget = Schema.Struct({
	returnTo: Schema.String,
})

const WebAuthState = Schema.Struct({
	returnTo: Schema.String,
})

const ClipboardAuthPayload = Schema.Struct({
	code: Schema.String,
	state: Schema.Unknown,
})

export type AuthLoginRequest = Schema.Schema.Type<typeof AuthLoginRequest>
export type AuthStoredSession = Schema.Schema.Type<typeof AuthStoredSession>
export type AuthCallbackInput = Schema.Schema.Type<typeof AuthCallbackInput>
export type AuthRecoveryTarget = Schema.Schema.Type<typeof AuthRecoveryTarget>

export interface StartLoginOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

export interface LogoutOptions {
	redirectTo?: string
}

export interface WebCallbackParams {
	code?: string
	state?: string | { returnTo: string }
	error?: string
	error_description?: string
}

export interface DesktopCallbackParams {
	code?: string
	state?: typeof DesktopAuthState.Type
	error?: string
	error_description?: string
}

export interface AuthCompletedSession {
	returnTo: string
	session: AuthStoredSession
}

export class InvalidAuthReturnToError extends Schema.TaggedErrorClass<InvalidAuthReturnToError>()(
	"InvalidAuthReturnToError",
	{
		message: Schema.String,
	},
) {}

export class InvalidAuthStateError extends Schema.TaggedErrorClass<InvalidAuthStateError>()(
	"InvalidAuthStateError",
	{
		message: Schema.String,
	},
) {}

export class InvalidClipboardAuthPayloadError extends Schema.TaggedErrorClass<InvalidClipboardAuthPayloadError>()(
	"InvalidClipboardAuthPayloadError",
	{
		message: Schema.String,
	},
) {}

export class JwtSessionIdDecodeError extends Schema.TaggedErrorClass<JwtSessionIdDecodeError>()(
	"JwtSessionIdDecodeError",
	{
		message: Schema.String,
	},
) {}

export class AuthNavigationError extends Schema.TaggedErrorClass<AuthNavigationError>()(
	"AuthNavigationError",
	{
		message: Schema.String,
	},
) {}

type WebCallbackFlowError =
	| InvalidAuthStateError
	| MissingAuthCodeError
	| OAuthCallbackError
	| OAuthCodeExpiredError
	| OAuthRedemptionPendingError
	| OAuthStateMismatchError
	| TokenDecodeError
	| TokenExchangeError
	| TokenStoreError

type DesktopCallbackFlowError =
	| DesktopConnectionError
	| InvalidAuthStateError
	| MissingAuthCodeError
	| OAuthCallbackError

type DesktopLoginFlowError =
	| InvalidAuthStateError
	| MissingAuthCodeError
	| OAuthTimeoutError
	| TauriCommandError
	| TauriNotAvailableError
	| TokenDecodeError
	| TokenExchangeError
	| TokenStoreError

type AuthStorageService =
	| ServiceMap.Service.Shape<typeof TokenStorage>
	| ServiceMap.Service.Shape<typeof WebTokenStorage>

const REFRESH_BUFFER_MS = 5 * 60 * 1000

const isRelativeReturnTo = (value: string): boolean => value.startsWith("/") && !value.startsWith("//")

const frontendOrigin = (): string =>
	import.meta.env.VITE_FRONTEND_URL ||
	(typeof window === "undefined" ? "http://localhost:3000" : window.location.origin)

const selectStorage = (
	platform: AuthPlatform,
	webStorage: ServiceMap.Service.Shape<typeof WebTokenStorage>,
	desktopStorage: ServiceMap.Service.Shape<typeof TokenStorage>,
): AuthStorageService => (platform === "desktop" ? desktopStorage : webStorage)

const buildStoredSession = (
	accessToken: Option.Option<string>,
	refreshToken: Option.Option<string>,
	expiresAt: Option.Option<number>,
): Option.Option<AuthStoredSession> =>
	Option.isSome(accessToken) && Option.isSome(refreshToken) && Option.isSome(expiresAt)
		? Option.some({
				accessToken: accessToken.value,
				refreshToken: refreshToken.value,
				expiresAt: expiresAt.value,
			})
		: Option.none()

const toStoredSession = (
	accessToken: string,
	refreshToken: string,
	expiresIn: number,
): AuthStoredSession => ({
	accessToken,
	refreshToken,
	expiresAt: Date.now() + expiresIn * 1000,
})

const decodeAuthState = (state: string | { returnTo: string }) =>
	typeof state === "string"
		? Effect.try({
				try: () => JSON.parse(state),
				catch: () =>
					new InvalidAuthStateError({
						message: "Invalid state parameter",
					}),
			}).pipe(
				Effect.flatMap((value) => Schema.decodeUnknownEffect(WebAuthState)(value)),
				Effect.mapError(
					() =>
						new InvalidAuthStateError({
							message: "Invalid state parameter",
						}),
				),
				Effect.map((authState) => ({ authState, stateString: state })),
			)
		: Schema.decodeUnknownEffect(WebAuthState)(state).pipe(
				Effect.mapError(
					() =>
						new InvalidAuthStateError({
							message: "Invalid state parameter",
						}),
				),
				Effect.map((authState) => ({ authState, stateString: JSON.stringify(state) })),
			)

const getTauriOpener = Effect.gen(function* () {
	const opener: TauriOpenerApi | undefined = getBridgeTauriOpener()
	if (!opener) {
		return yield* Effect.fail(
			new TauriNotAvailableError({
				message: "Tauri opener not available",
				component: "opener",
			}),
		)
	}
	return opener
})

const getTauriCore = Effect.gen(function* () {
	const core: TauriCoreApi | undefined = getBridgeTauriCore()
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

const getTauriEvent = Effect.gen(function* () {
	const event: TauriEventApi | undefined = getBridgeTauriEvent()
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

export const normalizeAuthReturnTo = (returnTo?: string): string => {
	if (!returnTo) {
		return "/"
	}

	if (isRelativeReturnTo(returnTo)) {
		return returnTo
	}

	if (!URL.canParse(returnTo)) {
		return "/"
	}

	const { pathname, search, hash } = new URL(returnTo)
	const normalized = `${pathname}${search}${hash}`
	return isRelativeReturnTo(normalized) ? normalized : "/"
}

const validateRelativeReturnTo = (value: string) =>
	isRelativeReturnTo(value)
		? Effect.succeed(value)
		: Effect.fail(
				new InvalidAuthReturnToError({
					message: "Return path must be relative",
				}),
			)

const buildWorkosLogoutUrl = (sessionId: string, returnTo: string): URL => {
	const url = new URL("https://api.workos.com/user_management/sessions/logout")
	url.searchParams.set("session_id", sessionId)
	url.searchParams.set("return_to", returnTo)
	return url
}

export const buildWebLoginUrl = (request: AuthLoginRequest): URL => {
	const url = new URL("/auth/login", import.meta.env.VITE_BACKEND_URL)
	url.searchParams.set("returnTo", request.returnTo)

	if (request.organizationId) {
		url.searchParams.set("organizationId", request.organizationId)
	}
	if (request.invitationToken) {
		url.searchParams.set("invitationToken", request.invitationToken)
	}

	return url
}

const buildDesktopLoginUrl = (
	request: AuthLoginRequest,
	connection: { port: number; nonce: string },
): URL => {
	const url = new URL("/auth/login/desktop", import.meta.env.VITE_BACKEND_URL)
	url.searchParams.set("returnTo", request.returnTo)
	url.searchParams.set("desktopPort", String(connection.port))
	url.searchParams.set("desktopNonce", connection.nonce)

	if (request.organizationId) {
		url.searchParams.set("organizationId", request.organizationId)
	}
	if (request.invitationToken) {
		url.searchParams.set("invitationToken", request.invitationToken)
	}

	return url
}

export const getWebCallbackReturnTo = (
	state: string | Schema.Schema.Type<typeof WebAuthState> | undefined,
): string =>
	typeof state === "string"
		? normalizeAuthReturnTo(
				Effect.runSync(
					decodeAuthState(state).pipe(
						Effect.map(({ authState }) => authState.returnTo),
						Effect.catch(() => Effect.succeed("/")),
					),
				),
			)
		: normalizeAuthReturnTo(state?.returnTo)

export const getJwtSessionId = (token: string): Effect.Effect<string | null, JwtSessionIdDecodeError> =>
	Effect.gen(function* () {
		const payloadPart = token.split(".")[1]
		if (!payloadPart) {
			return null
		}

		const payload = yield* Effect.try({
			try: () =>
				JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))) as {
					sid?: string
				},
			catch: () =>
				new JwtSessionIdDecodeError({
					message: "Failed to decode JWT session id",
				}),
		})

		return payload.sid?.trim() || null
	})

export class AuthStorage extends ServiceMap.Service<AuthStorage>()("AuthStorage", {
	make: Effect.gen(function* () {
		const webStorage = yield* WebTokenStorage
		const desktopStorage = yield* TokenStorage

		return {
			loadSession: (platform: AuthPlatform) =>
				Effect.gen(function* () {
					const storage = selectStorage(platform, webStorage, desktopStorage)
					const accessToken = yield* storage.getAccessToken
					const refreshToken = yield* storage.getRefreshToken
					const expiresAt = yield* storage.getExpiresAt
					return buildStoredSession(accessToken, refreshToken, expiresAt)
				}),
			getAccessToken: (platform: AuthPlatform) =>
				Effect.gen(function* () {
					const storage = selectStorage(platform, webStorage, desktopStorage)
					return Option.getOrNull(yield* storage.getAccessToken)
				}),
			getRefreshToken: (platform: AuthPlatform) =>
				Effect.gen(function* () {
					const storage = selectStorage(platform, webStorage, desktopStorage)
					return Option.getOrNull(yield* storage.getRefreshToken)
				}),
			storeSession: (
				platform: AuthPlatform,
				session: { accessToken: string; refreshToken: string; expiresIn: number },
			) =>
				Effect.gen(function* () {
					const storage = selectStorage(platform, webStorage, desktopStorage)
					yield* storage.storeTokens(session.accessToken, session.refreshToken, session.expiresIn)
					return toStoredSession(session.accessToken, session.refreshToken, session.expiresIn)
				}),
			clearSession: (platform: AuthPlatform) =>
				Effect.gen(function* () {
					const storage = selectStorage(platform, webStorage, desktopStorage)
					yield* storage.clearTokens
				}),
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provideMerge(WebTokenStorage.layer),
		Layer.provideMerge(TokenStorage.layer),
	)
}

export class AuthNavigator extends ServiceMap.Service<AuthNavigator>()("AuthNavigator", {
	make: Effect.succeed({
		redirect: (destination: string | URL) =>
			Effect.try({
				try: () => {
					if (typeof window === "undefined") {
						throw new Error("window is not available")
					}
					window.location.href =
						typeof destination === "string" ? destination : destination.toString()
				},
				catch: () =>
					new AuthNavigationError({
						message: "Failed to navigate during auth flow",
					}),
			}),
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}

export class AuthTokenExchange extends ServiceMap.Service<AuthTokenExchange>()("AuthTokenExchange", {
	make: Effect.gen(function* () {
		const tokenExchange = yield* TokenExchange

		return {
			exchangeCode: (code: string, state: string, attemptId?: string) =>
				tokenExchange.exchangeCode(code, state, attemptId),
			refreshToken: (refreshToken: string, attemptId?: string) =>
				tokenExchange.refreshToken(refreshToken, attemptId),
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provideMerge(TokenExchange.layer))
}

export class AuthSessionBridge extends ServiceMap.Service<AuthSessionBridge>()("AuthSessionBridge", {
	make: Effect.succeed({
		startDesktopLogin: (request: AuthLoginRequest) =>
			Effect.gen(function* () {
				const opener = yield* getTauriOpener
				const core = yield* getTauriCore
				const event = yield* getTauriEvent

				const [port, nonce] = yield* Effect.tryPromise({
					try: () => core.invoke<[number, string]>("start_oauth_server"),
					catch: (error) =>
						new TauriCommandError({
							message: "Failed to start OAuth server",
							command: "start_oauth_server",
							detail: String(error),
						}),
				})

				const loginUrl = buildDesktopLoginUrl(request, { port, nonce })
				yield* Effect.tryPromise({
					try: () => opener.openUrl(loginUrl.toString()),
					catch: (error) =>
						new TauriCommandError({
							message: "Failed to open browser",
							command: "openUrl",
							detail: String(error),
						}),
				})

				const callbackUrl = yield* Effect.callback<string, never>((resume) => {
					let unlisten: (() => void) | null = null

					event
						.listen<string>("oauth-callback", (evt: { payload: string }) => {
							resume(Effect.succeed(evt.payload))
						})
						.then((cleanup: () => void) => {
							unlisten = cleanup
						})

					return Effect.sync(() => {
						unlisten?.()
					})
				}).pipe(
					Effect.timeout(Duration.minutes(2)),
					Effect.catchTag("TimeoutError", () =>
						Effect.fail(
							new OAuthTimeoutError({
								message: "OAuth callback timeout after 2 minutes",
							}),
						),
					),
				)

				if (!URL.canParse(callbackUrl)) {
					return yield* Effect.fail(
						new InvalidAuthStateError({
							message: "Desktop auth callback URL was invalid",
						}),
					)
				}

				const url = new URL(callbackUrl)
				const code = url.searchParams.get("code")
				const state = url.searchParams.get("state")

				if (!code) {
					return yield* Effect.fail(
						new MissingAuthCodeError({
							message: "No authorization code received",
						}),
					)
				}

				if (!state) {
					return yield* Effect.fail(
						new InvalidAuthStateError({
							message: "Missing state parameter",
						}),
					)
				}

				return {
					returnTo: request.returnTo,
					callback: { code, state },
				}
			}),
		forwardDesktopCallback: (params: DesktopCallbackParams) =>
			Effect.gen(function* () {
				if (params.error) {
					return yield* Effect.fail(
						new OAuthCallbackError({
							message: params.error_description || params.error,
							error: params.error,
							errorDescription: params.error_description,
						}),
					)
				}

				if (!params.code) {
					return yield* Effect.fail(
						new MissingAuthCodeError({
							message: "Missing authorization code",
						}),
					)
				}

				if (!params.state) {
					return yield* Effect.fail(
						new InvalidAuthStateError({
							message: "Missing state parameter",
						}),
					)
				}

				const state = yield* Schema.decodeUnknownEffect(DesktopAuthState)(params.state).pipe(
					Effect.mapError(
						() =>
							new InvalidAuthStateError({
								message: "Invalid authentication state. Please try again.",
							}),
					),
				)
				const port = state.desktopPort
				const nonce = state.desktopNonce
				if (port === undefined || !nonce) {
					return yield* Effect.fail(
						new InvalidAuthStateError({
							message: "Invalid authentication state. Please try again.",
						}),
					)
				}

				yield* Effect.tryPromise({
					try: () =>
						fetch(`http://127.0.0.1:${port}`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								code: params.code,
								state: JSON.stringify(state),
								nonce,
							}),
						}),
					catch: (error) =>
						new DesktopConnectionError({
							message: "Could not connect to Hazel",
							port,
							attempts: 3,
						}),
				}).pipe(
					Effect.flatMap((response) =>
						response.ok
							? Effect.void
							: Effect.fail(
									new DesktopConnectionError({
										message: "Could not connect to Hazel",
										port,
										attempts: 3,
									}),
								),
					),
					Effect.retry({
						times: 3,
						schedule: Schedule.exponential("500 millis"),
					}),
					Effect.catchTag("DesktopConnectionError", (error) => Effect.fail(error)),
					Effect.catch(() =>
						Effect.fail(
							new DesktopConnectionError({
								message: "Could not connect to Hazel",
								port,
								attempts: 3,
							}),
						),
					),
				)
			}),
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}

export class AuthFlow extends ServiceMap.Service<AuthFlow>()("AuthFlow", {
	make: Effect.gen(function* () {
		const storage = yield* AuthStorage
		const authNavigator = yield* AuthNavigator
		const tokenExchange = yield* AuthTokenExchange
		const bridge = yield* AuthSessionBridge

		return {
			startLogin: (platform: AuthPlatform, options: StartLoginOptions = {}) =>
				Effect.gen(function* () {
					const returnTo = yield* validateRelativeReturnTo(normalizeAuthReturnTo(options.returnTo))
					const request: AuthLoginRequest = {
						returnTo,
						organizationId: options.organizationId,
						invitationToken: options.invitationToken,
					}

					if (platform === "web") {
						// Web auth now goes through Clerk (<SignIn> on /auth/login).
						// Redirect straight to our front-end login page instead of the
						// backend's legacy WorkOS OAuth endpoint.
						const relative = `/auth/login?${new URLSearchParams({
							returnTo,
							...(options.organizationId ? { organizationId: options.organizationId } : {}),
							...(options.invitationToken ? { invitationToken: options.invitationToken } : {}),
						}).toString()}`
						yield* authNavigator.redirect(relative)
						return
					}

						const { callback, returnTo: desktopReturnTo } = yield* bridge.startDesktopLogin(request)
						const tokens = yield* tokenExchange.exchangeCode(callback.code, callback.state)
						const session = yield* storage.storeSession("desktop", tokens)
						return { returnTo: desktopReturnTo, session } satisfies AuthCompletedSession
				}),
			completeWebCallback: (params: WebCallbackParams, attemptId?: string) =>
				Effect.gen(function* () {
					if (params.error) {
						return yield* Effect.fail(
							new OAuthCallbackError({
								message: params.error_description || params.error,
								error: params.error,
								errorDescription: params.error_description,
							}),
						)
					}

					if (!params.code) {
						return yield* Effect.fail(
							new MissingAuthCodeError({
								message: "Missing authorization code",
							}),
						)
					}

					if (!params.state) {
						return yield* Effect.fail(
							new InvalidAuthStateError({
								message: "Missing state parameter",
							}),
						)
					}

					const { authState, stateString } = yield* decodeAuthState(params.state)
					const returnTo = normalizeAuthReturnTo(authState.returnTo)
					const tokens = yield* tokenExchange.exchangeCode(params.code, stateString, attemptId)
					const session = yield* storage.storeSession("web", tokens)

					return { returnTo, session } satisfies AuthCompletedSession
				}),
			completeDesktopCallback: (callback: AuthCallbackInput, returnTo: string = "/") =>
				Effect.gen(function* () {
					const tokens = yield* tokenExchange.exchangeCode(callback.code, callback.state)
					const session = yield* storage.storeSession("desktop", tokens)
					return {
						returnTo: normalizeAuthReturnTo(returnTo),
						session,
					} satisfies AuthCompletedSession
				}),
			authenticateDesktopFromClipboard: () =>
				Effect.gen(function* () {
					const clipboard = yield* Clipboard.Clipboard
					const clipboardText = yield* clipboard.readString
					const rawJson = yield* Effect.try({
						try: () => JSON.parse(clipboardText),
						catch: () =>
							new InvalidClipboardAuthPayloadError({
								message: "Invalid clipboard data - not valid JSON",
							}),
					})

					const parsed = yield* Schema.decodeUnknownEffect(ClipboardAuthPayload)(rawJson).pipe(
						Effect.mapError(
							() =>
								new InvalidClipboardAuthPayloadError({
									message: "Invalid clipboard data - missing code or state",
								}),
						),
					)

					const callback: AuthCallbackInput = {
						code: parsed.code,
						state: typeof parsed.state === "string" ? parsed.state : JSON.stringify(parsed.state),
					}

					return yield* tokenExchange
						.exchangeCode(callback.code, callback.state)
						.pipe(Effect.flatMap((tokens) => storage.storeSession("desktop", tokens)))
				}),
			initSession: (platform: AuthPlatform) =>
				Effect.gen(function* () {
					const session = yield* storage.loadSession(platform)
					if (Option.isNone(session)) {
						return null
					}

					if (session.value.expiresAt - Date.now() > REFRESH_BUFFER_MS) {
						return session.value
					}

					const refreshed = yield* Effect.option(
						Effect.gen(function* () {
							const refreshToken = yield* storage.getRefreshToken(platform)
							if (!refreshToken) {
								return yield* Effect.fail(
									new TokenExchangeError({
										message: "Refresh token missing",
									}),
								)
							}

							const tokens = yield* tokenExchange.refreshToken(refreshToken)
							return yield* storage.storeSession(platform, tokens)
						}),
					)

					if (Option.isSome(refreshed)) {
						return refreshed.value
					}

					yield* storage
						.clearSession(platform)
						.pipe(
							Effect.catch(() =>
								Effect.logWarning(`[auth-flow:${platform}] Failed to clear stale session`),
							),
						)
					return null
				}),
			refreshSession: (platform: AuthPlatform) =>
				Effect.gen(function* () {
					const refreshToken = yield* storage.getRefreshToken(platform)
					if (!refreshToken) {
						return null
					}

					const tokens = yield* tokenExchange.refreshToken(refreshToken)
					return yield* storage.storeSession(platform, tokens)
				}),
			recoverSession: (platform: AuthPlatform, options: StartLoginOptions = {}) =>
				Effect.gen(function* () {
					const returnTo = yield* validateRelativeReturnTo(normalizeAuthReturnTo(options.returnTo))

					yield* storage
						.clearSession(platform)
						.pipe(
							Effect.catch(() =>
								Effect.logWarning(
									`[auth-flow:${platform}] Failed to clear session during recovery`,
								),
							),
						)

					if (platform === "desktop") {
						yield* authNavigator.redirect(returnTo)
						return
					}

					resetAllWebCallbackAttempts()
					resetAllWebLoginRedirects()

					// Clerk replaces WorkOS for web sign-in. Go straight to our /auth/login page
					// (which renders <SignIn/>) — no WorkOS logout hop, no backend OAuth endpoint.
					const clerkLoginUrl = `/auth/login?${new URLSearchParams({
						returnTo,
						...(options.organizationId ? { organizationId: options.organizationId } : {}),
						...(options.invitationToken ? { invitationToken: options.invitationToken } : {}),
					}).toString()}`
					yield* authNavigator.redirect(clerkLoginUrl)
				}),
			logout: (platform: AuthPlatform, options: LogoutOptions = {}) =>
				Effect.gen(function* () {
					const accessToken = yield* storage.getAccessToken(platform)
					yield* storage
						.clearSession(platform)
						.pipe(
							Effect.catch(() =>
								Effect.logWarning(
									`[auth-flow:${platform}] Failed to clear session during logout`,
								),
							),
						)

					if (platform === "desktop") {
						yield* authNavigator.redirect(normalizeAuthReturnTo(options.redirectTo))
						return
					}

					resetAllWebCallbackAttempts()
					resetAllWebLoginRedirects()

					const redirectPath = normalizeAuthReturnTo(options.redirectTo)
					const absoluteReturnTo = `${frontendOrigin()}${redirectPath}`
					const sessionId = accessToken
						? yield* getJwtSessionId(accessToken).pipe(Effect.catch(() => Effect.succeed(null)))
						: null

					yield* authNavigator.redirect(
						sessionId ? buildWorkosLogoutUrl(sessionId, absoluteReturnTo) : absoluteReturnTo,
					)
				}),
			forwardDesktopCallback: (params: DesktopCallbackParams) => bridge.forwardDesktopCallback(params),
			copyDesktopCallbackToClipboard: (params: DesktopCallbackParams) =>
				Effect.gen(function* () {
					if (!params.code || !params.state) {
						return
					}

					yield* Effect.tryPromise({
						try: () =>
							window.navigator.clipboard.writeText(
								JSON.stringify({
									code: params.code,
									state: params.state,
								}),
							),
						catch: () =>
							new InvalidClipboardAuthPayloadError({
								message: "Failed to copy auth payload to clipboard",
							}),
					})
				}),
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provideMerge(AuthStorage.layer),
		Layer.provideMerge(AuthNavigator.layer),
		Layer.provideMerge(AuthTokenExchange.layer),
		Layer.provideMerge(AuthSessionBridge.layer),
	)
}

const AuthFlowLive = Layer.mergeAll(AuthFlow.layer, Clipboard.layer)

export const loadStoredSessionEffect = (platform: AuthPlatform) =>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		return yield* flow.initSession(platform)
	}).pipe(Effect.provide(AuthFlowLive))

export const refreshSessionEffect = (platform: AuthPlatform) =>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		return yield* flow.refreshSession(platform)
	}).pipe(Effect.provide(AuthFlowLive))

export const getStoredAccessTokenEffect = (platform: AuthPlatform) =>
	Effect.gen(function* () {
		const storage = yield* AuthStorage
		return yield* storage.getAccessToken(platform)
	}).pipe(Effect.provide(AuthStorage.layer))

export const getStoredRefreshTokenEffect = (platform: AuthPlatform) =>
	Effect.gen(function* () {
		const storage = yield* AuthStorage
		return yield* storage.getRefreshToken(platform)
	}).pipe(Effect.provide(AuthStorage.layer))

export const clearStoredSessionEffect = (platform: AuthPlatform) =>
	Effect.gen(function* () {
		const storage = yield* AuthStorage
		yield* storage.clearSession(platform)
	}).pipe(Effect.provide(AuthStorage.layer))

export const startLoginEffect = (platform: AuthPlatform, options?: StartLoginOptions) =>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		return yield* flow.startLogin(platform, options)
	}).pipe(Effect.provide(AuthFlowLive))

export const completeWebCallbackEffect = (
	params: WebCallbackParams,
	attemptId?: string,
)=>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		return yield* flow.completeWebCallback(params, attemptId)
	}).pipe(Effect.provide(AuthFlowLive))

export const completeDesktopCallbackEffect = (
	callback: AuthCallbackInput,
	returnTo?: string,
)=>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		return yield* flow.completeDesktopCallback(callback, returnTo)
	}).pipe(Effect.provide(AuthFlowLive))

export const authenticateDesktopFromClipboardEffect = () =>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		return yield* flow.authenticateDesktopFromClipboard()
	}).pipe(Effect.provide(AuthFlowLive))

export const recoverSessionEffect = (
	platform: AuthPlatform,
	options?: StartLoginOptions,
)=>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		yield* flow.recoverSession(platform, options)
	}).pipe(Effect.provide(AuthFlowLive))

export const logoutEffect = (platform: AuthPlatform, options?: LogoutOptions) =>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		yield* flow.logout(platform, options)
	}).pipe(Effect.provide(AuthFlowLive))

export const forwardDesktopCallbackEffect = (params: DesktopCallbackParams) =>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		yield* flow.forwardDesktopCallback(params)
	}).pipe(Effect.provide(AuthFlowLive))

export const copyDesktopCallbackToClipboardEffect = (params: DesktopCallbackParams) =>
	Effect.gen(function* () {
		const flow = yield* AuthFlow
		yield* flow.copyDesktopCallbackToClipboard(params)
	}).pipe(Effect.provide(AuthFlowLive))

export const startLogin = (
	platform: AuthPlatform,
	options?: StartLoginOptions,
): Promise<void | AuthCompletedSession> => runtime.runPromise(startLoginEffect(platform, options))

export const recoverSession = (platform: AuthPlatform, options?: StartLoginOptions): Promise<void> =>
	runtime.runPromise(recoverSessionEffect(platform, options))

export const logout = (platform: AuthPlatform, options?: LogoutOptions): Promise<void> =>
	runtime.runPromise(logoutEffect(platform, options))

export const completeWebCallback = (
	params: WebCallbackParams,
	attemptId?: string,
): Promise<AuthCompletedSession> => runtime.runPromise(completeWebCallbackEffect(params, attemptId))

export const authenticateDesktopFromClipboard = (): Promise<AuthStoredSession> =>
	runtime.runPromise(authenticateDesktopFromClipboardEffect())

export const getStoredAccessToken = (platform: AuthPlatform): Promise<string | null> =>
	runtime.runPromise(getStoredAccessTokenEffect(platform))

export const clearStoredSession = (platform: AuthPlatform): Promise<void> =>
	runtime.runPromise(clearStoredSessionEffect(platform))

export const getWebCallbackErrorInfo = (
	error: WebCallbackFlowError,
): { message: string; isRetryable: boolean } => {
	switch (error._tag) {
		case "OAuthCallbackError":
			return {
				message: error.errorDescription || error.error,
				isRetryable: true,
			}
		case "MissingAuthCodeError":
		case "InvalidAuthStateError":
			return {
				message: "We did not receive a valid login callback. Please try again.",
				isRetryable: true,
			}
		case "OAuthCodeExpiredError":
			return {
				message: "This login code is no longer valid. Please start login again.",
				isRetryable: false,
			}
		case "OAuthStateMismatchError":
			return {
				message: "This login callback did not match the active session. Please start again.",
				isRetryable: false,
			}
		case "OAuthRedemptionPendingError":
			return {
				message: "Login is still finishing in another request. Please try again in a moment.",
				isRetryable: true,
			}
		case "TokenDecodeError":
			return {
				message: "The server returned an invalid auth response. Please try again.",
				isRetryable: true,
			}
		case "TokenExchangeError":
		case "TokenStoreError":
			return {
				message: error.message || "Failed to exchange authorization code.",
				isRetryable: true,
			}
	}
}

export const getDesktopCallbackErrorInfo = (
	error: DesktopCallbackFlowError,
): { message: string; isRetryable: boolean; isConnectionError?: boolean } => {
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
		case "InvalidAuthStateError":
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

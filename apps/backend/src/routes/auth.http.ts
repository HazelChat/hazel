import { createHash } from "node:crypto"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { HttpServerResponse } from "effect/unstable/http"
import { getJwtExpiry } from "@hazel/auth"
import { UserRepo } from "@hazel/backend-core"
import { RefreshTokenResponse, TokenResponse } from "@hazel/domain/http"
import { WorkOSUserId } from "@hazel/schema"
import { InternalServerError, OAuthCodeExpiredError, UnauthorizedError } from "@hazel/domain"
import { Config, Effect, Schema } from "effect"
import { HazelApi } from "../api"
import { RelativeUrl } from "../lib/schema"
import { AuthRedemptionStore } from "../services/auth-redemption-store"
import { WorkOSAuth as WorkOS } from "../services/workos-auth"

type TokenExchangeResponse = Schema.Schema.Type<typeof TokenResponse>
type AuthHeaders = {
	readonly "x-auth-attempt-id"?: string
}

const hashValue = (value: string): string => createHash("sha256").update(value).digest("hex").slice(0, 12)
const getAttemptId = (headers: AuthHeaders | undefined): string => headers?.["x-auth-attempt-id"] ?? "missing"

const getWorkOSCauseDetails = (cause: unknown) => {
	const details = cause as {
		status?: number
		error?: string
		errorDescription?: string
		rawData?: {
			error?: string
			error_description?: string
		}
		message?: string
		requestID?: string
	}

	return {
		status: details.status,
		error: details.error ?? details.rawData?.error,
		errorDescription: details.errorDescription ?? details.rawData?.error_description,
		message: details.message ?? String(cause),
		requestId: details.requestID ?? "",
	}
}

const mapWorkOSCodeExchangeError = (error: { cause: unknown }): OAuthCodeExpiredError | UnauthorizedError => {
	const details = getWorkOSCauseDetails(error.cause)

	if (details.error === "invalid_grant") {
		return new OAuthCodeExpiredError({
			message: details.errorDescription || "Authorization code expired or already used",
		})
	}

	return new UnauthorizedError({
		message: "Failed to authenticate with WorkOS",
		detail: details.errorDescription || details.message,
	})
}

export const HttpAuthLive = HttpApiBuilder.group(HazelApi, "auth", (handlers) =>
	handlers
		.handle("login", ({ query }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS

				const clientId = yield* Config.string("WORKOS_CLIENT_ID")
				const redirectUri = yield* Config.string("WORKOS_REDIRECT_URI")

				// Validate returnTo is a relative URL (defense in depth)
				const validatedReturnTo = Schema.decodeSync(RelativeUrl)(query.returnTo)
				const state = JSON.stringify({ returnTo: validatedReturnTo })

				let workosOrgId: string

				if (query.organizationId) {
					const workosOrg = yield* workos
						.call(async (client) =>
							client.organizations.getOrganizationByExternalId(query.organizationId!),
						)
						.pipe(
							Effect.catchTag("WorkOSAuthError", (error) =>
								Effect.fail(
									new InternalServerError({
										message: "Failed to get organization from WorkOS",
										detail: String(error.cause),
										cause: error,
									}),
								),
							),
						)

					workosOrgId = workosOrg.id
				}

				const authorizationUrl = yield* workos
					.call(async (client) => {
						const authUrl = client.userManagement.getAuthorizationUrl({
							provider: "authkit",
							clientId,
							redirectUri,
							state,
							screenHint: "sign-in",
							...(workosOrgId && {
								organizationId: workosOrgId,
							}),
							...(query.invitationToken && { invitationToken: query.invitationToken }),
						})
						return authUrl
					})
					.pipe(
						Effect.catchTag("WorkOSAuthError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Failed to generate authorization URL",
									detail: String(error.cause),
									cause: error,
								}),
							),
						),
					)

				// Return HTTP 302 redirect to WorkOS instead of JSON
				// This eliminates the "Redirecting to login..." intermediate page
				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: authorizationUrl,
					},
				})
			}).pipe(
				Effect.catchTag("ConfigError", (err) =>
					Effect.fail(
						new InternalServerError({ message: "Missing configuration", detail: String(err) }),
					),
				),
			),
		)
		.handle("callback", ({ query }) =>
			Effect.gen(function* () {
				const frontendUrl = yield* Config.string("FRONTEND_URL")

				const code = query.code
				const state = query.state

				if (!code) {
					return yield* Effect.fail(
						new UnauthorizedError({
							message: "Missing authorization code",
							detail: "The authorization code was not provided in the callback",
						}),
					)
				}

				// Redirect to frontend callback with code and state as URL params
				// The frontend will exchange the code for tokens via POST /auth/token
				const callbackUrl = new URL(`${frontendUrl}/auth/callback`)
				callbackUrl.searchParams.set("code", code)
				callbackUrl.searchParams.set("state", state)

				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: callbackUrl.toString(),
					},
				})
			}).pipe(
				Effect.catchTag("ConfigError", (err) =>
					Effect.fail(
						new InternalServerError({ message: "Missing configuration", detail: String(err) }),
					),
				),
			),
		)
		.handle("logout", ({ query }) =>
			Effect.gen(function* () {
				const frontendUrl = yield* Config.string("FRONTEND_URL")

				// Build the full return URL - redirect to frontend after logout
				const returnTo = query.redirectTo ? `${frontendUrl}${query.redirectTo}` : frontendUrl

				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: returnTo,
					},
				})
			}).pipe(
				Effect.catchTag("ConfigError", (err) =>
					Effect.fail(
						new InternalServerError({ message: "Missing configuration", detail: String(err) }),
					),
				),
			),
		)
		.handle("loginDesktop", ({ query }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS

				const clientId = yield* Config.string("WORKOS_CLIENT_ID")
				const frontendUrl = yield* Config.string("FRONTEND_URL")

				// Always use web app callback page
				const redirectUri = `${frontendUrl}/auth/desktop-callback`

				// Validate returnTo is a relative URL (defense in depth)
				const validatedReturnTo = Schema.decodeSync(RelativeUrl)(query.returnTo)

				// Build state with desktop connection info
				const stateObj = {
					returnTo: validatedReturnTo,
					desktopPort: query.desktopPort,
					desktopNonce: query.desktopNonce,
				}
				const state = JSON.stringify(stateObj)

				let workosOrgId: string | undefined

				if (query.organizationId) {
					const workosOrg = yield* workos
						.call(async (client) =>
							client.organizations.getOrganizationByExternalId(query.organizationId!),
						)
						.pipe(Effect.catchTag("WorkOSAuthError", () => Effect.succeed(null)))

					workosOrgId = workosOrg?.id
				}

				const authorizationUrl = yield* workos
					.call(async (client) => {
						return client.userManagement.getAuthorizationUrl({
							provider: "authkit",
							clientId,
							redirectUri,
							state,
							...(workosOrgId && { organizationId: workosOrgId }),
							...(query.invitationToken && { invitationToken: query.invitationToken }),
						})
					})
					.pipe(
						Effect.catchTag("WorkOSAuthError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Failed to generate authorization URL",
									detail: String(error.cause),
									cause: error,
								}),
							),
						),
					)

				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: authorizationUrl,
					},
				})
			}).pipe(
				Effect.catchTag("ConfigError", (err) =>
					Effect.fail(
						new InternalServerError({ message: "Missing configuration", detail: String(err) }),
					),
				),
			),
		)
		.handle("token", ({ payload, headers }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS
				const authRedemptionStore = yield* AuthRedemptionStore
				const userRepo = yield* UserRepo

				const { code, state } = payload
				const attemptId = getAttemptId(headers)

				const clientId = yield* Config.string("WORKOS_CLIENT_ID")

				yield* Effect.logInfo("[auth/token] Handling token exchange request", {
					attemptId,
					codeHash: hashValue(code),
					stateHash: hashValue(state),
				})

				const tokens = yield* authRedemptionStore.exchangeCodeOnce(
					{
						code,
						state,
						attemptId,
					},
					workos
						.call(async (client) => {
							return await client.userManagement.authenticateWithCode({
								clientId,
								code,
								// Don't seal - we need the accessToken for desktop apps
							})
						})
						.pipe(
							Effect.catchTag("WorkOSAuthError", (error) =>
								Effect.fail(mapWorkOSCodeExchangeError(error)),
							),
							Effect.map((authResponse): TokenExchangeResponse => {
								const expiresIn =
									getJwtExpiry(authResponse.accessToken) - Math.floor(Date.now() / 1000)

								return {
									accessToken: authResponse.accessToken,
									refreshToken: authResponse.refreshToken!,
									expiresIn,
									user: {
										id: authResponse.user.id,
										email: authResponse.user.email,
										firstName: authResponse.user.firstName || "",
										lastName: authResponse.user.lastName || "",
									},
								}
							}),
							Effect.catchTag("UnauthorizedError", (error) =>
								Effect.fail(
									new InternalServerError({
										message: error.message,
										detail: error.detail,
										cause: error,
									}),
								),
							),
						),
				)

				yield* Effect.logInfo("[auth/token] Ensuring local user exists", {
					attemptId,
					workosUserId: tokens.user.id,
				})

				const workosUser = tokens.user
				const workosUserId = Schema.decodeUnknownSync(WorkOSUserId)(workosUser.id)

				yield* userRepo
					.upsertWorkOSUser({
						externalId: workosUserId,
						email: workosUser.email,
						firstName: workosUser.firstName || "",
						lastName: workosUser.lastName || "",
						avatarUrl: null,
						userType: "user",
						settings: null,
						isOnboarded: false,
						timezone: null,
						deletedAt: null,
					})
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new InternalServerError({
										message: "Failed to upsert user after OAuth redemption",
										detail: String(err),
									}),
								),
						}),
					)

				yield* Effect.logInfo("[auth/token] Token exchange request completed", {
					attemptId,
					workosUserId: tokens.user.id,
					outcome: "success",
				})

				const response = new TokenResponse(tokens)
				yield* Effect.logInfo("[auth/token] Constructed schema success response", {
					attemptId,
					outcome: "success_response",
				})

				return response
			}).pipe(
				Effect.tapError((error) =>
					Effect.logError("[auth/token] Token exchange request failed", {
						attemptId: getAttemptId(headers),
						errorTag: error._tag,
						message: error.message,
					}),
				),
				Effect.catchTag("ConfigError", (err) =>
					Effect.fail(
						new InternalServerError({ message: "Missing configuration", detail: String(err) }),
					),
				),
			),
		)
		.handle("refresh", ({ payload, headers }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS
				const { refreshToken } = payload
				const attemptId = getAttemptId(headers)

				const clientId = yield* Config.string("WORKOS_CLIENT_ID")

				yield* Effect.logInfo("[auth/refresh] Handling refresh request", {
					attemptId,
					refreshTokenHash: hashValue(refreshToken),
				})

				// Exchange refresh token for new tokens
				const authResponse = yield* workos
					.call(async (client) => {
						return await client.userManagement.authenticateWithRefreshToken({
							clientId,
							refreshToken,
						})
					})
					.pipe(
						Effect.catchTag("WorkOSAuthError", (error) =>
							Effect.fail(
								new UnauthorizedError({
									message: "Failed to refresh token",
									detail: String(error.cause),
								}),
							),
						),
					)

				const expiresIn = getJwtExpiry(authResponse.accessToken) - Math.floor(Date.now() / 1000)

				yield* Effect.logInfo("[auth/refresh] Refresh request completed", {
					attemptId,
					outcome: "success",
				})

				const response = new RefreshTokenResponse({
					accessToken: authResponse.accessToken,
					refreshToken: authResponse.refreshToken!,
					expiresIn,
				})

				yield* Effect.logInfo("[auth/refresh] Constructed schema success response", {
					attemptId,
					outcome: "success_response",
				})

				return response
			}).pipe(
				Effect.tapError((error) =>
					Effect.logError("[auth/refresh] Refresh request failed", {
						attemptId: getAttemptId(headers),
						errorTag: error._tag,
						message: error.message,
					}),
				),
				Effect.catchTag("ConfigError", (err) =>
					Effect.fail(
						new InternalServerError({ message: "Missing configuration", detail: String(err) }),
					),
				),
			),
		),
)

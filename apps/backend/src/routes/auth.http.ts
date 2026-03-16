import { HttpApiBuilder } from "effect/unstable/httpapi"
import { HttpServerResponse } from "effect/unstable/http"
import { getJwtExpiry } from "@hazel/auth"
import { UserRepo } from "@hazel/backend-core"
import { WorkOSUserId } from "@hazel/schema"
import { InternalServerError, OAuthCodeExpiredError, UnauthorizedError } from "@hazel/domain"
import { Config, Effect, Option, Schema } from "effect"
import { HazelApi } from "../api"
import { AuthState, DesktopAuthState, RelativeUrl } from "../lib/schema"
import { WorkOSAuth as WorkOS } from "../services/workos-auth"

export const HttpAuthLive = HttpApiBuilder.group(HazelApi, "auth", (handlers) =>
	handlers
		.handle("login", ({ query }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS

				const clientId = yield* Config.string("WORKOS_CLIENT_ID")
				const redirectUri = yield* Config.string("WORKOS_REDIRECT_URI")

				// Validate returnTo is a relative URL (defense in depth)
				const validatedReturnTo = Schema.decodeSync(RelativeUrl)(query.returnTo)
				const state = JSON.stringify(AuthState.make({ returnTo: validatedReturnTo }))

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
			}),
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
			}),
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
			}),
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
				const stateObj = DesktopAuthState.make({
					returnTo: validatedReturnTo,
					desktopPort: query.desktopPort,
					desktopNonce: query.desktopNonce,
				})
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
			}),
		)
		.handle("token", ({ payload }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS
				const userRepo = yield* UserRepo

				const { code, state } = payload

				const clientId = yield* Config.string("WORKOS_CLIENT_ID")

				// Exchange code for tokens (without sealing - we want the JWT for desktop)
				const authResponse = yield* workos
					.call(async (client) => {
						return await client.userManagement.authenticateWithCode({
							clientId,
							code,
							// Don't seal - we need the accessToken for desktop apps
						})
					})
					.pipe(
						Effect.catchTag(
							"WorkOSAuthError",
							(error): Effect.Effect<never, OAuthCodeExpiredError | UnauthorizedError> => {
								const errorStr = String(error.cause)
								// Detect expired/invalid code from WorkOS (invalid_grant)
								if (errorStr.includes("invalid_grant")) {
									return Effect.fail(
										new OAuthCodeExpiredError({
											message: "Authorization code expired or already used",
										}),
									)
								}
								return Effect.fail(
									new UnauthorizedError({
										message: "Failed to authenticate with WorkOS",
										detail: errorStr,
									}),
								)
							},
						),
					)

				const { user: workosUser, accessToken, refreshToken } = authResponse
				const workosUserId = Schema.decodeUnknownSync(WorkOSUserId)(workosUser.id)

				// Ensure user exists in our DB
				const userOption = yield* userRepo.findByWorkOSUserId(workosUserId).pipe(
					Effect.catchTags({
						DatabaseError: (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Failed to query user",
									detail: String(err),
								}),
							),
					}),
				)

				yield* Option.match(userOption, {
					onNone: () =>
						userRepo
							.upsertWorkOSUser({
								externalId: workosUserId,
								email: workosUser.email,
								firstName: workosUser.firstName || "",
								lastName: workosUser.lastName || "",
								avatarUrl: workosUser.profilePictureUrl?.trim()
									? workosUser.profilePictureUrl
									: null,
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
												message: "Failed to create user",
												detail: String(err),
											}),
										),
								}),
							),
					onSome: (user) => Effect.succeed(user),
				})

				// Calculate expires in seconds from JWT expiry
				const expiresIn = getJwtExpiry(accessToken) - Math.floor(Date.now() / 1000)

				return {
					accessToken,
					refreshToken: refreshToken!,
					expiresIn,
					user: {
						id: workosUser.id,
						email: workosUser.email,
						firstName: workosUser.firstName || "",
						lastName: workosUser.lastName || "",
					},
				}
			}),
		)
		.handle("refresh", ({ payload }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS
				const { refreshToken } = payload

				const clientId = yield* Config.string("WORKOS_CLIENT_ID")

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

				return {
					accessToken: authResponse.accessToken,
					refreshToken: authResponse.refreshToken!,
					expiresIn,
				}
			}),
		),
)

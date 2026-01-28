import { HttpApiBuilder, HttpServerResponse } from "@effect/platform"
import { getJwtExpiry } from "@hazel/auth"
import { InternalServerError, OAuthCodeExpiredError, UnauthorizedError, withSystemActor } from "@hazel/domain"
import { Config, Effect, Option, Schema } from "effect"
import { HazelApi } from "../api"
import { AuthState, DesktopAuthState, RelativeUrl } from "../lib/schema"
import { UserRepo } from "../repositories/user-repo"
import { WorkOS } from "../services/workos"

export const HttpAuthLive = HttpApiBuilder.group(HazelApi, "auth", (handlers) =>
	handlers
		.handle("login", ({ urlParams }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS

				const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)
				const redirectUri = yield* Config.string("WORKOS_REDIRECT_URI").pipe(Effect.orDie)

				// Validate returnTo is a relative URL (defense in depth)
				const validatedReturnTo = Schema.decodeSync(RelativeUrl)(urlParams.returnTo)
				const state = JSON.stringify(AuthState.make({ returnTo: validatedReturnTo }))

				let workosOrgId: string

				if (urlParams.organizationId) {
					const workosOrg = yield* workos
						.call(async (client) =>
							client.organizations.getOrganizationByExternalId(urlParams.organizationId!),
						)
						.pipe(
							Effect.catchTag("WorkOSApiError", (error) =>
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
							...(urlParams.invitationToken && { invitationToken: urlParams.invitationToken }),
						})
						return authUrl
					})
					.pipe(
						Effect.catchTag("WorkOSApiError", (error) =>
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
		.handle("callback", ({ urlParams }) =>
			Effect.gen(function* () {
				const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

				const code = urlParams.code
				const state = urlParams.state

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
		.handle("logout", ({ urlParams }) =>
			Effect.gen(function* () {
				const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

				// Build the full return URL - redirect to frontend after logout
				const returnTo = urlParams.redirectTo ? `${frontendUrl}${urlParams.redirectTo}` : frontendUrl

				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: returnTo,
					},
				})
			}),
		)
		.handle("loginDesktop", ({ urlParams }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS

				const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)
				const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

				// Always use web app callback page
				const redirectUri = `${frontendUrl}/auth/desktop-callback`

				// Validate returnTo is a relative URL (defense in depth)
				const validatedReturnTo = Schema.decodeSync(RelativeUrl)(urlParams.returnTo)

				// Build state with desktop connection info
				const stateObj = DesktopAuthState.make({
					returnTo: validatedReturnTo,
					desktopPort: urlParams.desktopPort,
					desktopNonce: urlParams.desktopNonce,
				})
				const state = JSON.stringify(stateObj)

				let workosOrgId: string | undefined

				if (urlParams.organizationId) {
					const workosOrg = yield* workos
						.call(async (client) =>
							client.organizations.getOrganizationByExternalId(urlParams.organizationId!),
						)
						.pipe(Effect.catchTag("WorkOSApiError", () => Effect.succeed(null)))

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
							...(urlParams.invitationToken && { invitationToken: urlParams.invitationToken }),
						})
					})
					.pipe(
						Effect.catchTag("WorkOSApiError", (error) =>
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

				const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)

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
							"WorkOSApiError",
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

				// Ensure user exists in our DB
				const userOption = yield* userRepo.findByExternalId(workosUser.id).pipe(
					Effect.catchTags({
						DatabaseError: (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Failed to query user",
									detail: String(err),
								}),
							),
					}),
					withSystemActor,
				)

				yield* Option.match(userOption, {
					onNone: () =>
						userRepo
							.upsertByExternalId({
								externalId: workosUser.id,
								email: workosUser.email,
								firstName: workosUser.firstName || "",
								lastName: workosUser.lastName || "",
								avatarUrl:
									workosUser.profilePictureUrl ||
									`https://avatar.vercel.sh/${workosUser.id}.svg`,
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
								withSystemActor,
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

				const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)

				// Exchange refresh token for new tokens
				const authResponse = yield* workos
					.call(async (client) => {
						return await client.userManagement.authenticateWithRefreshToken({
							clientId,
							refreshToken,
						})
					})
					.pipe(
						Effect.catchTag("WorkOSApiError", (error) =>
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

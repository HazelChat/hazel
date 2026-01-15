import { HttpApiBuilder, HttpServerResponse } from "@effect/platform"
import { getJwtExpiry } from "@hazel/auth"
import {
	CurrentUser,
	InternalServerError,
	type OrganizationId,
	UnauthorizedError,
	withSystemActor,
} from "@hazel/domain"
import { Config, Effect, Option, Redacted, Schema } from "effect"
import { HazelApi } from "../api"
import { AuthState, DesktopAuthState, RelativeUrl } from "../lib/schema"
import { OrganizationMemberRepo } from "../repositories/organization-member-repo"
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
				const workos = yield* WorkOS
				const userRepo = yield* UserRepo

				const code = urlParams.code
				const state = AuthState.make(JSON.parse(urlParams.state))

				if (!code) {
					return yield* Effect.fail(
						new UnauthorizedError({
							message: "Missing authorization code",
							detail: "The authorization code was not provided in the callback",
						}),
					)
				}

				// Get required configuration
				const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)
				const cookiePassword = yield* Config.string("WORKOS_COOKIE_PASSWORD").pipe(Effect.orDie)
				const cookieDomain = yield* Config.string("WORKOS_COOKIE_DOMAIN").pipe(Effect.orDie)

				// Exchange code for user information using WorkOS SDK
				const authResponse = yield* workos
					.call(async (client) => {
						return await client.userManagement.authenticateWithCode({
							clientId,
							code,
							session: {
								sealSession: true,
								cookiePassword: cookiePassword,
							},
						})
					})
					.pipe(
						Effect.catchTag("WorkOSApiError", (error) =>
							Effect.fail(
								new UnauthorizedError({
									message: "Failed to authenticate with WorkOS",
									detail: String(error.cause),
								}),
							),
						),
					)

				const { user: workosUser } = authResponse

				// Find existing user or create if first login
				// Using find-or-create pattern to avoid overwriting data set by webhooks
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

				// If auth response includes an organization context, ensure membership exists
				// This handles cases where webhooks are slow to create the membership
				if (authResponse.organizationId) {
					const orgMemberRepo = yield* OrganizationMemberRepo

					// Fetch the internal user (just upserted above)
					const user = yield* userRepo.findByExternalId(workosUser.id).pipe(
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

					// Fetch org by WorkOS org ID to get our internal org ID
					const workosOrg = yield* workos
						.call((client) => client.organizations.getOrganization(authResponse.organizationId!))
						.pipe(Effect.catchAll(() => Effect.succeed(null)))

					if (workosOrg?.externalId && Option.isSome(user)) {
						const orgId = workosOrg.externalId as OrganizationId

						// Check if membership already exists - if so, skip creation
						const existingMembership = yield* orgMemberRepo
							.findByOrgAndUser(orgId, user.value.id)
							.pipe(
								Effect.catchTags({
									DatabaseError: (err) =>
										Effect.fail(
											new InternalServerError({
												message: "Failed to query organization membership",
												detail: String(err),
											}),
										),
								}),
								withSystemActor,
							)

						if (Option.isNone(existingMembership)) {
							// Membership doesn't exist - fetch role from WorkOS and create it
							const workosMembership = yield* workos
								.call((client) =>
									client.userManagement.listOrganizationMemberships({
										organizationId: authResponse.organizationId!,
										userId: workosUser.id,
									}),
								)
								.pipe(Effect.catchAll(() => Effect.succeed(null)))

							const role = (workosMembership?.data?.[0]?.role?.slug || "member") as
								| "admin"
								| "member"
								| "owner"

							// Create the membership (only runs if it doesn't exist)
							yield* orgMemberRepo
								.upsertByOrgAndUser({
									organizationId: orgId,
									userId: user.value.id,
									role,
									nickname: null,
									joinedAt: new Date(),
									invitedBy: null,
									deletedAt: null,
								})
								.pipe(
									Effect.catchTags({
										DatabaseError: (err) =>
											Effect.fail(
												new InternalServerError({
													message: "Failed to create organization membership",
													detail: String(err),
												}),
											),
									}),
									withSystemActor,
								)
						}
					}
				}

				const isSecure = true // Always use secure cookies with HTTPS proxy

				yield* HttpApiBuilder.securitySetCookie(
					CurrentUser.Cookie,
					Redacted.make(authResponse.sealedSession!),
					{
						secure: isSecure,
						sameSite: "none", // Allow cross-port cookies for localhost dev
						domain: cookieDomain,
						path: "/",
					},
				)

				const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: `${frontendUrl}${state.returnTo}`,
					},
				})
			}),
		)
		.handle("logout", ({ urlParams }) =>
			Effect.gen(function* () {
				const workos = yield* WorkOS
				const cookieDomain = yield* Config.string("WORKOS_COOKIE_DOMAIN").pipe(Effect.orDie)
				const frontendUrl = yield* Config.string("FRONTEND_URL").pipe(Effect.orDie)

				// Try to get WorkOS logout URL, fall back to frontend if session is invalid
				const logoutUrl = yield* workos.getLogoutUrl().pipe(
					Effect.catchAll(() => {
						// Session is invalid/expired - redirect to frontend instead
						const fallbackUrl = urlParams.redirectTo
							? `${frontendUrl}${urlParams.redirectTo}`
							: frontendUrl
						return Effect.succeed(fallbackUrl)
					}),
				)

				// Always clear the cookie
				yield* HttpApiBuilder.securitySetCookie(CurrentUser.Cookie, Redacted.make(""), {
					secure: true,
					sameSite: "none",
					domain: cookieDomain,
					path: "/",
					maxAge: 0,
				})

				return HttpServerResponse.empty({
					status: 302,
					headers: {
						Location: logoutUrl,
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
						.pipe(Effect.catchAll(() => Effect.succeed(null)))

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
						Effect.catchTag("WorkOSApiError", (error) =>
							Effect.fail(
								new UnauthorizedError({
									message: "Failed to authenticate with WorkOS",
									detail: String(error.cause),
								}),
							),
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

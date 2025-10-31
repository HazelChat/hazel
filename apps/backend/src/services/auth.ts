import { HttpApiBuilder } from "@effect/platform"
import { CurrentUser, type OrganizationId, UnauthorizedError, withSystemActor } from "@hazel/effect-lib"
import { Config, Effect, Layer, Option, Redacted } from "effect"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { UserRepo } from "../repositories/user-repo"
import { WorkOS } from "./workos"

export const AuthorizationLive = Layer.effect(
	CurrentUser.Authorization,
	Effect.gen(function* () {
		yield* Effect.log("Initializing Authorization middleware...")

		const userRepo = yield* UserRepo
		const workos = yield* WorkOS

		const workOsCookiePassword = yield* Config.string("WORKOS_COOKIE_PASSWORD").pipe(Effect.orDie)
		const cookieDomain = yield* Config.string("WORKOS_COOKIE_DOMAIN").pipe(Effect.orDie)

		const clearInvalidCookie = () =>
			HttpApiBuilder.securitySetCookie(CurrentUser.Cookie, Redacted.make(""), {
				secure: Bun.env.NODE_ENV === "production",
				sameSite: "lax",
				domain: cookieDomain,
				path: "/",
				maxAge: 0,
			})

		return {
			cookie: (cookie) =>
				Effect.gen(function* () {
					yield* Effect.log("checking cookie")
					const res = yield* workos
						.call(async (client) =>
							client.userManagement.loadSealedSession({
								sessionData: Redacted.value(cookie),
								cookiePassword: workOsCookiePassword,
							}),
						)
						.pipe(
							Effect.catchTag("WorkOSApiError", (error) =>
								Effect.gen(function* () {
									yield* clearInvalidCookie()
									return yield* Effect.fail(
										new UnauthorizedError({
											message: "Failed to get session from cookie",
											detail: String(error.cause),
										}),
									)
								}),
							),
						)

					const session = yield* Effect.tryPromise(() => res.authenticate()).pipe(
						Effect.tapError((error) => Effect.log("authenticate error", error)),
						Effect.catchTag("UnknownException", (error) =>
							Effect.gen(function* () {
								yield* clearInvalidCookie()
								return yield* Effect.fail(
									new UnauthorizedError({
										message: "Failed to call authenticate on sealed session",
										detail: String(error.cause),
									}),
								)
							}),
						),
					)

					if (session.authenticated) {
						const userOption = yield* userRepo
							.findByExternalId(session.user.id)
							.pipe(Effect.orDie, withSystemActor)

						const user = yield* Option.match(userOption, {
							onNone: () =>
								userRepo
									.upsertByExternalId({
										externalId: session.user.id,
										email: session.user.email,
										firstName: session.user.firstName || "",
										lastName: session.user.lastName || "",
										avatarUrl: session.user.profilePictureUrl || "",
										status: "online" as const,
										lastSeen: new Date(),
										settings: null,
										deletedAt: null,
									})
									.pipe(Effect.orDie, withSystemActor),
							onSome: (user) => Effect.succeed(user),
						})

						return new CurrentUser.Schema({
							id: user.id,
							role: (session.role as "admin" | "member") || "member",
							organizationId: session.organizationId as OrganizationId | undefined,
							avatarUrl: user.avatarUrl,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
						})
					}

					if (!session.authenticated && session.reason === "no_session_cookie_provided") {
						yield* clearInvalidCookie()
						return yield* Effect.fail(
							new UnauthorizedError({
								message: "Failed to authenticate session",
								detail: "The session was not authenticated",
							}),
						)
					}

					const refreshedSession = yield* Effect.tryPromise(() => res.refresh()).pipe(
						Effect.tapError((error) => Effect.log("refresh error", error)),
						Effect.catchTag("UnknownException", (error) =>
							Effect.gen(function* () {
								yield* clearInvalidCookie()
								return yield* Effect.fail(
									new UnauthorizedError({
										message: "Failed to call refresh on sealed session",
										detail: String(error.cause),
									}),
								)
							}),
						),
					)

					if (!refreshedSession.authenticated) {
						return yield* Effect.fail(
							new UnauthorizedError({
								message: "Failed to refresh session",
								detail: "The session was not refreshed",
							}),
						)
					}

					yield* HttpApiBuilder.securitySetCookie(
						CurrentUser.Cookie,
						Redacted.make(refreshedSession.sealedSession!),
						{
							secure: Bun.env.NODE_ENV === "production",
							sameSite: "lax",
							domain: cookieDomain,
							path: "/",
						},
					)

					const userOption = yield* userRepo
						.findByExternalId(refreshedSession.user.id)
						.pipe(Effect.orDie, withSystemActor)

					const user = yield* Option.match(userOption, {
						onNone: () =>
							userRepo
								.upsertByExternalId({
									externalId: refreshedSession.user.id,
									email: refreshedSession.user.email,
									firstName: refreshedSession.user.firstName || "",
									lastName: refreshedSession.user.lastName || "",
									avatarUrl: refreshedSession.user.profilePictureUrl || "",
									status: "online" as const,
									lastSeen: new Date(),
									settings: null,
									deletedAt: null,
								})
								.pipe(Effect.orDie, withSystemActor),
						onSome: (user) => Effect.succeed(user),
					})

					return new CurrentUser.Schema({
						id: user.id,
						role: (refreshedSession.role as "admin" | "member") || "member",
						organizationId: refreshedSession.organizationId as OrganizationId | undefined,
						avatarUrl: user.avatarUrl,
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
					})
				}),
			bearer: (bearerToken) =>
				Effect.gen(function* () {
					yield* Effect.log("checking bearer token", Redacted.value(bearerToken))
					const rawToken = Redacted.value(bearerToken)
					const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)

					const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))

					const { payload } = yield* Effect.tryPromise({
						try: () =>
							jwtVerify(rawToken, jwks, {
								issuer: "https://api.workos.com",
							}),
						catch: (error) => {
							console.error("JWT verification failed", error)
							return new UnauthorizedError({
								message: `Invalid token: ${error}`,
								detail: `The provided token ${rawToken} is invalid`,
							})
						},
					})

					yield* Effect.annotateCurrentSpan("workosId", payload.sub)

					const workOsUserId = payload.sub
					if (!workOsUserId) {
						return yield* Effect.fail(
							new UnauthorizedError({
								message: "Token missing user ID",
								detail: `The provided token ${rawToken} is missing the user ID`,
							}),
						)
					}

					const userOption = yield* userRepo
						.findByExternalId(workOsUserId)
						.pipe(Effect.orDie, withSystemActor)

					const user = yield* Option.match(userOption, {
						onNone: () =>
							Effect.gen(function* () {
								const workosUser = yield* workos
									.call(async (client) => client.userManagement.getUser(workOsUserId))
									.pipe(
										Effect.catchTag("WorkOSApiError", (error) =>
											Effect.fail(
												new UnauthorizedError({
													message: "Failed to fetch user from WorkOS",
													detail: String(error.cause),
												}),
											),
										),
									)

								return yield* userRepo
									.upsertByExternalId({
										externalId: workosUser.id,
										email: workosUser.email,
										firstName: workosUser.firstName || "",
										lastName: workosUser.lastName || "",
										avatarUrl: workosUser.profilePictureUrl || "",
										status: "online" as const,
										lastSeen: new Date(),
										settings: null,
										deletedAt: null,
									})
									.pipe(Effect.orDie, withSystemActor)
							}),
						onSome: (user) => Effect.succeed(user),
					})

					yield* Effect.annotateCurrentSpan("userId", user.id)

					return new CurrentUser.Schema({
						id: user.id,
						role: (payload.role as "admin" | "member") || "member",
						organizationId: payload.organizationId as OrganizationId | undefined,
						avatarUrl: user.avatarUrl,
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
					})
				}),
		}
	}),
)

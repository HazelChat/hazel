import { HttpApiBuilder } from "@effect/platform"
import { CurrentUser } from "@hazel/domain"
import { Config, Effect, Layer, Redacted } from "effect"
import { SessionManager } from "./session-manager"

export const AuthorizationLive = Layer.effect(
	CurrentUser.Authorization,
	Effect.gen(function* () {
		yield* Effect.log("Initializing Authorization middleware...")

		const sessionManager = yield* SessionManager

		const workOsCookiePassword = yield* Config.string("WORKOS_COOKIE_PASSWORD").pipe(Effect.orDie)
		const cookieDomain = yield* Config.string("WORKOS_COOKIE_DOMAIN").pipe(Effect.orDie)

		return {
			cookie: (cookie) =>
				Effect.gen(function* () {
					yield* Effect.log("checking cookie")

					// Use SessionManager to handle authentication and refresh logic
					const result = yield* sessionManager.authenticateWithCookie(
						Redacted.value(cookie),
						workOsCookiePassword,
					)

					// If a new session was created via refresh, update the cookie
					if (result.refreshedSession) {
						yield* HttpApiBuilder.securitySetCookie(
							CurrentUser.Cookie,
							Redacted.make(result.refreshedSession),
							{
								secure: Bun.env.NODE_ENV === "production",
								sameSite: "lax",
								domain: cookieDomain,
								path: "/",
							},
						)
					}

					return result.currentUser
				}),
			bearer: (bearerToken) =>
				Effect.gen(function* () {
					yield* Effect.log("checking bearer token")

					// Use SessionManager to handle bearer token authentication
					return yield* sessionManager.authenticateWithBearer(Redacted.value(bearerToken))
				}),
		}
	}),
)

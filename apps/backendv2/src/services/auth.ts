import { UserId } from "@hazel/db/schema"
import { randomUUIDv7 } from "bun"
import { Config, Effect, Layer, Option, Redacted } from "effect"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { Authorization, User } from "../lib/auth"
import { UnauthorizedError } from "../lib/errors"
import { UserRepo } from "../repositories/user-repo"

export const AuthorizationLive = Layer.effect(
	Authorization,
	Effect.gen(function* () {
		const userRepo = yield* UserRepo
		yield* Effect.log("Initializing Authorization middleware...")

		return {
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
							})
						},
					})

					yield* Effect.annotateCurrentSpan("workosId", payload.sub)

					const workOsUserId = payload.sub
					if (!workOsUserId) {
						return yield* Effect.fail(
							new UnauthorizedError({
								message: "Token missing user ID",
							}),
						)
					}

					const user = yield* userRepo.findByExternalId(workOsUserId).pipe(Effect.orDie)

					if (Option.isNone(user)) {
						return yield* Effect.fail(
							new UnauthorizedError({
								message: "User not found",
							}),
						)
					}

					yield* Effect.annotateCurrentSpan("userId", user.value.id)

					return new User({ id: user.value.id, role: payload.role as "admin" | "member" })
				}),
		}
	}),
)

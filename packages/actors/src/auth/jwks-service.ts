import { Effect, Option, Ref } from "effect"
import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose"
import { TokenValidationConfigService } from "./config-service"
import { ConfigError } from "./errors"

/**
 * Service for managing JWKS (JSON Web Key Set) for JWT validation.
 *
 * The keyset is created lazily the first time JWT validation is requested.
 */
export class JwksService extends Effect.Service<JwksService>()("JwksService", {
	accessors: true,
	dependencies: [TokenValidationConfigService.Default],
	effect: Effect.gen(function* () {
		const config = yield* TokenValidationConfigService
		const jwksRef = yield* Ref.make<Option.Option<JWTVerifyGetKey>>(Option.none())

		const getJwks = Effect.fn("JwksService.getJwks")(function* () {
			const cached = yield* Ref.get(jwksRef)
			if (Option.isSome(cached)) {
				return cached.value
			}

			if (!config.workosClientId) {
				return yield* Effect.fail(
					new ConfigError({
						message:
							"WORKOS_CLIENT_ID environment variable is required for JWT actor authentication",
					}),
				)
			}

			const jwks = createRemoteJWKSet(
				new URL(`https://api.workos.com/sso/jwks/${config.workosClientId}`),
			)
			yield* Ref.set(jwksRef, Option.some(jwks))
			return jwks
		})

		return {
			getJwks,
		}
	}),
}) {}

import { ServiceMap, Effect, Layer, Option, Ref } from "effect"
import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose"
import { TokenValidationConfigService } from "./config-service"
import { ConfigError } from "./errors"

/**
 * Service for managing JWKS (JSON Web Key Set) for JWT validation.
 *
 * The keyset is created lazily the first time JWT validation is requested.
 */
export class JwksService extends ServiceMap.Service<JwksService>()("JwksService", {
	make: Effect.gen(function* () {
		const config = yield* TokenValidationConfigService
		const jwksRef = yield* Ref.make<Option.Option<JWTVerifyGetKey>>(Option.none())

		const getJwks = Effect.fn("JwksService.getJwks")(function* () {
			const cached = yield* Ref.get(jwksRef)
			if (Option.isSome(cached)) {
				return cached.value
			}

			const clientId = yield* Option.match(config.workosClientId, {
				onNone: () =>
					Effect.fail(
						new ConfigError({
							message:
								"WORKOS_CLIENT_ID environment variable is required for JWT actor authentication",
						}),
					),
				onSome: Effect.succeed,
			})

			const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))
			yield* Ref.set(jwksRef, Option.some(jwks))
			return jwks
		})

		return {
			getJwks,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(TokenValidationConfigService.layer),
	)
}

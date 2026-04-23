import { ServiceMap, Config, Effect, Layer, Option, Redacted } from "effect"

/**
 * Configuration required for token validation.
 */
export interface TokenValidationConfig {
	/** Clerk secret key for JWT validation (sk_live_* / sk_test_*). */
	readonly clerkSecretKey: Option.Option<Redacted.Redacted>
	/** Backend URL for bot token validation. */
	readonly backendUrl: Option.Option<string>
	/** Internal secret for server-to-server auth (optional). */
	readonly internalSecret: Option.Option<Redacted.Redacted>
}

const optionalValue = <A, E>(effect: Effect.Effect<A, E, never>) => effect.pipe(Effect.option)

export class TokenValidationConfigService extends ServiceMap.Service<TokenValidationConfigService>()(
	"TokenValidationConfigService",
	{
		make: Effect.gen(function* () {
			const clerkSecretKey = yield* optionalValue(Config.redacted("CLERK_SECRET_KEY").asEffect())

			const backendUrl = yield* optionalValue(
				Config.string("BACKEND_URL")
					.pipe(
						Config.orElse(() => Config.string("API_BASE_URL")),
						Config.orElse(() => Config.string("VITE_BACKEND_URL")),
						Config.orElse(() => Config.string("VITE_API_BASE_URL")),
					)
					.asEffect(),
			)

			const internalSecret = yield* optionalValue(Config.redacted("INTERNAL_SECRET").asEffect())

			const config: TokenValidationConfig = {
				clerkSecretKey: clerkSecretKey as Option.Option<Redacted.Redacted>,
				backendUrl: backendUrl as Option.Option<string>,
				internalSecret: internalSecret as Option.Option<Redacted.Redacted>,
			}

			return config
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make)
}

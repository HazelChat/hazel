import { Config, Effect, Option } from "effect"

/**
 * Configuration required for token validation
 */
export interface TokenValidationConfig {
	/** WorkOS client ID for JWT validation */
	readonly workosClientId: string | undefined
	/** Backend URL for bot token validation */
	readonly backendUrl: string | undefined
	/** Internal secret for server-to-server auth (optional) */
	readonly internalSecret: string | undefined
}

const optionalValue = (effect: Effect.Effect<string, any, never>) =>
	effect.pipe(
		Effect.option,
		Effect.map(
			Option.match({
				onNone: () => undefined,
				onSome: (value) => value,
			}),
		),
	)

/**
 * Service for loading and providing token validation configuration.
 *
 * Uses Effect.Config to load from environment variables with proper fallbacks.
 */
export class TokenValidationConfigService extends Effect.Service<TokenValidationConfigService>()(
	"TokenValidationConfigService",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const workosClientId = yield* optionalValue(Config.string("WORKOS_CLIENT_ID"))

			const backendUrl = yield* optionalValue(
				Config.string("BACKEND_URL").pipe(
					Effect.orElse(() => Config.string("API_BASE_URL")),
					Effect.orElse(() => Config.string("VITE_BACKEND_URL")),
					Effect.orElse(() => Config.string("VITE_API_BASE_URL")),
				),
			)

			const internalSecret = yield* optionalValue(Config.string("INTERNAL_SECRET"))

			const config: TokenValidationConfig = {
				workosClientId,
				backendUrl,
				internalSecret,
			}

			return config
		}),
	},
) {}

import { Config, Effect } from "effect"

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
			// Load WorkOS client ID (optional; only needed for JWT validation)
			const workosClientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(
				Effect.option,
				Effect.map((opt) => (opt._tag === "Some" ? opt.value : undefined)),
			)

			// Load backend URL with fallbacks (optional; only needed for bot token validation)
			const backendUrl = yield* Config.string("BACKEND_URL").pipe(
				Effect.orElse(() => Config.string("API_BASE_URL")),
				Effect.orElse(() => Config.string("VITE_BACKEND_URL")),
				Effect.orElse(() => Config.string("VITE_API_BASE_URL")),
				Effect.option,
				Effect.map((opt) => (opt._tag === "Some" ? opt.value : undefined)),
			)

			// Load internal secret (optional)
			const internalSecret = yield* Config.string("INTERNAL_SECRET").pipe(
				Effect.option,
				Effect.map((opt) => (opt._tag === "Some" ? opt.value : undefined)),
			)

			const config: TokenValidationConfig = {
				workosClientId,
				backendUrl,
				internalSecret,
			}

			return config
		}),
	},
) {}

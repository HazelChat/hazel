import type { WorkOSClientId } from "@hazel/schema"
import { ServiceMap, Config, Effect, Option, Redacted, Schema } from "effect"
import { WorkOSClientId as WorkOSClientIdSchema } from "@hazel/schema"

/**
 * Configuration required for token validation
 */
export interface TokenValidationConfig {
	/** WorkOS client ID for JWT validation */
	readonly workosClientId: Option.Option<WorkOSClientId>
	/** Backend URL for bot token validation */
	readonly backendUrl: Option.Option<string>
	/** Internal secret for server-to-server auth (optional) */
	readonly internalSecret: Option.Option<Redacted.Redacted>
}

const optionalValue = <A>(effect: Effect.Effect<A, any, never>) => effect.pipe(Effect.option)

/**
 * Service for loading and providing token validation configuration.
 *
 * Uses Effect.Config to load from environment variables with proper fallbacks.
 */
export class TokenValidationConfigService extends ServiceMap.Service<TokenValidationConfigService>()(
	"TokenValidationConfigService",
	{
		effect: Effect.gen(function* () {
			const workosClientId = yield* optionalValue(
				Config.string("WORKOS_CLIENT_ID").pipe(
					Effect.flatMap((value) => Schema.decodeUnknown(WorkOSClientIdSchema)(value)),
				),
			)

			const backendUrl = yield* optionalValue(
				Config.string("BACKEND_URL").pipe(
					Effect.orElse(() => Config.string("API_BASE_URL")),
					Effect.orElse(() => Config.string("VITE_BACKEND_URL")),
					Effect.orElse(() => Config.string("VITE_API_BASE_URL")),
				),
			)

			const internalSecret = yield* optionalValue(Config.redacted("INTERNAL_SECRET"))

			const config: TokenValidationConfig = {
				workosClientId,
				backendUrl,
				internalSecret,
			}

			return config
		}),
	},
) {}

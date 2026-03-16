import type { WorkOSClientId } from "@hazel/schema"
import { ServiceMap, Config, Effect, Layer, Option, Redacted, Schema } from "effect"
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

const optionalValue = <A, E>(effect: Effect.Effect<A, E, never>) => effect.pipe(Effect.option)

/**
 * Service for loading and providing token validation configuration.
 *
 * Uses Effect.Config to load from environment variables with proper fallbacks.
 */
export class TokenValidationConfigService extends ServiceMap.Service<TokenValidationConfigService>()(
	"TokenValidationConfigService",
	{
		make: Effect.gen(function* () {
			const workosClientId = yield* optionalValue(
				Effect.flatMap(Config.string("WORKOS_CLIENT_ID").asEffect(), (value) =>
					Schema.decodeUnknownEffect(WorkOSClientIdSchema)(value),
				),
			)

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
				workosClientId: workosClientId as Option.Option<WorkOSClientId>,
				backendUrl: backendUrl as Option.Option<string>,
				internalSecret: internalSecret as Option.Option<Redacted.Redacted>,
			}

			return config
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make)
}

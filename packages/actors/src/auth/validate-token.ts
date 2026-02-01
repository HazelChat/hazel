import { FetchHttpClient } from "@effect/platform"
import { Effect, Layer } from "effect"
import { TokenValidationConfigService, type TokenValidationConfig } from "./config-service"
import { ConfigError } from "./errors"
import { JwksService } from "./jwks-service"
import { TokenValidationLive, TokenValidationService } from "./token-validation-service"
import type { AuthenticatedClient } from "./types"

/**
 * Load token validation config from environment variables.
 * Throws if required variables are missing.
 *
 * @deprecated Use TokenValidationConfigService.Default instead for Effect-based code
 */
export function loadConfigFromEnv(): TokenValidationConfig {
	const workosClientId = process.env.WORKOS_CLIENT_ID
	// Check multiple env var names for backend URL
	const backendUrl =
		process.env.BACKEND_URL ||
		process.env.API_BASE_URL ||
		process.env.VITE_BACKEND_URL ||
		process.env.VITE_API_BASE_URL

	if (!workosClientId) {
		throw new Error("WORKOS_CLIENT_ID environment variable is required for actor authentication")
	}
	if (!backendUrl) {
		throw new Error(
			"BACKEND_URL or API_BASE_URL environment variable is required for actor authentication",
		)
	}

	return {
		workosClientId,
		backendUrl,
		internalSecret: process.env.INTERNAL_SECRET,
	}
}

// Cached config loaded from environment
let cachedConfig: TokenValidationConfig | null = null

/**
 * Get or load the token validation config from environment.
 *
 * @deprecated Use TokenValidationConfigService.Default instead for Effect-based code
 */
export function getConfig(): TokenValidationConfig {
	if (!cachedConfig) {
		cachedConfig = loadConfigFromEnv()
	}
	return cachedConfig
}

/**
 * Full layer with all dependencies for token validation.
 * Includes HttpClient for bot token validation.
 */
const FullTokenValidationLayer = Layer.mergeAll(TokenValidationLive, FetchHttpClient.layer)

/**
 * Validate a token (JWT or bot token) and return the authenticated client identity.
 *
 * This is the Promise-based API for backwards compatibility.
 * For new Effect-based code, use TokenValidationService.validateToken directly.
 *
 * @param token - The token to validate (JWT or hzl_bot_xxxxx)
 * @param _config - Deprecated: config is now loaded from environment via Effect.Config
 * @returns AuthenticatedClient with user/bot identity
 * @throws Error if token is invalid or missing
 *
 * @deprecated For new code, use TokenValidationService.validateToken with proper Effect patterns
 */
export async function validateToken(
	token: string,
	_config?: TokenValidationConfig,
): Promise<AuthenticatedClient> {
	const program = Effect.gen(function* () {
		const service = yield* TokenValidationService
		return yield* service.validateToken(token)
	}).pipe(
		Effect.provide(FullTokenValidationLayer),
		Effect.catchTags({
			ConfigError: (e) => Effect.die(new Error(e.message)),
			InvalidTokenFormatError: (e) => Effect.die(new Error(e.message)),
			JwtValidationError: (e) => Effect.die(new Error(e.message)),
			BotTokenValidationError: (e) => Effect.die(new Error(e.message)),
		}),
		Effect.scoped,
	)

	return Effect.runPromise(program)
}

// Re-export config type for backwards compatibility
export type { TokenValidationConfig } from "./config-service"

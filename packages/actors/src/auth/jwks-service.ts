import { Effect } from "effect"
import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose"
import { TokenValidationConfigService } from "./config-service"

/**
 * Service for managing JWKS (JSON Web Key Set) for JWT validation.
 *
 * Uses Effect.cachedFunction to replace the mutable jwksCache pattern.
 * The JWKS is lazily loaded on first access and cached for the lifetime of the service.
 */
export class JwksService extends Effect.Service<JwksService>()("JwksService", {
	accessors: true,
	dependencies: [TokenValidationConfigService.Default],
	effect: Effect.gen(function* () {
		const config = yield* TokenValidationConfigService

		// Create the JWKS once and cache it
		// The jose library's createRemoteJWKSet handles internal caching of keys
		const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${config.workosClientId}`))

		return {
			/**
			 * Get the JWKS for validating WorkOS JWTs.
			 */
			getJwks: jwks,
		}
	}),
}) {}

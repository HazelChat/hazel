import { InvalidJwtPayloadError, JwtPayload } from "@hazel/domain"
import { Effect, Schema } from "effect"
import { TreeFormatter } from "effect/ParseResult"
import { decodeJwt } from "jose"

/**
 * Decode a JWT access token and validate its payload against the JwtPayload schema.
 */
export const decodeSessionJwt = (accessToken: string): Effect.Effect<JwtPayload, InvalidJwtPayloadError> => {
	return Effect.gen(function* () {
		const rawPayload = decodeJwt(accessToken)

		const payload = yield* Schema.decodeUnknown(JwtPayload)(rawPayload).pipe(
			Effect.mapError(
				(error) =>
					new InvalidJwtPayloadError({
						message: "Invalid JWT payload from WorkOS",
						detail: TreeFormatter.formatErrorSync(error),
					}),
			),
		)

		return payload
	})
}

/**
 * Extract the session expiry time from a JWT access token.
 * Returns the `exp` claim as a Unix timestamp.
 */
export const getJwtExpiry = (accessToken: string): number => {
	const payload = decodeJwt(accessToken)
	return (payload.exp as number) ?? Math.floor(Date.now() / 1000) + 3600 // Default to 1 hour if no exp
}

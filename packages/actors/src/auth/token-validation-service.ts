import { HttpClient, HttpClientRequest } from "effect/unstable/http"
import { WorkOSJwtClaims, WorkOSRole } from "@hazel/schema"
import { ServiceMap, Either, Effect, Option, Redacted, Schema } from "effect"
import { TreeFormatter } from "effect/ParseResult"
import type { JWTPayload } from "jose"
import { jwtVerify } from "jose"
import { TokenValidationConfigService } from "./config-service"
import { BotTokenValidationError, ConfigError, InvalidTokenFormatError, JwtValidationError } from "./errors"
import { JwksService } from "./jwks-service"
import {
	BotTokenValidationResponseSchema,
	type AuthenticatedClient,
	type BotClient,
	type UserClient,
} from "./types"

interface JWTPayloadWithClaims extends JWTPayload {
	org_id?: string
	role?: string
}

/**
 * Check if a token looks like a JWT (three base64url-encoded segments)
 */
function isJwtToken(token: string): boolean {
	const parts = token.split(".")
	return parts.length === 3 && parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))
}

/**
 * Check if a token is a bot token (hzl_bot_xxxxx format)
 */
function isBotToken(token: string): boolean {
	return token.startsWith("hzl_bot_")
}

/**
 * Service for validating authentication tokens (JWT and bot tokens).
 *
 * Provides Effect-native token validation with proper error types.
 */
export class TokenValidationService extends ServiceMap.Service<TokenValidationService>()(
	"TokenValidationService",
	{
		dependencies: [TokenValidationConfigService.Default, JwksService.Default],
		effect: Effect.gen(function* () {
			const config = yield* TokenValidationConfigService
			const jwksService = yield* JwksService
			const decodeClaims = Schema.decodeUnknown(WorkOSJwtClaims)
			const decodeBotValidationResponse = Schema.decodeUnknown(BotTokenValidationResponseSchema)

			/**
			 * Validate a WorkOS JWT token.
			 * Verifies the signature against WorkOS JWKS and extracts user identity.
			 */
			const validateJwt = (
				token: string,
			): Effect.Effect<UserClient, JwtValidationError | ConfigError> =>
				Effect.gen(function* () {
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

					const jwks = yield* jwksService.getJwks()

					// WorkOS can issue tokens with either issuer format
					const issuers = [
						"https://api.workos.com",
						`https://api.workos.com/user_management/${clientId}`,
					]

					const verifiedPayload = yield* Effect.forEach(
						issuers,
						(issuer) =>
							Effect.tryPromise(() => jwtVerify(token, jwks, { issuer })).pipe(
								Effect.map((result) => result.payload as JWTPayloadWithClaims),
								Effect.either,
							),
						{ concurrency: 1 },
					).pipe(
						Effect.flatMap((results) => {
							const success = results.find(Either.isRight)
							if (success) {
								return Effect.succeed(success.right)
							}

							return Effect.fail(
								new JwtValidationError({
									message: "Invalid or expired token",
									cause: results.map((result) =>
										Either.isLeft(result) ? result.left : null,
									),
								}),
							)
						}),
					)

					const claims = yield* decodeClaims(verifiedPayload).pipe(
						Effect.mapError(
							(error) =>
								new JwtValidationError({
									message: "Invalid JWT claims",
									cause: TreeFormatter.formatErrorSync(error),
								}),
						),
					)

					const role = claims.role ?? Schema.decodeUnknownSync(WorkOSRole)("member")

					return {
						type: "user" as const,
						workosUserId: claims.sub,
						workosOrganizationId: claims.org_id ?? null,
						role,
					}
				})

			/**
			 * Validate a bot token by calling the backend validation endpoint.
			 * Bot tokens are hashed and looked up in the database.
			 */
			const validateBotToken = (
				token: string,
			): Effect.Effect<BotClient, BotTokenValidationError | ConfigError, HttpClient.HttpClient> =>
				Effect.gen(function* () {
					const backendUrl = yield* Option.match(config.backendUrl, {
						onNone: () =>
							Effect.fail(
								new ConfigError({
									message:
										"BACKEND_URL or API_BASE_URL environment variable is required for bot token actor authentication",
								}),
							),
						onSome: Effect.succeed,
					})

					const httpClient = yield* HttpClient.HttpClient

					const requestBase = HttpClientRequest.post(
						`${backendUrl}/internal/actors/validate-bot-token`,
					).pipe(
						HttpClientRequest.setHeader("Content-Type", "application/json"),
						HttpClientRequest.bodyUnsafeJson({ token }),
					)
					const request = Option.match(config.internalSecret, {
						onNone: () => requestBase,
						onSome: (secret) =>
							requestBase.pipe(
								HttpClientRequest.setHeader("X-Internal-Secret", Redacted.value(secret)),
							),
					})

					const response = yield* httpClient.execute(request).pipe(
						Effect.catchTag("RequestError", (err) =>
							Effect.fail(
								new BotTokenValidationError({
									message: `Failed to validate bot token: ${err.message}`,
								}),
							),
						),
						Effect.catchTag("ResponseError", (err) =>
							Effect.fail(
								new BotTokenValidationError({
									message: `Failed to get response: ${err.message}`,
								}),
							),
						),
					)

					if (response.status >= 400) {
						const errorText = yield* response.text.pipe(
							Effect.catch(() => Effect.succeed("Unknown error")),
						)

						return yield* Effect.fail(
							new BotTokenValidationError({
								message: `Invalid bot token: ${errorText}`,
								statusCode: response.status,
							}),
						)
					}

					const rawData = yield* response.json.pipe(
						Effect.catchTag("ResponseError", (err) =>
							Effect.fail(
								new BotTokenValidationError({
									message: `Failed to parse bot token response: ${err.message}`,
								}),
							),
						),
					)
					const data = yield* decodeBotValidationResponse(rawData).pipe(
						Effect.mapError(
							(error) =>
								new BotTokenValidationError({
									message: `Failed to decode bot token response: ${TreeFormatter.formatErrorSync(error)}`,
								}),
						),
					)

					return {
						type: "bot" as const,
						userId: data.userId,
						botId: data.botId,
						organizationId: data.organizationId,
						scopes: data.scopes,
					}
				})

			/**
			 * Validate a token (JWT or bot token) and return the authenticated client identity.
			 */
			const validateToken = (
				token: string,
			): Effect.Effect<
				AuthenticatedClient,
				InvalidTokenFormatError | JwtValidationError | BotTokenValidationError | ConfigError,
				HttpClient.HttpClient
			> => {
				if (isBotToken(token)) {
					return validateBotToken(token)
				}

				if (isJwtToken(token)) {
					return validateJwt(token)
				}

				return Effect.fail(new InvalidTokenFormatError({ message: "Invalid token format" }))
			}

			return {
				validateToken,
				validateJwt,
				validateBotToken,
			}
		}),
	},
) {}

/**
 * Live layer for TokenValidationService with all dependencies.
 * Includes FetchHttpClient for bot token validation.
 */
export const TokenValidationLive = TokenValidationService.Default

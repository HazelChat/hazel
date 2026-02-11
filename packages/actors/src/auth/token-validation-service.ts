import { HttpClient, HttpClientRequest } from "@effect/platform"
import type { BotId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"
import type { JWTPayload, JWTVerifyResult } from "jose"
import { jwtVerify } from "jose"
import { TokenValidationConfigService } from "./config-service"
import { BotTokenValidationError, ConfigError, InvalidTokenFormatError, JwtValidationError } from "./errors"
import { JwksService } from "./jwks-service"
import type { AuthenticatedClient, BotClient, BotTokenValidationResponse, UserClient } from "./types"

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
export class TokenValidationService extends Effect.Service<TokenValidationService>()(
	"TokenValidationService",
	{
		accessors: true,
		dependencies: [TokenValidationConfigService.Default, JwksService.Default],
		effect: Effect.gen(function* () {
			const config = yield* TokenValidationConfigService
			const jwksService = yield* JwksService

			/**
			 * Validate a WorkOS JWT token.
			 * Verifies the signature against WorkOS JWKS and extracts user identity.
			 */
			const validateJwt = (
				token: string,
			): Effect.Effect<UserClient, JwtValidationError | ConfigError> =>
				Effect.gen(function* () {
					if (!config.workosClientId) {
						return yield* Effect.fail(
							new ConfigError({
								message:
									"WORKOS_CLIENT_ID environment variable is required for JWT actor authentication",
							}),
						)
					}

					const jwks = jwksService.getJwks

					// WorkOS can issue tokens with either issuer format
					const issuers = [
						"https://api.workos.com",
						`https://api.workos.com/user_management/${config.workosClientId}`,
					]

					let payload: JWTPayloadWithClaims | null = null

					// Try each issuer until one works
					for (const issuer of issuers) {
						const maybeResult = yield* Effect.tryPromise(() =>
							jwtVerify(token, jwks, { issuer }),
						).pipe(
							Effect.map(Option.some),
							Effect.catchAll(() => Effect.succeed(Option.none<JWTVerifyResult>())),
						)
						if (Option.isSome(maybeResult)) {
							payload = maybeResult.value.payload as JWTPayloadWithClaims
							break
						}
					}

					if (!payload) {
						return yield* Effect.fail(
							new JwtValidationError({ message: "Invalid or expired token" }),
						)
					}

					const userId = payload.sub
					if (!userId) {
						return yield* Effect.fail(
							new JwtValidationError({ message: "Token missing user ID" }),
						)
					}

					// Extract org_id if present (WorkOS org ID, not internal UUID)
					const organizationId = payload.org_id as OrganizationId | undefined
					const role = (payload.role as "admin" | "member" | "owner") || "member"

					return {
						type: "user" as const,
						userId: userId as UserId,
						organizationId: organizationId ?? null,
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
					if (!config.backendUrl) {
						return yield* Effect.fail(
							new ConfigError({
								message:
									"BACKEND_URL or API_BASE_URL environment variable is required for bot token actor authentication",
							}),
						)
					}

					const httpClient = yield* HttpClient.HttpClient

					const request = HttpClientRequest.post(
						`${config.backendUrl}/internal/actors/validate-bot-token`,
					).pipe(
						HttpClientRequest.setHeader("Content-Type", "application/json"),
						config.internalSecret
							? HttpClientRequest.setHeader("X-Internal-Secret", config.internalSecret)
							: (req) => req,
						HttpClientRequest.bodyUnsafeJson({ token }),
					)

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
							Effect.catchAll(() => Effect.succeed("Unknown error")),
						)

						return yield* Effect.fail(
							new BotTokenValidationError({
								message: `Invalid bot token: ${errorText}`,
								statusCode: response.status,
							}),
						)
					}

					const data = (yield* response.json.pipe(
						Effect.catchTag("ResponseError", (err) =>
							Effect.fail(
								new BotTokenValidationError({
									message: `Failed to parse bot token response: ${err.message}`,
								}),
							),
						),
					)) as BotTokenValidationResponse

					return {
						type: "bot" as const,
						userId: data.userId as UserId,
						botId: data.botId as BotId,
						organizationId: (data.organizationId as OrganizationId) ?? null,
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

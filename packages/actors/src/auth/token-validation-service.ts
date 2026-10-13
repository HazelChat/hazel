import { AccessTokenVerifier } from "@hazel/auth/access-token"
import { HttpClient, HttpClientRequest } from "effect/http"
import { UserId } from "@hazel/schema"
import { Context, Effect, Layer, Option, Redacted, Schema } from "effect"
import { TokenValidationConfigService } from "./config-service"
import { BotTokenValidationError, ConfigError, InvalidTokenFormatError, JwtValidationError } from "./errors"
import {
	BotTokenValidationResponseSchema,
	type AuthenticatedClient,
	type BotClient,
	type UserClient,
} from "./types"

function isJwtToken(token: string): boolean {
	const parts = token.split(".")
	return parts.length === 3 && parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))
}

function isBotToken(token: string): boolean {
	return token.startsWith("hzl_bot_")
}

/**
 * Service for validating authentication tokens (Hazel access tokens and bot tokens).
 */
export class TokenValidationService extends Context.Service<TokenValidationService>()(
	"TokenValidationService",
	{
		make: Effect.gen(function* () {
			const config = yield* TokenValidationConfigService
			const verifier = yield* AccessTokenVerifier
			const decodeUserId = Schema.decodeUnknownEffect(UserId)
			const decodeBotValidationResponse = Schema.decodeUnknownEffect(BotTokenValidationResponseSchema)

			/** A Hazel access token (`POST /auth/token` on the API), verified against its key set. */
			const validateJwt = (
				token: string,
			): Effect.Effect<UserClient, JwtValidationError | ConfigError> =>
				Effect.gen(function* () {
					const access = yield* verifier.verify(token).pipe(
						Effect.catchTags({
							AccessTokenInvalid: (error) =>
								Effect.fail(
									new JwtValidationError({
										message: `Access token verification failed: ${error.reason}`,
									}),
								),
							AccessTokenUnavailable: (error) =>
								Effect.fail(
									new ConfigError({
										message: `Access token keys unavailable: ${error.reason}`,
									}),
								),
						}),
					)
					const userId = yield* decodeUserId(access.userId).pipe(
						Effect.mapError(
							() =>
								new JwtValidationError({ message: "Access token subject is not a user id" }),
						),
					)
					return { type: "user" as const, userId }
				})

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
						HttpClientRequest.bodyJsonUnsafe({ token }),
					)
					const request = Option.match(config.internalSecret, {
						onNone: () => requestBase,
						onSome: (secret: Redacted.Redacted) =>
							requestBase.pipe(
								HttpClientRequest.setHeader("X-Internal-Secret", Redacted.value(secret)),
							),
					})

					const response = yield* httpClient.execute(request).pipe(
						Effect.catchTag("HttpClientError", (err) =>
							Effect.fail(
								new BotTokenValidationError({
									message: `Failed to validate bot token: ${err.message}`,
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
						Effect.catchTag("HttpClientError", (err) =>
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
									message: `Failed to decode bot token response: ${error.message}`,
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
) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(TokenValidationConfigService.layer),
		Layer.provide(AccessTokenVerifier.layer),
	)
}

export const TokenValidationLive = TokenValidationService.layer

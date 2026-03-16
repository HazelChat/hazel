/**
 * @module Token exchange Effect service for desktop apps
 * @platform desktop
 * @description HTTP client for token exchange using Effect HttpClient with Schema validation
 */

import { FetchHttpClient, HttpBody, HttpClient, HttpClientError, HttpClientRequest } from "effect/unstable/http"
import { OAuthCodeExpiredError, TokenDecodeError, TokenExchangeError } from "@hazel/domain/errors"
import { RefreshTokenResponse, TokenResponse } from "@hazel/domain/http"
import { ServiceMap, Duration, Effect, Layer, Schema } from "effect"

const DEFAULT_TIMEOUT = Duration.seconds(60)

const mapHttpClientError = (context: string) => (error: HttpClientError.HttpClientError) =>
	Effect.fail(
		new TokenExchangeError({
			message:
				error.response?.status === undefined
					? `Network error during ${context}`
					: `Server error during ${context}`,
			detail:
				error.response?.status === undefined
					? String(error)
					: `HTTP ${error.response.status}`,
		}),
	)

export class TokenExchange extends ServiceMap.Service<TokenExchange>()("TokenExchange", {
	make: Effect.gen(function* () {
		const httpClient = yield* HttpClient.HttpClient
		const backendUrl = import.meta.env.VITE_BACKEND_URL

		/**
		 * Create a configured client for auth requests
		 */
		const makeAuthClient = () =>
			httpClient.pipe(
				HttpClient.mapRequest(
					HttpClientRequest.setHeaders({
						"Content-Type": "application/json",
					}),
				),
			)

		return {
			/**
			 * Exchange authorization code for access/refresh tokens
			 */
			exchangeCode: (code: string, state: string) =>
				Effect.gen(function* () {
					const client = makeAuthClient()
					const body = JSON.stringify({ code, state })

					const response = yield* client
						.post(`${backendUrl}/auth/token`, {
							body: HttpBody.text(body, "application/json"),
						})
						.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

					// Handle HTTP errors
					if (response.status >= 400) {
						const errorText = yield* response.text
						// Try to parse the error response to detect specific error types
						try {
							const errorJson = JSON.parse(errorText)
							if (errorJson._tag === "OAuthCodeExpiredError") {
								return yield* Effect.fail(
									new OAuthCodeExpiredError({
										message:
											errorJson.message || "Authorization code expired or already used",
									}),
								)
							}
						} catch {
							// JSON parsing failed, fall through to generic error
						}
						return yield* Effect.fail(
							new TokenExchangeError({
								message: "Failed to exchange code for token",
								detail: `HTTP ${response.status}: ${errorText}`,
							}),
						)
					}

					// Parse and validate response
					const rawJson = yield* response.json
					return yield* Schema.decodeUnknownEffect(TokenResponse)(rawJson).pipe(
						Effect.mapError(
							(parseError) =>
								new TokenDecodeError({
									message: "Invalid token response from server",
									detail: String(parseError),
								}),
						),
					)
				}).pipe(
					Effect.catchTag("TimeoutError", () =>
						Effect.fail(
							new TokenExchangeError({
								message: "Token exchange timed out",
							}),
						),
					),
					Effect.catchIf(HttpClientError.isHttpClientError, mapHttpClientError("token exchange")),
				),

			/**
			 * Refresh tokens using a refresh token
			 */
			refreshToken: (refreshToken: string) =>
				Effect.gen(function* () {
					const client = makeAuthClient()
					const body = JSON.stringify({ refreshToken })

					const response = yield* client
						.post(`${backendUrl}/auth/refresh`, {
							body: HttpBody.text(body, "application/json"),
						})
						.pipe(Effect.scoped, Effect.timeout(DEFAULT_TIMEOUT))

					// Handle HTTP errors
					if (response.status >= 400) {
						const errorText = yield* response.text
						return yield* Effect.fail(
							new TokenExchangeError({
								message: "Failed to refresh token",
								detail: `HTTP ${response.status}: ${errorText}`,
							}),
						)
					}

					// Parse and validate response
					const rawJson = yield* response.json
					return yield* Schema.decodeUnknownEffect(RefreshTokenResponse)(rawJson).pipe(
						Effect.mapError(
							(parseError) =>
								new TokenDecodeError({
									message: "Invalid refresh response from server",
									detail: String(parseError),
								}),
						),
					)
				}).pipe(
					Effect.catchTag("TimeoutError", () =>
						Effect.fail(
							new TokenExchangeError({
								message: "Token refresh timed out",
							}),
						),
					),
					Effect.catchIf(HttpClientError.isHttpClientError, mapHttpClientError("token refresh")),
				),
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(FetchHttpClient.layer))

	/**
	 * Mock token response for testing
	 */
	static mockTokenResponse = () => ({
		accessToken: "new-access-token",
		refreshToken: "new-refresh-token",
		expiresIn: 3600,
	})

	/**
	 * Mock full token response with user data for testing
	 */
	static mockFullTokenResponse = () => ({
		accessToken: "new-access-token",
		refreshToken: "new-refresh-token",
		expiresIn: 3600,
		user: {
			id: "user-123",
			email: "test@example.com",
			firstName: "Test",
			lastName: "User",
		},
	})
}

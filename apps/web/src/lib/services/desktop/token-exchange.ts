/**
 * @module Token exchange Effect service for desktop apps
 * @platform desktop
 * @description HTTP client for token exchange using Effect HttpClient with Schema validation
 */

import { FetchHttpClient, HttpBody, HttpClient, HttpClientRequest } from "@effect/platform"
import { Http, TokenDecodeError, TokenExchangeError } from "@hazel/domain"
import { Duration, Effect, Schema } from "effect"

const DEFAULT_TIMEOUT = Duration.seconds(30)

export class TokenExchange extends Effect.Service<TokenExchange>()("TokenExchange", {
	accessors: true,
	dependencies: [FetchHttpClient.layer],
	effect: Effect.gen(function* () {
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
						return yield* Effect.fail(
							new TokenExchangeError({
								message: "Failed to exchange code for token",
								detail: `HTTP ${response.status}: ${errorText}`,
							}),
						)
					}

					// Parse and validate response
					const rawJson = yield* response.json
					return yield* Schema.decodeUnknown(Http.TokenResponse)(rawJson).pipe(
						Effect.mapError(
							(parseError) =>
								new TokenDecodeError({
									message: "Invalid token response from server",
									detail: String(parseError),
								}),
						),
					)
				}).pipe(
					// Map HTTP client errors to TokenExchangeError
					Effect.catchTag("TimeoutException", () =>
						Effect.fail(
							new TokenExchangeError({
								message: "Token exchange timed out",
							}),
						),
					),
					Effect.catchTag("RequestError", (error) =>
						Effect.fail(
							new TokenExchangeError({
								message: "Network error during token exchange",
								detail: String(error),
							}),
						),
					),
					Effect.catchTag("ResponseError", (error) =>
						Effect.fail(
							new TokenExchangeError({
								message: "Server error during token exchange",
								detail: `HTTP ${error.response.status}`,
							}),
						),
					),
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
					return yield* Schema.decodeUnknown(Http.RefreshTokenResponse)(rawJson).pipe(
						Effect.mapError(
							(parseError) =>
								new TokenDecodeError({
									message: "Invalid refresh response from server",
									detail: String(parseError),
								}),
						),
					)
				}).pipe(
					// Map HTTP client errors to TokenExchangeError
					Effect.catchTag("TimeoutException", () =>
						Effect.fail(
							new TokenExchangeError({
								message: "Token refresh timed out",
							}),
						),
					),
					Effect.catchTag("RequestError", (error) =>
						Effect.fail(
							new TokenExchangeError({
								message: "Network error during token refresh",
								detail: String(error),
							}),
						),
					),
					Effect.catchTag("ResponseError", (error) =>
						Effect.fail(
							new TokenExchangeError({
								message: "Server error during token refresh",
								detail: `HTTP ${error.response.status}`,
							}),
						),
					),
				),
		}
	}),
}) {}

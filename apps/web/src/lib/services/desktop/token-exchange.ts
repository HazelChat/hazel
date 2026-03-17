/**
 * @module Auth HTTP Effect service
 * @platform web
 * @description Type-safe auth client for token exchange and refresh
 */

import { FetchHttpClient, HttpClient, HttpClientError } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"
import {
	OAuthCodeExpiredError,
	OAuthRedemptionPendingError,
	OAuthStateMismatchError,
	TokenDecodeError,
	TokenExchangeError,
} from "@hazel/domain/errors"
import {
	AuthRequestHeaders,
	HazelApi,
	RefreshTokenRequest,
	RefreshTokenResponse,
	TokenRequest,
	TokenResponse,
} from "@hazel/domain/http"
import { Duration, Effect, Layer, Schema, ServiceMap } from "effect"

const DEFAULT_TIMEOUT = Duration.seconds(60)
const createAttemptId = (scope: "callback" | "refresh"): string => `${scope}_${crypto.randomUUID()}`

const makeAttemptHeaders = (attemptId?: string) =>
	new AuthRequestHeaders({
		"x-auth-attempt-id": attemptId,
	})

const mapExchangeError = (
	error: unknown,
):
	| OAuthCodeExpiredError
	| OAuthStateMismatchError
	| OAuthRedemptionPendingError
	| TokenExchangeError
	| TokenDecodeError => {
	if (
		error instanceof OAuthCodeExpiredError ||
		error instanceof OAuthStateMismatchError ||
		error instanceof OAuthRedemptionPendingError ||
		error instanceof TokenExchangeError
	) {
		return error
	}

	if (HttpClientError.isHttpClientError(error)) {
		return new TokenExchangeError({
			message:
				error.response?.status === undefined
					? "Network error during token exchange"
					: "Server error during token exchange",
			detail: error.response?.status === undefined ? String(error) : `HTTP ${error.response.status}`,
		})
	}

	if (Schema.isSchemaError(error)) {
		return new TokenDecodeError({
			message: "Invalid token response from server",
			detail: String(error),
		})
	}

	return new TokenExchangeError({
		message: "Failed to exchange code for token",
		detail: String(error),
	})
}

const mapRefreshError = (error: unknown): TokenExchangeError | TokenDecodeError => {
	if (error instanceof TokenExchangeError) {
		return error
	}

	if (HttpClientError.isHttpClientError(error)) {
		return new TokenExchangeError({
			message:
				error.response?.status === undefined
					? "Network error during token refresh"
					: "Server error during token refresh",
			detail: error.response?.status === undefined ? String(error) : `HTTP ${error.response.status}`,
		})
	}

	if (Schema.isSchemaError(error)) {
		return new TokenDecodeError({
			message: "Invalid refresh response from server",
			detail: String(error),
		})
	}

	if (error instanceof OAuthCodeExpiredError) {
		return new TokenExchangeError({
			message: error.message,
		})
	}

	return new TokenExchangeError({
		message: "Failed to refresh token",
		detail: String(error),
	})
}

export class TokenExchange extends ServiceMap.Service<TokenExchange>()("TokenExchange", {
	make: Effect.gen(function* () {
		const httpClient = yield* HttpClient.HttpClient
		const backendUrl = import.meta.env.VITE_BACKEND_URL
		const authClient = yield* HttpApiClient.group(HazelApi, {
			group: "auth",
			httpClient,
			baseUrl: backendUrl,
		})

		return {
			exchangeCode: (
				code: string,
				state: string,
				attemptId: string = createAttemptId("callback"),
			): Effect.Effect<
				Schema.Schema.Type<typeof TokenResponse>,
				| OAuthCodeExpiredError
				| OAuthStateMismatchError
				| OAuthRedemptionPendingError
				| TokenExchangeError
				| TokenDecodeError,
				never
			> =>
				authClient
					.token({
						headers: makeAttemptHeaders(attemptId),
						payload: new TokenRequest({ code, state }),
					})
					.pipe(
						Effect.timeout(DEFAULT_TIMEOUT),
						Effect.catchTag("TimeoutError", () =>
							Effect.fail(
								new TokenExchangeError({
									message: "Token exchange timed out",
								}),
							),
						),
						Effect.catchTag("OAuthCodeExpiredError", (error) => Effect.fail(error)),
						Effect.catchTag("OAuthStateMismatchError", (error) => Effect.fail(error)),
						Effect.catchTag("OAuthRedemptionPendingError", (error) => Effect.fail(error)),
						Effect.catch((error) => Effect.fail(mapExchangeError(error))),
					),

			refreshToken: (
				refreshToken: string,
				attemptId: string = createAttemptId("refresh"),
			): Effect.Effect<
				Schema.Schema.Type<typeof RefreshTokenResponse>,
				TokenExchangeError | TokenDecodeError,
				never
			> =>
				authClient
					.refresh({
						headers: makeAttemptHeaders(attemptId),
						payload: new RefreshTokenRequest({ refreshToken }),
					})
					.pipe(
						Effect.timeout(DEFAULT_TIMEOUT),
						Effect.catchTag("TimeoutError", () =>
							Effect.fail(
								new TokenExchangeError({
									message: "Token refresh timed out",
								}),
							),
						),
						Effect.catch((error) => Effect.fail(mapRefreshError(error))),
					),
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(FetchHttpClient.layer))

	static mockTokenResponse = () => ({
		accessToken: "new-access-token",
		refreshToken: "new-refresh-token",
		expiresIn: 3600,
	})

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

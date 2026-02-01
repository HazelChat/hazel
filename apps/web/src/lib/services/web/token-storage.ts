/**
 * @module Token storage service for web apps
 * @platform web
 * @description Token storage using localStorage with same API as desktop TokenStorage
 */

import { TokenNotFoundError, TokenStoreError } from "@hazel/domain/errors"
import { Effect, Option } from "effect"

const STORAGE_PREFIX = "hazel_auth_"
const ACCESS_TOKEN_KEY = `${STORAGE_PREFIX}access_token`
const REFRESH_TOKEN_KEY = `${STORAGE_PREFIX}refresh_token`
const EXPIRES_AT_KEY = `${STORAGE_PREFIX}expires_at`

/**
 * Check if localStorage is available
 */
const checkStorage = Effect.gen(function* () {
	if (typeof window === "undefined" || !window.localStorage) {
		return yield* Effect.fail(
			new TokenStoreError({
				message: "localStorage not available",
				operation: "load",
				detail: "Running in non-browser environment",
			}),
		)
	}
	return window.localStorage
})

export class WebTokenStorage extends Effect.Service<WebTokenStorage>()("WebTokenStorage", {
	accessors: true,
	effect: Effect.gen(function* () {
		return {
			/**
			 * Store all auth tokens in localStorage
			 */
			storeTokens: (accessToken: string, refreshToken: string, expiresIn: number) =>
				Effect.gen(function* () {
					const storage = yield* checkStorage

					yield* Effect.try({
						try: () => storage.setItem(ACCESS_TOKEN_KEY, accessToken),
						catch: (e) =>
							new TokenStoreError({
								message: "Failed to store access token",
								operation: "set",
								detail: String(e),
							}),
					})

					yield* Effect.try({
						try: () => storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
						catch: (e) =>
							new TokenStoreError({
								message: "Failed to store refresh token",
								operation: "set",
								detail: String(e),
							}),
					})

					yield* Effect.try({
						try: () => storage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000)),
						catch: (e) =>
							new TokenStoreError({
								message: "Failed to store token expiry",
								operation: "set",
								detail: String(e),
							}),
					})
				}),

			/**
			 * Get stored access token
			 */
			getAccessToken: Effect.gen(function* () {
				const storage = yield* checkStorage
				const token = yield* Effect.try({
					try: () => storage.getItem(ACCESS_TOKEN_KEY),
					catch: (e) =>
						new TokenStoreError({
							message: "Failed to get access token",
							operation: "get",
							detail: String(e),
						}),
				})
				return Option.fromNullable(token)
			}),

			/**
			 * Get stored refresh token
			 */
			getRefreshToken: Effect.gen(function* () {
				const storage = yield* checkStorage
				const token = yield* Effect.try({
					try: () => storage.getItem(REFRESH_TOKEN_KEY),
					catch: (e) =>
						new TokenStoreError({
							message: "Failed to get refresh token",
							operation: "get",
							detail: String(e),
						}),
				})
				return Option.fromNullable(token)
			}),

			/**
			 * Get token expiration timestamp (ms)
			 */
			getExpiresAt: Effect.gen(function* () {
				const storage = yield* checkStorage
				const expiresAtStr = yield* Effect.try({
					try: () => storage.getItem(EXPIRES_AT_KEY),
					catch: (e) =>
						new TokenStoreError({
							message: "Failed to get token expiry",
							operation: "get",
							detail: String(e),
						}),
				})
				if (expiresAtStr === null) {
					return Option.none()
				}
				const expiresAt = Number(expiresAtStr)
				return Number.isNaN(expiresAt) ? Option.none() : Option.some(expiresAt)
			}),

			/**
			 * Get access token, failing if not found
			 */
			requireAccessToken: Effect.gen(function* () {
				const storage = yield* checkStorage
				const token = yield* Effect.try({
					try: () => storage.getItem(ACCESS_TOKEN_KEY),
					catch: (e) =>
						new TokenStoreError({
							message: "Failed to get access token",
							operation: "get",
							detail: String(e),
						}),
				})
				if (!token) {
					return yield* Effect.fail(
						new TokenNotFoundError({
							message: "Access token not found",
							tokenType: "access",
						}),
					)
				}
				return token
			}),

			/**
			 * Get refresh token, failing if not found
			 */
			requireRefreshToken: Effect.gen(function* () {
				const storage = yield* checkStorage
				const token = yield* Effect.try({
					try: () => storage.getItem(REFRESH_TOKEN_KEY),
					catch: (e) =>
						new TokenStoreError({
							message: "Failed to get refresh token",
							operation: "get",
							detail: String(e),
						}),
				})
				if (!token) {
					return yield* Effect.fail(
						new TokenNotFoundError({
							message: "Refresh token not found",
							tokenType: "refresh",
						}),
					)
				}
				return token
			}),

			/**
			 * Clear all stored tokens from localStorage
			 */
			clearTokens: Effect.gen(function* () {
				const storage = yield* checkStorage

				yield* Effect.all(
					[
						Effect.try({
							try: () => storage.removeItem(ACCESS_TOKEN_KEY),
							catch: (e) =>
								new TokenStoreError({
									message: "Failed to delete access token",
									operation: "delete",
									detail: String(e),
								}),
						}),
						Effect.try({
							try: () => storage.removeItem(REFRESH_TOKEN_KEY),
							catch: (e) =>
								new TokenStoreError({
									message: "Failed to delete refresh token",
									operation: "delete",
									detail: String(e),
								}),
						}),
						Effect.try({
							try: () => storage.removeItem(EXPIRES_AT_KEY),
							catch: (e) =>
								new TokenStoreError({
									message: "Failed to delete token expiry",
									operation: "delete",
									detail: String(e),
								}),
						}),
					],
					{ concurrency: "unbounded" },
				)
			}),
		}
	}),
}) {
	/**
	 * Mock token data for testing
	 */
	static mockTokens = () => ({
		accessToken: "mock-access-token",
		refreshToken: "mock-refresh-token",
		expiresAt: Date.now() + 3600 * 1000,
	})
}

/**
 * @module Token storage Effect service for desktop apps
 * @platform desktop
 * @description Secure token storage using Tauri's encrypted store with Effect error safety
 */

import { TokenNotFoundError, TokenStoreError, TauriNotAvailableError } from "@hazel/domain/errors"
import { Effect, Option } from "effect"

type StoreApi = typeof import("@tauri-apps/plugin-store")
type StoreInstance = Awaited<ReturnType<StoreApi["load"]>>

const STORE_NAME = "auth.json"
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const EXPIRES_AT_KEY = "expires_at"

// Lazy-loaded store instance
let storePromise: Promise<StoreInstance> | null = null

/**
 * Get or create the store instance
 */
const getStore = Effect.gen(function* () {
	const storeApi: StoreApi | undefined = (window as any).__TAURI__?.store

	if (!storeApi) {
		return yield* Effect.fail(
			new TauriNotAvailableError({
				message: "Tauri store not available",
				component: "store",
			}),
		)
	}

	if (!storePromise) {
		storePromise = storeApi.load(STORE_NAME, { defaults: {}, autoSave: true })
	}

	return yield* Effect.tryPromise({
		try: () => storePromise!,
		catch: (e) =>
			new TokenStoreError({
				message: "Failed to load token store",
				operation: "load",
				detail: String(e),
			}),
	})
})

export class TokenStorage extends Effect.Service<TokenStorage>()("TokenStorage", {
	accessors: true,
	effect: Effect.gen(function* () {
		return {
			/**
			 * Store all auth tokens in Tauri store
			 */
			storeTokens: (accessToken: string, refreshToken: string, expiresIn: number) =>
				Effect.gen(function* () {
					const store = yield* getStore

					yield* Effect.tryPromise({
						try: () => store.set(ACCESS_TOKEN_KEY, accessToken),
						catch: (e) =>
							new TokenStoreError({
								message: "Failed to store access token",
								operation: "set",
								detail: String(e),
							}),
					})

					yield* Effect.tryPromise({
						try: () => store.set(REFRESH_TOKEN_KEY, refreshToken),
						catch: (e) =>
							new TokenStoreError({
								message: "Failed to store refresh token",
								operation: "set",
								detail: String(e),
							}),
					})

					yield* Effect.tryPromise({
						try: () => store.set(EXPIRES_AT_KEY, Date.now() + expiresIn * 1000),
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
				const store = yield* getStore
				const token = yield* Effect.tryPromise({
					try: () => store.get<string>(ACCESS_TOKEN_KEY),
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
				const store = yield* getStore
				const token = yield* Effect.tryPromise({
					try: () => store.get<string>(REFRESH_TOKEN_KEY),
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
				const store = yield* getStore
				const expiresAt = yield* Effect.tryPromise({
					try: () => store.get<number>(EXPIRES_AT_KEY),
					catch: (e) =>
						new TokenStoreError({
							message: "Failed to get token expiry",
							operation: "get",
							detail: String(e),
						}),
				})
				return Option.fromNullable(expiresAt)
			}),

			/**
			 * Get access token, failing if not found
			 */
			requireAccessToken: Effect.gen(function* () {
				const store = yield* getStore
				const token = yield* Effect.tryPromise({
					try: () => store.get<string>(ACCESS_TOKEN_KEY),
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
				const store = yield* getStore
				const token = yield* Effect.tryPromise({
					try: () => store.get<string>(REFRESH_TOKEN_KEY),
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
			 * Clear all stored tokens from Tauri store
			 */
			clearTokens: Effect.gen(function* () {
				const store = yield* getStore

				yield* Effect.all(
					[
						Effect.tryPromise({
							try: () => store.delete(ACCESS_TOKEN_KEY),
							catch: (e) =>
								new TokenStoreError({
									message: "Failed to delete access token",
									operation: "delete",
									detail: String(e),
								}),
						}),
						Effect.tryPromise({
							try: () => store.delete(REFRESH_TOKEN_KEY),
							catch: (e) =>
								new TokenStoreError({
									message: "Failed to delete refresh token",
									operation: "delete",
									detail: String(e),
								}),
						}),
						Effect.tryPromise({
							try: () => store.delete(EXPIRES_AT_KEY),
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

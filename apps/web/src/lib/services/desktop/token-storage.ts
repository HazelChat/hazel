/**
 * @module Token storage Effect service for desktop apps
 * @platform desktop
 * @description Secure token storage using desktop runtime bridge with Effect error safety
 */

import { TokenNotFoundError, TokenStoreError } from "@hazel/domain/errors"
import { Effect, Option } from "effect"
import { desktopBridge } from "~/lib/desktop-bridge"

const STORE_NAME = "auth.json"
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const EXPIRES_AT_KEY = "expires_at"

const ensureBridge = Effect.tryPromise({
	try: () => desktopBridge.ensureReady(),
	catch: (error) =>
		new TokenStoreError({
			message: "Desktop bridge unavailable",
			operation: "load",
			detail: String(error),
		}),
}).pipe(
	Effect.flatMap((bridge) =>
		bridge
				? Effect.succeed(bridge)
				: Effect.fail(
						new TokenStoreError({
							message: "Desktop bridge unavailable",
							operation: "load",
							detail: "No desktop bridge context",
						}),
					),
	),
)

const getValue = (key: string) =>
	Effect.gen(function* () {
		yield* ensureBridge
		const result = yield* Effect.tryPromise({
			try: () => desktopBridge.storeGet(STORE_NAME, key),
			catch: (error) =>
				new TokenStoreError({
					message: "Failed to get value from desktop store",
					operation: "get",
					detail: String(error),
				}),
		})
		return result.value
	})

const setValue = (key: string, value: string) =>
	Effect.gen(function* () {
		yield* ensureBridge
		yield* Effect.tryPromise({
			try: () => desktopBridge.storeSet(STORE_NAME, key, value),
			catch: (error) =>
				new TokenStoreError({
					message: "Failed to set value in desktop store",
					operation: "set",
					detail: String(error),
				}),
		})
	})

const deleteValue = (key: string) =>
	Effect.gen(function* () {
		yield* ensureBridge
		yield* Effect.tryPromise({
			try: () => desktopBridge.storeDelete(STORE_NAME, key),
			catch: (error) =>
				new TokenStoreError({
					message: "Failed to delete value from desktop store",
					operation: "delete",
					detail: String(error),
				}),
		})
	})

export class TokenStorage extends Effect.Service<TokenStorage>()("TokenStorage", {
	accessors: true,
	effect: Effect.gen(function* () {
		return {
			storeTokens: (accessToken: string, refreshToken: string, expiresIn: number) =>
				Effect.all(
					[
						setValue(ACCESS_TOKEN_KEY, accessToken),
						setValue(REFRESH_TOKEN_KEY, refreshToken),
						setValue(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000)),
					],
					{ concurrency: "unbounded" },
				),

			getAccessToken: getValue(ACCESS_TOKEN_KEY).pipe(Effect.map((value) => Option.fromNullable(value))),

			getRefreshToken: getValue(REFRESH_TOKEN_KEY).pipe(Effect.map((value) => Option.fromNullable(value))),

			getExpiresAt: getValue(EXPIRES_AT_KEY).pipe(
				Effect.map((value) => {
					if (!value) return Option.none<number>()
					const parsed = Number(value)
					return Number.isFinite(parsed) ? Option.some(parsed) : Option.none<number>()
				}),
			),

			requireAccessToken: Effect.gen(function* () {
				const token = yield* getValue(ACCESS_TOKEN_KEY)
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

			requireRefreshToken: Effect.gen(function* () {
				const token = yield* getValue(REFRESH_TOKEN_KEY)
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

			clearTokens: Effect.all(
				[
					deleteValue(ACCESS_TOKEN_KEY),
					deleteValue(REFRESH_TOKEN_KEY),
					deleteValue(EXPIRES_AT_KEY),
				],
				{ concurrency: "unbounded" },
			),
		}
	}),
}) {
	static mockTokens = () => ({
		accessToken: "mock-access-token",
		refreshToken: "mock-refresh-token",
		expiresAt: Date.now() + 3600 * 1000,
	})
}

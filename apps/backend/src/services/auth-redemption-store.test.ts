import { describe, expect, it, vi } from "vitest"
import { Effect, Layer, Schema } from "effect"
import { InternalServerError, OAuthCodeExpiredError, OAuthStateMismatchError } from "@hazel/domain"
import { TokenResponse } from "@hazel/domain/http"
import { serviceShape } from "../test/effect-helpers"

vi.mock("@hazel/effect-bun", async () => {
	const { Layer, ServiceMap } = await import("effect")
	class Redis extends ServiceMap.Service<
		Redis,
		{
			readonly get: (key: string) => unknown
			readonly del: (key: string) => unknown
			readonly send: <T = unknown>(command: string, args: string[]) => T
		}
	>()("@hazel/effect-bun/Redis") {}

	return {
		Redis: Object.assign(Redis, {
			Default: Layer.empty,
		}),
	}
})

import { Redis } from "@hazel/effect-bun"
import { AuthRedemptionStore } from "./auth-redemption-store"

type TokenExchangeResponse = Schema.Schema.Type<typeof TokenResponse>

interface RedisValue {
	value: string
	expiresAt: number | null
}

const makeResponse = (): TokenExchangeResponse => ({
	accessToken: "access-token",
	refreshToken: "refresh-token",
	expiresIn: 3600,
	user: {
		id: "user_123",
		email: "test@example.com",
		firstName: "Test",
		lastName: "User",
	},
})

const makeRedisLayer = () => {
	const store = new Map<string, RedisValue>()

	const getValue = (key: string): string | null => {
		const entry = store.get(key)
		if (!entry) return null
		if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
			store.delete(key)
			return null
		}
		return entry.value
	}

	const setValue = (key: string, value: string, ttlMs?: number) => {
		store.set(key, {
			value,
			expiresAt: ttlMs === undefined ? null : Date.now() + ttlMs,
		})
	}

	return Layer.succeed(
		Redis,
		serviceShape<typeof Redis>({
			get: (key: string) => Effect.succeed(getValue(key)),
			del: (key: string) =>
				Effect.sync(() => {
					store.delete(key)
				}),
			send: <T>(command: string, args: string[]) =>
				Effect.sync(() => {
					if (command === "EVAL") {
						const [, , key, processingValue, ttlMs] = args
						const existing = getValue(key)
						if (existing === null) {
							setValue(key, processingValue, Number(ttlMs))
							return ["claimed", ""] as T
						}
						return ["existing", existing] as T
					}

					if (command === "SET") {
						const [key, value, , ttlMs] = args
						setValue(key, value, Number(ttlMs))
						return "OK" as T
					}

					throw new Error(`Unsupported Redis command in test: ${command}`)
				}),
		}),
	)
}

const makeStore = async () =>
	await Effect.runPromise(
		Effect.gen(function* () {
			return yield* AuthRedemptionStore
		}).pipe(
			Effect.provide(
				Layer.effect(AuthRedemptionStore, AuthRedemptionStore.make).pipe(
					Layer.provide(makeRedisLayer()),
				),
			),
		),
	)

describe("AuthRedemptionStore", () => {
	it("deduplicates concurrent redemptions and calls WorkOS once", async () => {
		const store = await makeStore()
		let resolveGate: () => void
		const gate = {
			promise: new Promise<void>((r) => {
				resolveGate = r
			}),
			resolve: () => resolveGate(),
		}
		let calls = 0
		const response = makeResponse()
		const exchange = Effect.gen(function* () {
			calls += 1
			yield* Effect.promise(() => gate.promise)
			return response
		})

		const first = Effect.runPromise(
			store.exchangeCodeOnce({ code: "code-1", state: JSON.stringify({ returnTo: "/" }) }, exchange),
		)
		const second = Effect.runPromise(
			store.exchangeCodeOnce({ code: "code-1", state: JSON.stringify({ returnTo: "/" }) }, exchange),
		)

		gate.resolve()
		const result = await Promise.all([first, second])

		expect(result).toEqual([response, response])
		expect(calls).toBe(1)
	})

	it("returns cached success on a duplicate request after completion", async () => {
		const store = await makeStore()
		let calls = 0
		const response = makeResponse()
		const exchange = Effect.gen(function* () {
			calls += 1
			return response
		})

		const first = await Effect.runPromise(
			store.exchangeCodeOnce({ code: "code-2", state: JSON.stringify({ returnTo: "/" }) }, exchange),
		)
		const second = await Effect.runPromise(
			store.exchangeCodeOnce({ code: "code-2", state: JSON.stringify({ returnTo: "/" }) }, exchange),
		)

		expect([first, second]).toEqual([response, response])
		expect(calls).toBe(1)
	})

	it("caches invalid_grant failures and replays them to duplicates", async () => {
		const store = await makeStore()
		let calls = 0
		const exchange = Effect.gen(function* () {
			calls += 1
			return yield* Effect.fail(
				new OAuthCodeExpiredError({
					message: "Authorization code expired or already used",
				}),
			)
		})

		const first = await Effect.runPromise(
			Effect.flip(
				store.exchangeCodeOnce(
					{ code: "code-3", state: JSON.stringify({ returnTo: "/" }) },
					exchange,
				),
			),
		)
		const second = await Effect.runPromise(
			Effect.flip(
				store.exchangeCodeOnce(
					{ code: "code-3", state: JSON.stringify({ returnTo: "/" }) },
					exchange,
				),
			),
		)

		expect(first).toEqual(
			new OAuthCodeExpiredError({
				message: "Authorization code expired or already used",
			}),
		)
		expect(second).toEqual(
			new OAuthCodeExpiredError({
				message: "Authorization code expired or already used",
			}),
		)
		expect(calls).toBe(1)
	})

	it("clears the processing lock on transient failures so retries can re-run", async () => {
		const store = await makeStore()
		let calls = 0
		const response = makeResponse()

		const first = await Effect.runPromise(
			Effect.flip(
				store.exchangeCodeOnce(
					{ code: "code-4", state: JSON.stringify({ returnTo: "/" }) },
					Effect.gen(function* () {
						calls += 1
						return yield* Effect.fail(
							new InternalServerError({
								message: "Temporary database failure",
							}),
						)
					}),
				),
			),
		)

		const second = await Effect.runPromise(
			store.exchangeCodeOnce(
				{ code: "code-4", state: JSON.stringify({ returnTo: "/" }) },
				Effect.gen(function* () {
					calls += 1
					return response
				}),
			),
		)

		expect(first).toEqual(
			new InternalServerError({
				message: "Temporary database failure",
			}),
		)
		expect(second).toEqual(response)
		expect(calls).toBe(2)
	})

	it("rejects reused codes when the duplicate request has a different state payload", async () => {
		const store = await makeStore()

		await Effect.runPromise(
			store.exchangeCodeOnce(
				{ code: "code-5", state: JSON.stringify({ returnTo: "/" }) },
				Effect.succeed(makeResponse()),
			),
		)

		const result = await Effect.runPromise(
			Effect.flip(
				store.exchangeCodeOnce(
					{ code: "code-5", state: JSON.stringify({ returnTo: "/other" }) },
					Effect.succeed(makeResponse()),
				),
			),
		)

		expect(result).toEqual(
			new OAuthStateMismatchError({
				message: "Received a duplicate OAuth redemption with mismatched state. Please restart login.",
			}),
		)
	})
})

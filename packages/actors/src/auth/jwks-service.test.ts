import { Effect, Either } from "effect"
import { afterEach, describe, expect, it } from "vitest"
import { JwksService } from "./jwks-service"

const ORIGINAL_ENV = { ...process.env }

const resetEnv = () => {
	for (const key of Object.keys(process.env)) {
		if (!(key in ORIGINAL_ENV)) {
			delete process.env[key]
		}
	}

	for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
		if (value === undefined) {
			delete process.env[key]
		} else {
			process.env[key] = value
		}
	}
}

afterEach(() => {
	resetEnv()
})

describe("JwksService", () => {
	it("fails with ConfigError when WORKOS_CLIENT_ID is missing", async () => {
		delete process.env.WORKOS_CLIENT_ID

		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* JwksService
				return yield* service.getJwks()
			}).pipe(Effect.provide(JwksService.layer), Effect.either),
		)

		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(result.left._tag).toBe("ConfigError")
		}
	})

	it("caches the JWKS getter when config is present", async () => {
		process.env.WORKOS_CLIENT_ID = "client_test_123"

		const [first, second] = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* JwksService
				const firstJwks = yield* service.getJwks()
				const secondJwks = yield* service.getJwks()
				return [firstJwks, secondJwks] as const
			}).pipe(Effect.provide(JwksService.layer)),
		)

		expect(typeof first).toBe("function")
		expect(second).toBe(first)
	})
})

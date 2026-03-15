import { Effect, Option, Redacted } from "effect"
import { afterEach, describe, expect, it } from "vitest"
import { TokenValidationConfigService } from "./config-service"

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

const loadConfig = Effect.gen(function* () {
	return yield* TokenValidationConfigService
}).pipe(Effect.provide(TokenValidationConfigService.layer))

afterEach(() => {
	resetEnv()
})

describe("TokenValidationConfigService", () => {
	it("returns Option.none when auth config is unset", async () => {
		delete process.env.WORKOS_CLIENT_ID
		delete process.env.BACKEND_URL
		delete process.env.API_BASE_URL
		delete process.env.VITE_BACKEND_URL
		delete process.env.VITE_API_BASE_URL
		delete process.env.INTERNAL_SECRET

		const config = await Effect.runPromise(loadConfig)

		expect(Option.isNone(config.workosClientId)).toBe(true)
		expect(Option.isNone(config.backendUrl)).toBe(true)
		expect(Option.isNone(config.internalSecret)).toBe(true)
	})

	it("loads branded client ID, backend URL, and redacted secret", async () => {
		process.env.WORKOS_CLIENT_ID = "client_test_123"
		process.env.BACKEND_URL = "https://backend.example.com"
		process.env.INTERNAL_SECRET = "super-secret"

		const config = await Effect.runPromise(loadConfig)

		expect(Option.isSome(config.workosClientId)).toBe(true)
		expect(Option.isSome(config.backendUrl)).toBe(true)
		expect(Option.isSome(config.internalSecret)).toBe(true)

		if (Option.isSome(config.workosClientId)) {
			expect(config.workosClientId.value).toBe("client_test_123")
		}

		if (Option.isSome(config.backendUrl)) {
			expect(config.backendUrl.value).toBe("https://backend.example.com")
		}

		if (Option.isSome(config.internalSecret)) {
			expect(Redacted.value(config.internalSecret.value)).toBe("super-secret")
		}
	})
})

import { beforeEach, describe, expect, it, vi } from "vitest"
import {
	getWebCallbackAttemptKey,
	resetAllWebCallbackAttempts,
	runWebCallbackAttemptOnce,
} from "./web-callback-single-flight"

describe("web-callback-single-flight", () => {
	beforeEach(() => {
		resetAllWebCallbackAttempts()
	})

	it("invokes the runner once for duplicate in-flight callback attempts", async () => {
		const runner = vi.fn(async () => {
			await Promise.resolve()
			return { success: true as const }
		})
		const key = getWebCallbackAttemptKey({
			code: "auth-code",
			state: { returnTo: "/" },
		})

		const [first, second] = await Promise.all([
			runWebCallbackAttemptOnce(key, runner, () => true),
			runWebCallbackAttemptOnce(key, runner, () => true),
		])

		expect(runner).toHaveBeenCalledTimes(1)
		expect(first).toEqual({ success: true })
		expect(second).toEqual({ success: true })
	})

	it("keeps successful terminal results for later callers", async () => {
		const runner = vi.fn(async () => ({ success: true as const }))
		const key = getWebCallbackAttemptKey({
			code: "auth-code",
			state: { returnTo: "/dashboard" },
		})

		await runWebCallbackAttemptOnce(key, runner, () => true)
		await runWebCallbackAttemptOnce(key, runner, () => true)

		expect(runner).toHaveBeenCalledTimes(1)
	})

	it("clears retryable results so the next attempt can run again", async () => {
		const runner = vi
			.fn<() => Promise<{ success: false; retryable: boolean }>>()
			.mockResolvedValue({ success: false, retryable: true })
		const key = getWebCallbackAttemptKey({
			code: "auth-code",
			state: { returnTo: "/dashboard" },
		})

		await runWebCallbackAttemptOnce(key, runner, () => false)
		await runWebCallbackAttemptOnce(key, runner, () => false)

		expect(runner).toHaveBeenCalledTimes(2)
	})

	it("keeps non-retryable terminal failures", async () => {
		const runner = vi
			.fn<() => Promise<{ success: false; retryable: boolean }>>()
			.mockResolvedValue({ success: false, retryable: false })
		const key = getWebCallbackAttemptKey({
			code: "auth-code",
			state: { returnTo: "/dashboard" },
		})

		await runWebCallbackAttemptOnce(key, runner, () => true)
		await runWebCallbackAttemptOnce(key, runner, () => true)

		expect(runner).toHaveBeenCalledTimes(1)
	})
})

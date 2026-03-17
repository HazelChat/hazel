import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
	getWebLoginAttemptKey,
	resetAllWebLoginRedirects,
	startWebLoginRedirectOnce,
} from "./web-login-single-flight"

describe("web-login-single-flight", () => {
	beforeEach(() => {
		vi.useFakeTimers()
		resetAllWebLoginRedirects()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("starts a login redirect only once while the guard is active", () => {
		const start = vi.fn()
		const key = getWebLoginAttemptKey({ returnTo: "/" })

		expect(startWebLoginRedirectOnce(key, start, 1000)).toBe(true)
		expect(startWebLoginRedirectOnce(key, start, 1000)).toBe(false)
		expect(start).toHaveBeenCalledTimes(1)
	})

	it("allows the same login redirect again after the guard timeout", () => {
		const start = vi.fn()
		const key = getWebLoginAttemptKey({ returnTo: "/" })

		expect(startWebLoginRedirectOnce(key, start, 1000)).toBe(true)
		vi.advanceTimersByTime(1000)
		expect(startWebLoginRedirectOnce(key, start, 1000)).toBe(true)
		expect(start).toHaveBeenCalledTimes(2)
	})
})

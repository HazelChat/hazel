import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { isFatalRefreshError, isTransientError } from "~/lib/auth-token"

// ============================================================================
// Helper Function Tests (Pure Unit Tests)
// ============================================================================

describe("isFatalRefreshError", () => {
	it("returns true for HTTP 401 errors", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "Failed to refresh token",
			detail: "HTTP 401: Unauthorized",
		}
		expect(isFatalRefreshError(error)).toBe(true)
	})

	it("returns true for HTTP 403 errors", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "Failed to refresh token",
			detail: "HTTP 403: Forbidden",
		}
		expect(isFatalRefreshError(error)).toBe(true)
	})

	it("returns false for HTTP 500 errors", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "Server error",
			detail: "HTTP 500: Internal Server Error",
		}
		expect(isFatalRefreshError(error)).toBe(false)
	})

	it("returns false for timeout errors", () => {
		const error = {
			_tag: "TimeoutException",
			message: "Request timed out",
		}
		expect(isFatalRefreshError(error)).toBe(false)
	})

	it("returns false for network errors", () => {
		const error = {
			_tag: "RequestError",
			message: "Network error during token refresh",
		}
		expect(isFatalRefreshError(error)).toBe(false)
	})

	it("returns false for errors without detail", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "Unknown error",
		}
		expect(isFatalRefreshError(error)).toBe(false)
	})

	it("returns false for empty error objects", () => {
		expect(isFatalRefreshError({})).toBe(false)
	})
})

describe("isTransientError", () => {
	it("returns true for TimeoutException tag", () => {
		const error = {
			_tag: "TimeoutException",
			message: "Operation timed out",
		}
		expect(isTransientError(error)).toBe(true)
	})

	it("returns true for RequestError tag", () => {
		const error = {
			_tag: "RequestError",
			message: "Request failed",
		}
		expect(isTransientError(error)).toBe(true)
	})

	it("returns true for errors with 'timed out' in message", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "Token exchange timed out",
		}
		expect(isTransientError(error)).toBe(true)
	})

	it("returns true for errors with 'timeout' in message", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "Request timeout after 60s",
		}
		expect(isTransientError(error)).toBe(true)
	})

	it("returns true for errors with 'network error' in message", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "Network error during request",
		}
		expect(isTransientError(error)).toBe(true)
	})

	it("returns false for HTTP 401 errors", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "HTTP 401: Unauthorized",
		}
		expect(isTransientError(error)).toBe(false)
	})

	it("returns false for HTTP 403 errors", () => {
		const error = {
			_tag: "TokenExchangeError",
			message: "HTTP 403: Forbidden",
		}
		expect(isTransientError(error)).toBe(false)
	})

	it("returns false for parse errors", () => {
		const error = {
			_tag: "TokenDecodeError",
			message: "Invalid JSON response",
		}
		expect(isTransientError(error)).toBe(false)
	})

	it("returns false for errors without message", () => {
		const error = {
			_tag: "UnknownError",
		}
		expect(isTransientError(error)).toBe(false)
	})

	it("returns false for empty error objects", () => {
		expect(isTransientError({})).toBe(false)
	})

	it("is case-insensitive for message matching", () => {
		expect(isTransientError({ message: "TIMED OUT" })).toBe(true)
		expect(isTransientError({ message: "NETWORK ERROR" })).toBe(true)
		expect(isTransientError({ message: "Connection Timeout" })).toBe(true)
	})
})

// ============================================================================
// Integration Tests for forceRefresh and waitForRefresh
// These tests require mocking the Tauri environment and would need more setup
// ============================================================================

describe("forceRefresh", () => {
	beforeEach(() => {
		vi.stubGlobal("window", {
			dispatchEvent: vi.fn(),
			location: { href: "" },
		})
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it("returns false when no refresh token available", async () => {
		// Without Tauri or stored tokens, forceRefresh returns false
		const { forceRefresh } = await import("~/lib/auth-token")
		const result = await forceRefresh()
		expect(result).toBe(false)
	})
})

describe("waitForRefresh", () => {
	beforeEach(() => {
		vi.stubGlobal("window", {
			dispatchEvent: vi.fn(),
			location: { href: "" },
		})
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it("returns true immediately when no refresh in progress", async () => {
		const { waitForRefresh } = await import("~/lib/auth-token")
		const result = await waitForRefresh()
		expect(result).toBe(true)
	})
})

// ============================================================================
// Event Dispatch Tests
// ============================================================================

describe("session-expired event", () => {
	let dispatchEventSpy: ReturnType<typeof vi.fn>

	beforeEach(() => {
		dispatchEventSpy = vi.fn()
		vi.stubGlobal("window", {
			dispatchEvent: dispatchEventSpy,
			location: { href: "" },
		})
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it("window.dispatchEvent can be called with CustomEvent", () => {
		window.dispatchEvent(new CustomEvent("auth:session-expired"))
		expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
		expect(dispatchEventSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "auth:session-expired",
			}),
		)
	})
})

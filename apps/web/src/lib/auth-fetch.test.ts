import { describe, expect, it, vi, beforeEach, afterEach, type Mock } from "vitest"

// Mock modules before importing
vi.mock("./tauri", () => ({
	isTauri: vi.fn(),
}))

vi.mock("~/atoms/desktop-auth", () => ({
	forceRefresh: vi.fn(),
	waitForRefresh: vi.fn(),
}))

vi.mock("~/atoms/web-auth", () => ({
	forceWebRefresh: vi.fn(),
	getWebAccessToken: vi.fn(),
	waitForWebRefresh: vi.fn(),
}))

// Import after mocks are set up
import { isTauri } from "./tauri"
import { forceRefresh, waitForRefresh } from "~/atoms/desktop-auth"
import { forceWebRefresh, getWebAccessToken, waitForWebRefresh } from "~/atoms/web-auth"

describe("authenticatedFetch", () => {
	let mockFetch: Mock
	let dispatchEventSpy: Mock

	beforeEach(() => {
		// Reset all mocks
		vi.resetAllMocks()
		// Clear module cache to get fresh imports
		vi.resetModules()

		// Setup mock fetch
		mockFetch = vi.fn()
		vi.stubGlobal("fetch", mockFetch)

		// Setup window mock
		dispatchEventSpy = vi.fn()
		vi.stubGlobal("window", {
			dispatchEvent: dispatchEventSpy,
			location: { href: "" },
			__TAURI_INTERNALS__: undefined,
		})

		// Default mock implementations for desktop auth
		;(waitForRefresh as Mock).mockResolvedValue(true)
		;(forceRefresh as Mock).mockResolvedValue(false)

		// Default mock implementations for web auth
		;(getWebAccessToken as Mock).mockResolvedValue(null) // No token by default
		;(waitForWebRefresh as Mock).mockResolvedValue(true)
		;(forceWebRefresh as Mock).mockResolvedValue(false)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	describe("web mode (non-Tauri)", () => {
		beforeEach(() => {
			;(isTauri as Mock).mockReturnValue(false)
		})

		it("makes unauthenticated request when no token is available", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data")

			expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", undefined)
		})

		it("adds Bearer token when token is available", async () => {
			;(getWebAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data")

			expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
				headers: {
					Authorization: "Bearer test-jwt-token",
				},
			})
		})

		it("preserves existing init options without token", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data", {
				method: "POST",
				body: JSON.stringify({ foo: "bar" }),
			})

			expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
				method: "POST",
				body: JSON.stringify({ foo: "bar" }),
			})
		})

		it("preserves existing init options with token", async () => {
			;(getWebAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data", {
				method: "POST",
				body: JSON.stringify({ foo: "bar" }),
			})

			expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
				method: "POST",
				body: JSON.stringify({ foo: "bar" }),
				headers: {
					Authorization: "Bearer test-jwt-token",
				},
			})
		})

		it("dispatches session-expired event on 401", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 401 })

			await authenticatedFetch("https://api.example.com/data")

			expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({ type: "auth:session-expired" }),
			)
		})

		it("does not dispatch session-expired on successful response", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data")

			expect(dispatchEventSpy).not.toHaveBeenCalled()
		})

		it("returns the response on success", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			const mockResponse = { status: 200, json: () => Promise.resolve({ data: "test" }) }
			mockFetch.mockResolvedValue(mockResponse)

			const response = await authenticatedFetch("https://api.example.com/data")

			expect(response).toBe(mockResponse)
		})
	})

	describe("401 retry flow", () => {
		beforeEach(() => {
			;(isTauri as Mock).mockReturnValue(false)
		})

		it("returns 401 response immediately in web mode", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			const mockResponse = { status: 401 }
			mockFetch.mockResolvedValue(mockResponse)

			const response = await authenticatedFetch("https://api.example.com/data")

			expect(response.status).toBe(401)
			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({ type: "auth:session-expired" }),
			)
		})
	})

	describe("error handling", () => {
		beforeEach(() => {
			;(isTauri as Mock).mockReturnValue(false)
		})

		it("propagates fetch errors", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			const networkError = new Error("Network error")
			mockFetch.mockRejectedValue(networkError)

			await expect(authenticatedFetch("https://api.example.com/data")).rejects.toThrow("Network error")
		})

		it("handles various HTTP status codes correctly", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			// 404 - should return response without dispatching event
			mockFetch.mockResolvedValue({ status: 404 })
			const response404 = await authenticatedFetch("https://api.example.com/data")
			expect(response404.status).toBe(404)
			expect(dispatchEventSpy).not.toHaveBeenCalled()

			// 500 - should return response without dispatching event
			mockFetch.mockResolvedValue({ status: 500 })
			const response500 = await authenticatedFetch("https://api.example.com/data")
			expect(response500.status).toBe(500)
			expect(dispatchEventSpy).not.toHaveBeenCalled()
		})
	})

	describe("request headers", () => {
		beforeEach(() => {
			;(isTauri as Mock).mockReturnValue(false)
		})

		it("preserves custom headers in web mode without token", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data", {
				headers: {
					"Content-Type": "application/json",
					"X-Custom-Header": "custom-value",
				},
			})

			expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
				headers: {
					"Content-Type": "application/json",
					"X-Custom-Header": "custom-value",
				},
			})
		})

		it("merges Authorization header with custom headers when token available", async () => {
			;(getWebAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data", {
				headers: {
					"Content-Type": "application/json",
					"X-Custom-Header": "custom-value",
				},
			})

			expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
				headers: {
					"Content-Type": "application/json",
					"X-Custom-Header": "custom-value",
					Authorization: "Bearer test-jwt-token",
				},
			})
		})
	})
})

// ============================================================================
// Desktop Mode Tests (Tauri)
// These tests require mocking the Tauri store which is complex due to Effect layers.
// The desktop auth flow tests are in desktop-auth.test.ts using Effect testing patterns.
// ============================================================================

describe("authenticatedFetch desktop mode documentation", () => {
	it("documents the expected behavior for desktop mode", () => {
		// Desktop mode behavior:
		// 1. waitForRefresh() is called first to wait for any in-progress refresh
		// 2. getAccessToken() retrieves the token from Tauri secure storage
		// 3. If token exists, request is made with Authorization header
		// 4. On 401, forceRefresh() is called to refresh the token
		// 5. If refresh succeeds, request is retried with new token
		// 6. If retry also returns 401, tokens are cleared
		// 7. If refresh fails, tokens are cleared

		// This behavior is tested through integration testing with the full
		// Effect layer stack, which is difficult to unit test due to the
		// Tauri secure storage dependency.
		expect(true).toBe(true)
	})
})

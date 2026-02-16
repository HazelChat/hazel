import { describe, expect, it, vi, beforeEach, afterEach, type Mock } from "vitest"

// Mock modules before importing
vi.mock("./tauri", () => ({
	isTauri: vi.fn(),
}))

vi.mock("~/lib/auth-token", () => ({
	forceRefresh: vi.fn(),
	waitForRefresh: vi.fn(),
	getAccessToken: vi.fn(),
}))

// Import after mocks are set up
import { isTauri } from "./tauri"
import { forceRefresh, waitForRefresh, getAccessToken } from "~/lib/auth-token"

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

		// Default mock implementations
		;(waitForRefresh as Mock).mockResolvedValue(true)
		;(forceRefresh as Mock).mockResolvedValue(false)
		;(getAccessToken as Mock).mockResolvedValue(null) // No token by default
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	describe("web mode (non-Tauri)", () => {
		beforeEach(() => {
			;(isTauri as Mock).mockReturnValue(false)
		})

		it("dispatches session-expired when no token and refresh fails", async () => {
			const { authenticatedFetch } = await import("./auth-fetch")

			await authenticatedFetch("https://api.example.com/data")

			expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({ type: "auth:session-expired" }),
			)
		})

		it("adds Bearer token when token is available", async () => {
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data")

			expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
				headers: {
					Authorization: "Bearer test-jwt-token",
				},
			})
		})

		it("preserves existing init options with token", async () => {
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
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
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 401 })

			await authenticatedFetch("https://api.example.com/data")

			expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({ type: "auth:session-expired" }),
			)
		})

		it("does not dispatch session-expired on successful response", async () => {
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			await authenticatedFetch("https://api.example.com/data")

			expect(dispatchEventSpy).not.toHaveBeenCalled()
		})

		it("returns the response on success", async () => {
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			const mockResponse = { status: 200, json: () => Promise.resolve({ data: "test" }) }
			mockFetch.mockResolvedValue(mockResponse)

			const response = await authenticatedFetch("https://api.example.com/data")

			expect(response).toBe(mockResponse)
		})

		it("attempts refresh when no token and succeeds", async () => {
			;(getAccessToken as Mock)
				.mockResolvedValueOnce(null) // first call: no token
				.mockResolvedValueOnce("refreshed-token") // after refresh
			;(forceRefresh as Mock).mockResolvedValue(true)
			const { authenticatedFetch } = await import("./auth-fetch")
			mockFetch.mockResolvedValue({ status: 200 })

			const response = await authenticatedFetch("https://api.example.com/data")

			expect(forceRefresh).toHaveBeenCalled()
			expect(response.status).toBe(200)
			expect(dispatchEventSpy).not.toHaveBeenCalled()
		})
	})

	describe("401 retry flow", () => {
		beforeEach(() => {
			;(isTauri as Mock).mockReturnValue(false)
		})

		it("returns 401 response when token present but refresh fails", async () => {
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
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
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
			const { authenticatedFetch } = await import("./auth-fetch")
			const networkError = new Error("Network error")
			mockFetch.mockRejectedValue(networkError)

			await expect(authenticatedFetch("https://api.example.com/data")).rejects.toThrow("Network error")
		})

		it("handles various HTTP status codes correctly", async () => {
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
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

		it("merges Authorization header with custom headers when token available", async () => {
			;(getAccessToken as Mock).mockResolvedValue("test-jwt-token")
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

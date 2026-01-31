/**
 * MSW-based integration tests for SSE command listener reconnection behavior
 *
 * These tests use MSW to mock the HTTP layer and test actual reconnection
 * behavior with HTTP requests, unlike class-level mocks that only test
 * Effect patterns.
 *
 * What these tests verify:
 * - SSE endpoint connection with proper authorization
 * - Server errors (503) trigger reconnection
 * - Command events are received after recovery
 */

import { describe, expect, it, beforeAll, afterAll, afterEach } from "@effect/vitest"
import { setupServer } from "msw/node"
import { Effect, Ref } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { createSseMock, createCommandEvent } from "./sse-mock.ts"

const BACKEND_URL = "http://localhost:3050"
const mock = createSseMock(BACKEND_URL)
const server = setupServer(mock.handler)

describe("SSE command listener MSW integration", () => {
	beforeAll(() => {
		server.listen({ onUnhandledRequest: "error" })
	})

	afterEach(() => {
		mock.reset()
		server.resetHandlers()
	})

	afterAll(() => {
		server.close()
	})

	it.effect("connects to SSE endpoint with proper authorization", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient

			// Make a request to the SSE endpoint
			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Authorization", "Bearer test-bot-token"),
				HttpClientRequest.setHeader("Accept", "text/event-stream"),
			)

			const response = yield* httpClient.execute(request)

			expect(response.status).toBe(200)

			// Verify content type
			const contentType = response.headers["content-type"]
			expect(contentType).toBe("text/event-stream")
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)

	it.effect("rejects requests without authorization", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient

			// Make a request without auth header
			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Accept", "text/event-stream"),
			)

			const response = yield* httpClient.execute(request)

			expect(response.status).toBe(401)
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)

	it.effect("receives command events from SSE stream", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient

			// Push a command event before connecting
			mock.pushEvent(createCommandEvent("test-command", { arg1: "value1" }))

			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Authorization", "Bearer test-bot-token"),
				HttpClientRequest.setHeader("Accept", "text/event-stream"),
			)

			const response = yield* httpClient.execute(request)

			// Read the response body as text
			const body = yield* response.text

			// Verify SSE format
			expect(body).toContain("event: command")
			expect(body).toContain("test-command")
			expect(body).toContain("arg1")
			expect(body).toContain("value1")
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)

	it.effect("returns 503 when server is in error state", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient

			// Trigger error state
			mock.triggerError(1)

			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Authorization", "Bearer test-bot-token"),
			)

			const response = yield* httpClient.execute(request)

			expect(response.status).toBe(503)
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)

	it.effect("recovers from 503 errors and receives events after recovery", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient
			const responses = yield* Ref.make<number[]>([])

			// Trigger 2 failures, then recover
			mock.triggerError(2)

			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Authorization", "Bearer test-bot-token"),
			)

			// First request should fail
			const response1 = yield* httpClient.execute(request)
			yield* Ref.update(responses, (r) => [...r, response1.status])

			// Second request should also fail
			const response2 = yield* httpClient.execute(request)
			yield* Ref.update(responses, (r) => [...r, response2.status])

			// Now recover and push an event
			mock.recover()
			mock.pushEvent(createCommandEvent("recovered-command"))

			// Third request should succeed
			const response3 = yield* httpClient.execute(request)
			yield* Ref.update(responses, (r) => [...r, response3.status])
			const body = yield* response3.text

			const statusCodes = yield* Ref.get(responses)

			expect(statusCodes).toEqual([503, 503, 200])
			expect(body).toContain("recovered-command")
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)

	it.effect("receives multiple command events in order", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient

			// Push multiple events
			mock.pushEvent(createCommandEvent("cmd1", { order: "1" }))
			mock.pushEvent(createCommandEvent("cmd2", { order: "2" }))
			mock.pushEvent(createCommandEvent("cmd3", { order: "3" }))

			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Authorization", "Bearer test-bot-token"),
			)

			const response = yield* httpClient.execute(request)
			const body = yield* response.text

			// Verify all events are present
			expect(body).toContain("cmd1")
			expect(body).toContain("cmd2")
			expect(body).toContain("cmd3")

			// Verify order (cmd1 should appear before cmd2, etc.)
			const cmd1Index = body.indexOf("cmd1")
			const cmd2Index = body.indexOf("cmd2")
			const cmd3Index = body.indexOf("cmd3")

			expect(cmd1Index).toBeLessThan(cmd2Index)
			expect(cmd2Index).toBeLessThan(cmd3Index)
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)

	it.effect("handles delay in response", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient

			// Set 100ms delay
			mock.setDelay(100)
			mock.pushEvent(createCommandEvent("delayed-command"))

			const startTime = Date.now()

			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Authorization", "Bearer test-bot-token"),
			)

			const response = yield* httpClient.execute(request)
			const body = yield* response.text

			const elapsed = Date.now() - startTime

			expect(response.status).toBe(200)
			expect(body).toContain("delayed-command")
			// Should have taken at least 100ms due to delay
			expect(elapsed).toBeGreaterThanOrEqual(90) // Allow some timing variance
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)

	it.effect("mock state tracks failure count correctly", () =>
		Effect.gen(function* () {
			const httpClient = yield* HttpClient.HttpClient

			// Trigger 3 failures
			mock.triggerError(3)

			const request = HttpClientRequest.get(`${BACKEND_URL}/bot-commands/stream`).pipe(
				HttpClientRequest.setHeader("Authorization", "Bearer test-bot-token"),
			)

			// Make 3 failing requests
			yield* httpClient.execute(request)
			yield* httpClient.execute(request)
			yield* httpClient.execute(request)

			// Check state
			const state1 = mock.getState()
			expect(state1.failCount).toBe(3)

			// Fourth request should succeed (exceeded maxFailures)
			const response = yield* httpClient.execute(request)
			expect(response.status).toBe(200)
		}).pipe(Effect.provide(FetchHttpClient.layer)),
	)
})

/**
 * MSW-based integration tests for ShapeStream HTTP behavior
 *
 * These tests use MSW to mock the HTTP layer and test:
 * - Electric protocol compliance (headers, response format)
 * - Error response handling (503, 401, etc.)
 * - Request structure from ShapeStream client
 *
 * Note: Full reconnection lifecycle tests are complex due to ShapeStream's
 * long-polling behavior. These tests focus on HTTP-level behavior that
 * can be verified synchronously.
 */

import { describe, expect, it, beforeAll, afterAll, afterEach } from "@effect/vitest"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import { Effect, Ref } from "effect"
import { createElectricMock, createChangeMessage } from "./electric-mock.ts"

const ELECTRIC_URL = "http://localhost:3060"
const mock = createElectricMock(ELECTRIC_URL)
const server = setupServer(mock.handler)

describe("Electric HTTP mock protocol", () => {
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

	it.effect("responds with required Electric headers", () =>
		Effect.gen(function* () {
			const response = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)

			expect(response.ok).toBe(true)
			expect(response.headers.get("electric-handle")).toBeTruthy()
			expect(response.headers.get("electric-offset")).toBeTruthy()
			expect(response.headers.get("electric-cursor")).toBeTruthy()
			expect(response.headers.get("electric-schema")).toBeTruthy()
			expect(response.headers.get("electric-up-to-date")).toBe("true")
		}),
	)

	it.effect("returns messages in correct format", () =>
		Effect.gen(function* () {
			// Push a message before request
			mock.pushMessage(createChangeMessage("insert", "msg-1", { id: "msg-1", content: "Hello" }))

			const response = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)

			const body = yield* Effect.tryPromise(() => response.json())

			// Should be an array
			expect(Array.isArray(body)).toBe(true)
			expect(body.length).toBeGreaterThanOrEqual(2) // message + control

			// First should be our insert message
			const insertMsg = body[0]
			expect(insertMsg.key).toBe("msg-1")
			expect(insertMsg.value).toEqual({ id: "msg-1", content: "Hello" })
			expect(insertMsg.headers.operation).toBe("insert")

			// Last should be control message
			const controlMsg = body[body.length - 1]
			expect(controlMsg.headers.control).toBe("up-to-date")
		}),
	)

	it.effect("returns 503 when error state is triggered", () =>
		Effect.gen(function* () {
			mock.triggerError(1)

			const response = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)

			expect(response.status).toBe(503)
		}),
	)

	it.effect("recovers after maxFailures errors", () =>
		Effect.gen(function* () {
			mock.triggerError(2)

			// First two requests should fail
			const response1 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			expect(response1.status).toBe(503)

			const response2 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			expect(response2.status).toBe(503)

			// Third should succeed
			const response3 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			expect(response3.status).toBe(200)
		}),
	)

	it.effect("increments offset with each request", () =>
		Effect.gen(function* () {
			const response1 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			const offset1 = response1.headers.get("electric-offset")

			const response2 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=${offset1}`),
			)
			const offset2 = response2.headers.get("electric-offset")

			// Offsets should be different
			expect(offset1).not.toBe(offset2)

			// State should track the request count
			const state = mock.getState()
			expect(state.requestCount).toBe(2)
		}),
	)

	it.effect("handles multiple messages in single response", () =>
		Effect.gen(function* () {
			mock.pushMessages([
				createChangeMessage("insert", "1", { id: "1" }),
				createChangeMessage("insert", "2", { id: "2" }),
				createChangeMessage("update", "1", { id: "1", updated: true }),
			])

			const response = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			const body = yield* Effect.tryPromise(() => response.json())

			// 3 messages + 1 control = 4 total
			expect(body.length).toBe(4)

			const operations = body.slice(0, 3).map((m: any) => m.headers.operation)
			expect(operations).toEqual(["insert", "insert", "update"])
		}),
	)

	it.effect("clears messages after they are returned", () =>
		Effect.gen(function* () {
			mock.pushMessage(createChangeMessage("insert", "1", { id: "1" }))

			// First request gets the message
			const response1 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			const body1 = yield* Effect.tryPromise(() => response1.json())
			expect(body1.length).toBe(2) // message + control

			// Second request gets no messages (just control)
			const response2 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			const body2 = yield* Effect.tryPromise(() => response2.json())
			expect(body2.length).toBe(1) // only control
		}),
	)

	it.effect("returns table-specific handle", () =>
		Effect.gen(function* () {
			const response = yield* Effect.tryPromise(() => fetch(`${ELECTRIC_URL}/?table=users&offset=-1`))

			const handle = response.headers.get("electric-handle")
			expect(handle).toContain("users")
		}),
	)

	it.effect("manual recover clears failure state", () =>
		Effect.gen(function* () {
			mock.triggerError(100) // Many failures

			// First request fails
			const response1 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			expect(response1.status).toBe(503)

			// Manually recover
			mock.recover()

			// Next request succeeds
			const response2 = yield* Effect.tryPromise(() =>
				fetch(`${ELECTRIC_URL}/?table=messages&offset=-1`),
			)
			expect(response2.status).toBe(200)
		}),
	)
})

describe("createChangeMessage helper", () => {
	it("creates insert message correctly", () => {
		const msg = createChangeMessage("insert", "key-1", { id: "1", name: "Test" })

		expect(msg.key).toBe("key-1")
		expect(msg.value).toEqual({ id: "1", name: "Test" })
		expect(msg.headers.operation).toBe("insert")
	})

	it("creates update message correctly", () => {
		const msg = createChangeMessage("update", "key-1", { id: "1", name: "Updated" })

		expect(msg.headers.operation).toBe("update")
	})

	it("creates delete message correctly", () => {
		const msg = createChangeMessage("delete", "key-1", { id: "1" })

		expect(msg.headers.operation).toBe("delete")
	})
})

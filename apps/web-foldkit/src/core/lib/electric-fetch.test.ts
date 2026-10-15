// @vitest-environment jsdom
import { FetchError } from "@electric-sql/client"
import { afterEach, describe, expect, test, vi } from "vitest"
import { clearAccessToken } from "./access-token"
import { electricFetchClient, electricOnError } from "./electric-fetch"

const fetchError = (status: number) => new FetchError(status, undefined, undefined, {}, "http://electric/v1/shape")

afterEach(() => {
	clearAccessToken()
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

describe("electricOnError", () => {
	test("retries a rejected token and errors that are not HTTP responses", () => {
		expect(electricOnError(fetchError(401))).toEqual({})
		expect(electricOnError(new TypeError("Failed to fetch"))).toEqual({})
	})

	test("stops on a request the proxy will never accept", () => {
		for (const status of [400, 403, 404]) expect(electricOnError(fetchError(status))).toBeUndefined()
	})
})

describe("electricFetchClient", () => {
	const shape = "http://electric/v1/shape?table=organizations"

	test("sends the shape request with the access token", async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValueOnce(Response.json({ token: "t1", expiresIn: 300 }))
			.mockResolvedValue(new Response("[]"))
		vi.stubGlobal("fetch", fetch)
		expect((await electricFetchClient(shape)).status).toBe(200)
		expect(fetch.mock.calls[1]?.[1]?.headers).toMatchObject({ Authorization: "Bearer t1" })
	})

	test("an API that does not answer the exchange is a retryable 503, not a rejected token", async () => {
		vi.useFakeTimers()
		vi.stubGlobal(
			"fetch",
			vi.fn<typeof globalThis.fetch>(async () => new Response(null, { status: 503 })),
		)
		const response = electricFetchClient(shape)
		await vi.runAllTimersAsync()
		expect((await response).status).toBe(503)
	})

	test("no session is a 401", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn<typeof globalThis.fetch>(async () => new Response(null, { status: 401 })),
		)
		expect((await electricFetchClient(shape)).status).toBe(401)
	})

	test("a token the proxy rejects is exchanged again on the next request", async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValueOnce(Response.json({ token: "t1", expiresIn: 300 }))
			.mockResolvedValueOnce(new Response(null, { status: 401 }))
			.mockResolvedValueOnce(Response.json({ token: "t2", expiresIn: 300 }))
			.mockResolvedValue(new Response("[]"))
		vi.stubGlobal("fetch", fetch)
		expect((await electricFetchClient(shape)).status).toBe(401)
		expect((await electricFetchClient(shape)).status).toBe(200)
		expect(fetch.mock.calls[3]?.[1]?.headers).toMatchObject({ Authorization: "Bearer t2" })
	})
})

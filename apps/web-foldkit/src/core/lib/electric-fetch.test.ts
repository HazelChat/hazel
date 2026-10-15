import { FetchError } from "@electric-sql/client"
import { describe, expect, test } from "vitest"
import { electricOnError } from "./electric-fetch"

const fetchError = (status: number) =>
	new FetchError(status, undefined, undefined, {}, "http://electric/v1/shape")

describe("electricOnError", () => {
	test("retries a rejected token and errors that are not HTTP responses", () => {
		expect(electricOnError(fetchError(401))).toEqual({})
		expect(electricOnError(new TypeError("Failed to fetch"))).toEqual({})
	})

	test("stops on a request the proxy will never accept", () => {
		for (const status of [400, 403, 404]) expect(electricOnError(fetchError(status))).toBeUndefined()
	})
})

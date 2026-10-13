import { describe, expect, test } from "vitest"
import { safeReturnTo } from "./return-to"

describe("safeReturnTo", () => {
	test("keeps same-origin paths and drops everything else", () => {
		expect(safeReturnTo("/hazel/chat?x=1")).toBe("/hazel/chat?x=1")
		expect(safeReturnTo("//evil.example")).toBeNull()
		expect(safeReturnTo("/\\evil.example")).toBeNull()
		expect(safeReturnTo("https://evil.example")).toBeNull()
		expect(safeReturnTo("")).toBeNull()
		expect(safeReturnTo(null)).toBeNull()
	})
})

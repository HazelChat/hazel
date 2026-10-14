import { describe, expect, it, vi } from "vitest"
import { isInQuietHours } from "./notification-sound-atoms"

describe("notification-sound-atoms", () => {
	it("returns false when quiet hours are not configured", () => {
		expect(isInQuietHours(null, "08:00")).toBe(false)
		expect(isInQuietHours("22:00", null)).toBe(false)
	})

	it("supports minute precision during same-day quiet hours", () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2025-01-01T10:30:00"))
		expect(isInQuietHours("10:15", "10:45")).toBe(true)
		expect(isInQuietHours("10:31", "10:45")).toBe(false)
		vi.useRealTimers()
	})

	it("supports quiet hours spanning midnight", () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2025-01-01T23:30:00"))
		expect(isInQuietHours("22:15", "06:45")).toBe(true)
		vi.setSystemTime(new Date("2025-01-01T12:00:00"))
		expect(isInQuietHours("22:15", "06:45")).toBe(false)
		vi.useRealTimers()
	})
})

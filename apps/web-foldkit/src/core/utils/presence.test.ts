import { describe, expect, it } from "vitest"
import { getEffectivePresenceStatus } from "./presence"

describe("getEffectivePresenceStatus", () => {
	it("returns online for recent lastSeenAt with status=online", () => {
		const now = Date.now()
		const status = getEffectivePresenceStatus(
			{ status: "online", lastSeenAt: new Date(now - 1_000) },
			now,
		)
		expect(status).toBe("online")
	})

	it("returns offline for stale lastSeenAt with status=online", () => {
		const now = Date.now()
		const status = getEffectivePresenceStatus(
			{ status: "online", lastSeenAt: new Date(now - 46_000) },
			now,
		)
		expect(status).toBe("offline")
	})

	it("returns offline for stale lastSeenAt with status=dnd", () => {
		const now = Date.now()
		const status = getEffectivePresenceStatus({ status: "dnd", lastSeenAt: new Date(now - 46_000) }, now)
		expect(status).toBe("offline")
	})

	it('returns online for recent lastSeenAt with stored status="offline" (anti-flicker)', () => {
		const now = Date.now()
		const status = getEffectivePresenceStatus(
			{ status: "offline", lastSeenAt: new Date(now - 1_000) },
			now,
		)
		expect(status).toBe("online")
	})

	it("returns offline when presence is missing", () => {
		const now = Date.now()
		const status = getEffectivePresenceStatus(null, now)
		expect(status).toBe("offline")
	})
})

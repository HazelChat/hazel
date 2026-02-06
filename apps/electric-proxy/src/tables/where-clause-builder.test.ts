import { schema } from "@hazel/db"
import { describe, expect, it } from "bun:test"
import { buildChannelAccessClause, buildChannelVisibilityClause } from "./where-clause-builder"

describe("where-clause-builder channel access", () => {
	it("buildChannelVisibilityClause uses single channel_access subquery", () => {
		const result = buildChannelVisibilityClause("user-1", schema.channelsTable.deletedAt)

		expect(result.params).toEqual(["user-1"])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).toContain(
			`"id" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
		expect(result.whereClause).not.toContain("COALESCE")
	})

	it("buildChannelAccessClause includes optional deletedAt and single subquery", () => {
		const result = buildChannelAccessClause(
			"user-1",
			schema.messagesTable.channelId,
			schema.messagesTable.deletedAt,
		)

		expect(result.params).toEqual(["user-1"])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
		expect(result.whereClause).not.toContain("COALESCE")
	})
})

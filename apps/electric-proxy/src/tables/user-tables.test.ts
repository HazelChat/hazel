import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import type { AuthenticatedUser } from "../auth/user-auth"
import { getWhereClauseForTable } from "./user-tables"

const testUser: AuthenticatedUser = {
	userId: "wrk_test_user",
	internalUserId: "00000000-0000-0000-0000-0000000000a1" as AuthenticatedUser["internalUserId"],
	email: "viewer@hazel.test",
}

const run = <A>(effect: Effect.Effect<A, any>) => Effect.runPromise(effect)

describe("user table where clauses", () => {
	it("filters connect conversations through mounted channel access", async () => {
		const result = await run(getWhereClauseForTable("connect_conversations", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).toContain(`IN (SELECT "conversationId" FROM connect_conversation_channels`)
		expect(result.whereClause).toContain(`"channelId" IN (SELECT "channelId" FROM channel_access`)
	})

	it("filters connect conversation channels by channel access", async () => {
		const result = await run(getWhereClauseForTable("connect_conversation_channels", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
	})

	it("filters connect participants by channel access", async () => {
		const result = await run(getWhereClauseForTable("connect_participants", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
	})

	it("filters messages by channel access and conversation access", async () => {
		const result = await run(getWhereClauseForTable("messages", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
		expect(result.whereClause).toContain(`"conversationId" IS NULL`)
		expect(result.whereClause).toContain(`"conversationId" IS NOT NULL`)
		expect(result.whereClause).toContain(`IN (SELECT "conversationId" FROM connect_conversation_channels`)
	})

	it("filters message reactions by channel access and conversation access", async () => {
		const result = await run(getWhereClauseForTable("message_reactions", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
		expect(result.whereClause).toContain(`"conversationId" IS NULL`)
		expect(result.whereClause).toContain(`"conversationId" IS NOT NULL`)
		expect(result.whereClause).toContain(`IN (SELECT "conversationId" FROM connect_conversation_channels`)
	})
})

import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import type { AuthenticatedUser } from "../auth/user-auth"
import { getWhereClauseForTable } from "./user-tables"

const testUser: AuthenticatedUser = {
	userId: "wrk_test_user",
	internalUserId: "00000000-0000-0000-0000-0000000000a1" as AuthenticatedUser["internalUserId"],
	email: "viewer@hazel.test",
}

describe("user table where clauses", () => {
	it("filters connect conversations through mounted channel access", async () => {
		const result = await Effect.runPromise(getWhereClauseForTable("connect_conversations", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).toContain(`IN (SELECT "conversationId" FROM connect_conversation_channels`)
		expect(result.whereClause).toContain(`"channelId" IN (SELECT "channelId" FROM channel_access`)
	})

	it("filters connect conversation channels by channel access", async () => {
		const result = await Effect.runPromise(
			getWhereClauseForTable("connect_conversation_channels", testUser),
		)

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
	})

	it("filters connect participants by channel access", async () => {
		const result = await Effect.runPromise(getWhereClauseForTable("connect_participants", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
	})

	it("filters connect invites by host or guest organization membership", async () => {
		const result = await Effect.runPromise(getWhereClauseForTable("connect_invites", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(`EXISTS (SELECT 1 FROM organization_members om`)
		expect(result.whereClause).toContain(`om."organizationId" = "hostOrganizationId"`)
		expect(result.whereClause).toContain(` OR om."organizationId" = "guestOrganizationId"`)
	})

	it("uses conversation and legacy channel branches for messages", async () => {
		const result = await Effect.runPromise(getWhereClauseForTable("messages", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(`EXISTS (SELECT 1 FROM channel_access ca`)
		expect(result.whereClause).toContain(`"conversationId" IS NOT NULL`)
		expect(result.whereClause).toContain(`LEFT JOIN connect_conversation_channels ccc`)
		expect(result.whereClause).toContain(
			`"messages"."conversationId" IS NULL AND ca."channelId" = "messages"."channelId"`,
		)
	})

	it("uses conversation and legacy channel branches for message reactions", async () => {
		const result = await Effect.runPromise(getWhereClauseForTable("message_reactions", testUser))

		expect(result.params).toEqual([testUser.internalUserId])
		expect(result.whereClause).toContain(`EXISTS (SELECT 1 FROM channel_access ca`)
		expect(result.whereClause).toContain(`"conversationId" IS NOT NULL`)
		expect(result.whereClause).toContain(`LEFT JOIN connect_conversation_channels ccc`)
		expect(result.whereClause).toContain(
			`"message_reactions"."conversationId" IS NULL AND ca."channelId" = "message_reactions"."channelId"`,
		)
	})
})

import { sql } from "@hazel/db"
import { schema } from "@hazel/db"
import type { UserId } from "@hazel/schema"
import { describe, expect, it } from "vitest"
import {
	assertWhereClauseParamsAreSequential,
	buildChannelAccessClause,
	buildChannelVisibilityClause,
	col,
	eqCol,
	inSubquery,
	isNullCol,
	sqlToWhereClause,
	WhereClauseParamMismatchError,
} from "./where-clause-builder"

describe("where-clause-builder channel access", () => {
	it("buildChannelVisibilityClause uses single channel_access subquery", () => {
		const result = buildChannelVisibilityClause("user-1" as UserId, schema.channelsTable.deletedAt)

		expect(result.params).toEqual(["user-1"])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).toMatch(
			/"id" IN \(SELECT "channelId" FROM "?channel_access"? WHERE "userId" = \$1\)/,
		)
		expect(result.whereClause).not.toContain("COALESCE")
		expect(result.whereClause).not.toContain(`"channels".`)
	})

	it("buildChannelAccessClause includes optional deletedAt and single subquery", () => {
		const result = buildChannelAccessClause(
			"user-1" as UserId,
			schema.messagesTable.channelId,
			schema.messagesTable.deletedAt,
		)

		expect(result.params).toEqual(["user-1"])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toMatch(
			/"channelId" IN \(SELECT "channelId" FROM "?channel_access"? WHERE "userId" = \$1\)/,
		)
		expect(result.whereClause).not.toContain("COALESCE")
		expect(result.whereClause).not.toContain(`"messages".`)
	})
})

describe("where-clause-builder sql compiler", () => {
	it("compiles drizzle sql to an Electric-compatible where clause", () => {
		const channelAccessSubquery = sql`(SELECT ${col(schema.channelAccessTable.channelId)} FROM ${schema.channelAccessTable} WHERE ${eqCol(schema.channelAccessTable.userId, "user-1" as UserId)})`
		const result = sqlToWhereClause(
			schema.channelsTable,
			sql`${isNullCol(schema.channelsTable.deletedAt)} AND ${inSubquery(schema.channelsTable.id, channelAccessSubquery)}`,
		)

		expect(result.params).toEqual(["user-1"])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).toMatch(
			/"id" IN \(SELECT "channelId" FROM "?channel_access"? WHERE "userId" = \$1\)/,
		)
		expect(result.whereClause).not.toContain(`"channels".`)
	})
})

describe("where-clause-builder param validation", () => {
	it("accepts repeated placeholder usage with one param", () => {
		const result = {
			whereClause: `"deletedAt" IS NULL AND ("userId" = $1 OR "authorId" = $1)`,
			params: ["user-1"],
		}

		expect(() => assertWhereClauseParamsAreSequential(result)).not.toThrow()
	})

	it("rejects gaps in placeholder sequence", () => {
		const result = {
			whereClause: `"channelId" IN ($1, $3)`,
			params: ["a", "b", "c"],
		}

		expect(() => assertWhereClauseParamsAreSequential(result)).toThrow(WhereClauseParamMismatchError)
	})

	it("rejects params without placeholders", () => {
		const result = {
			whereClause: `"deletedAt" IS NULL`,
			params: ["unexpected"],
		}

		expect(() => assertWhereClauseParamsAreSequential(result)).toThrow(WhereClauseParamMismatchError)
	})
})

import { schema, sql, type SQL, type SQLWrapper } from "@hazel/db"
import type { UserId } from "@hazel/schema"
import { QueryBuilder, type PgColumn, type PgTable } from "drizzle-orm/pg-core"

/**
 * Result of building a WHERE clause with parameterized values
 */
export interface WhereClauseResult {
	whereClause: string
	params: unknown[]
}

const queryBuilder = new QueryBuilder()

/**
 * Summary of placeholder/param usage in a WHERE clause.
 */
export interface WhereClauseParamStats {
	paramsCount: number
	uniquePlaceholderCount: number
	maxPlaceholderIndex: number
	startsAtOne: boolean
	hasGaps: boolean
}

/**
 * Error thrown when WHERE clause placeholders do not match params.
 */
export class WhereClauseParamMismatchError extends Error {
	readonly stats: WhereClauseParamStats

	constructor(result: WhereClauseResult, stats: WhereClauseParamStats) {
		super(
			`Invalid WHERE clause params: placeholders must be sequential from $1 with max index equal to params length (params=${stats.paramsCount}, uniquePlaceholders=${stats.uniquePlaceholderCount}, maxPlaceholder=${stats.maxPlaceholderIndex}, startsAtOne=${stats.startsAtOne}, hasGaps=${stats.hasGaps})`,
		)
		this.name = "WhereClauseParamMismatchError"
		this.stats = stats
	}
}

/**
 * Calculate placeholder/param stats for a WHERE clause.
 */
export function getWhereClauseParamStats(result: WhereClauseResult): WhereClauseParamStats {
	const placeholderMatches = [...result.whereClause.matchAll(/\$(\d+)/g)]
	const placeholders = placeholderMatches
		.map((match) => Number(match[1]))
		.filter((index) => Number.isInteger(index) && index > 0)
	const uniqueSorted = [...new Set(placeholders)].sort((a, b) => a - b)

	let hasGaps = false
	for (let i = 0; i < uniqueSorted.length; i++) {
		if (uniqueSorted[i] !== i + 1) {
			hasGaps = true
			break
		}
	}

	return {
		paramsCount: result.params.length,
		uniquePlaceholderCount: uniqueSorted.length,
		maxPlaceholderIndex: uniqueSorted[uniqueSorted.length - 1] ?? 0,
		startsAtOne: uniqueSorted.length === 0 ? result.params.length === 0 : uniqueSorted[0] === 1,
		hasGaps,
	}
}

/**
 * Ensure placeholder numbering and params length are compatible with Electric SQL.
 */
export function assertWhereClauseParamsAreSequential(result: WhereClauseResult): void {
	const stats = getWhereClauseParamStats(result)

	// No placeholders is only valid when there are also no params.
	if (stats.uniquePlaceholderCount === 0) {
		if (stats.paramsCount === 0) {
			return
		}
		throw new WhereClauseParamMismatchError(result, stats)
	}

	// Placeholders must start at $1, have no gaps, and the max index must match params length.
	if (!stats.startsAtOne || stats.hasGaps || stats.maxPlaceholderIndex !== stats.paramsCount) {
		throw new WhereClauseParamMismatchError(result, stats)
	}
}

const getRootTable = (column: PgColumn): PgTable => column.table as PgTable

export const col = (column: PgColumn) => sql.identifier(column.name)

export const eqCol = <T>(column: PgColumn, value: T | SQLWrapper): SQL => sql`${col(column)} = ${value}`

export const isNullCol = (column: PgColumn): SQL => sql`${col(column)} IS NULL`

export const inSubquery = (column: PgColumn, subquerySql: SQL): SQL => sql`${col(column)} IN ${subquerySql}`

const comma = sql.raw(", ")

const buildParamList = (values: readonly unknown[]): SQL =>
	sql`(${sql.join(
		values.map((value) => sql`${value}`),
		comma,
	)})`

const buildSubquery = (selectedColumn: PgColumn, table: PgTable, whereExpr: SQL): SQL =>
	sql`(SELECT ${col(selectedColumn)} FROM ${table} WHERE ${whereExpr})`

const extractWhereClause = (compiledSql: string): string => {
	const match = /\bwhere\b\s+([\s\S]*)$/i.exec(compiledSql)
	if (!match?.[1]) {
		throw new Error(`Failed to extract WHERE clause from compiled SQL: ${compiledSql}`)
	}
	return match[1].trim()
}

const dedupeParams = (whereClause: string, params: unknown[]): WhereClauseResult => {
	const dedupedParams: unknown[] = []
	const placeholderMap = new Map<number, number>()

	params.forEach((param, index) => {
		const existingIndex = dedupedParams.findIndex((existingParam) => Object.is(existingParam, param))
		if (existingIndex === -1) {
			dedupedParams.push(param)
			placeholderMap.set(index + 1, dedupedParams.length)
			return
		}

		placeholderMap.set(index + 1, existingIndex + 1)
	})

	const dedupedWhereClause = whereClause.replace(/\$(\d+)\b/g, (_, rawIndex: string) => {
		const nextIndex = placeholderMap.get(Number(rawIndex))
		return `$${nextIndex ?? Number(rawIndex)}`
	})

	return {
		whereClause: dedupedWhereClause,
		params: dedupedParams,
	}
}

export function sqlToWhereClause(
	rootTable: PgTable,
	whereExpr: SQL,
	overrideParams?: unknown[],
): WhereClauseResult {
	const compiled = queryBuilder
		.select({ __electric_where__: sql`1` })
		.from(rootTable)
		.where(whereExpr)
		.toSQL()
	const result = {
		whereClause: extractWhereClause(compiled.sql),
		params: overrideParams ?? compiled.params,
	}

	return dedupeParams(result.whereClause, result.params)
}

/**
 * Build IN clause with sorted IDs using unqualified column name.
 * Uses column.name for Electric SQL compatibility (Electric requires unqualified column names).
 *
 * @param column - The Drizzle column to filter on (uses column.name for unqualified name)
 * @param values - Array of values for the IN clause
 * @returns WhereClauseResult with parameterized WHERE clause
 */
export function buildInClause<T extends string>(column: PgColumn, values: readonly T[]): WhereClauseResult {
	if (values.length === 0) {
		return { whereClause: "false", params: [] }
	}
	const sorted = [...values].sort()
	return sqlToWhereClause(getRootTable(column), sql`${col(column)} IN ${buildParamList(sorted)}`)
}

/**
 * Build IN clause with deletedAt IS NULL check using unqualified column names.
 *
 * @param column - The Drizzle column to filter on
 * @param values - Array of values for the IN clause
 * @param deletedAtColumn - The deletedAt column to check for NULL
 * @returns WhereClauseResult with parameterized WHERE clause
 */
export function buildInClauseWithDeletedAt<T extends string>(
	column: PgColumn,
	values: readonly T[],
	deletedAtColumn: PgColumn,
): WhereClauseResult {
	if (values.length === 0) {
		return { whereClause: "false", params: [] }
	}
	const sorted = [...values].sort()
	return sqlToWhereClause(
		getRootTable(column),
		sql`${col(column)} IN ${buildParamList(sorted)} AND ${isNullCol(deletedAtColumn)}`,
	)
}

/**
 * Build equality check using unqualified column name.
 *
 * @param column - The Drizzle column to filter on
 * @param value - The value to compare against
 * @param paramIndex - The parameter index (default: 1)
 * @returns WhereClauseResult with parameterized WHERE clause
 */
export function buildEqClause<T>(column: PgColumn, value: T, paramIndex = 1): WhereClauseResult {
	const result = sqlToWhereClause(getRootTable(column), eqCol(column, value))
	if (paramIndex === 1) {
		return result
	}

	return {
		whereClause: result.whereClause.replace(/\$1\b/g, `$${paramIndex}`),
		params: result.params,
	}
}

/**
 * Build simple deletedAt IS NULL check using unqualified column name.
 *
 * @param deletedAtColumn - The deletedAt column to check for NULL
 * @returns WhereClauseResult with no parameters
 */
export function buildDeletedAtNullClause(deletedAtColumn: PgColumn): WhereClauseResult {
	return sqlToWhereClause(getRootTable(deletedAtColumn), isNullCol(deletedAtColumn))
}

/**
 * Build a "no filter" clause that matches all rows.
 *
 * @returns WhereClauseResult that matches all rows
 */
export function buildNoFilterClause(): WhereClauseResult {
	return {
		whereClause: "true",
		params: [],
	}
}

/**
 * Build channel visibility clause using subquery.
 * Shows channels using precomputed channel access rows for the user.
 *
 * Uses Electric's subquery feature (requires ELECTRIC_FEATURE_FLAGS=allow_subqueries).
 *
 * @param userId - The user's internal database UUID
 * @param deletedAtColumn - The deletedAt column to check for NULL
 * @returns WhereClauseResult with parameterized WHERE clause and subquery
 */
export function buildChannelVisibilityClause(userId: UserId, deletedAtColumn: PgColumn): WhereClauseResult {
	const channelAccessSubquery = buildSubquery(
		schema.channelAccessTable.channelId,
		schema.channelAccessTable,
		eqCol(schema.channelAccessTable.userId, userId),
	)

	return sqlToWhereClause(
		getRootTable(deletedAtColumn),
		sql`${isNullCol(deletedAtColumn)} AND ${inSubquery(schema.channelsTable.id, channelAccessSubquery)}`,
	)
}

/**
 * Build organization membership clause using subquery.
 * Filters rows to only those in organizations the user is a member of.
 *
 * Uses Electric's subquery feature (requires ELECTRIC_FEATURE_FLAGS=allow_subqueries).
 *
 * @param userId - The user's internal database UUID
 * @param orgIdColumn - The organizationId column to filter on
 * @param deletedAtColumn - Optional deletedAt column to check for NULL
 * @returns WhereClauseResult with parameterized WHERE clause and subquery
 */
export function buildOrgMembershipClause(
	userId: UserId,
	orgIdColumn: PgColumn,
	deletedAtColumn?: PgColumn,
): WhereClauseResult {
	const orgMembershipSubquery = buildSubquery(
		schema.organizationMembersTable.organizationId,
		schema.organizationMembersTable,
		sql`${eqCol(schema.organizationMembersTable.userId, userId)} AND ${isNullCol(schema.organizationMembersTable.deletedAt)}`,
	)

	const baseCondition = inSubquery(orgIdColumn, orgMembershipSubquery)
	const whereExpr = deletedAtColumn
		? sql`${isNullCol(deletedAtColumn)} AND ${baseCondition}`
		: baseCondition

	return sqlToWhereClause(getRootTable(orgIdColumn), whereExpr)
}

/**
 * Build user organization membership clause using subquery.
 * Filters users to only those who are members of the same organizations as the current user.
 *
 * Uses Electric's subquery feature (requires ELECTRIC_FEATURE_FLAGS=allow_subqueries).
 *
 * @param userId - The user's internal database UUID
 * @param userIdColumn - The user id column to filter on (users.id)
 * @param deletedAtColumn - The deletedAt column to check for NULL
 * @returns WhereClauseResult with parameterized WHERE clause and subquery
 */
export function buildUserOrgMembershipClause(
	userId: UserId,
	userIdColumn: PgColumn,
	deletedAtColumn: PgColumn,
): WhereClauseResult {
	const currentUserOrgIds = buildSubquery(
		schema.organizationMembersTable.organizationId,
		schema.organizationMembersTable,
		sql`${eqCol(schema.organizationMembersTable.userId, userId)} AND ${isNullCol(schema.organizationMembersTable.deletedAt)}`,
	)
	const sharedOrgUsers = buildSubquery(
		schema.organizationMembersTable.userId,
		schema.organizationMembersTable,
		sql`${col(schema.organizationMembersTable.organizationId)} IN ${currentUserOrgIds} AND ${isNullCol(schema.organizationMembersTable.deletedAt)}`,
	)

	return sqlToWhereClause(
		getRootTable(userIdColumn),
		sql`${isNullCol(deletedAtColumn)} AND ${inSubquery(userIdColumn, sharedOrgUsers)}`,
	)
}

/**
 * Build user membership clause using subquery.
 * Filters rows to only those belonging to the user's organization memberships.
 *
 * Uses Electric's subquery feature (requires ELECTRIC_FEATURE_FLAGS=allow_subqueries).
 *
 * @param userId - The user's internal database UUID
 * @param memberIdColumn - The memberId column to filter on
 * @returns WhereClauseResult with parameterized WHERE clause and subquery
 */
export function buildUserMembershipClause(userId: UserId, memberIdColumn: PgColumn): WhereClauseResult {
	const membershipSubquery = buildSubquery(
		schema.organizationMembersTable.id,
		schema.organizationMembersTable,
		sql`${eqCol(schema.organizationMembersTable.userId, userId)} AND ${isNullCol(schema.organizationMembersTable.deletedAt)}`,
	)

	return sqlToWhereClause(getRootTable(memberIdColumn), inSubquery(memberIdColumn, membershipSubquery))
}

/**
 * Build channel access clause using subquery.
 * Filters rows to only those in channels the user has access to.
 *
 * Uses Electric's subquery feature (requires ELECTRIC_FEATURE_FLAGS=allow_subqueries).
 *
 * @param userId - The user's internal database UUID
 * @param channelIdColumn - The channelId column to filter on
 * @param deletedAtColumn - Optional deletedAt column to check for NULL
 * @returns WhereClauseResult with parameterized WHERE clause and subquery
 */
export function buildChannelAccessClause(
	userId: UserId,
	channelIdColumn: PgColumn,
	deletedAtColumn?: PgColumn,
): WhereClauseResult {
	const channelAccessSubquery = buildSubquery(
		schema.channelAccessTable.channelId,
		schema.channelAccessTable,
		eqCol(schema.channelAccessTable.userId, userId),
	)
	const baseCondition = inSubquery(channelIdColumn, channelAccessSubquery)
	const whereExpr = deletedAtColumn
		? sql`${isNullCol(deletedAtColumn)} AND ${baseCondition}`
		: baseCondition

	return sqlToWhereClause(getRootTable(channelIdColumn), whereExpr)
}

/**
 * Build integration connection clause using subquery.
 * Filters to org-level connections in user's orgs OR user's own connections.
 *
 * Uses Electric's subquery feature (requires ELECTRIC_FEATURE_FLAGS=allow_subqueries).
 *
 * @param userId - The user's internal database UUID
 * @param deletedAtColumn - The deletedAt column to check for NULL
 * @returns WhereClauseResult with parameterized WHERE clause and subquery
 */
export function buildIntegrationConnectionClause(
	userId: UserId,
	deletedAtColumn: PgColumn,
): WhereClauseResult {
	const orgMembershipSubquery = buildSubquery(
		schema.organizationMembersTable.organizationId,
		schema.organizationMembersTable,
		sql`${eqCol(schema.organizationMembersTable.userId, userId)} AND ${isNullCol(schema.organizationMembersTable.deletedAt)}`,
	)

	return sqlToWhereClause(
		getRootTable(deletedAtColumn),
		sql`${isNullCol(deletedAtColumn)} AND ((${sql.identifier("userId")} IS NULL AND ${sql.identifier("organizationId")} IN ${orgMembershipSubquery}) OR ${sql.identifier("userId")} = ${userId})`,
	)
}

/**
 * Apply WHERE clause result to Electric URL with params.
 * Sets the "where" parameter and appends "params[N]" parameters directly to the URL string.
 *
 * URLSearchParams.set encodes brackets as %5B/%5D which Electric SQL may not decode,
 * causing HTTP 400 "Parameters must be numbered sequentially, starting from 1".
 * We build the params portion manually to keep brackets unencoded.
 *
 * @param url - The URL to modify (where clause is set via searchParams)
 * @param result - The WhereClauseResult
 * @returns The final URL string with unencoded bracket params
 */
export function applyWhereToElectricUrl(url: URL, result: WhereClauseResult): string {
	assertWhereClauseParamsAreSequential(result)
	url.searchParams.set("where", result.whereClause)

	// Append params with unencoded brackets directly to the URL string.
	// Electric uses params[1], params[2], etc. (1-indexed)
	let urlStr = url.toString()
	for (let i = 0; i < result.params.length; i++) {
		urlStr += `&params[${i + 1}]=${encodeURIComponent(String(result.params[i]))}`
	}
	return urlStr
}

import type { PgColumn } from "drizzle-orm/pg-core"

/**
 * Result of building a WHERE clause with parameterized values
 */
export interface WhereClauseResult {
	whereClause: string
	params: unknown[]
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
	const placeholders = sorted.map((_, i) => `$${i + 1}`).join(", ")
	return {
		whereClause: `"${column.name}" IN (${placeholders})`,
		params: sorted,
	}
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
	const placeholders = sorted.map((_, i) => `$${i + 1}`).join(", ")
	return {
		whereClause: `"${column.name}" IN (${placeholders}) AND "${deletedAtColumn.name}" IS NULL`,
		params: sorted,
	}
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
	return {
		whereClause: `"${column.name}" = $${paramIndex}`,
		params: [value],
	}
}

/**
 * Build simple deletedAt IS NULL check using unqualified column name.
 *
 * @param deletedAtColumn - The deletedAt column to check for NULL
 * @returns WhereClauseResult with no parameters
 */
export function buildDeletedAtNullClause(deletedAtColumn: PgColumn): WhereClauseResult {
	return {
		whereClause: `"${deletedAtColumn.name}" IS NULL`,
		params: [],
	}
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
export function buildChannelVisibilityClause(userId: string, deletedAtColumn: PgColumn): WhereClauseResult {
	const whereClause = `"${deletedAtColumn.name}" IS NULL AND "id" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`

	return {
		whereClause,
		params: [userId],
	}
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
	userId: string,
	orgIdColumn: PgColumn,
	deletedAtColumn?: PgColumn,
): WhereClauseResult {
	const deletedAtClause = deletedAtColumn ? `"${deletedAtColumn.name}" IS NULL AND ` : ""
	const whereClause = `${deletedAtClause}"${orgIdColumn.name}" IN (SELECT "organizationId" FROM organization_members WHERE "userId" = $1 AND "deletedAt" IS NULL)`
	return { whereClause, params: [userId] }
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
	userId: string,
	userIdColumn: PgColumn,
	deletedAtColumn: PgColumn,
): WhereClauseResult {
	// Filter users to those in same orgs as the current user
	const whereClause = `"${deletedAtColumn.name}" IS NULL AND "${userIdColumn.name}" IN (SELECT "userId" FROM organization_members WHERE "organizationId" IN (SELECT "organizationId" FROM organization_members WHERE "userId" = $1 AND "deletedAt" IS NULL) AND "deletedAt" IS NULL)`
	return { whereClause, params: [userId] }
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
export function buildUserMembershipClause(userId: string, memberIdColumn: PgColumn): WhereClauseResult {
	const whereClause = `"${memberIdColumn.name}" IN (SELECT "id" FROM organization_members WHERE "userId" = $1 AND "deletedAt" IS NULL)`
	return { whereClause, params: [userId] }
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
	userId: string,
	channelIdColumn: PgColumn,
	deletedAtColumn?: PgColumn,
): WhereClauseResult {
	const deletedAtClause = deletedAtColumn ? `"${deletedAtColumn.name}" IS NULL AND ` : ""
	const whereClause = `${deletedAtClause}"${channelIdColumn.name}" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`
	return { whereClause, params: [userId] }
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
	userId: string,
	deletedAtColumn: PgColumn,
): WhereClauseResult {
	// Org-level connections (userId IS NULL) in user's orgs OR user's own connections
	const whereClause = `"${deletedAtColumn.name}" IS NULL AND (("userId" IS NULL AND "organizationId" IN (SELECT "organizationId" FROM organization_members WHERE "userId" = $1 AND "deletedAt" IS NULL)) OR "userId" = $1)`
	return { whereClause, params: [userId] }
}

/**
 * Apply WHERE clause result to Electric URL with params.
 * Sets the "where" parameter and individual "params[N]" parameters.
 *
 * @param url - The URL to modify
 * @param result - The WhereClauseResult
 */
export function applyWhereToElectricUrl(url: URL, result: WhereClauseResult): void {
	url.searchParams.set("where", result.whereClause)

	// Electric uses params[1], params[2], etc. (1-indexed)
	result.params.forEach((value, index) => {
		url.searchParams.set(`params[${index + 1}]`, String(value))
	})
}

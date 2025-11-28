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
 * Apply WHERE clause result to Electric URL with params.
 * Sets the "subset__where" parameter and "subset__params" as a JSON object.
 *
 * @param url - The URL to modify
 * @param result - The WhereClauseResult
 */
export function applyWhereToElectricUrl(url: URL, result: WhereClauseResult): void {
	url.searchParams.set("subset__where", result.whereClause)

	if (result.params.length > 0) {
		const paramsObject: Record<string, string> = {}
		result.params.forEach((value, index) => {
			paramsObject[String(index + 1)] = String(value)
		})
		url.searchParams.set("subset__params", JSON.stringify(paramsObject))
	}
}

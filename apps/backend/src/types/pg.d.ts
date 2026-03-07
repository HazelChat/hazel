declare module "pg" {
	export class Pool {
		constructor(config: Record<string, unknown>)
		connect(): Promise<PoolClient>
		end(): Promise<void>
	}

	export interface QueryResultRow {
		[column: string]: unknown
	}

	export interface QueryResult<R extends QueryResultRow = QueryResultRow> {
		rows: R[]
	}

	export interface PoolClient {
		query<R extends QueryResultRow = QueryResultRow>(
			queryText: string,
			values?: unknown[],
		): Promise<QueryResult<R>>
		release(): void
	}
}

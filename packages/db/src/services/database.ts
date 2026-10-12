/**
 * The database every Hazel service codes against: effect-orm over `@effect/sql-pg`.
 *
 * Statements are Effects over the typed tables in `@hazel/db/tables`:
 *
 *     const db = yield* Database.Database
 *     const rows = yield* db.run(PG.from(schema.channelsTable).select().where(($) => [$.id.eq(id)]))
 *
 * `db.transaction(effect)` pins every statement in `effect` to one connection through fiber context,
 * so repositories and helpers need no transaction handle: whatever runs inside the transaction
 * joins it.
 */
import * as PgClient from "@effect/sql-pg/PgClient"
import * as Orm from "@maple-dev/effect-orm/database"
import { CompiledQueryDecodeError, postgresDialect, QueryBuilderError } from "@maple-dev/effect-orm/postgres"
import { Cause, Context, Duration, Effect, Layer, Option, Redacted, Schema, type Scope } from "effect"
import * as Reactivity from "effect/reactivity/Reactivity"
import * as SqlClient from "effect/sql/SqlClient"
import { SqlError } from "effect/sql/SqlError"

const DatabaseErrorType = Schema.Literals([
	"unique_violation",
	"foreign_key_violation",
	"connection_error",
	"query_error",
])

/**
 * A statement or transaction failed. `type` classifies it for callers that branch on it;
 * `constraint` names the violated constraint or unique index, when there is one.
 */
export class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", {
	type: DatabaseErrorType,
	message: Schema.String,
	sqlState: Schema.optional(Schema.String),
	constraint: Schema.optional(Schema.String),
	/** Postgres's DETAIL line, e.g. `Key (slug)=(acme) already exists.` */
	detail: Schema.optional(Schema.String),
	cause: Schema.Defect(),
}) {
	public override toString() {
		return `DatabaseError: ${this.message}`
	}
}

/** Walks a driver error chain (`SqlError` → reason → the server's error) for a string field. */
const findField = (cause: unknown, field: string): string | undefined => {
	let current: unknown = cause
	for (let depth = 0; depth < 8 && typeof current === "object" && current !== null; depth++) {
		const value = (current as Record<string, unknown>)[field]
		if (typeof value === "string" && value.length > 0) return value
		const next =
			"reason" in current && typeof current.reason === "object"
				? current.reason
				: "cause" in current
					? current.cause
					: undefined
		if (next === undefined || next === current) break
		current = next
	}
	return undefined
}

const classify = (sqlState: string | undefined, reason: string): typeof DatabaseErrorType.Type => {
	if (sqlState === "23505" || reason === "UniqueViolation") return "unique_violation"
	if (sqlState === "23503" || reason === "ForeignKeyViolation") return "foreign_key_violation"
	if (sqlState?.startsWith("08") || reason === "ConnectionError") return "connection_error"
	return "query_error"
}

/** What a statement can fail with below this module. */
type OrmFailure =
	| SqlError
	| Orm.DatabaseError
	| Orm.TransactionCommitFailed
	| Orm.TransactionRollbackFailed
	| Orm.TransactionOptionsRejected
	| Orm.TransactionUnsupported
	| Orm.TransactionClosed
	| QueryBuilderError
	| CompiledQueryDecodeError

const isOrmFailure = (value: unknown): value is OrmFailure =>
	value instanceof SqlError ||
	value instanceof Orm.DatabaseError ||
	value instanceof Orm.TransactionCommitFailed ||
	value instanceof Orm.TransactionRollbackFailed ||
	value instanceof Orm.TransactionOptionsRejected ||
	value instanceof Orm.TransactionUnsupported ||
	value instanceof Orm.TransactionClosed ||
	value instanceof QueryBuilderError ||
	value instanceof CompiledQueryDecodeError

export const toDatabaseError = (cause: OrmFailure): DatabaseError => {
	const sqlState =
		cause instanceof Orm.DatabaseError || cause instanceof Orm.TransactionCommitFailed
			? (cause.sqlState ?? findField(cause.cause, "code"))
			: findField(cause, "code")
	const reason =
		cause instanceof Orm.DatabaseError || cause instanceof Orm.TransactionCommitFailed
			? cause.reason
			: cause instanceof SqlError
				? cause.reason._tag
				: "Unknown"
	const constraint = findField(cause, "constraint") ?? findField(cause, "constraint_name")
	const detail = findField(cause, "detail")
	return new DatabaseError({
		type: classify(sqlState, reason),
		message: cause.message,
		...(sqlState === undefined ? undefined : { sqlState }),
		...(constraint === undefined ? undefined : { constraint }),
		...(detail === undefined ? undefined : { detail }),
		cause,
	})
}

/**
 * Absorbs effect-orm's and the driver's failures into `DatabaseError`; anything else the effect
 * failed with passes through. A failed COMMIT or ROLLBACK that `@effect/sql` turned into a defect
 * comes back as a `DatabaseError` too.
 */
const absorb = <A, E, R>(
	self: Effect.Effect<A, E, R>,
): Effect.Effect<A, Exclude<E, OrmFailure> | DatabaseError, R> =>
	self.pipe(
		Effect.catchIf(
			(error): error is Extract<E, OrmFailure> => isOrmFailure(error),
			(error) => Effect.fail(toDatabaseError(error)),
		),
		Effect.catchCauseIf(
			(cause) => !Cause.hasInterrupts(cause) && Option.isSome(driverDefect(cause)),
			(cause) => Effect.fail(toDatabaseError(Option.getOrThrow(driverDefect(cause)))),
		),
	) as Effect.Effect<A, Exclude<E, OrmFailure> | DatabaseError, R>

const driverDefect = (cause: Cause.Cause<unknown>): Option.Option<OrmFailure> => {
	for (const reason of cause.reasons) {
		if (
			Cause.isDieReason(reason) &&
			isOrmFailure(reason.defect) &&
			!(reason.defect instanceof Orm.TransactionClosed)
		) {
			return Option.some(reason.defect)
		}
	}
	return Option.none()
}

/**
 * What `run` takes: effect-orm's `Runnable`, plus any builder insert. Under TypeScript 5 a concrete
 * `PG.insertInto(table)` is not assignable to `Runnable`'s `CHInsert<any, ...>` (the variance of its
 * `onConflictDoUpdate` target), so inserts are recognised by their tag; the row type still comes from
 * the query.
 */
export type Runnable = Orm.Runnable | { readonly _tag: "CHInsert" }

export interface DatabaseShape {
	/** Compiles a built query or write, runs it, and decodes its rows (a write's RETURNING rows). */
	readonly run: <Q extends Runnable, const Given extends object = {}>(
		query: Q,
		params?: Given,
	) => Effect.Effect<ReadonlyArray<Orm.RowOf<Q>>, DatabaseError>
	/** `run`, keeping the first row. */
	readonly first: <Q extends Runnable, const Given extends object = {}>(
		query: Q,
		params?: Given,
	) => Effect.Effect<Option.Option<Orm.RowOf<Q>>, DatabaseError>
	/** Runs a `sql\`...\`` statement and returns its rows, decoded through `schema` when given. */
	readonly query: {
		(statement: Orm.StatementInput): Effect.Effect<ReadonlyArray<Record<string, unknown>>, DatabaseError>
		<A>(
			statement: Orm.StatementInput,
			schema: Orm.RowSchema<A>,
		): Effect.Effect<ReadonlyArray<A>, DatabaseError>
	}
	/** Runs a statement whose rows are not wanted. */
	readonly execute: (statement: Orm.StatementInput) => Effect.Effect<void, DatabaseError>
	/**
	 * Runs `body` in a transaction; a nested call is a savepoint. Any failure, defect or
	 * interruption rolls back, and the body's own errors come out unchanged.
	 */
	readonly transaction: <A, E, R>(
		body: Effect.Effect<A, E, R>,
		options?: Orm.TransactionOptions,
	) => Effect.Effect<A, E | DatabaseError, Exclude<R, Orm.Transaction>>
}

const makeShape = (getOrm: Effect.Effect<Orm.DatabaseApi>): DatabaseShape => {
	const run = (query: Runnable, params?: object) =>
		Effect.flatMap(getOrm, (orm) => absorb(orm.run(query as never, params as never)))
	return {
		run: run as DatabaseShape["run"],
		first: ((query: Runnable, params?: object) =>
			Effect.map(run(query, params), (rows) =>
				Option.fromNullishOr(rows[0]),
			)) as DatabaseShape["first"],
		query: ((statement: Orm.StatementInput, schema?: Orm.RowSchema<unknown>) =>
			Effect.flatMap(getOrm, (orm) =>
				absorb(schema === undefined ? orm.query(statement) : orm.query(statement, schema)),
			)) as DatabaseShape["query"],
		execute: (statement) => Effect.flatMap(getOrm, (orm) => absorb(orm.execute(statement))),
		transaction: (body, options) =>
			Effect.flatMap(getOrm, (orm) => absorb(orm.transaction(body, options))) as never,
	}
}

export class Database extends Context.Service<Database, DatabaseShape>()("Database") {}

/** effect-orm's database over a client, for Postgres. */
export const fromSqlClient = (sql: SqlClient.SqlClient): Orm.DatabaseApi =>
	Orm.fromSqlClient(sql, { dialect: postgresDialect })

export type Config = {
	url: Redacted.Redacted
	ssl: boolean
	maxConnections?: number
}

/** A long-lived pool, for long-running processes (Bun servers, the cluster, scripts). */
export const layer = (config: Config): Layer.Layer<Database, SqlError> =>
	Layer.effect(
		Database,
		Effect.gen(function* () {
			const sql = yield* SqlClient.SqlClient
			const orm = fromSqlClient(sql)
			return makeShape(Effect.succeed(orm))
		}),
	).pipe(
		Layer.provide(
			PgClient.layer({
				url: config.url,
				ssl: config.ssl,
				connectTimeout: Duration.seconds(10),
				...(config.maxConnections === undefined
					? undefined
					: { maxConnections: config.maxConnections }),
			}),
		),
	)

/**
 * The database for the current request. On Cloudflare Workers a TCP socket belongs to the request
 * that opened it, so an isolate-wide pool cannot be shared across requests; the Worker provides one
 * of these per request (see {@link makeRequestConnection}) and {@link layerRequestScoped} reads it
 * on every statement.
 */
export class DatabaseConnection extends Context.Service<
	DatabaseConnection,
	{ readonly orm: Orm.DatabaseApi }
>()("DatabaseConnection") {}

/**
 * Opens a client for one request. The pool dials nothing until the first statement, so requests
 * that never touch the database cost nothing, and it is closed with the given Scope. Through
 * Hyperdrive the pool lives at the edge, so `max` stays small, and statements stay unnamed: a
 * named prepared statement belongs to one connection, which the pooler need not hand back.
 */
export const makeRequestConnection = (
	url: string,
): Effect.Effect<DatabaseConnection["Service"], SqlError, Scope.Scope> =>
	Effect.gen(function* () {
		const services = yield* Layer.build(
			PgClient.layerFrom(
				PgClient.make({
					url: Redacted.make(url),
					maxConnections: 5,
					idleTimeout: Duration.seconds(5),
					connectTimeout: Duration.seconds(10),
					prepare: false,
				}),
			).pipe(Layer.provide(Reactivity.layer)),
		)
		return { orm: fromSqlClient(Context.get(services, SqlClient.SqlClient)) }
	})

/** The request's database; a defect when the Worker forgot to provide one. */
const requestOrm: Effect.Effect<Orm.DatabaseApi> = Effect.serviceOption(DatabaseConnection).pipe(
	Effect.flatMap((connection) =>
		Option.isSome(connection)
			? Effect.succeed(connection.value.orm)
			: Effect.die(new Error("DatabaseConnection is not provided for this request")),
	),
)

/** Reads the per-request {@link DatabaseConnection}; for Cloudflare Workers and Durable Objects. */
export const layerRequestScoped: Layer.Layer<Database> = Layer.succeed(Database, makeShape(requestOrm))

/** A database over an existing client (tests over PGlite or a container). */
export const layerFromSqlClient: Layer.Layer<Database, never, SqlClient.SqlClient> = Layer.effect(
	Database,
	Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient
		return makeShape(Effect.succeed(fromSqlClient(sql)))
	}),
)

/** Marks an effect as correct only inside a transaction (see effect-orm's `requireTransaction`). */
export const requireTransaction = Orm.requireTransaction

/** The open transaction; `transaction` provides it, `requireTransaction` requires it. */
export const Transaction = Orm.Transaction

export { sql } from "@maple-dev/effect-orm/database"

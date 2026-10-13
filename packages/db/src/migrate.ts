/**
 * The bundled migrations and how to apply them.
 *
 * `migrations/` holds one `<timestamp>_<name>/migration.sql` per migration, written by
 * `effect-orm generate` (`effect-orm.config.ts`) from `src/tables`. The first, `initial_schema`,
 * creates the schema exactly as `drizzle-kit push` left it; a database push built adopts it as
 * applied (see {@link adoptPushedSchema}).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import * as PgClient from "@effect/sql-pg/PgClient"
import * as Orm from "@maple-dev/effect-orm/database"
import * as Migrate from "@maple-dev/effect-orm/migrate"
import { postgresDialect } from "@maple-dev/effect-orm/postgres"
import { Effect, Layer, Redacted, Schema } from "effect"
import * as SqlClient from "effect/sql/SqlClient"

/** The migration a database `drizzle-kit push` built is adopted at: the schema push left. */
export const BASELINE_MIGRATION = "20261013000436_initial_schema"

export const migrationsFolder = (): string =>
	resolve(dirname(fileURLToPath(import.meta.url)), "../migrations")

/** The bundled migrations, ordered by the effect-orm runner. */
export const bundledMigrations = Effect.suspend(() => {
	const dir = migrationsFolder()
	const names = readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
	return Migrate.fromRecord(
		Object.fromEntries(
			names.map((name): [string, Migrate.MigrationInput] => {
				const snapshotPath = join(dir, name, "snapshot.json")
				return [
					name,
					{
						migration: readFileSync(join(dir, name, "migration.sql"), "utf8"),
						kind: "sql",
						...(existsSync(snapshotPath)
							? { snapshot: readFileSync(snapshotPath, "utf8") }
							: undefined),
					},
				]
			}),
		),
	)
})

const Found = Schema.Struct({ schema: Schema.Boolean, ledger: Schema.Boolean })

/**
 * A database whose schema `drizzle-kit push` created has tables and no effect-orm ledger: record
 * every migration up to the baseline as applied, without running them. Returns what it recorded.
 */
export const adoptPushedSchema = Effect.gen(function* () {
	const orm = Orm.fromSqlClient(yield* SqlClient.SqlClient, { dialect: postgresDialect })
	const [found] = yield* orm.query(
		Orm.sql`SELECT to_regclass('public.users') IS NOT NULL AS schema,
			to_regclass(${Migrate.LEDGER_TABLES.migrations}) IS NOT NULL AS ledger`,
		Found,
	)
	if (found === undefined || !found.schema || found.ledger) return []
	return yield* Migrate.baseline({ migrations: yield* bundledMigrations, upTo: BASELINE_MIGRATION })
})

/** Adopts a pushed schema if needed, then applies every bundled migration the database lacks. */
export const migrateBundled = Effect.gen(function* () {
	const adopted = yield* adoptPushedSchema
	const applied = yield* Migrate.run({ migrations: yield* bundledMigrations, strict: true })
	return { adopted, applied }
})

/** The migration driver over a fresh single-connection client to `url`. */
export const driverLayer = (url: string) =>
	Migrate.layerSqlClient().pipe(
		Layer.provideMerge(PgClient.layer({ url: Redacted.make(url), maxConnections: 1 })),
	)

/** Applies the bundled migrations to the database at `url` (tests, local setup, scripts). */
export const migrateUrl = (url: string) => migrateBundled.pipe(Effect.provide(driverLayer(url)))

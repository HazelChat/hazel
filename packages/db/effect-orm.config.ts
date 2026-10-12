import * as PgClient from "@effect/sql-pg/PgClient"
import { defineConfig } from "@maple-dev/effect-orm/kit"
import * as Migrate from "@maple-dev/effect-orm/migrate"
import { Layer, Redacted } from "effect"

export default defineConfig({
	dialect: "postgres",
	schema: "./src/tables/index.ts",
	// `<timestamp>_<name>/migration.sql`, the layout `db:migrate` applies.
	out: "./migrations",
	emit: "sql",
	// `migrate`, `status`, `verify` and `baseline` run against DATABASE_URL (local docker Postgres by default).
	driver: Migrate.layerSqlClient().pipe(
		Layer.provide(
			PgClient.layer({
				url: Redacted.make(
					process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/app",
				),
				maxConnections: 1,
			}),
		),
	),
})

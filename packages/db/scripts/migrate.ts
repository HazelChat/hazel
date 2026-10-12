/**
 * Apply the bundled migrations to a Postgres.
 *
 *   DATABASE_URL=postgres://… bun run db:migrate
 *
 * A database `drizzle-kit push` built (no effect-orm ledger yet) is adopted first: every migration up
 * to the baseline is recorded as applied without running, then the rest run.
 */
import { Effect } from "effect"
import { migrateUrl } from "../src/migrate"

const url = process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/app"

const program = migrateUrl(url).pipe(
	Effect.tap(({ adopted, applied }) =>
		Effect.log(
			[
				adopted.length > 0
					? `Adopted the existing schema: ${adopted.join(", ")} recorded as applied`
					: "",
				applied.length === 0 ? "Up to date" : `Applied ${applied.map((m) => m.name).join(", ")}`,
			]
				.filter(Boolean)
				.join("\n"),
		),
	),
)

Effect.runPromise(program).catch((error) => {
	console.error(error)
	process.exit(1)
})

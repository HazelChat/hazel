import { Database } from "@hazel/db"
import { Effect, Layer, Schedule } from "effect"
import { EnvVars } from "../lib/env-vars"

/**
 * Checks the database is reachable at startup, retrying for a while before giving up: the pool
 * itself connects lazily, so without this a bad DATABASE_URL would only surface on the first query.
 */
const ConnectionCheck = Layer.effectDiscard(
	Effect.gen(function* () {
		const db = yield* Database.Database
		yield* db.execute(Database.sql`SELECT 1`).pipe(
			Effect.retry(
				Schedule.jittered(Schedule.spaced("1.25 seconds")).pipe(
					(schedule) => Schedule.max([schedule, Schedule.recurs(10)]),
					Schedule.tap(({ attempt }) =>
						Effect.logWarning(
							`[Database client]: Connection to the database failed. Retrying (attempt ${attempt}).`,
						),
					),
				),
			),
			Effect.tap(() => Effect.logInfo("[Database client]: Connection to the database established.")),
			Effect.orDie,
		)
	}),
)

export const DatabaseLive = ConnectionCheck.pipe(
	Layer.provideMerge(
		Layer.unwrap(
			Effect.gen(function* () {
				const envVars = yield* EnvVars
				return Database.layer({
					url: envVars.DATABASE_URL,
					ssl: !envVars.IS_DEV,
				})
			}),
		).pipe(Layer.orDie),
	),
	Layer.provide(EnvVars.layer),
)

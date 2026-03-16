import { Database } from "@hazel/db"
import { Effect, Layer } from "effect"
import { EnvVars } from "../lib/env-vars"

export const DatabaseLive = Layer.unwrap(
	Effect.gen(function* () {
		const envVars = yield* EnvVars
		return Database.layer({
			url: envVars.DATABASE_URL,
			ssl: !envVars.IS_DEV,
		})
	}),
).pipe(Layer.provide(EnvVars.layer))

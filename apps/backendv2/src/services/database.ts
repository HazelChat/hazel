import { Database } from "@hazel/db"
import { Effect, Layer } from "effect"
import { EnvVars } from "../lib/env-vars"

export const DatabaseLive = Layer.unwrapEffect(
	EnvVars.pipe(
		Effect.map((envVars) =>
			Database.layer({
				url: envVars.DATABASE_URL,
				ssl: false,
			}),
		),
	),
).pipe(Layer.provide(EnvVars.Default))

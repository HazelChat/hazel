import { Context, Data, Effect, Layer } from "effect"
import { SQL } from "bun"

export class ValidationError extends Data.TaggedError("ValidationError")<{
	service: string
	message: string
}> {}

export class CredentialValidator extends Context.Service<CredentialValidator>()("CredentialValidator", {
	make: Effect.succeed({
		validateDatabase: (url: string) =>
			Effect.tryPromise({
				try: async () => {
					// Bun's SQL returns a tagged template literal function
					const sql = new SQL({ url })
					await sql`SELECT 1`
					sql.close()
					return { valid: true as const }
				},
				catch: (error) =>
					new ValidationError({
						service: "Database",
						message: error instanceof Error ? error.message : String(error),
					}),
			}),

		validateRedis: (url: string) =>
			Effect.tryPromise({
				try: async () => {
					const redis = new Bun.RedisClient(url)
					await redis.ping()
					redis.close()
					return { valid: true as const }
				},
				catch: (error) =>
					new ValidationError({
						service: "Redis",
						message: error instanceof Error ? error.message : String(error),
					}),
			}),
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}

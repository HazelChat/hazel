import { Data, Effect } from "effect"
import { WorkOS } from "@workos-inc/node"
import { SQL } from "bun"

export class ValidationError extends Data.TaggedError("ValidationError")<{
	service: string
	message: string
}> {}

export class CredentialValidator extends Effect.Service<CredentialValidator>()("CredentialValidator", {
	accessors: true,
	effect: Effect.succeed({
		validateWorkOS: (apiKey: string, _clientId: string) =>
			Effect.tryPromise({
				try: async () => {
					const workos = new WorkOS(apiKey)
					// Test API call - list organizations (limited to 1)
					await workos.organizations.listOrganizations({ limit: 1 })
					return { valid: true as const }
				},
				catch: (error) =>
					new ValidationError({
						service: "WorkOS",
						message: error instanceof Error ? error.message : String(error),
					}),
			}),

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
}) {}

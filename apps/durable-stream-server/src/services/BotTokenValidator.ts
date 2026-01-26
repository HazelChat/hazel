/**
 * Bot Token Validator Service
 *
 * Validates bot tokens by hashing them (SHA-256) and looking up the hash in the database.
 */
import { PgClient } from "@effect/sql-pg"
import { Effect, Option, Schema } from "effect"
import { InvalidTokenError } from "../errors.ts"

/**
 * Bot lookup result schema
 */
export const BotLookupResult = Schema.Struct({
	id: Schema.String,
	userId: Schema.String,
	name: Schema.String,
})
export type BotLookupResult = typeof BotLookupResult.Type

/**
 * Hash a token using SHA-256
 */
export const hashToken = (token: string): Effect.Effect<string> =>
	Effect.promise(async () => {
		const encoder = new TextEncoder()
		const data = encoder.encode(token)
		const hashBuffer = await crypto.subtle.digest("SHA-256", data)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
	})

/**
 * Validate a bot token and return the bot info if valid
 */
export const validateBotToken = (
	token: string,
): Effect.Effect<BotLookupResult, InvalidTokenError, PgClient.PgClient> =>
	Effect.gen(function* () {
		const sql = yield* PgClient.PgClient

		// Hash the token
		const tokenHash = yield* hashToken(token)

		// Query the bots table
		const results = yield* sql<{
			id: string
			user_id: string
			name: string
		}>`
			SELECT id, user_id, name
			FROM bots
			WHERE api_token_hash = ${tokenHash}
			  AND deleted_at IS NULL
			LIMIT 1
		`.pipe(Effect.orDie)

		if (results.length === 0) {
			return yield* new InvalidTokenError({ message: "Invalid bot token" })
		}

		const bot = results[0]!
		return {
			id: bot.id,
			userId: bot.user_id,
			name: bot.name,
		}
	})

/**
 * Try to validate a bot token, returning None if invalid
 */
export const tryValidateBotToken = (
	token: string,
): Effect.Effect<Option.Option<BotLookupResult>, never, PgClient.PgClient> =>
	validateBotToken(token).pipe(
		Effect.map(Option.some),
		Effect.catchTag("InvalidTokenError", () => Effect.succeed(Option.none())),
	)

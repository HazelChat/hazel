import { Database } from "@hazel/db"
import { Effect, Schema } from "effect"
import { TransactionIdFromString } from "./schema"

export const generateTransactionId = Effect.fn("generateTransactionId")(function* (
	tx?: <T>(
		fn: (client: Database.TransactionClient) => Promise<T>,
	) => Effect.Effect<T, Database.DatabaseError, never>,
) {
	const db = yield* Database.Database
	const executor = tx ?? db.execute
	const result = yield* executor((client) =>
		client.execute(`SELECT pg_current_xact_id()::xid::text as txid`),
	).pipe(
		Effect.map((rows) => rows[0]?.txid as string),
		Effect.flatMap((txid) => Schema.decode(TransactionIdFromString)(txid)),
		Effect.orDie,
	)

	return result
})

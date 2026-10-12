import { Database } from "@hazel/db"
import { TransactionIdFromString } from "@hazel/schema"
import { Effect, Schema } from "effect"

const TxidRow = Schema.Struct({ txid: Schema.String })

/**
 * The id of the open transaction, for Electric to confirm the client's optimistic write against.
 * Must run inside `db.transaction`, which pins this statement to the transaction's connection.
 */
export const generateTransactionId = Effect.fn("generateTransactionId")(function* () {
	const db = yield* Database.Database
	const rows = yield* db
		.query(Database.sql`SELECT pg_current_xact_id()::xid::text AS txid`, TxidRow)
		.pipe(
			Effect.catchTag("DatabaseError", (err) =>
				Effect.die(`Database error generating transaction ID: ${err}`),
			),
		)
	return yield* Schema.decodeEffect(TransactionIdFromString)(rows[0]?.txid ?? "").pipe(
		Effect.catchTag("SchemaError", (err) => Effect.die(`Failed to parse transaction ID: ${err}`)),
	)
}, Database.requireTransaction)

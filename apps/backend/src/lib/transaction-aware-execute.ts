import { Database } from "@hazel/db"
import { Effect, Option } from "effect"

export const transactionAwareExecute = Effect.fn("transactionAwareExecute")(
	<T>(fn: (client: Database.TransactionClient) => Promise<T>) =>
		Effect.gen(function* () {
			const maybeTx = yield* Effect.serviceOption(Database.TransactionContext)
			if (Option.isSome(maybeTx)) {
				return yield* maybeTx.value.execute(fn)
			}

			const db = yield* Database.Database
			return yield* db.execute((client) => fn(client as unknown as Database.TransactionClient))
		}),
)

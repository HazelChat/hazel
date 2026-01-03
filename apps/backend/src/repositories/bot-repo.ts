import { and, Database, eq, isNull, schema, type TransactionClient } from "@hazel/db"
import { type BotId, policyRequire } from "@hazel/domain"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class BotRepo extends Effect.Service<BotRepo>()("BotRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		// Find bot by ID
		const findById = (id: BotId, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: BotId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.botsTable)
								.where(
									and(eq(schema.botsTable.id, data.id), isNull(schema.botsTable.deletedAt)),
								)
								.limit(1),
						),
					policyRequire("Bot", "select"),
				)({ id }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		// Find bot by token hash
		const findByTokenHash = (tokenHash: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { tokenHash: string }) =>
						execute((client) =>
							client
								.select()
								.from(schema.botsTable)
								.where(
									and(
										eq(schema.botsTable.apiTokenHash, data.tokenHash),
										isNull(schema.botsTable.deletedAt),
									),
								)
								.limit(1),
						),
					policyRequire("Bot", "select"),
				)({ tokenHash }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		// Find bot by user ID
		const findByUserId = (userId: import("@hazel/domain").UserId, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { userId: import("@hazel/domain").UserId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.botsTable)
								.where(
									and(
										eq(schema.botsTable.userId, data.userId),
										isNull(schema.botsTable.deletedAt),
									),
								)
								.limit(1),
						),
					policyRequire("Bot", "select"),
				)({ userId }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		return {
			findById,
			findByTokenHash,
			findByUserId,
		}
	}),
	dependencies: [DatabaseLive],
}) {}

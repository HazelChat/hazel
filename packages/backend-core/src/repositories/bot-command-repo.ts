import { and, Database, eq, inArray, lt, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type BotCommandId, type BotId, policyRequire } from "@hazel/domain"
import { BotCommand } from "@hazel/domain/models"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class BotCommandRepo extends Effect.Service<BotCommandRepo>()("BotCommandRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.botCommandsTable, BotCommand.Model, {
			idColumn: "id",
			name: "BotCommand",
		})
		const db = yield* Database.Database

		// Find all commands for a bot
		const findByBot = (botId: BotId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { botId: BotId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.botCommandsTable)
							.where(eq(schema.botCommandsTable.botId, data.botId)),
					),
				policyRequire("BotCommand", "select"),
			)({ botId }, tx)

		// Find enabled commands for a bot
		const findEnabledByBot = (botId: BotId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { botId: BotId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.botCommandsTable)
							.where(
								and(
									eq(schema.botCommandsTable.botId, data.botId),
									eq(schema.botCommandsTable.isEnabled, true),
								),
							),
					),
				policyRequire("BotCommand", "select"),
			)({ botId }, tx)

		// Find commands for multiple bots (for getAvailableCommands)
		const findByBots = (botIds: BotId[], tx?: TxFn) => {
			if (botIds.length === 0) {
				return Effect.succeed([])
			}
			return db.makeQuery(
				(execute, data: { botIds: BotId[] }) =>
					execute((client) =>
						client
							.select()
							.from(schema.botCommandsTable)
							.where(
								and(
									inArray(schema.botCommandsTable.botId, data.botIds),
									eq(schema.botCommandsTable.isEnabled, true),
								),
							),
					),
				policyRequire("BotCommand", "select"),
			)({ botIds }, tx)
		}

		// Find a specific command by bot and name
		const findByBotAndName = (botId: BotId, name: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { botId: BotId; name: string }) =>
						execute((client) =>
							client
								.select()
								.from(schema.botCommandsTable)
								.where(
									and(
										eq(schema.botCommandsTable.botId, data.botId),
										eq(schema.botCommandsTable.name, data.name),
									),
								)
								.limit(1),
						),
					policyRequire("BotCommand", "select"),
				)({ botId, name }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		// Upsert command (for bot sync)
		const upsert = (
			data: {
				botId: BotId
				name: string
				description: string
				arguments: BotCommand.BotCommandArgument[] | null
				usageExample: string | null
			},
			tx?: TxFn,
		) =>
			db
				.makeQuery(
					(
						execute,
						d: {
							botId: BotId
							name: string
							description: string
							arguments: BotCommand.BotCommandArgument[] | null
							usageExample: string | null
						},
					) =>
						execute((client) => {
							// Convert null values to undefined for DB schema compatibility
							const args = (d.arguments ?? []).map((arg) => ({
								...arg,
								description: arg.description ?? undefined,
								placeholder: arg.placeholder ?? undefined,
							}))
							return client
								.insert(schema.botCommandsTable)
								.values({
									botId: d.botId,
									name: d.name,
									description: d.description,
									arguments: args,
									usageExample: d.usageExample,
									isEnabled: true,
								})
								.onConflictDoUpdate({
									target: [schema.botCommandsTable.botId, schema.botCommandsTable.name],
									set: {
										description: d.description,
										arguments: args,
										usageExample: d.usageExample,
										isEnabled: true,
										updatedAt: new Date(),
									},
								})
								.returning()
						}),
					policyRequire("BotCommand", "insert"),
				)(data, tx)
				.pipe(Effect.map((results) => results[0]))

		// Delete commands not updated since the given timestamp (for bot sync cleanup)
		const deleteStaleCommands = (botId: BotId, syncStartTime: Date, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { botId: BotId; syncStartTime: Date }) =>
					execute((client) =>
						client
							.delete(schema.botCommandsTable)
							.where(
								and(
									eq(schema.botCommandsTable.botId, data.botId),
									lt(schema.botCommandsTable.updatedAt, data.syncStartTime),
								),
							),
					),
				policyRequire("BotCommand", "delete"),
			)({ botId, syncStartTime }, tx)

		return {
			...baseRepo,
			findByBot,
			findEnabledByBot,
			findByBots,
			findByBotAndName,
			upsert,
			deleteStaleCommands,
		}
	}),
}) {}

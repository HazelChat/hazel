import {
	and,
	Database,
	eq,
	ilike,
	inArray,
	isNull,
	ModelRepository,
	or,
	schema,
	sql,
	type TransactionClient,
} from "@hazel/db"
import { policyRequire } from "@hazel/domain"
import type { BotId, UserId } from "@hazel/schema"
import { Bot } from "@hazel/domain/models"
import { Effect, Option, type Schema } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class BotRepo extends Effect.Service<BotRepo>()("BotRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.botsTable, Bot.Model, {
			idColumn: "id",
			name: "Bot",
		})
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
		const findByUserId = (userId: UserId, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { userId: UserId }) =>
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

		// Find all bots created by a user
		const findByCreator = (createdBy: UserId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { createdBy: UserId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.botsTable)
							.where(
								and(
									eq(schema.botsTable.createdBy, data.createdBy),
									isNull(schema.botsTable.deletedAt),
								),
							),
					),
				policyRequire("Bot", "select"),
			)({ createdBy }, tx)

		// Find all public bots (for marketplace)
		const findPublic = (search?: string, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { search?: string }) =>
					execute((client) => {
						const conditions = [
							eq(schema.botsTable.isPublic, true),
							isNull(schema.botsTable.deletedAt),
						]

						if (data.search) {
							conditions.push(
								or(
									ilike(schema.botsTable.name, `%${data.search}%`),
									ilike(schema.botsTable.description, `%${data.search}%`),
								)!,
							)
						}

						return client
							.select()
							.from(schema.botsTable)
							.where(and(...conditions))
							.orderBy(schema.botsTable.installCount)
					}),
				policyRequire("Bot", "select"),
			)({ search }, tx)

		// Find bots by IDs (for installed bots lookup)
		const findByIds = (ids: BotId[], tx?: TxFn) => {
			if (ids.length === 0) {
				return Effect.succeed([])
			}
			return db.makeQuery(
				(execute, data: { ids: BotId[] }) =>
					execute((client) =>
						client
							.select()
							.from(schema.botsTable)
							.where(
								and(
									inArray(schema.botsTable.id, data.ids),
									isNull(schema.botsTable.deletedAt),
								),
							),
					),
				policyRequire("Bot", "select"),
			)({ ids }, tx)
		}

		// Insert a new bot
		const insert = (data: Schema.Schema.Type<typeof Bot.Insert>, tx?: TxFn) =>
			db.makeQuery(
				(execute, input: typeof data) =>
					execute((client) =>
						client
							.insert(schema.botsTable)
							.values({
								userId: input.userId,
								createdBy: input.createdBy,
								name: input.name,
								description: input.description,
								webhookUrl: input.webhookUrl,
								apiTokenHash: input.apiTokenHash,
								scopes: input.scopes ? [...input.scopes] : null,
								metadata: input.metadata,
								isPublic: input.isPublic,
								installCount: input.installCount,
								allowedIntegrations: input.allowedIntegrations
									? [...input.allowedIntegrations]
									: null,
							})
							.returning(),
					),
				policyRequire("Bot", "insert"),
			)(data, tx)

		// Update a bot
		const update = (
			data: { id: BotId } & Partial<
				Omit<Schema.Schema.Type<typeof Bot.Update>, "id" | "createdAt" | "updatedAt" | "deletedAt">
			>,
			tx?: TxFn,
		) =>
			db
				.makeQuery(
					(execute, input: typeof data) =>
						execute((client) =>
							client
								.update(schema.botsTable)
								.set({
									...(input.name !== undefined && { name: input.name }),
									...(input.description !== undefined && {
										description: input.description,
									}),
									...(input.webhookUrl !== undefined && { webhookUrl: input.webhookUrl }),
									...(input.scopes !== undefined && {
										scopes: input.scopes ? [...input.scopes] : null,
									}),
									...(input.isPublic !== undefined && { isPublic: input.isPublic }),
									...(input.apiTokenHash !== undefined && {
										apiTokenHash: input.apiTokenHash,
									}),
									...(input.mentionable !== undefined && {
										mentionable: input.mentionable,
									}),
									updatedAt: new Date(),
								})
								.where(
									and(
										eq(schema.botsTable.id, input.id),
										isNull(schema.botsTable.deletedAt),
									),
								)
								.returning(),
						),
					policyRequire("Bot", "update"),
				)(data, tx)
				.pipe(Effect.map((results) => results[0]))

		// Update token hash
		const updateTokenHash = (id: BotId, tokenHash: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { id: BotId; tokenHash: string }) =>
						execute((client) =>
							client
								.update(schema.botsTable)
								.set({ apiTokenHash: data.tokenHash, updatedAt: new Date() })
								.where(
									and(eq(schema.botsTable.id, data.id), isNull(schema.botsTable.deletedAt)),
								)
								.returning(),
						),
					policyRequire("Bot", "update"),
				)({ id, tokenHash }, tx)
				.pipe(Effect.map((results) => results[0]))

		// Soft delete a bot
		const softDelete = (id: BotId, tx?: TxFn) =>
			db.makeQuery(
				(execute, botId: BotId) =>
					execute((client) =>
						client
							.update(schema.botsTable)
							.set({ deletedAt: new Date() })
							.where(and(eq(schema.botsTable.id, botId), isNull(schema.botsTable.deletedAt))),
					),
				policyRequire("Bot", "delete"),
			)(id, tx)

		// Increment install count
		const incrementInstallCount = (id: BotId, tx?: TxFn) =>
			db.makeQuery(
				(execute, botId: BotId) =>
					execute((client) =>
						client
							.update(schema.botsTable)
							.set({ installCount: sql`${schema.botsTable.installCount} + 1` })
							.where(eq(schema.botsTable.id, botId)),
					),
				policyRequire("Bot", "update"),
			)(id, tx)

		// Decrement install count
		const decrementInstallCount = (id: BotId, tx?: TxFn) =>
			db.makeQuery(
				(execute, botId: BotId) =>
					execute((client) =>
						client
							.update(schema.botsTable)
							.set({
								installCount: sql`GREATEST(0, ${schema.botsTable.installCount} - 1)`,
							})
							.where(eq(schema.botsTable.id, botId)),
					),
				policyRequire("Bot", "update"),
			)(id, tx)

		return {
			...baseRepo,
			findById,
			findByTokenHash,
			findByUserId,
			findByCreator,
			findPublic,
			findByIds,
			insert,
			update,
			updateTokenHash,
			softDelete,
			incrementInstallCount,
			decrementInstallCount,
		}
	}),
}) {}

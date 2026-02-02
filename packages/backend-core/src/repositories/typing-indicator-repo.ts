import { and, Database, eq, lt, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type ChannelId, type ChannelMemberId, policyRequire, TypingIndicatorId } from "@hazel/domain"
import { TypingIndicator } from "@hazel/domain/models"
import { Effect } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class TypingIndicatorRepo extends Effect.Service<TypingIndicatorRepo>()("TypingIndicatorRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const db = yield* Database.Database
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.typingIndicatorsTable,
			TypingIndicator.Model,
			{
				idColumn: "id",
				name: "TypingIndicator",
			},
		)

		// Add custom method to delete by channel and member
		const deleteByChannelAndMember = (
			{
				channelId,
				memberId,
			}: {
				channelId: ChannelId
				memberId: ChannelMemberId
			},
			tx?: TxFn,
		) =>
			db.makeQuery(
				(execute, _data) =>
					execute((client) =>
						client
							.delete(schema.typingIndicatorsTable)
							.where(
								and(
									eq(schema.typingIndicatorsTable.channelId, channelId),
									eq(schema.typingIndicatorsTable.memberId, memberId),
								),
							),
					),
				policyRequire("TypingIndicator", "delete"),
			)({ channelId, memberId }, tx)

		// Upsert method to create or update typing indicator
		const upsertByChannelAndMember = (
			params: {
				channelId: ChannelId
				memberId: ChannelMemberId
				lastTyped: number
			},
			tx?: TxFn,
		) =>
			db.makeQuery(
				(execute, _data) =>
					execute((client) => {
						return client
							.insert(schema.typingIndicatorsTable)
							.values({
								id: TypingIndicatorId.make(crypto.randomUUID()),
								channelId: params.channelId,
								memberId: params.memberId,
								lastTyped: params.lastTyped,
							})
							.onConflictDoUpdate({
								target: [
									schema.typingIndicatorsTable.channelId,
									schema.typingIndicatorsTable.memberId,
								],
								set: { lastTyped: params.lastTyped },
							})
							.returning()
					}),
				policyRequire("TypingIndicator", "create"),
			)(params, tx)

		// Cleanup method to remove stale indicators
		const deleteStale = (thresholdMs: number = 10000, tx?: TxFn) => {
			const threshold = Date.now() - thresholdMs
			return db.makeQuery(
				(execute, _data) =>
					execute((client) =>
						client
							.delete(schema.typingIndicatorsTable)
							.where(lt(schema.typingIndicatorsTable.lastTyped, threshold))
							.returning(),
					),
				policyRequire("TypingIndicator", "delete"),
			)({}, tx)
		}

		return {
			...baseRepo,
			deleteByChannelAndMember,
			upsertByChannelAndMember,
			deleteStale,
		}
	}),
}) {}

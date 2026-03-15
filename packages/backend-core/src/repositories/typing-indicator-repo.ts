import { and, Database, eq, lt, ModelRepository, schema, type TxFn } from "@hazel/db"

import { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/schema"
import { TypingIndicator } from "@hazel/domain/models"
import { ServiceMap, Effect } from "effect"

export class TypingIndicatorRepo extends ServiceMap.Service<TypingIndicatorRepo>()("TypingIndicatorRepo", {
	make: Effect.gen(function* () {
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
			db.makeQuery((execute, _data) =>
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
			db.makeQuery((execute, _data) =>
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
			)(params, tx)

		// Cleanup method to remove stale indicators
		const deleteStale = (thresholdMs: number = 10000, tx?: TxFn) => {
			const threshold = Date.now() - thresholdMs
			return db.makeQuery((execute, _data) =>
				execute((client) =>
					client
						.delete(schema.typingIndicatorsTable)
						.where(lt(schema.typingIndicatorsTable.lastTyped, threshold))
						.returning(),
				),
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

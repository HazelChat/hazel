import { and, Database, eq, lt, ModelRepository, schema, sql } from "@hazel/db"
import { TypingIndicator } from "@hazel/db/models"
import { type ChannelId, type ChannelMemberId, policyRequire, type TypingIndicatorId } from "@hazel/db/schema"
import { Effect } from "effect"
import { v4 as uuid } from "uuid"
import { DatabaseLive } from "../services/database"

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
		const deleteByChannelAndMember = ({
			channelId,
			memberId,
		}: {
			channelId: ChannelId
			memberId: ChannelMemberId
		}) =>
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
			)({ channelId, memberId })

		// Upsert method to create or update typing indicator
		const upsertByChannelAndMember = (params: {
			channelId: ChannelId
			memberId: ChannelMemberId
			lastTyped: number
		}) =>
			db.makeQuery(
				(execute, _data) =>
					execute((client) => {
						const id = uuid() as TypingIndicatorId
						return client
							.insert(schema.typingIndicatorsTable)
							.values({
								id,
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
			)(params)

		// Cleanup method to remove stale indicators
		const deleteStale = (thresholdMs: number = 10000) => {
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
			)({})
		}

		return {
			...baseRepo,
			deleteByChannelAndMember,
			upsertByChannelAndMember,
			deleteStale,
		}
	}),
	dependencies: [DatabaseLive],
}) {}

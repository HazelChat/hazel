import { Database, ModelRepository, schema, eq, and } from "@hazel/db"
import { TypingIndicator } from "@hazel/db/models"
import { ChannelId, ChannelMemberId } from "@hazel/db/schema"
import { Effect } from "effect"
import { DatabaseLive } from "../services/database"

export class TypingIndicatorRepo extends Effect.Service<TypingIndicatorRepo>()("TypingIndicatorRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const db = yield* Database.Database
		const baseRepo = yield* ModelRepository.makeRepository(schema.typingIndicatorsTable, TypingIndicator.Model, {
			idColumn: "id",
		})

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
			)({ channelId, memberId })

		return {
			...baseRepo,
			deleteByChannelAndMember,
		}
	}),
	dependencies: [DatabaseLive],
}) {}
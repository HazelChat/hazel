import { and, Database, eq, isNull, ModelRepository, schema, type TxFn } from "@hazel/db"
import type { ChannelId, ConnectConversationId, UserId } from "@hazel/schema"
import { ConnectParticipant } from "@hazel/domain/models"
import { Effect, Option } from "effect"

export class ConnectParticipantRepo extends Effect.Service<ConnectParticipantRepo>()(
	"ConnectParticipantRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.connectParticipantsTable,
				ConnectParticipant.Model,
				{
					idColumn: "id",
					name: "ConnectParticipant",
				},
			)
			const db = yield* Database.Database

			const findByChannelAndUser = (channelId: ChannelId, userId: UserId, tx?: TxFn) =>
				db
					.makeQuery((execute, input: { channelId: ChannelId; userId: UserId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.connectParticipantsTable)
								.where(
									and(
										eq(schema.connectParticipantsTable.channelId, input.channelId),
										eq(schema.connectParticipantsTable.userId, input.userId),
										isNull(schema.connectParticipantsTable.deletedAt),
									),
								)
								.limit(1),
						),
					)({ channelId, userId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const listByChannel = (channelId: ChannelId, tx?: TxFn) =>
				db.makeQuery((execute, input: ChannelId) =>
					execute((client) =>
						client
							.select()
							.from(schema.connectParticipantsTable)
							.where(
								and(
									eq(schema.connectParticipantsTable.channelId, input),
									isNull(schema.connectParticipantsTable.deletedAt),
								),
							),
					),
				)(channelId, tx)

			const listByConversation = (conversationId: ConnectConversationId, tx?: TxFn) =>
				db.makeQuery((execute, input: ConnectConversationId) =>
					execute((client) =>
						client
							.select()
							.from(schema.connectParticipantsTable)
							.where(
								and(
									eq(schema.connectParticipantsTable.conversationId, input),
									isNull(schema.connectParticipantsTable.deletedAt),
								),
							),
					),
				)(conversationId, tx)

			return {
				...baseRepo,
				findByChannelAndUser,
				listByChannel,
				listByConversation,
			}
		}),
	},
) {}

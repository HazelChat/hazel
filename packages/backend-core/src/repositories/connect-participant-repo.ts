import { and, Database, eq, isNull, ModelRepository, schema, type TxFn } from "@hazel/db"
import type { ChannelId, ConnectConversationId, UserId } from "@hazel/schema"
import { ConnectParticipant } from "@hazel/domain/models"
import { ServiceMap, Effect, Option, type Schema as EffectSchema } from "effect"

export class ConnectParticipantRepo extends ServiceMap.Service<ConnectParticipantRepo>()(
	"ConnectParticipantRepo",
	{
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

			const upsertByChannelAndUser = (
				data: EffectSchema.Schema.Type<typeof ConnectParticipant.Insert>,
				tx?: TxFn,
			) =>
				baseRepo.insert(data, tx).pipe(
					Effect.map((results) => results[0]!),
					Effect.catchTag("DatabaseError", (error) => {
						if (
							error.type !== "unique_violation" ||
							(error.cause as { constraint_name?: string } | undefined)?.constraint_name !==
								"connect_participants_channel_user_unique"
						) {
							return Effect.fail(error)
						}

						return findByChannelAndUser(data.channelId, data.userId, tx).pipe(
							Effect.flatMap(
								Option.match({
									onNone: () => Effect.fail(error),
									onSome: (existing) =>
										baseRepo.update(
											{
												id: existing.id,
												conversationId: data.conversationId,
												homeOrganizationId: data.homeOrganizationId,
												isExternal: data.isExternal,
												addedBy: data.addedBy,
												deletedAt: data.deletedAt,
											},
											tx,
										),
								}),
							),
						)
					}),
				)

			return {
				...baseRepo,
				findByChannelAndUser,
				listByChannel,
				listByConversation,
				upsertByChannelAndUser,
			}
		}),
	},
) {}

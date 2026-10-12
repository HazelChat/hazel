import { Database, PG, Repository, schema } from "@hazel/db"
import type { ChannelId, ConnectConversationId, UserId } from "@hazel/schema"
import { ConnectParticipant } from "@hazel/domain/models"
import { Context, Effect, Layer, Option, type Schema as EffectSchema } from "effect"

export class ConnectParticipantRepo extends Context.Service<ConnectParticipantRepo>()(
	"ConnectParticipantRepo",
	{
		make: Effect.gen(function* () {
			const baseRepo = yield* Repository.makeRepository(
				schema.connectParticipantsTable,
				{ insert: ConnectParticipant.Insert, update: ConnectParticipant.Update },
				{
					idColumn: "id",
					name: "ConnectParticipant",
				},
			)
			const db = yield* Database.Database

			const findByChannelAndUser = (channelId: ChannelId, userId: UserId) =>
				db.first(
					PG.from(schema.connectParticipantsTable)
						.select()
						.where(($) => [$.channelId.eq(channelId), $.userId.eq(userId), $.deletedAt.isNull()])
						.limit(1),
				)

			const listByChannel = (channelId: ChannelId) =>
				db.run(
					PG.from(schema.connectParticipantsTable)
						.select()
						.where(($) => [$.channelId.eq(channelId), $.deletedAt.isNull()]),
				)

			const listByConversation = (conversationId: ConnectConversationId) =>
				db.run(
					PG.from(schema.connectParticipantsTable)
						.select()
						.where(($) => [$.conversationId.eq(conversationId), $.deletedAt.isNull()]),
				)

			const upsertByChannelAndUser = (
				data: EffectSchema.Schema.Type<typeof ConnectParticipant.Insert>,
			) =>
				baseRepo.insert(data).pipe(
					Effect.map((results) => results[0]!),
					Effect.catchTag("DatabaseError", (error) => {
						if (
							error.type !== "unique_violation" ||
							error.constraint !== "connect_participants_channel_user_unique"
						) {
							return Effect.fail(error)
						}

						return findByChannelAndUser(data.channelId, data.userId).pipe(
							Effect.flatMap(
								Option.match({
									onNone: () => Effect.fail(error),
									onSome: (existing) =>
										baseRepo.update({
											id: existing.id,
											conversationId: data.conversationId,
											homeOrganizationId: data.homeOrganizationId,
											isExternal: data.isExternal,
											addedBy: data.addedBy,
											deletedAt: data.deletedAt,
										}),
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
) {
	static readonly layer = Layer.effect(this, this.make)
}

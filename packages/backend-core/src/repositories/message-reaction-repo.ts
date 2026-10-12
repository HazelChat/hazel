import { Database, PG, Repository, schema } from "@hazel/db"

import type { ChannelId, ConnectConversationId, MessageId, UserId } from "@hazel/schema"
import { MessageReaction } from "@hazel/domain/models"
import { Context, Effect, Layer } from "effect"

export class MessageReactionRepo extends Context.Service<MessageReactionRepo>()("MessageReactionRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* Repository.makeRepository(
			schema.messageReactionsTable,
			{ insert: MessageReaction.Insert, update: MessageReaction.Update },
			{
				idColumn: "id",
				name: "MessageReaction",
			},
		)

		const db = yield* Database.Database

		const findByMessageUserEmoji = (messageId: MessageId, userId: UserId, emoji: string) =>
			db.first(
				PG.from(schema.messageReactionsTable)
					.select()
					.where(($) => [$.messageId.eq(messageId), $.userId.eq(userId), $.emoji.eq(emoji)])
					.limit(1),
			)

		const backfillConversationIdForChannel = (
			channelId: ChannelId,
			conversationId: ConnectConversationId,
		) =>
			db.run(
				PG.update(schema.messageReactionsTable)
					.set({ conversationId })
					.where(($) => [$.channelId.eq(channelId), $.conversationId.isNull()]),
			)

		return {
			...baseRepo,
			findByMessageUserEmoji,
			backfillConversationIdForChannel,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}

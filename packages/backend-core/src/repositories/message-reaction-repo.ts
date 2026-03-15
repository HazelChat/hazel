import { and, Database, eq, isNull, ModelRepository, schema, type TxFn } from "@hazel/db"

import type { ChannelId, ConnectConversationId, MessageId, UserId } from "@hazel/schema"
import { MessageReaction } from "@hazel/domain/models"
import { ServiceMap, Effect, Option } from "effect"

export class MessageReactionRepo extends ServiceMap.Service<MessageReactionRepo>()("MessageReactionRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.messageReactionsTable,
			MessageReaction.Model,
			{
				idColumn: "id",
				name: "MessageReaction",
			},
		)

		const db = yield* Database.Database

		const findByMessageUserEmoji = (messageId: MessageId, userId: UserId, emoji: string) =>
			db
				.makeQuery((execute, data: { messageId: MessageId; userId: UserId; emoji: string }) =>
					execute((client) =>
						client
							.select()
							.from(schema.messageReactionsTable)
							.where(
								and(
									eq(schema.messageReactionsTable.messageId, data.messageId),
									eq(schema.messageReactionsTable.userId, data.userId),
									eq(schema.messageReactionsTable.emoji, data.emoji),
								),
							)
							.limit(1),
					),
				)({ messageId, userId, emoji })
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		const backfillConversationIdForChannel = (
			channelId: ChannelId,
			conversationId: ConnectConversationId,
			tx?: TxFn,
		) =>
			db.makeQuery((execute, input: { channelId: ChannelId; conversationId: ConnectConversationId }) =>
				execute((client) =>
					client
						.update(schema.messageReactionsTable)
						.set({ conversationId: input.conversationId })
						.where(
							and(
								eq(schema.messageReactionsTable.channelId, input.channelId),
								isNull(schema.messageReactionsTable.conversationId),
							),
						),
				),
			)({ channelId, conversationId }, tx)

		return {
			...baseRepo,
			findByMessageUserEmoji,
			backfillConversationIdForChannel,
		}
	}),
}) {}

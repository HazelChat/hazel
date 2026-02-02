import { and, Database, eq, ModelRepository, schema } from "@hazel/db"
import { type MessageId, policyRequire, type UserId } from "@hazel/domain"
import { MessageReaction } from "@hazel/domain/models"
import { Effect, Option } from "effect"

export class MessageReactionRepo extends Effect.Service<MessageReactionRepo>()("MessageReactionRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
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
				.makeQuery(
					(execute, data: { messageId: MessageId; userId: UserId; emoji: string }) =>
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
					policyRequire("MessageReaction", "select"),
				)({ messageId, userId, emoji })
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		return {
			...baseRepo,
			findByMessageUserEmoji,
		}
	}),
}) {}

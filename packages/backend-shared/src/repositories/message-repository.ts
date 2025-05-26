import { Model } from "@maki-chat/api-schema"
import { Message, type MessageId } from "@maki-chat/api-schema/schema"
import { Effect } from "effect"
import { Database } from "../services/internal/database"

import { schema } from "@maki-chat/drizzle"
import { eq } from "drizzle-orm"

export class MessageRepo extends Effect.Service<MessageRepo>()("@hazel/Message/Repo", {
	effect: Effect.gen(function* () {
		const db = yield* Database

		const baseModel = yield* Model.makeRepository(Message, {
			tableName: "messages",
			spanPrefix: "MessageRepo",
			idColumn: "id",
		})

		const findById = db.makeQuery((ex, id: MessageId) =>
			ex((client) =>
				client.query.messages.findFirst({
					where: (table, { eq }) => eq(table.id, id),
				}),
			),
		)

		const _delete = db.makeQuery((ex, id: MessageId) =>
			ex((client) => client.delete(schema.messages).where(eq(schema.messages.id, id)).returning()),
		)

		// const update = db.makeQuery(
		// 	(ex, { id, message }: { id: MessageId; message: typeof Message.jsonUpdate.Encoded }) =>
		// 		ex((client) =>
		// 			client
		// 				.update(schema.messages)
		// 				.set({ ...message, updatedAt: new Date() })
		// 				.where(eq(schema.messages.id, id))
		// 				.returning(),
		// 		),
		// )

		return {
			...baseModel,
			findById2: findById,
			delete: _delete,
		}
	}),
	dependencies: [],
}) {}

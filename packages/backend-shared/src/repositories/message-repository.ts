import { Model } from "@maki-chat/api-schema"
import { Message } from "@maki-chat/api-schema/schema"
import { Effect } from "effect"

export class MessageRepo extends Effect.Service<MessageRepo>()("@hazel/Message/Repo", {
	effect: Model.makeRepository(Message, {
		tableName: "messages",
		spanPrefix: "MessageRepo",
		idColumn: "id",
	}),
	dependencies: [],
}) {}

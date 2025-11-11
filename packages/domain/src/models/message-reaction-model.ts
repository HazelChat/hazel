import { MessageId, MessageReactionId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("MessageReaction")({
	id: M.Generated(MessageReactionId),
	messageId: MessageId,
	userId: M.GeneratedByApp(UserId),
	emoji: Schema.String,
	createdAt: M.Generated(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update

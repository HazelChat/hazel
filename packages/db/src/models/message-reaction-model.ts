import { Schema } from "effect"
import { MessageId, MessageReactionId, UserId } from "../lib/schema"
import * as M from "../services/model"

export class Model extends M.Class<Model>("MessageReaction")({
	id: M.Generated(MessageReactionId),
	messageId: MessageId,
	userId: UserId,
	emoji: Schema.String,
	createdAt: M.Generated(Schema.Date),
}) {}

export const Insert = Model.insert
export const Update = Model.update

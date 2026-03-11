import { ChannelId, ConnectConversationId, MessageId, MessageReactionId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("MessageReaction")({
	id: M.Generated(MessageReactionId),
	messageId: MessageId,
	channelId: ChannelId,
	conversationId: M.GeneratedOptional(Schema.NullOr(ConnectConversationId)),
	userId: M.GeneratedByApp(UserId),
	emoji: Schema.String,
	createdAt: M.Generated(JsonDate),
}) {}

export const Insert = Schema.Struct({
	...Model.insert.fields,
	conversationId: Schema.optional(Schema.NullOr(ConnectConversationId)),
})
export const Update = Model.update

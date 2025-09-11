import { Schema } from "effect"
import { ChannelId, MessageId, UserId } from "../lib/schema"
import * as M from "../services/model"
import { baseFields } from "./utils"

export class Model extends M.Class<Model>("Message")({
	id: M.Generated(MessageId),
	channelId: ChannelId,
	authorId: M.GeneratedByApp(UserId),
	content: Schema.String,
	replyToMessageId: Schema.NullOr(MessageId),
	threadChannelId: Schema.NullOr(ChannelId),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update

import { ChannelId, ChannelMemberId, MessageId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("ChannelMember")({
	id: M.Generated(ChannelMemberId),
	channelId: ChannelId,
	userId: M.GeneratedByApp(UserId),
	isHidden: Schema.Boolean,
	isMuted: Schema.Boolean,
	isFavorite: Schema.Boolean,
	lastSeenMessageId: Schema.NullOr(MessageId),
	notificationCount: Schema.Number,
	joinedAt: M.GeneratedByApp(JsonDate),
	createdAt: M.Generated(JsonDate),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

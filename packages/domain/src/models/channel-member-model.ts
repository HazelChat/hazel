import { ChannelId, ChannelMemberId, MessageId, UserId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

class Model extends M.Class<Model>("ChannelMember")({
	id: M.Generated(ChannelMemberId),
	channelId: ChannelId,
	userId: M.GeneratedByApp(UserId),
	isHidden: S.Boolean,
	isMuted: S.Boolean,
	isFavorite: S.Boolean,
	lastSeenMessageId: S.NullOr(MessageId),
	notificationCount: S.Number,
	joinedAt: M.GeneratedByApp(JsonDate),
	createdAt: M.Generated(JsonDate),
	deletedAt: M.GeneratedByApp(S.NullOr(JsonDate)),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type

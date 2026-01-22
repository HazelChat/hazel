import { ChannelId, UserId, UserPresenceStatusId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const UserPresenceStatusEnum = Schema.Literal("online", "away", "busy", "dnd", "offline")
export type UserPresenceStatusEnum = Schema.Schema.Type<typeof UserPresenceStatusEnum>

export class Model extends M.Class<Model>("UserPresenceStatus")({
	id: M.Generated(UserPresenceStatusId),
	userId: UserId,
	status: UserPresenceStatusEnum,
	customMessage: Schema.NullOr(Schema.String),
	statusEmoji: Schema.NullOr(Schema.String),
	statusExpiresAt: Schema.NullOr(JsonDate),
	activeChannelId: Schema.NullOr(ChannelId),
	suppressNotifications: Schema.Boolean,
	updatedAt: JsonDate,
	lastSeenAt: JsonDate,
}) {}

export const Insert = Model.insert
export const Update = Model.update

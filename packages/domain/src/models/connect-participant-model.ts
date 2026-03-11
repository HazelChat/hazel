import { ChannelId, ConnectConversationId, ConnectParticipantId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("ConnectParticipant")({
	id: M.Generated(ConnectParticipantId),
	conversationId: ConnectConversationId,
	channelId: ChannelId,
	userId: UserId,
	homeOrganizationId: OrganizationId,
	isExternal: Schema.Boolean,
	addedBy: Schema.NullOr(UserId),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

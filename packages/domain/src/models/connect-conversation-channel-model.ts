import { ChannelId, ConnectConversationChannelId, ConnectConversationId, OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ConnectConversationChannelRole = Schema.Literals(["host", "guest"])
export type ConnectConversationChannelRole = Schema.Schema.Type<typeof ConnectConversationChannelRole>

export class Model extends M.Class<Model>("ConnectConversationChannel")({
	id: M.Generated(ConnectConversationChannelId),
	conversationId: ConnectConversationId,
	organizationId: OrganizationId,
	channelId: ChannelId,
	role: ConnectConversationChannelRole,
	allowGuestMemberAdds: Schema.Boolean,
	isActive: Schema.Boolean,
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

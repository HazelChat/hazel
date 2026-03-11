import { ChannelId, ConnectConversationId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ConnectConversationStatus = Schema.Literal("active", "disconnected")
export type ConnectConversationStatus = Schema.Schema.Type<typeof ConnectConversationStatus>

export class Model extends M.Class<Model>("ConnectConversation")({
	id: M.Generated(ConnectConversationId),
	hostOrganizationId: OrganizationId,
	hostChannelId: ChannelId,
	status: ConnectConversationStatus,
	settings: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	createdBy: UserId,
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

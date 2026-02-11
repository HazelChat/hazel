import { ChannelId, SyncChannelLinkId, SyncConnectionId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ChatSyncDirection = Schema.Literal("both", "hazel_to_external", "external_to_hazel")
export type ChatSyncDirection = Schema.Schema.Type<typeof ChatSyncDirection>

export class Model extends M.Class<Model>("ChatSyncChannelLink")({
	id: M.Generated(SyncChannelLinkId),
	syncConnectionId: SyncConnectionId,
	hazelChannelId: ChannelId,
	externalChannelId: Schema.String,
	externalChannelName: Schema.NullOr(Schema.String),
	direction: ChatSyncDirection,
	isActive: Schema.Boolean,
	settings: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	lastSyncedAt: Schema.NullOr(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

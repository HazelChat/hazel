import { ChannelId, MessageId, SyncChannelLinkId, SyncMessageLinkId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("ChatSyncMessageLink")({
	id: M.Generated(SyncMessageLinkId),
	channelLinkId: SyncChannelLinkId,
	hazelMessageId: MessageId,
	externalMessageId: Schema.String,
	rootHazelMessageId: Schema.NullOr(MessageId),
	rootExternalMessageId: Schema.NullOr(Schema.String),
	hazelThreadChannelId: Schema.NullOr(ChannelId),
	externalThreadId: Schema.NullOr(Schema.String),
	lastSyncedAt: M.Generated(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

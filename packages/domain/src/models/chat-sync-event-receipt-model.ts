import { SyncChannelLinkId, SyncConnectionId, SyncEventReceiptId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ChatSyncReceiptSource = Schema.Literal("hazel", "external")
export type ChatSyncReceiptSource = Schema.Schema.Type<typeof ChatSyncReceiptSource>

export const ChatSyncReceiptStatus = Schema.Literal("processed", "ignored", "failed")
export type ChatSyncReceiptStatus = Schema.Schema.Type<typeof ChatSyncReceiptStatus>

export class Model extends M.Class<Model>("ChatSyncEventReceipt")({
	id: M.Generated(SyncEventReceiptId),
	syncConnectionId: SyncConnectionId,
	channelLinkId: Schema.NullOr(SyncChannelLinkId),
	source: ChatSyncReceiptSource,
	externalEventId: Schema.NullOr(Schema.String),
	dedupeKey: Schema.String,
	payloadHash: Schema.NullOr(Schema.String),
	status: ChatSyncReceiptStatus,
	errorMessage: Schema.NullOr(Schema.String),
	processedAt: M.Generated(JsonDate),
	createdAt: M.Generated(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update

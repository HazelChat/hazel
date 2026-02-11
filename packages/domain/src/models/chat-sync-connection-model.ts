import { IntegrationConnectionId, OrganizationId, SyncConnectionId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ChatSyncProvider = Schema.NonEmptyTrimmedString
export type ChatSyncProvider = Schema.Schema.Type<typeof ChatSyncProvider>

export const ChatSyncConnectionStatus = Schema.Literal("active", "paused", "error", "disabled")
export type ChatSyncConnectionStatus = Schema.Schema.Type<typeof ChatSyncConnectionStatus>

export class Model extends M.Class<Model>("ChatSyncConnection")({
	id: M.Generated(SyncConnectionId),
	organizationId: OrganizationId,
	integrationConnectionId: Schema.NullOr(IntegrationConnectionId),
	provider: ChatSyncProvider,
	externalWorkspaceId: Schema.String,
	externalWorkspaceName: Schema.NullOr(Schema.String),
	status: ChatSyncConnectionStatus,
	settings: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	errorMessage: Schema.NullOr(Schema.String),
	lastSyncedAt: Schema.NullOr(JsonDate),
	createdBy: UserId,
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

import { IntegrationConnectionId, OrganizationId, SyncConnectionId, UserId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ChatSyncProvider = S.NonEmptyString
export type ChatSyncProvider = S.Schema.Type<typeof ChatSyncProvider>

export const ChatSyncConnectionStatus = S.Literals(["active", "paused", "error", "disabled"])
export type ChatSyncConnectionStatus = S.Schema.Type<typeof ChatSyncConnectionStatus>

class Model extends M.Class<Model>("ChatSyncConnection")({
	id: M.Generated(SyncConnectionId),
	organizationId: OrganizationId,
	integrationConnectionId: S.NullOr(IntegrationConnectionId),
	provider: ChatSyncProvider,
	externalWorkspaceId: S.String,
	externalWorkspaceName: S.NullOr(S.String),
	status: ChatSyncConnectionStatus,
	settings: S.NullOr(S.Record(S.String, S.Unknown)),
	metadata: S.NullOr(S.Record(S.String, S.Unknown)),
	errorMessage: S.NullOr(S.String),
	lastSyncedAt: S.NullOr(JsonDate),
	createdBy: UserId,
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(S.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(S.NullOr(JsonDate)),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type

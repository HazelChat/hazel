import { IntegrationConnectionId, OrganizationId, UserId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const IntegrationProvider = S.Literals(["linear", "github", "figma", "notion", "discord", "craft"])
export type IntegrationProvider = S.Schema.Type<typeof IntegrationProvider>

export const ConnectionLevel = S.Literals(["organization", "user"])
export type ConnectionLevel = S.Schema.Type<typeof ConnectionLevel>

export const ConnectionStatus = S.Literals(["active", "expired", "revoked", "error", "suspended"])
export type ConnectionStatus = S.Schema.Type<typeof ConnectionStatus>

class Model extends M.Class<Model>("IntegrationConnection")({
	id: M.Generated(IntegrationConnectionId),
	provider: IntegrationProvider,
	organizationId: OrganizationId,
	userId: S.NullOr(UserId),
	level: ConnectionLevel,
	status: ConnectionStatus,
	externalAccountId: S.NullOr(S.String),
	externalAccountName: S.NullOr(S.String),
	connectedBy: UserId,
	settings: S.NullOr(S.Record(S.String, S.Unknown)),
	metadata: S.NullOr(S.Record(S.String, S.Unknown)),
	errorMessage: S.NullOr(S.String),
	lastUsedAt: S.NullOr(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(S.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(S.NullOr(JsonDate)),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type

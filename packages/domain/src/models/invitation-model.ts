import { InvitationId, OrganizationId, UserId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const InvitationStatus = S.Literals(["pending", "accepted", "expired", "revoked"])
export type InvitationStatus = S.Schema.Type<typeof InvitationStatus>

class Model extends M.Class<Model>("Invitation")({
	id: M.Generated(InvitationId),
	invitationUrl: M.Immutable(S.String),
	workosInvitationId: M.Sensitive(S.String),
	organizationId: M.Immutable(OrganizationId),
	email: M.Immutable(S.String),
	invitedBy: M.Immutable(S.NullOr(UserId)),
	invitedAt: M.Immutable(JsonDate),
	expiresAt: M.Immutable(JsonDate),
	status: InvitationStatus,
	acceptedAt: M.GeneratedByApp(S.NullOr(JsonDate)),
	acceptedBy: M.GeneratedByApp(S.NullOr(UserId)),
}) {}

export const { Insert, Update, Schema, Create, Patch, PatchPartial } = M.expose(Model)
export type Type = typeof Schema.Type

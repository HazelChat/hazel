import { InvitationId, OrganizationId, UserId, WorkOSInvitationId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const InvitationStatus = S.Literals(["pending", "accepted", "expired", "revoked"])
export type InvitationStatus = S.Schema.Type<typeof InvitationStatus>

class Model extends M.Class<Model>("Invitation")({
	id: M.Generated(InvitationId),
	invitationUrl: S.String,
	workosInvitationId: WorkOSInvitationId,
	organizationId: OrganizationId,
	email: S.String,
	invitedBy: S.NullOr(UserId),
	invitedAt: JsonDate,
	expiresAt: JsonDate,
	status: InvitationStatus,
	acceptedAt: S.NullOr(JsonDate),
	acceptedBy: S.NullOr(UserId),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type

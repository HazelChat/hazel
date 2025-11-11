import { InvitationId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const InvitationStatus = Schema.Literal("pending", "accepted", "expired", "revoked")
export type InvitationStatus = Schema.Schema.Type<typeof InvitationStatus>

export class Model extends M.Class<Model>("Invitation")({
	id: M.Generated(InvitationId),
	workosInvitationId: Schema.String,
	organizationId: OrganizationId,
	email: Schema.String,
	invitedBy: Schema.NullOr(UserId),
	invitedAt: JsonDate,
	expiresAt: JsonDate,
	status: InvitationStatus,
	acceptedAt: Schema.NullOr(JsonDate),
	acceptedBy: Schema.NullOr(UserId),
}) {}

export const Insert = Model.insert
export const Update = Model.update

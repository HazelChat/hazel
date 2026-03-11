import { ChannelId, ConnectConversationId, ConnectInviteId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const ConnectInviteStatus = Schema.Literal("pending", "accepted", "declined", "revoked", "expired")
export type ConnectInviteStatus = Schema.Schema.Type<typeof ConnectInviteStatus>

export const ConnectInviteTargetKind = Schema.Literal("slug", "email")
export type ConnectInviteTargetKind = Schema.Schema.Type<typeof ConnectInviteTargetKind>

export class Model extends M.Class<Model>("ConnectInvite")({
	id: M.Generated(ConnectInviteId),
	conversationId: ConnectConversationId,
	hostOrganizationId: OrganizationId,
	hostChannelId: ChannelId,
	targetKind: ConnectInviteTargetKind,
	targetValue: Schema.String,
	guestOrganizationId: Schema.NullOr(OrganizationId),
	status: ConnectInviteStatus,
	allowGuestMemberAdds: Schema.Boolean,
	invitedBy: UserId,
	acceptedBy: Schema.NullOr(UserId),
	acceptedAt: Schema.NullOr(JsonDate),
	expiresAt: Schema.NullOr(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update

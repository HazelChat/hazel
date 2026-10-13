import { InvitationRole } from "@hazel/domain/rpc"
import { InvitationId, OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as Menu from "../../../ui/menu"

export const Invitation = Schema.Struct({
	id: InvitationId,
	emailAddress: Schema.String,
	role: InvitationRole,
	createdAtMs: Schema.Number,
})
export type Invitation = typeof Invitation.Type

export const RowMenu = Schema.Struct({ invitationId: InvitationId, menu: Menu.Model })
export type RowMenu = typeof RowMenu.Type

export const Model = Schema.Struct({
	/** The route's organization; `null` until it has loaded. */
	organizationId: Schema.NullOr(OrganizationId),
	invitations: Schema.Array(Invitation),
	/** Bumped per fetch; an older result (initial fetch racing a post-revoke refetch) is dropped. */
	fetchVersion: Schema.Number,
	menus: Schema.Array(RowMenu),
	revokingId: Schema.NullOr(InvitationId),
})
export type Model = typeof Model.Type

import { InvitationId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { timestamptz, typed, uuid, varchar } from "./columns"
import { organizationRoleEnum } from "./organizations"

/** Email links contain a random token; only its hash is stored. */
export const organizationInvitationsTable = PG.table("organization_invitations", {
	columns: {
		id: PG.column(uuid(InvitationId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: uuid(OrganizationId),
		email: varchar(320),
		role: PG.column(organizationRoleEnum, { default: "member" }),
		tokenHash: PG.text,
		invitedBy: uuid(UserId),
		status: PG.column(typed<"pending" | "accepted" | "revoked">()(varchar(16)), { default: "pending" }),
		expiresAt: timestamptz,
		acceptedBy: PG.nullable(uuid(UserId)),
		acceptedAt: PG.nullable(timestamptz),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.uniqueIndex("organization_invitations_token_hash_idx", ["tokenHash"]),
		PG.uniqueIndex("organization_invitations_pending_email_idx", ["organizationId", "email"], {
			where: "\"status\" = 'pending'",
		}),
		PG.index("organization_invitations_organization_id_idx", ["organizationId"]),
	],
})
export type OrganizationInvitation = PG.SelectRowOf<typeof organizationInvitationsTable>
export type NewOrganizationInvitation = PG.InsertRowOf<typeof organizationInvitationsTable>

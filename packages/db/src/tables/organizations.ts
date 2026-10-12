import { OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, now, pgEnum, timestamptz, uuid, varchar } from "./columns"

export const organizationRoleEnum = pgEnum("organization_role", ["admin", "member", "owner"])

export const organizationsTable = PG.table("organizations", {
	columns: {
		id: PG.column(uuid(OrganizationId), { defaultExpr: "gen_random_uuid()" }),
		name: varchar(255),
		slug: PG.nullable(varchar(100)),
		logoUrl: PG.nullable(PG.text),
		settings: PG.nullable(jsonb<unknown>()),
		isPublic: PG.column(PG.bool, { default: false }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.uniqueIndex("organizations_slug_unique", ["slug"]),
		PG.index("organizations_slug_idx", ["slug"]),
		PG.index("organizations_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex(
			"organizations_clerk_org_id_unique",
			($) => [PG.jsonText($.settings!, "clerkOrganizationId")],
			{ where: '"deletedAt" IS NULL AND "settings"->>\'clerkOrganizationId\' IS NOT NULL' },
		),
	],
})
export type Organization = PG.SelectRowOf<typeof organizationsTable>
export type NewOrganization = PG.InsertRowOf<typeof organizationsTable>

export const organizationMembersTable = PG.table("organization_members", {
	columns: {
		id: PG.column(uuid(OrganizationMemberId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: uuid(OrganizationId),
		userId: uuid(UserId),
		role: PG.column(organizationRoleEnum, { default: "member" }),
		nickname: PG.nullable(varchar(100)),
		joinedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		invitedBy: PG.nullable(uuid(UserId)),
		metadata: PG.nullable(jsonb<unknown>()),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("org_members_organization_id_idx", ["organizationId"]),
		PG.index("org_members_user_id_idx", ["userId"]),
		PG.uniqueIndex("org_members_org_user_unique", ["organizationId", "userId"]),
	],
	foreignKeys: [
		PG.foreignKey({
			name: "organization_members_organizationId_organizations_id_fk",
			columns: ["organizationId"],
			references: organizationsTable,
			foreignColumns: ["id"],
			onDelete: "cascade",
		}),
	],
})
export type OrganizationMember = PG.SelectRowOf<typeof organizationMembersTable>
export type NewOrganizationMember = PG.InsertRowOf<typeof organizationMembersTable>

import { sql } from "drizzle-orm"
import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Organization member roles
export const organizationRoleEnum = pgEnum("organization_role", ["admin", "member", "owner"])

// Organizations table
export const organizationsTable = pgTable(
	"organizations",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		workosId: varchar("workos_id", { length: 255 }).notNull().unique(),
		name: varchar("name", { length: 255 }).notNull(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		logoUrl: text("logo_url"),
		// Settings as JSONB - storing as text for now, can be migrated to jsonb column
		settings: text("settings").default("{}"),
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
		deletedAt: timestamp("deleted_at", { mode: "date" }),
	},
	(table) => [
		index("organizations_workos_id_idx").on(table.workosId),
		index("organizations_slug_idx").on(table.slug),
		index("organizations_deleted_at_idx").on(table.deletedAt),
	],
)

// Organization members junction table
export const organizationMembersTable = pgTable(
	"organization_members",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizationsTable.id, { onDelete: "cascade" }),
		userId: uuid("user_id").notNull(),
		role: organizationRoleEnum("role").notNull().default("member"),
		joinedAt: timestamp("joined_at", { mode: "date" }).notNull().defaultNow(),
		invitedBy: uuid("invited_by"),
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
		deletedAt: timestamp("deleted_at", { mode: "date" }),
	},
	(table) => [
		index("org_members_organization_id_idx").on(table.organizationId),
		index("org_members_user_id_idx").on(table.userId),
		index("org_members_org_user_idx").on(table.organizationId, table.userId),
		// Unique constraint for active memberships (where deletedAt is null)
		index("org_members_unique_active_idx")
			.on(table.organizationId, table.userId)
			.where(sql`deleted_at IS NULL`),
	],
)

// Type exports
export type Organization = typeof organizationsTable.$inferSelect
export type NewOrganization = typeof organizationsTable.$inferInsert
export type OrganizationMember = typeof organizationMembersTable.$inferSelect
export type NewOrganizationMember = typeof organizationMembersTable.$inferInsert

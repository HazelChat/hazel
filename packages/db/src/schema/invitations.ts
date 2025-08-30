import { index, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Invitation status
export const invitationStatusEnum = pgEnum("invitation_status", ["pending", "accepted", "expired", "revoked"])

// Invitations table
export const invitationsTable = pgTable(
	"invitations",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		workosInvitationId: varchar("workos_invitation_id", { length: 255 }).notNull().unique(),
		organizationId: uuid("organization_id").notNull(),
		email: varchar("email", { length: 255 }).notNull(),
		invitedBy: uuid("invited_by"),
		invitedAt: timestamp("invited_at", { mode: "date" }).notNull().defaultNow(),
		expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
		status: invitationStatusEnum("status").notNull().default("pending"),
		acceptedAt: timestamp("accepted_at", { mode: "date" }),
		acceptedBy: uuid("accepted_by"),
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
	},
	(table) => [
		index("invitations_workos_id_idx").on(table.workosInvitationId),
		index("invitations_organization_id_idx").on(table.organizationId),
		index("invitations_email_idx").on(table.email),
		index("invitations_status_idx").on(table.status),
	],
)

// Type exports
export type Invitation = typeof invitationsTable.$inferSelect
export type NewInvitation = typeof invitationsTable.$inferInsert

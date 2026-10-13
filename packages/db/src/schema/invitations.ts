import type { InvitationId, OrganizationId, UserId } from "@hazel/schema"
import { sql } from "drizzle-orm"
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"
import { organizationRoleEnum } from "./organizations"

/**
 * Email invitations to an organization. The emailed link carries a random token; only its
 * SHA-256 hash is stored. Accepting needs a signed-in user whose email matches.
 */
export const organizationInvitationsTable = pgTable(
	"organization_invitations",
	{
		id: uuid().primaryKey().defaultRandom().$type<InvitationId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		/** Lowercased. */
		email: varchar({ length: 320 }).notNull(),
		role: organizationRoleEnum().notNull().default("member"),
		tokenHash: text().notNull(),
		invitedBy: uuid().notNull().$type<UserId>(),
		status: varchar({ length: 16 })
			.notNull()
			.default("pending")
			.$type<"pending" | "accepted" | "revoked">(),
		expiresAt: timestamp({ mode: "date", withTimezone: true }).notNull(),
		acceptedBy: uuid().$type<UserId>(),
		acceptedAt: timestamp({ mode: "date", withTimezone: true }),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		uniqueIndex("organization_invitations_token_hash_idx").on(table.tokenHash),
		uniqueIndex("organization_invitations_pending_email_idx")
			.on(table.organizationId, table.email)
			.where(sql`${table.status} = 'pending'`),
		index("organization_invitations_organization_id_idx").on(table.organizationId),
	],
)

export type OrganizationInvitation = typeof organizationInvitationsTable.$inferSelect
export type NewOrganizationInvitation = typeof organizationInvitationsTable.$inferInsert

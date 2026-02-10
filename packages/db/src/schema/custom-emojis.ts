import type { CustomEmojiId, OrganizationId, UserId } from "@hazel/schema"
import { sql } from "drizzle-orm"
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

// Custom emojis table
export const customEmojisTable = pgTable(
	"custom_emojis",
	{
		id: uuid("id").primaryKey().defaultRandom().$type<CustomEmojiId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		name: varchar({ length: 64 }).notNull(),
		imageUrl: text().notNull(),
		createdBy: uuid().notNull().$type<UserId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("custom_emojis_organization_id_idx").on(table.organizationId),
		index("custom_emojis_name_idx").on(table.name),
		uniqueIndex("custom_emojis_org_name_unique_idx")
			.on(table.organizationId, table.name)
			.where(sql`${table.deletedAt} IS NULL`),
		index("custom_emojis_deleted_at_idx").on(table.deletedAt),
	],
)

// Type exports
export type CustomEmoji = typeof customEmojisTable.$inferSelect
export type NewCustomEmoji = typeof customEmojisTable.$inferInsert

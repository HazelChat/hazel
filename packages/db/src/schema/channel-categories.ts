import type { ChannelCategoryId, OrganizationId } from "@hazel/schema"
import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Channel categories table - groups channels within an organization
export const channelCategoriesTable = pgTable(
	"channel_categories",
	{
		id: uuid().primaryKey().defaultRandom().$type<ChannelCategoryId>(),
		name: varchar({ length: 255 }).notNull(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		sortOrder: varchar({ length: 50 }).notNull(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("channel_categories_organization_id_idx").on(table.organizationId),
		index("channel_categories_sort_order_idx").on(table.sortOrder),
		index("channel_categories_deleted_at_idx").on(table.deletedAt),
	],
)

// Type exports
export type ChannelCategory = typeof channelCategoriesTable.$inferSelect
export type NewChannelCategory = typeof channelCategoriesTable.$inferInsert

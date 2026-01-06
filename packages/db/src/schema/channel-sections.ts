import type { ChannelSectionId, OrganizationId } from "@hazel/schema"
import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Channel sections table - organization-wide groupings for channels
export const channelSectionsTable = pgTable(
	"channel_sections",
	{
		id: uuid().primaryKey().defaultRandom().$type<ChannelSectionId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		name: varchar({ length: 255 }).notNull(),
		order: integer().notNull().default(0),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("channel_sections_organization_id_idx").on(table.organizationId),
		index("channel_sections_order_idx").on(table.organizationId, table.order),
		index("channel_sections_deleted_at_idx").on(table.deletedAt),
	],
)

// Type exports
export type ChannelSection = typeof channelSectionsTable.$inferSelect
export type NewChannelSection = typeof channelSectionsTable.$inferInsert

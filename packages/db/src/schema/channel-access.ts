import type { ChannelId, OrganizationId, UserId } from "@hazel/schema"
import { index, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"

/**
 * Materialized channel visibility for Electric-safe single-subquery filtering.
 * Each row means userId can read channelId in organizationId.
 */
export const channelAccessTable = pgTable(
	"channel_access",
	{
		userId: uuid().notNull().$type<UserId>(),
		channelId: uuid().notNull().$type<ChannelId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.channelId], name: "channel_access_user_channel_pk" }),
		index("channel_access_user_id_idx").on(table.userId),
		index("channel_access_channel_id_idx").on(table.channelId),
		index("channel_access_organization_id_idx").on(table.organizationId),
		index("channel_access_org_user_idx").on(table.organizationId, table.userId),
	],
)

export type ChannelAccess = typeof channelAccessTable.$inferSelect
export type NewChannelAccess = typeof channelAccessTable.$inferInsert

import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Notifications table
export const notificationsTable = pgTable(
	"notifications",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		memberId: uuid("member_id").notNull(),
		// Can be a channel or organization
		targetedResourceId: uuid("targeted_resource_id"),
		targetedResourceType: varchar("targeted_resource_type", { length: 50 }), // 'channel' or 'organization'
		// Can be a message
		resourceId: uuid("resource_id"),
		resourceType: varchar("resource_type", { length: 50 }), // 'message'
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
		readAt: timestamp("read_at", { mode: "date" }),
	},
	(table) => [
		index("notifications_member_id_idx").on(table.memberId),
		index("notifications_targeted_resource_idx").on(table.targetedResourceId, table.targetedResourceType),
		index("notifications_resource_idx").on(table.resourceId, table.resourceType),
		index("notifications_read_at_idx").on(table.readAt),
	],
)

// Type exports
export type Notification = typeof notificationsTable.$inferSelect
export type NewNotification = typeof notificationsTable.$inferInsert

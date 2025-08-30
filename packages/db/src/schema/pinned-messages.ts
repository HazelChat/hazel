import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

// Pinned messages table (normalized from array in Convex)
export const pinnedMessagesTable = pgTable(
	"pinned_messages",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		channelId: uuid("channel_id").notNull(),
		messageId: uuid("message_id").notNull(),
		pinnedBy: uuid("pinned_by").notNull(),
		pinnedAt: timestamp("pinned_at", { mode: "date" }).notNull().defaultNow(),
	},
	(table) => [
		index("pinned_messages_channel_id_idx").on(table.channelId),
		index("pinned_messages_message_id_idx").on(table.messageId),
		// A message can only be pinned once per channel
		uniqueIndex("pinned_messages_unique_idx").on(table.channelId, table.messageId),
	],
)

// Type exports
export type PinnedMessage = typeof pinnedMessagesTable.$inferSelect
export type NewPinnedMessage = typeof pinnedMessagesTable.$inferInsert

import { bigint, index, pgTable, uuid } from "drizzle-orm/pg-core"

// Typing indicators table - ephemeral data for real-time typing status
export const typingIndicatorsTable = pgTable(
	"typing_indicators",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		channelId: uuid("channel_id").notNull(),
		memberId: uuid("member_id").notNull(),
		lastTyped: bigint("last_typed", { mode: "number" }).notNull(), // Unix timestamp in milliseconds
	},
	(table) => [
		index("typing_indicators_member_idx").on(table.channelId, table.memberId),
		index("typing_indicators_channel_timestamp_idx").on(table.channelId, table.lastTyped),
		index("typing_indicators_timestamp_idx").on(table.lastTyped),
	],
)

// Type exports
export type TypingIndicator = typeof typingIndicatorsTable.$inferSelect
export type NewTypingIndicator = typeof typingIndicatorsTable.$inferInsert

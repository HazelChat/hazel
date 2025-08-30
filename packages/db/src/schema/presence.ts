import { bigint, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Presence table - for tracking user presence in rooms/channels
export const presenceTable = pgTable(
	"presence",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		roomId: varchar("room_id", { length: 255 }).notNull(), // Can be channel ID or other room identifier
		userId: uuid("user_id").notNull(),
		sessionId: varchar("session_id", { length: 255 }).notNull(),
		lastHeartbeat: timestamp("last_heartbeat", { mode: "date" }).notNull().defaultNow(),
		interval: bigint("interval", { mode: "number" }).notNull(), // Heartbeat interval in ms
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
	},
	(table) => [
		index("presence_room_id_idx").on(table.roomId),
		index("presence_user_id_idx").on(table.userId),
		index("presence_session_id_idx").on(table.sessionId),
		index("presence_last_heartbeat_idx").on(table.lastHeartbeat),
		// Unique constraint for room + user + session
		index("presence_unique_idx").on(table.roomId, table.userId, table.sessionId),
	],
)

// Type exports
export type Presence = typeof presenceTable.$inferSelect
export type NewPresence = typeof presenceTable.$inferInsert

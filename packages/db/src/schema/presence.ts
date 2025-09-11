import { bigint, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import type { PresenceId, UserId } from "../lib/schema"

// Presence table - for tracking user presence in rooms/channels
export const presenceTable = pgTable(
	"presence",
	{
		id: uuid().primaryKey().defaultRandom().$type<PresenceId>(),
		roomId: varchar({ length: 255 }).notNull(),
		userId: uuid().notNull().$type<UserId>(),
		sessionId: varchar({ length: 255 }).notNull(),
		lastHeartbeat: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		interval: bigint({ mode: "number" }).notNull(), // Heartbeat interval in ms
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
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

import type { ChannelId, UserId, UserPresenceStatusId } from "@hazel/schema"
import { boolean, index, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// User presence status enum - user-settable statuses
export const userPresenceStatusEnum = pgEnum("user_presence_status_enum", [
	"online",
	"away",
	"busy",
	"dnd", // do not disturb
	"offline",
])

// User presence status table - for tracking user-set status overrides
export const userPresenceStatusTable = pgTable(
	"user_presence_status",
	{
		id: uuid().primaryKey().defaultRandom().$type<UserPresenceStatusId>(),
		userId: uuid().notNull().$type<UserId>().unique(),
		status: userPresenceStatusEnum().notNull().default("online"),
		customMessage: varchar({ length: 255 }), // Optional custom status message
		statusEmoji: varchar({ length: 10 }), // Single emoji for status (e.g., "🏠")
		statusExpiresAt: timestamp({ mode: "date", withTimezone: true }), // Auto-clear time for custom status
		activeChannelId: uuid().$type<ChannelId>(), // Currently active/viewing channel
		suppressNotifications: boolean().notNull().default(false), // Suppress notifications while status is set
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		lastSeenAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(), // Track heartbeat for timeout-based offline detection
	},
	(table) => [
		index("user_presence_status_user_id_idx").on(table.userId),
		index("user_presence_status_active_channel_idx").on(table.activeChannelId),
		index("user_presence_status_last_seen_idx").on(table.lastSeenAt), // For efficient stale user queries
	],
)

// Type exports
export type UserPresenceStatus = typeof userPresenceStatusTable.$inferSelect
export type NewUserPresenceStatus = typeof userPresenceStatusTable.$inferInsert

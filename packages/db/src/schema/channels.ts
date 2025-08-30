import { sql } from "drizzle-orm"
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

// Channel types
export const channelTypeEnum = pgEnum("channel_type", ["public", "private", "thread", "direct", "single"])

// Channels table
export const channelsTable = pgTable(
	"channels",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: varchar("name", { length: 255 }).notNull(),
		type: channelTypeEnum("type").notNull(),
		organizationId: uuid("organization_id").notNull(),
		// For thread channels - reference to parent channel
		parentChannelId: uuid("parent_channel_id"),
		// For direct/group channels - sorted list of participant IDs for uniqueness
		// In PostgreSQL, we'll handle this with a separate table and unique constraint
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
		deletedAt: timestamp("deleted_at", { mode: "date" }),
	},
	(table) => [
		index("channels_organization_id_idx").on(table.organizationId),
		index("channels_parent_channel_id_idx").on(table.parentChannelId),
		index("channels_type_idx").on(table.type),
		index("channels_deleted_at_idx").on(table.deletedAt),
	],
)

// Channel members table - tracks user membership in channels
export const channelMembersTable = pgTable(
	"channel_members",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		channelId: uuid("channel_id").notNull(),
		userId: uuid("user_id").notNull(),
		isHidden: boolean("is_hidden").notNull().default(false),
		isMuted: boolean("is_muted").notNull().default(false),
		isFavorite: boolean("is_favorite").notNull().default(false),
		lastSeenMessageId: uuid("last_seen_message_id"),
		notificationCount: integer("notification_count").notNull().default(0),
		joinedAt: timestamp("joined_at", { mode: "date" }).notNull().defaultNow(),
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
		deletedAt: timestamp("deleted_at", { mode: "date" }),
	},
	(table) => [
		index("channel_members_channel_id_idx").on(table.channelId),
		index("channel_members_user_id_idx").on(table.userId),
		index("channel_members_channel_user_idx").on(table.channelId, table.userId),
		// Unique constraint for active memberships
		uniqueIndex("channel_members_unique_active_idx")
			.on(table.channelId, table.userId)
			.where(sql`deleted_at IS NULL`),
	],
)

// Direct message participants table - for ensuring unique DM channels
// This replaces the participantHash pattern from Convex
export const directMessageParticipantsTable = pgTable(
	"direct_message_participants",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		channelId: uuid("channel_id").notNull(),
		userId: uuid("user_id").notNull(),
		organizationId: uuid("organization_id").notNull(),
	},
	(table) => [
		index("dm_participants_channel_id_idx").on(table.channelId),
		index("dm_participants_user_id_idx").on(table.userId),
		index("dm_participants_org_id_idx").on(table.organizationId),
		// Ensure each user can only be in a DM channel once
		uniqueIndex("dm_participants_unique_idx").on(table.channelId, table.userId),
	],
)

// Type exports
export type Channel = typeof channelsTable.$inferSelect
export type NewChannel = typeof channelsTable.$inferInsert
export type ChannelMember = typeof channelMembersTable.$inferSelect
export type NewChannelMember = typeof channelMembersTable.$inferInsert
export type DirectMessageParticipant = typeof directMessageParticipantsTable.$inferSelect
export type NewDirectMessageParticipant = typeof directMessageParticipantsTable.$inferInsert

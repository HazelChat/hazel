import { relations } from "drizzle-orm"
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

import type { Brand } from "effect"

export const userRoleEnum = pgEnum("user_role", ["owner", "admin", "member"])
export const channelTypeEnum = pgEnum("channel_type", ["public", "private", "direct", "single", "thread"])

export const serverTypeEnum = pgEnum("server_type", ["public", "private"])

export const users = pgTable("user", {
	id: text("id").primaryKey(),
	displayName: text("display_name").notNull(),
	tag: text("tag").notNull().unique(),
	avatarUrl: text("avatar_url").notNull(),
	lastSeen: timestamp("last_seen").notNull().defaultNow(),
	status: text("status").notNull().default("offline"),
})

export const server = pgTable(
	"server",
	{
		id: text("id").primaryKey(),
		ownerId: text("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		imageUrl: text("image_url").notNull(),

		type: serverTypeEnum("type").default("public").notNull(),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => {
		return [uniqueIndex("slug_idx").on(table.slug), index("owner_idx").on(table.ownerId)]
	},
)

export const serverMembers = pgTable(
	"server_members",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		serverId: text("server_id")
			.notNull()
			.references(() => server.id, { onDelete: "cascade" }),

		role: userRoleEnum("role").default("member").notNull(),
		joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => {
		return {
			pk: uniqueIndex("sm_user_wsp_idx").on(table.userId, table.serverId),
			workspaceIdx: index("sm_workspace_idx").on(table.serverId),
			userIdx: index("sm_user_idx").on(table.userId),
		}
	},
)

export const serverChannels = pgTable(
	"server_channels",
	{
		id: text("id").primaryKey(),
		serverId: text("server_id")
			.notNull()
			.references(() => server.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		channelType: channelTypeEnum("channel_type").default("public").notNull(),

		// Parent channel for threads
		parentChannelId: text("parent_channel_id").references((): AnyPgColumn => serverChannels.id, {
			onDelete: "cascade",
		}),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("channel_origin_server_idx").on(table.serverId)],
)

export const channelMembers = pgTable(
	"channel_members",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		channelId: text("channel_id")
			.notNull()
			.references(() => serverChannels.id, { onDelete: "cascade" }),

		// Member controls
		isHidden: boolean("is_hiddem").default(false).notNull(),
		isMuted: boolean("is_muted").default(false).notNull(),

		lastSeenMessageId: text("last_seen_message_id"),
		notificationCount: integer("notification_count").notNull().default(0),

		joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => {
		return [
			primaryKey({ columns: [table.userId, table.channelId] }),
			index("cm_channel_idx").on(table.channelId),
			index("cm_user_idx").on(table.userId),
		]
	},
)

export const messages = pgTable(
	"messages",
	{
		id: uuid("id").primaryKey().$type<string & Brand.Brand<"@hazel/message-id">>(),
		attachedFiles: jsonb("attached_files").$type<string[]>(),
		authorId: text("author_id"),
		channelId: text("channel_id"),
		content: text("content"),
		createdAt: timestamp("created_at").defaultNow(),
		replyToMessageId: uuid("reply_to_message_id"),
		threadChannelId: text("thread_channel_id"),
		updatedAt: timestamp("updated_at").defaultNow(),
		optimisticId: text("optimistic_id"),
	},
	(table) => ({
		channelCreatedIdx: index("idx_messages_channel_created").on(table.channelId, table.id),
		authorIdx: index("idx_messages_author").on(table.authorId),
		threadIdx: index("idx_messages_thread").on(table.threadChannelId),
		replyToIdx: index("idx_messages_reply_to").on(table.replyToMessageId),
	}),
)

export const pinnedMessages = pgTable(
	"pinned_messages",
	{
		messageId: text("message_id").notNull().primaryKey(),
		channelId: text("channel_id")
			.notNull()
			.references(() => serverChannels.id, { onDelete: "cascade" }),
	},
	(table) => [unique("pinned_message_channel_idx").on(table.channelId, table.messageId)],
)

export const reactions = pgTable(
	"reactions",
	{
		id: text("id").primaryKey(),
		messageId: text("message_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		emoji: varchar("emoji", { length: 50 }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => {
		return [
			uniqueIndex("reaction_message_user_emoji_uk").on(table.messageId, table.userId, table.emoji),
			index("reaction_message_idx").on(table.messageId),
			index("reaction_user_idx").on(table.userId),
		]
	},
)

export const usersRelations = relations(users, ({ many }) => ({
	// One user can own multiple servers
	serversOwned: many(server, { relationName: "ServerOwner" }),
	// One user can be a member of multiple servers (via serverMembers)
	serverMemberships: many(serverMembers),
	// One user can be a member of multiple channels (via channelMembers)
	channelMemberships: many(channelMembers),
	// One user can author multiple messages
	messagesAuthored: many(messages),
	// One user can add multiple reactions
	reactionsAdded: many(reactions),
}))

export const serverRelations = relations(server, ({ one, many }) => ({
	// Each server has one owner (user)
	owner: one(users, {
		fields: [server.ownerId],
		references: [users.id],
		relationName: "ServerOwner",
	}),
	// One server can have multiple members (via serverMembers)
	members: many(serverMembers),
	// One server can have multiple channels
	channels: many(serverChannels),
}))

export const serverMembersRelations = relations(serverMembers, ({ one }) => ({
	// Each server membership belongs to one user
	user: one(users, {
		fields: [serverMembers.userId],
		references: [users.id],
	}),
	// Each server membership belongs to one server
	server: one(server, {
		fields: [serverMembers.serverId],
		references: [server.id],
	}),
}))

export const serverChannelsRelations = relations(serverChannels, ({ one, many }) => ({
	// Each channel belongs to one server
	server: one(server, {
		fields: [serverChannels.serverId],
		references: [server.id],
	}),
	// Each channel can have one parent channel (for threads)
	parentChannel: one(serverChannels, {
		fields: [serverChannels.parentChannelId],
		references: [serverChannels.id],
	}),

	// One channel can have multiple members (via channelMembers)
	members: many(channelMembers),
	// One channel can have multiple messages
	messages: many(messages),
	// One channel can have multiple pinned messages (via pinnedMessages)
	pinnedMessages: many(pinnedMessages),
}))

export const channelMembersRelations = relations(channelMembers, ({ one }) => ({
	// Each channel membership belongs to one user
	user: one(users, {
		fields: [channelMembers.userId],
		references: [users.id],
	}),
	// Each channel membership belongs to one channel
	channel: one(serverChannels, {
		fields: [channelMembers.channelId],
		references: [serverChannels.id],
	}),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
	// Each message belongs to one channel (can be null if message exclusively in thread channel)
	channel: one(serverChannels, {
		fields: [messages.channelId],
		references: [serverChannels.id],
		relationName: "ChannelMessages",
	}),
	// Each message can belong to one thread channel
	threadChannel: one(serverChannels, {
		fields: [messages.threadChannelId],
		references: [serverChannels.id],
		relationName: "ThreadParent",
	}),
	// Each message has one author (can be null if user deleted)
	author: one(users, {
		fields: [messages.authorId],
		references: [users.id],
	}),
	// Each message can be a reply to one other message
	replyToMessage: one(messages, {
		fields: [messages.replyToMessageId],
		references: [messages.id],
		relationName: "ReplyTo",
	}),
	// Each message can have multiple replies pointing to it
	replies: many(messages, {
		relationName: "ReplyTo",
	}),
	// One message can be pinned in multiple channels (via pinnedMessages)
	pinnedInChannels: many(pinnedMessages),
	// One message can have multiple reactions
	reactions: many(reactions),
}))

export const pinnedMessagesRelations = relations(pinnedMessages, ({ one }) => ({
	// Each pinned message entry refers to one message
	message: one(messages, {
		fields: [pinnedMessages.messageId],
		references: [messages.id],
	}),
	// Each pinned message entry refers to one channel
	channel: one(serverChannels, {
		fields: [pinnedMessages.channelId],
		references: [serverChannels.id],
	}),
}))

export const reactionsRelations = relations(reactions, ({ one }) => ({
	// Each reaction belongs to one message
	message: one(messages, {
		fields: [reactions.messageId],
		references: [messages.id],
	}),
	// Each reaction is added by one user
	user: one(users, {
		fields: [reactions.userId],
		references: [users.id],
	}),
}))

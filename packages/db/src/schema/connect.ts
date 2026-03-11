import type {
	ChannelId,
	ConnectConversationChannelId,
	ConnectConversationId,
	ConnectInviteId,
	ConnectParticipantId,
	OrganizationId,
	UserId,
} from "@hazel/schema"
import { sql } from "drizzle-orm"
import {
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

export const connectConversationStatusEnum = pgEnum("connect_conversation_status", ["active", "disconnected"])

export const connectConversationChannelRoleEnum = pgEnum("connect_conversation_channel_role", [
	"host",
	"guest",
])

export const connectInviteStatusEnum = pgEnum("connect_invite_status", [
	"pending",
	"accepted",
	"declined",
	"revoked",
	"expired",
])

export const connectInviteTargetKindEnum = pgEnum("connect_invite_target_kind", ["slug", "email"])

export const connectConversationsTable = pgTable(
	"connect_conversations",
	{
		id: uuid().primaryKey().defaultRandom().$type<ConnectConversationId>(),
		hostOrganizationId: uuid().notNull().$type<OrganizationId>(),
		hostChannelId: uuid().notNull().$type<ChannelId>(),
		status: connectConversationStatusEnum().notNull().default("active"),
		settings: jsonb().$type<Record<string, unknown>>(),
		createdBy: uuid().notNull().$type<UserId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("connect_conversations_host_org_idx").on(table.hostOrganizationId),
		index("connect_conversations_host_channel_idx").on(table.hostChannelId),
		index("connect_conversations_status_idx").on(table.status),
		index("connect_conversations_deleted_at_idx").on(table.deletedAt),
		uniqueIndex("connect_conversations_host_channel_unique")
			.on(table.hostChannelId)
			.where(sql`${table.deletedAt} IS NULL`),
	],
)

export const connectConversationChannelsTable = pgTable(
	"connect_conversation_channels",
	{
		id: uuid().primaryKey().defaultRandom().$type<ConnectConversationChannelId>(),
		conversationId: uuid().notNull().$type<ConnectConversationId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		channelId: uuid().notNull().$type<ChannelId>(),
		role: connectConversationChannelRoleEnum().notNull(),
		isActive: boolean().notNull().default(true),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("connect_conv_channels_conversation_idx").on(table.conversationId),
		index("connect_conv_channels_org_idx").on(table.organizationId),
		index("connect_conv_channels_channel_idx").on(table.channelId),
		index("connect_conv_channels_deleted_at_idx").on(table.deletedAt),
		uniqueIndex("connect_conv_channels_channel_unique")
			.on(table.channelId)
			.where(sql`${table.deletedAt} IS NULL`),
		uniqueIndex("connect_conv_channels_conversation_org_unique")
			.on(table.conversationId, table.organizationId)
			.where(sql`${table.deletedAt} IS NULL`),
	],
)

export const connectInvitesTable = pgTable(
	"connect_invites",
	{
		id: uuid().primaryKey().defaultRandom().$type<ConnectInviteId>(),
		conversationId: uuid().notNull().$type<ConnectConversationId>(),
		hostOrganizationId: uuid().notNull().$type<OrganizationId>(),
		hostChannelId: uuid().notNull().$type<ChannelId>(),
		targetKind: connectInviteTargetKindEnum().notNull(),
		targetValue: varchar({ length: 255 }).notNull(),
		guestOrganizationId: uuid().$type<OrganizationId>(),
		status: connectInviteStatusEnum().notNull().default("pending"),
		allowGuestMemberAdds: boolean().notNull().default(false),
		invitedBy: uuid().notNull().$type<UserId>(),
		acceptedBy: uuid().$type<UserId>(),
		acceptedAt: timestamp({ mode: "date", withTimezone: true }),
		expiresAt: timestamp({ mode: "date", withTimezone: true }),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("connect_invites_conversation_idx").on(table.conversationId),
		index("connect_invites_host_org_idx").on(table.hostOrganizationId),
		index("connect_invites_guest_org_idx").on(table.guestOrganizationId),
		index("connect_invites_status_idx").on(table.status),
		index("connect_invites_target_idx").on(table.targetKind, table.targetValue),
		index("connect_invites_deleted_at_idx").on(table.deletedAt),
	],
)

export const connectParticipantsTable = pgTable(
	"connect_participants",
	{
		id: uuid().primaryKey().defaultRandom().$type<ConnectParticipantId>(),
		conversationId: uuid().notNull().$type<ConnectConversationId>(),
		channelId: uuid().notNull().$type<ChannelId>(),
		userId: uuid().notNull().$type<UserId>(),
		homeOrganizationId: uuid().notNull().$type<OrganizationId>(),
		isExternal: boolean().notNull().default(false),
		addedBy: uuid().$type<UserId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("connect_participants_conversation_idx").on(table.conversationId),
		index("connect_participants_channel_idx").on(table.channelId),
		index("connect_participants_user_idx").on(table.userId),
		index("connect_participants_deleted_at_idx").on(table.deletedAt),
		uniqueIndex("connect_participants_channel_user_unique")
			.on(table.channelId, table.userId)
			.where(sql`${table.deletedAt} IS NULL`),
	],
)

export type ConnectConversation = typeof connectConversationsTable.$inferSelect
export type NewConnectConversation = typeof connectConversationsTable.$inferInsert
export type ConnectConversationChannel = typeof connectConversationChannelsTable.$inferSelect
export type NewConnectConversationChannel = typeof connectConversationChannelsTable.$inferInsert
export type ConnectInvite = typeof connectInvitesTable.$inferSelect
export type NewConnectInvite = typeof connectInvitesTable.$inferInsert
export type ConnectParticipant = typeof connectParticipantsTable.$inferSelect
export type NewConnectParticipant = typeof connectParticipantsTable.$inferInsert

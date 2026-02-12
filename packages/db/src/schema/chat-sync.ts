import type {
	ChannelId,
	IntegrationConnectionId,
	MessageId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	SyncEventReceiptId,
	SyncMessageLinkId,
	UserId,
} from "@hazel/schema"
import { sql } from "drizzle-orm"
import {
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

export const chatSyncConnectionStatusEnum = pgEnum("chat_sync_connection_status", [
	"active",
	"paused",
	"error",
	"disabled",
])

export const chatSyncDirectionEnum = pgEnum("chat_sync_direction", [
	"both",
	"hazel_to_external",
	"external_to_hazel",
])

export const chatSyncReceiptSourceEnum = pgEnum("chat_sync_receipt_source", ["hazel", "external"])

export const chatSyncReceiptStatusEnum = pgEnum("chat_sync_receipt_status", [
	"processed",
	"ignored",
	"failed",
])

export const chatSyncConnectionsTable = pgTable(
	"chat_sync_connections",
	{
		id: uuid().primaryKey().defaultRandom().$type<SyncConnectionId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		// Optional so providers without OAuth/app installations can still be supported.
		integrationConnectionId: uuid().$type<IntegrationConnectionId>(),
		// Provider key (e.g. "discord", "slack"). Kept as string for forward compatibility.
		provider: varchar({ length: 50 }).notNull(),
		// Provider workspace/guild/team identifier.
		externalWorkspaceId: varchar({ length: 255 }).notNull(),
		externalWorkspaceName: varchar({ length: 255 }),
		status: chatSyncConnectionStatusEnum().notNull().default("active"),
		settings: jsonb().$type<Record<string, any>>(),
		metadata: jsonb().$type<Record<string, any>>(),
		errorMessage: text(),
		lastSyncedAt: timestamp({ mode: "date", withTimezone: true }),
		createdBy: uuid().notNull().$type<UserId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("chat_sync_conn_org_idx").on(table.organizationId),
		index("chat_sync_conn_integration_idx").on(table.integrationConnectionId),
		index("chat_sync_conn_provider_idx").on(table.provider),
		index("chat_sync_conn_status_idx").on(table.status),
		index("chat_sync_conn_deleted_at_idx").on(table.deletedAt),
		uniqueIndex("chat_sync_conn_org_provider_workspace_unique")
			.on(table.organizationId, table.provider, table.externalWorkspaceId)
			.where(sql`${table.deletedAt} IS NULL`),
		uniqueIndex("chat_sync_conn_integration_unique")
			.on(table.integrationConnectionId)
			.where(sql`${table.deletedAt} IS NULL AND ${table.integrationConnectionId} IS NOT NULL`),
	],
)

export const chatSyncChannelLinksTable = pgTable(
	"chat_sync_channel_links",
	{
		id: uuid().primaryKey().defaultRandom().$type<SyncChannelLinkId>(),
		syncConnectionId: uuid().notNull().$type<SyncConnectionId>(),
		hazelChannelId: uuid().notNull().$type<ChannelId>(),
		externalChannelId: varchar({ length: 255 }).notNull(),
		externalChannelName: varchar({ length: 255 }),
		direction: chatSyncDirectionEnum().notNull().default("both"),
		isActive: boolean().notNull().default(true),
		settings: jsonb().$type<Record<string, any>>(),
		lastSyncedAt: timestamp({ mode: "date", withTimezone: true }),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("chat_sync_link_connection_idx").on(table.syncConnectionId),
		index("chat_sync_link_hazel_channel_idx").on(table.hazelChannelId),
		index("chat_sync_link_external_channel_idx").on(table.externalChannelId),
		index("chat_sync_link_deleted_at_idx").on(table.deletedAt),
		uniqueIndex("chat_sync_link_connection_hazel_unique")
			.on(table.syncConnectionId, table.hazelChannelId)
			.where(sql`${table.deletedAt} IS NULL`),
		uniqueIndex("chat_sync_link_connection_external_unique")
			.on(table.syncConnectionId, table.externalChannelId)
			.where(sql`${table.deletedAt} IS NULL`),
	],
)

export const chatSyncMessageLinksTable = pgTable(
	"chat_sync_message_links",
	{
		id: uuid().primaryKey().defaultRandom().$type<SyncMessageLinkId>(),
		channelLinkId: uuid().notNull().$type<SyncChannelLinkId>(),
		hazelMessageId: uuid().notNull().$type<MessageId>(),
		externalMessageId: varchar({ length: 255 }).notNull(),
		source: chatSyncReceiptSourceEnum().notNull().default("hazel"),
		// Optional root mapping enables thread/reply stitching across provider differences.
		rootHazelMessageId: uuid().$type<MessageId>(),
		rootExternalMessageId: varchar({ length: 255 }),
		hazelThreadChannelId: uuid().$type<ChannelId>(),
		externalThreadId: varchar({ length: 255 }),
		lastSyncedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("chat_sync_msg_link_channel_idx").on(table.channelLinkId),
		index("chat_sync_msg_link_hazel_message_idx").on(table.hazelMessageId),
		index("chat_sync_msg_link_external_message_idx").on(table.externalMessageId),
		index("chat_sync_msg_link_root_hazel_idx").on(table.rootHazelMessageId),
		index("chat_sync_msg_link_deleted_at_idx").on(table.deletedAt),
		uniqueIndex("chat_sync_msg_link_hazel_unique")
			.on(table.channelLinkId, table.hazelMessageId)
			.where(sql`${table.deletedAt} IS NULL`),
		uniqueIndex("chat_sync_msg_link_external_unique")
			.on(table.channelLinkId, table.externalMessageId)
			.where(sql`${table.deletedAt} IS NULL`),
	],
)

export const chatSyncEventReceiptsTable = pgTable(
	"chat_sync_event_receipts",
	{
		id: uuid().primaryKey().defaultRandom().$type<SyncEventReceiptId>(),
		syncConnectionId: uuid().notNull().$type<SyncConnectionId>(),
		channelLinkId: uuid().$type<SyncChannelLinkId>(),
		source: chatSyncReceiptSourceEnum().notNull(),
		externalEventId: varchar({ length: 255 }),
		dedupeKey: varchar({ length: 255 }).notNull(),
		payloadHash: varchar({ length: 128 }),
		status: chatSyncReceiptStatusEnum().notNull().default("processed"),
		errorMessage: text(),
		processedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("chat_sync_receipt_connection_idx").on(table.syncConnectionId),
		index("chat_sync_receipt_channel_link_idx").on(table.channelLinkId),
		index("chat_sync_receipt_source_idx").on(table.source),
		index("chat_sync_receipt_processed_at_idx").on(table.processedAt),
		uniqueIndex("chat_sync_receipt_dedupe_unique").on(
			table.syncConnectionId,
			table.source,
			table.dedupeKey,
		),
	],
)

export type ChatSyncConnection = typeof chatSyncConnectionsTable.$inferSelect
export type NewChatSyncConnection = typeof chatSyncConnectionsTable.$inferInsert
export type ChatSyncChannelLink = typeof chatSyncChannelLinksTable.$inferSelect
export type NewChatSyncChannelLink = typeof chatSyncChannelLinksTable.$inferInsert
export type ChatSyncMessageLink = typeof chatSyncMessageLinksTable.$inferSelect
export type NewChatSyncMessageLink = typeof chatSyncMessageLinksTable.$inferInsert
export type ChatSyncEventReceipt = typeof chatSyncEventReceiptsTable.$inferSelect
export type NewChatSyncEventReceipt = typeof chatSyncEventReceiptsTable.$inferInsert

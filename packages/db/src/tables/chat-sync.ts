import {
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
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, pgEnum, timestamptz, varchar } from "./columns"

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

export const chatSyncChannelLinksTable = PG.table("chat_sync_channel_links", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, SyncChannelLinkId), { defaultExpr: "gen_random_uuid()" }),
		syncConnectionId: PG.brand(PG.uuid, SyncConnectionId),
		hazelChannelId: PG.brand(PG.uuid, ChannelId),
		externalChannelId: varchar(255),
		externalChannelName: PG.nullable(varchar(255)),
		direction: PG.column(chatSyncDirectionEnum, { default: "both" }),
		isActive: PG.column(PG.bool, { default: true }),
		settings: PG.nullable(jsonb<Record<string, any>>()),
		lastSyncedAt: PG.nullable(timestamptz),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("chat_sync_link_connection_idx", ["syncConnectionId"]),
		PG.index("chat_sync_link_hazel_channel_idx", ["hazelChannelId"]),
		PG.index("chat_sync_link_external_channel_idx", ["externalChannelId"]),
		PG.index("chat_sync_link_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex("chat_sync_link_connection_hazel_unique", ["syncConnectionId", "hazelChannelId"], {
			where: '"deletedAt" IS NULL',
		}),
		PG.uniqueIndex(
			"chat_sync_link_connection_external_unique",
			["syncConnectionId", "externalChannelId"],
			{ where: '"deletedAt" IS NULL' },
		),
	],
})
export type ChatSyncChannelLink = PG.SelectRowOf<typeof chatSyncChannelLinksTable>
export type NewChatSyncChannelLink = PG.InsertRowOf<typeof chatSyncChannelLinksTable>

export const chatSyncConnectionsTable = PG.table("chat_sync_connections", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, SyncConnectionId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: PG.brand(PG.uuid, OrganizationId),
		integrationConnectionId: PG.nullable(PG.brand(PG.uuid, IntegrationConnectionId)),
		provider: varchar(50),
		externalWorkspaceId: varchar(255),
		externalWorkspaceName: PG.nullable(varchar(255)),
		status: PG.column(chatSyncConnectionStatusEnum, { default: "active" }),
		settings: PG.nullable(jsonb<Record<string, any>>()),
		metadata: PG.nullable(jsonb<Record<string, any>>()),
		errorMessage: PG.nullable(PG.text),
		lastSyncedAt: PG.nullable(timestamptz),
		createdBy: PG.brand(PG.uuid, UserId),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("chat_sync_conn_org_idx", ["organizationId"]),
		PG.index("chat_sync_conn_integration_idx", ["integrationConnectionId"]),
		PG.index("chat_sync_conn_provider_idx", ["provider"]),
		PG.index("chat_sync_conn_status_idx", ["status"]),
		PG.index("chat_sync_conn_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex(
			"chat_sync_conn_org_provider_workspace_unique",
			["organizationId", "provider", "externalWorkspaceId"],
			{ where: '"deletedAt" IS NULL' },
		),
		PG.uniqueIndex("chat_sync_conn_integration_unique", ["integrationConnectionId"], {
			where: '"deletedAt" IS NULL AND "integrationConnectionId" IS NOT NULL',
		}),
	],
})
export type ChatSyncConnection = PG.SelectRowOf<typeof chatSyncConnectionsTable>
export type NewChatSyncConnection = PG.InsertRowOf<typeof chatSyncConnectionsTable>

export const chatSyncEventReceiptsTable = PG.table("chat_sync_event_receipts", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, SyncEventReceiptId), { defaultExpr: "gen_random_uuid()" }),
		syncConnectionId: PG.brand(PG.uuid, SyncConnectionId),
		channelLinkId: PG.nullable(PG.brand(PG.uuid, SyncChannelLinkId)),
		source: chatSyncReceiptSourceEnum,
		externalEventId: PG.nullable(varchar(255)),
		dedupeKey: varchar(255),
		payloadHash: PG.nullable(varchar(128)),
		status: PG.column(chatSyncReceiptStatusEnum, { default: "processed" }),
		errorMessage: PG.nullable(PG.text),
		processedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("chat_sync_receipt_connection_idx", ["syncConnectionId"]),
		PG.index("chat_sync_receipt_channel_link_idx", ["channelLinkId"]),
		PG.index("chat_sync_receipt_source_idx", ["source"]),
		PG.index("chat_sync_receipt_processed_at_idx", ["processedAt"]),
		PG.uniqueIndex("chat_sync_receipt_dedupe_unique", ["syncConnectionId", "source", "dedupeKey"]),
	],
})
export type ChatSyncEventReceipt = PG.SelectRowOf<typeof chatSyncEventReceiptsTable>
export type NewChatSyncEventReceipt = PG.InsertRowOf<typeof chatSyncEventReceiptsTable>

export const chatSyncMessageLinksTable = PG.table("chat_sync_message_links", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, SyncMessageLinkId), { defaultExpr: "gen_random_uuid()" }),
		channelLinkId: PG.brand(PG.uuid, SyncChannelLinkId),
		hazelMessageId: PG.brand(PG.uuid, MessageId),
		externalMessageId: varchar(255),
		source: PG.column(chatSyncReceiptSourceEnum, { default: "hazel" }),
		rootHazelMessageId: PG.nullable(PG.brand(PG.uuid, MessageId)),
		rootExternalMessageId: PG.nullable(varchar(255)),
		hazelThreadChannelId: PG.nullable(PG.brand(PG.uuid, ChannelId)),
		externalThreadId: PG.nullable(varchar(255)),
		lastSyncedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("chat_sync_msg_link_channel_idx", ["channelLinkId"]),
		PG.index("chat_sync_msg_link_hazel_message_idx", ["hazelMessageId"]),
		PG.index("chat_sync_msg_link_external_message_idx", ["externalMessageId"]),
		PG.index("chat_sync_msg_link_root_hazel_idx", ["rootHazelMessageId"]),
		PG.index("chat_sync_msg_link_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex("chat_sync_msg_link_hazel_unique", ["channelLinkId", "hazelMessageId"], {
			where: '"deletedAt" IS NULL',
		}),
		PG.uniqueIndex("chat_sync_msg_link_external_unique", ["channelLinkId", "externalMessageId"], {
			where: '"deletedAt" IS NULL',
		}),
	],
})
export type ChatSyncMessageLink = PG.SelectRowOf<typeof chatSyncMessageLinksTable>
export type NewChatSyncMessageLink = PG.InsertRowOf<typeof chatSyncMessageLinksTable>

export type ChatSyncOutboundIdentitySettings = {
	readonly enabled: boolean
	readonly strategy: "webhook" | "fallback_bot"
	readonly providers: Record<string, Record<string, unknown>>
}

import { ChannelId, ConnectConversationId, MessageId, MessageReactionId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, now, timestamptz, uuid, varchar } from "./columns"

// Embed types for JSONB column
export interface MessageEmbedAuthor {
	name: string
	url?: string
	iconUrl?: string
}

export interface MessageEmbedFooter {
	text: string
	iconUrl?: string
}

export interface MessageEmbedField {
	name: string
	value: string
	inline?: boolean
}

export interface MessageEmbedBadge {
	text: string
	color?: number // Hex color as integer
}

/**
 * Cached snapshot of live state for non-realtime clients.
 * Synced on finalize when the actor completes.
 */
export interface MessageEmbedLiveStateCached {
	status: "idle" | "active" | "completed" | "failed"
	data: Record<string, unknown>
	text?: string
	progress?: number
	error?: string
}

/**
 * Live state configuration for messages with attached RivetKit actors.
 * Used for real-time updates like deployment status or AI streaming.
 */
export interface MessageEmbedLiveState {
	// Whether this message has an attached actor
	enabled: true
	// Cached snapshot for non-realtime clients (synced on finalize)
	cached?: MessageEmbedLiveStateCached
}

export interface MessageEmbed {
	title?: string
	description?: string
	url?: string
	color?: number // Hex color as integer
	author?: MessageEmbedAuthor
	footer?: MessageEmbedFooter
	image?: { url: string }
	thumbnail?: { url: string }
	fields?: MessageEmbedField[]
	timestamp?: string // ISO 8601 timestamp
	badge?: MessageEmbedBadge // Status badge (e.g., "Deployed", "Failed")
	liveState?: MessageEmbedLiveState // Live state for real-time updates
}

export const messageReactionsTable = PG.table("message_reactions", {
	columns: {
		id: PG.column(uuid(MessageReactionId), { defaultExpr: "gen_random_uuid()" }),
		messageId: uuid(MessageId),
		channelId: uuid(ChannelId),
		conversationId: PG.nullable(uuid(ConnectConversationId)),
		userId: uuid(UserId),
		emoji: varchar(50),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	uniqueConstraints: [PG.unique("reactions_message_user_emoji_unique", ["messageId", "userId", "emoji"])],
	indexes: [
		PG.index("reactions_channel_id_idx", ["channelId"]),
		PG.index("reactions_conversation_id_idx", ["conversationId"]),
		PG.index("reactions_message_id_idx", ["messageId"]),
		PG.index("reactions_user_id_idx", ["userId"]),
		PG.index("reactions_message_user_emoji_idx", ["messageId", "userId", "emoji"]),
	],
})
export type MessageReaction = PG.SelectRowOf<typeof messageReactionsTable>
export type NewMessageReaction = PG.InsertRowOf<typeof messageReactionsTable>

export const messagesTable = PG.table("messages", {
	columns: {
		id: PG.column(uuid(MessageId), { defaultExpr: "gen_random_uuid()" }),
		channelId: uuid(ChannelId),
		conversationId: PG.nullable(uuid(ConnectConversationId)),
		authorId: uuid(UserId),
		content: PG.text,
		embeds: PG.nullable(jsonb<MessageEmbed[]>()),
		replyToMessageId: PG.nullable(uuid(MessageId)),
		threadChannelId: PG.nullable(uuid(ChannelId)),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.nullable(timestamptz),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("messages_channel_id_idx", ["channelId"]),
		PG.index("messages_conversation_id_idx", ["conversationId"]),
		PG.index("messages_author_id_idx", ["authorId"]),
		PG.index("messages_reply_to_idx", ["replyToMessageId"]),
		PG.index("messages_thread_channel_idx", ["threadChannelId"]),
		PG.index("messages_created_at_idx", ["createdAt"]),
		PG.index("messages_deleted_at_idx", ["deletedAt"]),
	],
})
export type Message = PG.SelectRowOf<typeof messagesTable>
export type NewMessage = PG.InsertRowOf<typeof messagesTable>

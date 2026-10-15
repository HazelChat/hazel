import {
	Attachment,
	Bot,
	BotCommand,
	BotInstallation,
	Channel,
	ChannelMember,
	ChannelSection,
	ChatSyncChannelLink,
	ChatSyncConnection,
	ChatSyncMessageLink,
	ConnectConversation,
	ConnectConversationChannel,
	ConnectParticipant,
	CustomEmoji,
	IntegrationConnection,
	Message,
	MessageReaction,
	Notification,
	Organization,
	OrganizationMember,
	PinnedMessage,
	TypingIndicator,
	User,
	UserPresenceStatus,
} from "@hazel/domain/models"
import type { Schema } from "effect"
import { electricFetchClient, electricOnError } from "~/lib/electric-fetch"
import { createEffectCollection, type EffectCollection } from "@hazel/effect-electric-db-collection"

const electricUrl = import.meta.env.VITE_ELECTRIC_URL

interface ElectricCollectionOptions {
	/** TanStack DB's sync mode; the default loads the whole shape eagerly. */
	readonly syncMode?: "eager" | "on-demand"
	/** Parse `timestamptz` columns into `Date`s before the schema sees them (default true). */
	readonly parseTimestamps?: boolean
}

/**
 * One Electric-synced table: the shape is the table itself (the proxy scopes it to the user), rows are keyed by
 * `id`. Retries: the Electric client (5xx, 429, network) and `electricOnError` (401), so collection backoff is off.
 */
const electricCollection = <A extends { readonly id: string }>(
	table: string,
	schema: Schema.Schema<A>,
	{ syncMode, parseTimestamps = true }: ElectricCollectionOptions = {},
): EffectCollection<A> =>
	createEffectCollection({
		id: table,
		...(syncMode === undefined ? {} : { syncMode }),
		backoff: false,
		shapeOptions: {
			url: electricUrl,
			params: { table },
			// The parser's value type follows the row, which a generic row can't name; `Schema.JsonDate`
			// columns accept the string form too, so this is only the fast path.
			...(parseTimestamps
				? { parser: { timestamptz: ((date: string) => new Date(date)) as never } }
				: {}),
			fetchClient: electricFetchClient,
			onError: electricOnError,
		},
		schema,
		getKey: (item) => item.id,
	})

export const organizationCollection = electricCollection("organizations", Organization.Schema)
export const messageCollection = electricCollection("messages", Message.Schema)
export const messageReactionCollection = electricCollection("message_reactions", MessageReaction.Schema, {
	syncMode: "on-demand",
})
export const pinnedMessageCollection = electricCollection("pinned_messages", PinnedMessage.Schema)
export const notificationCollection = electricCollection("notifications", Notification.Schema, {
	syncMode: "on-demand",
})
export const userCollection = electricCollection("users", User.Schema)
export const organizationMemberCollection = electricCollection(
	"organization_members",
	OrganizationMember.Schema,
)
export const channelCollection = electricCollection("channels", Channel.Schema)
export const connectConversationCollection = electricCollection(
	"connect_conversations",
	ConnectConversation.Schema,
)
export const connectConversationChannelCollection = electricCollection(
	"connect_conversation_channels",
	ConnectConversationChannel.Schema,
)
export const connectParticipantCollection = electricCollection(
	"connect_participants",
	ConnectParticipant.Schema,
)
export const channelMemberCollection = electricCollection("channel_members", ChannelMember.Schema)
export const channelSectionCollection = electricCollection("channel_sections", ChannelSection.Schema)
export const attachmentCollection = electricCollection("attachments", Attachment.Schema)
export const typingIndicatorCollection = electricCollection("typing_indicators", TypingIndicator.Schema, {
	syncMode: "eager",
	parseTimestamps: false,
})
export const userPresenceStatusCollection = electricCollection(
	"user_presence_status",
	UserPresenceStatus.Schema,
)
export const integrationConnectionCollection = electricCollection(
	"integration_connections",
	IntegrationConnection.Schema,
)
export const chatSyncConnectionCollection = electricCollection(
	"chat_sync_connections",
	ChatSyncConnection.Schema,
)
export const chatSyncChannelLinkCollection = electricCollection(
	"chat_sync_channel_links",
	ChatSyncChannelLink.Schema,
)
export const chatSyncMessageLinkCollection = electricCollection(
	"chat_sync_message_links",
	ChatSyncMessageLink.Schema,
)
export const botCollection = electricCollection("bots", Bot.Schema)
export const botCommandCollection = electricCollection("bot_commands", BotCommand.Schema)
export const botInstallationCollection = electricCollection("bot_installations", BotInstallation.Schema)
export const customEmojiCollection = electricCollection("custom_emojis", CustomEmoji.Schema)

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
	CustomEmoji,
	IntegrationConnection,
	Invitation,
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
import { electricFetchClient } from "~/lib/electric-fetch"
import { runtime } from "~/lib/services/common/runtime"
import { createEffectCollection } from "../../../../libs/effect-electric-db-collection/src"

const electricUrl: string = import.meta.env.VITE_ELECTRIC_URL

export const organizationCollection = createEffectCollection({
	id: "organizations",
	runtime: runtime,
	backoff: false, // Retry handled at fetch level in electric-fetch.ts
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,

		params: {
			table: "organizations",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},

		fetchClient: electricFetchClient,
	},
	schema: Organization.Model.json,
	getKey: (item) => item.id,
})

export const invitationCollection = createEffectCollection({
	id: "invitations",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "invitations",
		},
		//liveSse: true,
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: Invitation.Model.json,
	getKey: (item) => item.id,
})

export const messageCollection = createEffectCollection({
	id: "messages",
	// syncMode: "on-demand",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "messages",
		},
		//// liveSse: true,
		parser: {
			timestamptz: (date: string) => new Date(date),
		} as any,
		fetchClient: electricFetchClient,
	},
	schema: Message.Model.json,
	getKey: (item) => item.id,
})

export const messageReactionCollection = createEffectCollection({
	id: "message_reactions",
	syncMode: "on-demand",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "message_reactions",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: MessageReaction.Model.json,
	getKey: (item) => item.id,
})

export const pinnedMessageCollection = createEffectCollection({
	id: "pinned_messages",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "pinned_messages",
		},
		//liveSse: true,
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: PinnedMessage.Model.json,
	getKey: (item) => item.id,
})

export const notificationCollection = createEffectCollection({
	id: "notifications",
	syncMode: "on-demand",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,
		params: {
			table: "notifications",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: Notification.Model.json,
	getKey: (item) => item.id,
})

export const userCollection = createEffectCollection({
	id: "users",
	// syncMode: "progressive",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//// liveSse: true,
		params: {
			table: "users",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: User.Model.json,
	getKey: (item) => item.id,
})

export const organizationMemberCollection = createEffectCollection({
	id: "organization_members",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,
		params: {
			table: "organization_members",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: OrganizationMember.Model.json,
	getKey: (item) => item.id,
})

export const channelCollection = createEffectCollection({
	id: "channels",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,
		params: {
			table: "channels",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: Channel.Model.json,
	getKey: (item) => item.id,
})

export const channelMemberCollection = createEffectCollection({
	id: "channel_members",
	// syncMode: "progressive",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: `${electricUrl}`,
		//liveSse: true,
		params: {
			table: "channel_members",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: ChannelMember.Model.json,
	getKey: (item) => item.id,
})

export const channelSectionCollection = createEffectCollection({
	id: "channel_sections",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "channel_sections",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: ChannelSection.Model.json,
	getKey: (item) => item.id,
})

export const attachmentCollection = createEffectCollection({
	id: "attachments",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,
		params: {
			table: "attachments",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: Attachment.Model.json,
	getKey: (item) => item.id,
})

export const typingIndicatorCollection = createEffectCollection({
	id: "typing_indicators",
	syncMode: "on-demand",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,
		params: {
			table: "typing_indicators",
		},
		fetchClient: electricFetchClient,
	},
	schema: TypingIndicator.Model.json,
	getKey: (item) => item.id,
})

export const userPresenceStatusCollection = createEffectCollection({
	id: "user_presence_status",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,
		params: {
			table: "user_presence_status",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: UserPresenceStatus.Model.json,
	getKey: (item) => item.id,
})

export const integrationConnectionCollection = createEffectCollection({
	id: "integration_connections",
	// syncMode: "on-demand",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		//liveSse: true,
		params: {
			table: "integration_connections",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: IntegrationConnection.Model.json,
	getKey: (item) => item.id,
})

export const chatSyncConnectionCollection = createEffectCollection({
	id: "chat_sync_connections",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "chat_sync_connections",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: ChatSyncConnection.Model.json,
	getKey: (item) => item.id,
})

export const chatSyncChannelLinkCollection = createEffectCollection({
	id: "chat_sync_channel_links",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "chat_sync_channel_links",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: ChatSyncChannelLink.Model.json,
	getKey: (item) => item.id,
})

export const chatSyncMessageLinkCollection = createEffectCollection({
	id: "chat_sync_message_links",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "chat_sync_message_links",
		},
		parser: {
			timestamptz: (date) => new Date(date),
		},
		fetchClient: electricFetchClient,
	},
	schema: ChatSyncMessageLink.Model.json,
	getKey: (item) => item.id,
})

export const botCollection = createEffectCollection({
	id: "bots",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "bots",
		},
		parser: {
			timestamptz: (date: string) => new Date(date),
		} as any,
		fetchClient: electricFetchClient,
	},
	schema: Bot.Model.json,
	getKey: (item) => item.id,
})

export const botCommandCollection = createEffectCollection({
	id: "bot_commands",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "bot_commands",
		},
		parser: {
			timestamptz: (date: string) => new Date(date),
		} as any,
		fetchClient: electricFetchClient,
	},
	schema: BotCommand.Model.json,
	getKey: (item) => item.id,
})

export const botInstallationCollection = createEffectCollection({
	id: "bot_installations",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "bot_installations",
		},
		parser: {
			timestamptz: (date: string) => new Date(date),
		} as any,
		fetchClient: electricFetchClient,
	},
	schema: BotInstallation.Model.json,
	getKey: (item) => item.id,
})

export const customEmojiCollection = createEffectCollection({
	id: "custom_emojis",
	runtime: runtime,
	backoff: false,
	shapeOptions: {
		url: electricUrl,
		params: {
			table: "custom_emojis",
		},
		parser: {
			timestamptz: (date: string) => new Date(date),
		} as any,
		fetchClient: electricFetchClient,
	},
	schema: CustomEmoji.Model.json,
	getKey: (item) => item.id,
})

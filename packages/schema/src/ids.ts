import { Schema } from "effect"

export const ChannelId = Schema.UUID.pipe(Schema.brand("@HazelChat/ChannelId")).annotations({
	description: "The ID of the channel where the message is posted",
	title: "Channel ID",
})
export type ChannelId = Schema.Schema.Type<typeof ChannelId>

export const UserId = Schema.UUID.pipe(Schema.brand("@HazelChat/UserId")).annotations({
	description: "The ID of a user",
	title: "UserId ID",
})
export type UserId = Schema.Schema.Type<typeof UserId>

export const BotId = Schema.UUID.pipe(Schema.brand("@HazelChat/BotId")).annotations({
	description: "The ID of a bot",
	title: "Bot ID",
})
export type BotId = Schema.Schema.Type<typeof BotId>

export const MessageId = Schema.UUID.pipe(Schema.brand("@HazelChat/MessageId")).annotations({
	description: "The ID of the message being replied to",
	title: "Reply To Message ID",
})
export type MessageId = Schema.Schema.Type<typeof MessageId>

export const MessageReactionId = Schema.UUID.pipe(Schema.brand("@HazelChat/MessageReactionId")).annotations({
	description: "The ID of the message reaction",
	title: "Message Reaction ID",
})
export type MessageReactionId = Schema.Schema.Type<typeof MessageReactionId>

export const MessageAttachmentId = Schema.UUID.pipe(
	Schema.brand("@HazelChat/MessageAttachmentId"),
).annotations({
	description: "The ID of the message attachment",
	title: "Message Attachment ID",
})
export type MessageAttachmentId = Schema.Schema.Type<typeof MessageAttachmentId>

export const AttachmentId = Schema.UUID.pipe(Schema.brand("@HazelChat/AttachmentId")).annotations({
	description: "The ID of the attachment being replied to",
	title: "Attachment ID",
})
export type AttachmentId = Schema.Schema.Type<typeof AttachmentId>

export const OrganizationId = Schema.UUID.pipe(Schema.brand("@HazelChat/OrganizationId")).annotations({
	description: "The ID of the organization",
	title: "Organization ID",
})
export type OrganizationId = Schema.Schema.Type<typeof OrganizationId>

export const InvitationId = Schema.UUID.pipe(Schema.brand("@HazelChat/InvitationId")).annotations({
	description: "The ID of the invitation",
	title: "Invitation ID",
})
export type InvitationId = Schema.Schema.Type<typeof InvitationId>

export const PinnedMessageId = Schema.UUID.pipe(Schema.brand("@HazelChat/PinnedMessageId")).annotations({
	description: "The ID of the pinned message",
	title: "Pinned Message ID",
})
export type PinnedMessageId = Schema.Schema.Type<typeof PinnedMessageId>

export const NotificationId = Schema.UUID.pipe(Schema.brand("@HazelChat/NotificationId")).annotations({
	description: "The ID of the notification",
	title: "Notification ID",
})
export type NotificationId = Schema.Schema.Type<typeof NotificationId>

export const ChannelMemberId = Schema.UUID.pipe(Schema.brand("@HazelChat/ChannelMemberId")).annotations({
	description: "The ID of the channel member",
	title: "Channel Member ID",
})
export type ChannelMemberId = Schema.Schema.Type<typeof ChannelMemberId>

export const OrganizationMemberId = Schema.UUID.pipe(
	Schema.brand("@HazelChat/OrganizationMemberId"),
).annotations({
	description: "The ID of the organization member",
	title: "Organization Member ID",
})
export type OrganizationMemberId = Schema.Schema.Type<typeof OrganizationMemberId>

export const TypingIndicatorId = Schema.UUID.pipe(Schema.brand("@HazelChat/TypingIndicatorId")).annotations({
	description: "The ID of the typing indicator",
	title: "Typing Indicator ID",
})
export type TypingIndicatorId = Schema.Schema.Type<typeof TypingIndicatorId>

export const UserPresenceStatusId = Schema.UUID.pipe(
	Schema.brand("@HazelChat/UserPresenceStatusId"),
).annotations({
	description: "The ID of the user presence status",
	title: "User Presence Status ID",
})
export type UserPresenceStatusId = Schema.Schema.Type<typeof UserPresenceStatusId>

export const IntegrationConnectionId = Schema.UUID.pipe(
	Schema.brand("@HazelChat/IntegrationConnectionId"),
).annotations({
	description: "The ID of an integration connection",
	title: "Integration Connection ID",
})
export type IntegrationConnectionId = Schema.Schema.Type<typeof IntegrationConnectionId>

export const IntegrationTokenId = Schema.UUID.pipe(Schema.brand("@HazelChat/IntegrationTokenId")).annotations(
	{
		description: "The ID of an integration token record",
		title: "Integration Token ID",
	},
)
export type IntegrationTokenId = Schema.Schema.Type<typeof IntegrationTokenId>

export const MessageIntegrationLinkId = Schema.UUID.pipe(
	Schema.brand("@HazelChat/MessageIntegrationLinkId"),
).annotations({
	description: "The ID of a message-integration link",
	title: "Message Integration Link ID",
})
export type MessageIntegrationLinkId = Schema.Schema.Type<typeof MessageIntegrationLinkId>

export const ChannelWebhookId = Schema.UUID.pipe(Schema.brand("@HazelChat/ChannelWebhookId")).annotations({
	description: "The ID of a channel webhook",
	title: "Channel Webhook ID",
})
export type ChannelWebhookId = Schema.Schema.Type<typeof ChannelWebhookId>

export const ChannelIcon = Schema.String.pipe(Schema.brand("@HazelChat/ChannelIcon")).annotations({
	description: "An emoji icon for a channel",
	title: "Channel Icon",
})
export type ChannelIcon = Schema.Schema.Type<typeof ChannelIcon>

export const GitHubSubscriptionId = Schema.UUID.pipe(
	Schema.brand("@HazelChat/GitHubSubscriptionId"),
).annotations({
	description: "The ID of a GitHub subscription",
	title: "GitHub Subscription ID",
})
export type GitHubSubscriptionId = Schema.Schema.Type<typeof GitHubSubscriptionId>

export const BotCommandId = Schema.UUID.pipe(Schema.brand("@HazelChat/BotCommandId")).annotations({
	description: "The ID of a bot command",
	title: "Bot Command ID",
})
export type BotCommandId = Schema.Schema.Type<typeof BotCommandId>

export const BotInstallationId = Schema.UUID.pipe(Schema.brand("@HazelChat/BotInstallationId")).annotations({
	description: "The ID of a bot installation",
	title: "Bot Installation ID",
})
export type BotInstallationId = Schema.Schema.Type<typeof BotInstallationId>

export const ChannelSectionId = Schema.UUID.pipe(Schema.brand("@HazelChat/ChannelSectionId")).annotations({
	description: "The ID of a channel section",
	title: "Channel Section ID",
})
export type ChannelSectionId = Schema.Schema.Type<typeof ChannelSectionId>

export const RssSubscriptionId = Schema.UUID.pipe(Schema.brand("@HazelChat/RssSubscriptionId")).annotations({
	description: "The ID of an RSS subscription",
	title: "RSS Subscription ID",
})
export type RssSubscriptionId = Schema.Schema.Type<typeof RssSubscriptionId>

export const IntegrationRequestId = Schema.UUID.pipe(
	Schema.brand("@HazelChat/IntegrationRequestId"),
).annotations({
	description: "The ID of an integration request",
	title: "Integration Request ID",
})
export type IntegrationRequestId = Schema.Schema.Type<typeof IntegrationRequestId>

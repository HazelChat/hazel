import { relations } from "drizzle-orm"
import { attachmentsTable } from "./attachments"
import { customEmojisTable } from "./custom-emojis"
import { botCommandsTable } from "./bot-commands"
import { botInstallationsTable } from "./bot-installations"
import { botsTable } from "./bots"
import { channelAccessTable } from "./channel-access"
import { channelWebhooksTable } from "./channel-webhooks"
import { channelMembersTable, channelsTable } from "./channels"
import {
	chatSyncChannelLinksTable,
	chatSyncConnectionsTable,
	chatSyncEventReceiptsTable,
	chatSyncMessageLinksTable,
} from "./chat-sync"
import { rssSubscriptionsTable } from "./rss-subscriptions"
import { integrationConnectionsTable } from "./integration-connections"
import { integrationTokensTable } from "./integration-tokens"
import { invitationsTable } from "./invitations"
import { messageReactionsTable, messagesTable } from "./messages"
import { notificationsTable } from "./notifications"
import { organizationMembersTable, organizationsTable } from "./organizations"
import { pinnedMessagesTable } from "./pinned-messages"
import { typingIndicatorsTable } from "./typing-indicators"
import { usersTable } from "./users"

// Users relations
export const usersRelations = relations(usersTable, ({ many }) => ({
	organizationMembers: many(organizationMembersTable),
	channelMembers: many(channelMembersTable),
	channelAccess: many(channelAccessTable),
	messages: many(messagesTable),
	messageReactions: many(messageReactionsTable),
	chatSyncConnectionsCreated: many(chatSyncConnectionsTable),
	attachments: many(attachmentsTable),
	invitationsSent: many(invitationsTable),
	invitationsAccepted: many(invitationsTable),
	pinnedMessages: many(pinnedMessagesTable),
}))

// Organizations relations
export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
	members: many(organizationMembersTable),
	channels: many(channelsTable),
	chatSyncConnections: many(chatSyncConnectionsTable),
	channelAccess: many(channelAccessTable),
	invitations: many(invitationsTable),
	attachments: many(attachmentsTable),
	customEmojis: many(customEmojisTable),
}))

// Organization members relations
export const organizationMembersRelations = relations(organizationMembersTable, ({ one, many }) => ({
	organization: one(organizationsTable, {
		fields: [organizationMembersTable.organizationId],
		references: [organizationsTable.id],
	}),
	user: one(usersTable, {
		fields: [organizationMembersTable.userId],
		references: [usersTable.id],
	}),
	invitedByUser: one(usersTable, {
		fields: [organizationMembersTable.invitedBy],
		references: [usersTable.id],
	}),
	notifications: many(notificationsTable),
	typingIndicators: many(typingIndicatorsTable),
}))

// Channels relations
export const channelsRelations = relations(channelsTable, ({ one, many }) => ({
	organization: one(organizationsTable, {
		fields: [channelsTable.organizationId],
		references: [organizationsTable.id],
	}),
	parentChannel: one(channelsTable, {
		fields: [channelsTable.parentChannelId],
		references: [channelsTable.id],
		relationName: "channelThreads",
	}),
	childChannels: many(channelsTable, {
		relationName: "channelThreads",
	}),
	members: many(channelMembersTable),
	messages: many(messagesTable),
	threadMessages: many(messagesTable),
	pinnedMessages: many(pinnedMessagesTable),
	attachments: many(attachmentsTable),
	typingIndicators: many(typingIndicatorsTable),
	webhooks: many(channelWebhooksTable),
	rssSubscriptions: many(rssSubscriptionsTable),
	chatSyncLinks: many(chatSyncChannelLinksTable),
	chatSyncThreadMessageLinks: many(chatSyncMessageLinksTable, {
		relationName: "chatSyncHazelThreadChannelLinks",
	}),
	channelAccess: many(channelAccessTable),
}))

// Channel members relations
export const channelMembersRelations = relations(channelMembersTable, ({ one }) => ({
	channel: one(channelsTable, {
		fields: [channelMembersTable.channelId],
		references: [channelsTable.id],
	}),
	user: one(usersTable, {
		fields: [channelMembersTable.userId],
		references: [usersTable.id],
	}),
	lastSeenMessage: one(messagesTable, {
		fields: [channelMembersTable.lastSeenMessageId],
		references: [messagesTable.id],
	}),
}))

// Channel access relations
export const channelAccessRelations = relations(channelAccessTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [channelAccessTable.userId],
		references: [usersTable.id],
	}),
	channel: one(channelsTable, {
		fields: [channelAccessTable.channelId],
		references: [channelsTable.id],
	}),
	organization: one(organizationsTable, {
		fields: [channelAccessTable.organizationId],
		references: [organizationsTable.id],
	}),
}))

// Messages relations
export const messagesRelations = relations(messagesTable, ({ one, many }) => ({
	channel: one(channelsTable, {
		fields: [messagesTable.channelId],
		references: [channelsTable.id],
	}),
	author: one(usersTable, {
		fields: [messagesTable.authorId],
		references: [usersTable.id],
	}),
	replyTo: one(messagesTable, {
		fields: [messagesTable.replyToMessageId],
		references: [messagesTable.id],
		relationName: "messageReplies",
	}),
	threadChannel: one(channelsTable, {
		fields: [messagesTable.threadChannelId],
		references: [channelsTable.id],
	}),
	replies: many(messagesTable, {
		relationName: "messageReplies",
	}),
	reactions: many(messageReactionsTable),
	chatSyncLinks: many(chatSyncMessageLinksTable, {
		relationName: "chatSyncHazelMessageLinks",
	}),
	chatSyncRootLinks: many(chatSyncMessageLinksTable, {
		relationName: "chatSyncRootHazelMessageLinks",
	}),
	attachments: many(attachmentsTable),
	pinnedIn: many(pinnedMessagesTable),
	seenBy: many(channelMembersTable),
}))

// Message reactions relations
export const messageReactionsRelations = relations(messageReactionsTable, ({ one }) => ({
	message: one(messagesTable, {
		fields: [messageReactionsTable.messageId],
		references: [messagesTable.id],
	}),
	user: one(usersTable, {
		fields: [messageReactionsTable.userId],
		references: [usersTable.id],
	}),
}))

// Attachments relations
export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
	organization: one(organizationsTable, {
		fields: [attachmentsTable.organizationId],
		references: [organizationsTable.id],
	}),
	channel: one(channelsTable, {
		fields: [attachmentsTable.channelId],
		references: [channelsTable.id],
	}),
	message: one(messagesTable, {
		fields: [attachmentsTable.messageId],
		references: [messagesTable.id],
	}),
	uploadedBy: one(usersTable, {
		fields: [attachmentsTable.uploadedBy],
		references: [usersTable.id],
	}),
}))

// Invitations relations
export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
	organization: one(organizationsTable, {
		fields: [invitationsTable.organizationId],
		references: [organizationsTable.id],
	}),
	invitedBy: one(usersTable, {
		fields: [invitationsTable.invitedBy],
		references: [usersTable.id],
		relationName: "invitationsSent",
	}),
	acceptedBy: one(usersTable, {
		fields: [invitationsTable.acceptedBy],
		references: [usersTable.id],
		relationName: "invitationsAccepted",
	}),
}))

// Pinned messages relations
export const pinnedMessagesRelations = relations(pinnedMessagesTable, ({ one }) => ({
	channel: one(channelsTable, {
		fields: [pinnedMessagesTable.channelId],
		references: [channelsTable.id],
	}),
	message: one(messagesTable, {
		fields: [pinnedMessagesTable.messageId],
		references: [messagesTable.id],
	}),
	pinnedBy: one(usersTable, {
		fields: [pinnedMessagesTable.pinnedBy],
		references: [usersTable.id],
	}),
}))

// Notifications relations
export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
	member: one(organizationMembersTable, {
		fields: [notificationsTable.memberId],
		references: [organizationMembersTable.id],
	}),
	// Note: targetedResourceId and resourceId can reference different tables
	// These would need to be handled at the application level since they're polymorphic
}))

// Typing indicators relations
export const typingIndicatorsRelations = relations(typingIndicatorsTable, ({ one }) => ({
	channel: one(channelsTable, {
		fields: [typingIndicatorsTable.channelId],
		references: [channelsTable.id],
	}),
	member: one(organizationMembersTable, {
		fields: [typingIndicatorsTable.memberId],
		references: [organizationMembersTable.id],
	}),
}))

// Integration connections relations
export const integrationConnectionsRelations = relations(integrationConnectionsTable, ({ one, many }) => ({
	organization: one(organizationsTable, {
		fields: [integrationConnectionsTable.organizationId],
		references: [organizationsTable.id],
	}),
	user: one(usersTable, {
		fields: [integrationConnectionsTable.userId],
		references: [usersTable.id],
	}),
	connectedByUser: one(usersTable, {
		fields: [integrationConnectionsTable.connectedBy],
		references: [usersTable.id],
	}),
	token: one(integrationTokensTable),
	chatSyncConnections: many(chatSyncConnectionsTable),
}))

// Integration tokens relations
export const integrationTokensRelations = relations(integrationTokensTable, ({ one }) => ({
	connection: one(integrationConnectionsTable, {
		fields: [integrationTokensTable.connectionId],
		references: [integrationConnectionsTable.id],
	}),
}))

// Chat sync connections relations
export const chatSyncConnectionsRelations = relations(chatSyncConnectionsTable, ({ one, many }) => ({
	organization: one(organizationsTable, {
		fields: [chatSyncConnectionsTable.organizationId],
		references: [organizationsTable.id],
	}),
	integrationConnection: one(integrationConnectionsTable, {
		fields: [chatSyncConnectionsTable.integrationConnectionId],
		references: [integrationConnectionsTable.id],
	}),
	createdByUser: one(usersTable, {
		fields: [chatSyncConnectionsTable.createdBy],
		references: [usersTable.id],
	}),
	channelLinks: many(chatSyncChannelLinksTable),
	eventReceipts: many(chatSyncEventReceiptsTable),
}))

// Chat sync channel links relations
export const chatSyncChannelLinksRelations = relations(chatSyncChannelLinksTable, ({ one, many }) => ({
	syncConnection: one(chatSyncConnectionsTable, {
		fields: [chatSyncChannelLinksTable.syncConnectionId],
		references: [chatSyncConnectionsTable.id],
	}),
	hazelChannel: one(channelsTable, {
		fields: [chatSyncChannelLinksTable.hazelChannelId],
		references: [channelsTable.id],
	}),
	messageLinks: many(chatSyncMessageLinksTable),
	eventReceipts: many(chatSyncEventReceiptsTable),
}))

// Chat sync message links relations
export const chatSyncMessageLinksRelations = relations(chatSyncMessageLinksTable, ({ one }) => ({
	channelLink: one(chatSyncChannelLinksTable, {
		fields: [chatSyncMessageLinksTable.channelLinkId],
		references: [chatSyncChannelLinksTable.id],
	}),
	hazelMessage: one(messagesTable, {
		fields: [chatSyncMessageLinksTable.hazelMessageId],
		references: [messagesTable.id],
		relationName: "chatSyncHazelMessageLinks",
	}),
	rootHazelMessage: one(messagesTable, {
		fields: [chatSyncMessageLinksTable.rootHazelMessageId],
		references: [messagesTable.id],
		relationName: "chatSyncRootHazelMessageLinks",
	}),
	hazelThreadChannel: one(channelsTable, {
		fields: [chatSyncMessageLinksTable.hazelThreadChannelId],
		references: [channelsTable.id],
		relationName: "chatSyncHazelThreadChannelLinks",
	}),
}))

// Chat sync event receipts relations
export const chatSyncEventReceiptsRelations = relations(chatSyncEventReceiptsTable, ({ one }) => ({
	syncConnection: one(chatSyncConnectionsTable, {
		fields: [chatSyncEventReceiptsTable.syncConnectionId],
		references: [chatSyncConnectionsTable.id],
	}),
	channelLink: one(chatSyncChannelLinksTable, {
		fields: [chatSyncEventReceiptsTable.channelLinkId],
		references: [chatSyncChannelLinksTable.id],
	}),
}))

// Bots relations
export const botsRelations = relations(botsTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [botsTable.userId],
		references: [usersTable.id],
	}),
	createdByUser: one(usersTable, {
		fields: [botsTable.createdBy],
		references: [usersTable.id],
	}),
	commands: many(botCommandsTable),
	installations: many(botInstallationsTable),
}))

// Bot commands relations
export const botCommandsRelations = relations(botCommandsTable, ({ one }) => ({
	bot: one(botsTable, {
		fields: [botCommandsTable.botId],
		references: [botsTable.id],
	}),
}))

// Bot installations relations
export const botInstallationsRelations = relations(botInstallationsTable, ({ one }) => ({
	bot: one(botsTable, {
		fields: [botInstallationsTable.botId],
		references: [botsTable.id],
	}),
	organization: one(organizationsTable, {
		fields: [botInstallationsTable.organizationId],
		references: [organizationsTable.id],
	}),
	installedByUser: one(usersTable, {
		fields: [botInstallationsTable.installedBy],
		references: [usersTable.id],
	}),
}))

// Channel webhooks relations
export const channelWebhooksRelations = relations(channelWebhooksTable, ({ one }) => ({
	channel: one(channelsTable, {
		fields: [channelWebhooksTable.channelId],
		references: [channelsTable.id],
	}),
	organization: one(organizationsTable, {
		fields: [channelWebhooksTable.organizationId],
		references: [organizationsTable.id],
	}),
	botUser: one(usersTable, {
		fields: [channelWebhooksTable.botUserId],
		references: [usersTable.id],
	}),
	createdByUser: one(usersTable, {
		fields: [channelWebhooksTable.createdBy],
		references: [usersTable.id],
	}),
}))

// RSS subscriptions relations
export const rssSubscriptionsRelations = relations(rssSubscriptionsTable, ({ one }) => ({
	channel: one(channelsTable, {
		fields: [rssSubscriptionsTable.channelId],
		references: [channelsTable.id],
	}),
	organization: one(organizationsTable, {
		fields: [rssSubscriptionsTable.organizationId],
		references: [organizationsTable.id],
	}),
	createdByUser: one(usersTable, {
		fields: [rssSubscriptionsTable.createdBy],
		references: [usersTable.id],
	}),
}))

// Custom emojis relations
export const customEmojisRelations = relations(customEmojisTable, ({ one }) => ({
	organization: one(organizationsTable, {
		fields: [customEmojisTable.organizationId],
		references: [organizationsTable.id],
	}),
	createdByUser: one(usersTable, {
		fields: [customEmojisTable.createdBy],
		references: [usersTable.id],
	}),
}))

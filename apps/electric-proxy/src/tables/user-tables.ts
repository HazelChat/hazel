import { schema } from "@hazel/db"
import { Effect, Match, Schema } from "effect"
import type { AuthenticatedUser } from "../auth/user-auth"
import {
	buildChannelAccessClause,
	buildChannelVisibilityClause,
	buildDeletedAtNullClause,
	buildIntegrationConnectionClause,
	buildNoFilterClause,
	buildOrgMembershipClause,
	buildUserMembershipClause,
	col,
	eqCol,
	inSubquery,
	isNullCol,
	refs,
	sql,
	sqlToWhereClause,
	type WhereClauseResult,
} from "./where-clause-builder"

/** The tables whose columns the WHERE clauses name. */
const T = {
	attachments: refs(schema.attachmentsTable),
	botInstallations: refs(schema.botInstallationsTable),
	bots: refs(schema.botsTable),
	channelAccess: refs(schema.channelAccessTable),
	channelMembers: refs(schema.channelMembersTable),
	channelSections: refs(schema.channelSectionsTable),
	channels: refs(schema.channelsTable),
	chatSyncChannelLinks: refs(schema.chatSyncChannelLinksTable),
	chatSyncConnections: refs(schema.chatSyncConnectionsTable),
	chatSyncMessageLinks: refs(schema.chatSyncMessageLinksTable),
	connectConversationChannels: refs(schema.connectConversationChannelsTable),
	connectConversations: refs(schema.connectConversationsTable),
	connectParticipants: refs(schema.connectParticipantsTable),
	customEmojis: refs(schema.customEmojisTable),
	integrationConnections: refs(schema.integrationConnectionsTable),
	messageReactions: refs(schema.messageReactionsTable),
	messages: refs(schema.messagesTable),
	notifications: refs(schema.notificationsTable),
	organizationMembers: refs(schema.organizationMembersTable),
	organizations: refs(schema.organizationsTable),
	pinnedMessages: refs(schema.pinnedMessagesTable),
	typingIndicators: refs(schema.typingIndicatorsTable),
	users: refs(schema.usersTable),
}

/**
 * Error thrown when table access is denied or where clause cannot be generated
 */
export class TableAccessError extends Schema.TaggedError<TableAccessError>()("TableAccessError", {
	message: Schema.String,
	detail: Schema.optional(Schema.String),
	table: Schema.String,
}) {}

/**
 * Whitelisted tables that can be accessed through the Electric proxy.
 * Only these tables are allowed for authenticated users.
 */
export const ALLOWED_TABLES = [
	// User tables
	"users",
	"user_presence_status",

	// Organization tables
	"organizations",
	"organization_members",

	// Channel tables
	"channels",
	"channel_members",
	"channel_sections",
	"connect_conversations",
	"connect_conversation_channels",
	"connect_participants",

	// Message tables
	"messages",
	"message_reactions",
	"attachments",

	// Notification tables
	"notifications",
	"pinned_messages",

	// Interaction tables
	"typing_indicators",

	// Bot tables
	"bots",
	"bot_commands",
	"bot_installations",

	// Integration tables
	"integration_connections",

	// Chat Sync tables
	"chat_sync_connections",
	"chat_sync_channel_links",
	"chat_sync_message_links",

	// Custom Emoji tables
	"custom_emojis",
] as const

export type AllowedTable = (typeof ALLOWED_TABLES)[number]

/**
 * Check if a table name is allowed
 */
export function isTableAllowed(table: string): table is AllowedTable {
	return ALLOWED_TABLES.includes(table as AllowedTable)
}

/**
 * Validate that a table parameter is present and allowed
 */
export function validateTable(table: string | null): {
	valid: boolean
	table?: AllowedTable
	error?: string
} {
	if (!table) {
		return {
			valid: false,
			error: "Missing required parameter: table",
		}
	}

	if (!isTableAllowed(table)) {
		return {
			valid: false,
			error: `Table '${table}' is not allowed. Only whitelisted tables can be accessed.`,
		}
	}

	return {
		valid: true,
		table: table as AllowedTable,
	}
}

/**
 * Get the WHERE clause for a table based on the authenticated user.
 *
 * Channel-scoped visibility uses a single subquery over `channel_access`.
 * This keeps Electric parser compatibility while allowing thread inheritance
 * to update through normal DB write paths.
 *
 * Uses unqualified column names (via column.name) for Electric SQL compatibility.
 * All WHERE clauses are parameterized for security.
 *
 * @param table - The table name
 * @param user - The authenticated user context
 * @returns Effect that succeeds with WhereClauseResult or fails with TableAccessError
 */
export function getWhereClauseForTable(
	table: AllowedTable,
	user: AuthenticatedUser,
): Effect.Effect<WhereClauseResult, TableAccessError> {
	const channelAccessSubquery = sql`(SELECT ${col(T.channelAccess.channelId)} FROM ${T.channelAccess.$table} WHERE ${eqCol(T.channelAccess.userId, user.internalUserId)})`
	const connectConversationAccessSubquery = sql`(SELECT ${col(T.connectConversationChannels.conversationId)} FROM ${T.connectConversationChannels.$table} WHERE ${isNullCol(T.connectConversationChannels.deletedAt)} AND ${col(T.connectConversationChannels.channelId)} IN ${channelAccessSubquery})`

	// Chat Sync tables — handled before Match.pipe to stay within its 20-arg type limit
	switch (table) {
		case "chat_sync_connections":
			return Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					T.chatSyncConnections.organizationId,
					T.chatSyncConnections.deletedAt,
				),
			)
		case "chat_sync_channel_links":
			return Effect.succeed(
				buildChannelAccessClause(
					user.internalUserId,
					T.chatSyncChannelLinks.hazelChannelId,
					T.chatSyncChannelLinks.deletedAt,
				),
			)
		case "chat_sync_message_links":
			return Effect.succeed(
				sqlToWhereClause(
					sql`${isNullCol(T.chatSyncMessageLinks.deletedAt)} AND ${inSubquery(
						T.chatSyncMessageLinks.channelLinkId,
						sql`(SELECT ${col(T.chatSyncChannelLinks.id)} FROM ${T.chatSyncChannelLinks.$table} WHERE ${isNullCol(T.chatSyncChannelLinks.deletedAt)} AND ${col(T.chatSyncChannelLinks.hazelChannelId)} IN ${channelAccessSubquery})`,
					)}`,
				),
			)
		case "connect_conversations":
			return Effect.succeed(
				sqlToWhereClause(
					sql`${isNullCol(T.connectConversations.deletedAt)} AND ${inSubquery(
						T.connectConversations.id,
						connectConversationAccessSubquery,
					)}`,
				),
			)
		case "connect_conversation_channels":
			return Effect.succeed(
				buildChannelAccessClause(
					user.internalUserId,
					T.connectConversationChannels.channelId,
					T.connectConversationChannels.deletedAt,
				),
			)
		case "connect_participants":
			return Effect.succeed(
				buildChannelAccessClause(
					user.internalUserId,
					T.connectParticipants.channelId,
					T.connectParticipants.deletedAt,
				),
			)
	}

	return Match.value(table).pipe(
		// ===========================================
		// User tables
		// ===========================================

		Match.when("users", () =>
			// All non-deleted users (organization filtering removed to support bot machine users
			// whose organization membership is soft-deleted on bot uninstall)
			Effect.succeed(buildDeletedAtNullClause(T.users.deletedAt)),
		),

		Match.when("user_presence_status", () =>
			// All presence status visible
			Effect.succeed(buildNoFilterClause()),
		),

		// ===========================================
		// Organization tables
		// ===========================================

		Match.when("organizations", () =>
			// Organizations: only those the user is a member of
			Effect.succeed(
				buildOrgMembershipClause(user.internalUserId, T.organizations.id, T.organizations.deletedAt),
			),
		),

		Match.when("organization_members", () =>
			// Organization members: only in orgs the user is a member of
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					T.organizationMembers.organizationId,
					T.organizationMembers.deletedAt,
				),
			),
		),

		// ===========================================
		// Channel tables
		// ===========================================

		Match.when("channels", () =>
			// Channel visibility: rows materialized in channel_access for this user
			Effect.succeed(buildChannelVisibilityClause(user.internalUserId, T.channels.deletedAt)),
		),

		Match.when("channel_members", () =>
			// Channel members: only in channels user has access to
			Effect.succeed(
				buildChannelAccessClause(
					user.internalUserId,
					T.channelMembers.channelId,
					T.channelMembers.deletedAt,
				),
			),
		),

		Match.when("channel_sections", () =>
			// Channel sections: only in orgs the user is a member of
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					T.channelSections.organizationId,
					T.channelSections.deletedAt,
				),
			),
		),

		// ===========================================
		// Message tables
		// ===========================================

		Match.when("messages", () =>
			Effect.succeed(
				sqlToWhereClause(
					sql`${isNullCol(T.messages.deletedAt)} AND ((${col(T.messages.conversationId)} IS NULL AND ${inSubquery(T.messages.channelId, channelAccessSubquery)}) OR (${col(T.messages.conversationId)} IS NOT NULL AND ${inSubquery(T.messages.conversationId, connectConversationAccessSubquery)}))`,
				),
			),
		),

		Match.when("message_reactions", () =>
			Effect.succeed(
				sqlToWhereClause(
					sql`((${col(T.messageReactions.conversationId)} IS NULL AND ${inSubquery(T.messageReactions.channelId, channelAccessSubquery)}) OR (${col(T.messageReactions.conversationId)} IS NOT NULL AND ${inSubquery(T.messageReactions.conversationId, connectConversationAccessSubquery)}))`,
				),
			),
		),

		Match.when("attachments", () =>
			// Attachments: only in orgs the user is a member of
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					T.attachments.organizationId,
					T.attachments.deletedAt,
				),
			),
		),

		// ===========================================
		// Notification tables
		// ===========================================

		Match.when("notifications", () =>
			// Users can only see their own notifications (via subquery on organization_members)
			Effect.succeed(buildUserMembershipClause(user.internalUserId, T.notifications.memberId)),
		),

		Match.when("pinned_messages", () =>
			// Pinned messages: only in channels user has access to
			Effect.succeed(buildChannelAccessClause(user.internalUserId, T.pinnedMessages.channelId)),
		),

		// ===========================================
		// Interaction tables
		// ===========================================

		Match.when("typing_indicators", () =>
			// Typing indicators: only in channels user has access to
			Effect.succeed(buildChannelAccessClause(user.internalUserId, T.typingIndicators.channelId)),
		),

		// ===========================================
		// Bot tables
		// ===========================================

		Match.when("bots", () => Effect.succeed(buildDeletedAtNullClause(T.bots.deletedAt))),

		Match.when("bot_commands", () =>
			// All bot commands visible (filtered by bot installation in frontend)
			Effect.succeed(buildNoFilterClause()),
		),

		Match.when("bot_installations", () =>
			// Bot installations: only in orgs the user is a member of (no deletedAt column)
			Effect.succeed(buildOrgMembershipClause(user.internalUserId, T.botInstallations.organizationId)),
		),

		// ===========================================
		// Integration tables
		// ===========================================

		Match.when("integration_connections", () =>
			// Integration connections: org-level in user's orgs OR user's own connections
			Effect.succeed(
				buildIntegrationConnectionClause(user.internalUserId, T.integrationConnections.deletedAt),
			),
		),

		// ===========================================
		// Custom Emoji tables
		// ===========================================

		Match.when("custom_emojis", () =>
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					T.customEmojis.organizationId,
					T.customEmojis.deletedAt,
				),
			),
		),

		// ===========================================
		// Fallback for unhandled tables
		// ===========================================

		Match.orElse((table) =>
			Effect.fail(
				new TableAccessError({
					message: "Table not handled in where clause system",
					detail: `Missing where clause implementation for table: ${String(table)}`,
					table: String(table),
				}),
			),
		),
	)
}

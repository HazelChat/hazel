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
	type WhereClauseResult,
} from "./where-clause-builder"

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

	// Message tables
	"messages",
	"message_reactions",
	"attachments",

	// Notification tables
	"notifications",
	"pinned_messages",

	// Interaction tables
	"typing_indicators",
	"invitations",

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
	// Chat Sync tables — handled before Match.pipe to stay within its 20-arg type limit
	switch (table) {
		case "chat_sync_connections":
			return Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					schema.chatSyncConnectionsTable.organizationId,
					schema.chatSyncConnectionsTable.deletedAt,
				),
			)
		case "chat_sync_channel_links":
			return Effect.succeed(
				buildChannelAccessClause(
					user.internalUserId,
					schema.chatSyncChannelLinksTable.hazelChannelId,
					schema.chatSyncChannelLinksTable.deletedAt,
				),
			)
		case "chat_sync_message_links": {
			const deletedAtClause = `"${schema.chatSyncMessageLinksTable.deletedAt.name}" IS NULL AND `
			const whereClause = `${deletedAtClause}"${schema.chatSyncMessageLinksTable.channelLinkId.name}" IN (SELECT "id" FROM chat_sync_channel_links WHERE "deletedAt" IS NULL AND "hazelChannelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1))`
			return Effect.succeed({ whereClause, params: [user.internalUserId] })
		}
	}

	return Match.value(table).pipe(
		// ===========================================
		// User tables
		// ===========================================

		Match.when("users", () =>
			// All non-deleted users (organization filtering removed to support bot machine users
			// whose organization membership is soft-deleted on bot uninstall)
			Effect.succeed(buildDeletedAtNullClause(schema.usersTable.deletedAt)),
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
				buildOrgMembershipClause(
					user.internalUserId,
					schema.organizationsTable.id,
					schema.organizationsTable.deletedAt,
				),
			),
		),

		Match.when("organization_members", () =>
			// Organization members: only in orgs the user is a member of
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					schema.organizationMembersTable.organizationId,
					schema.organizationMembersTable.deletedAt,
				),
			),
		),

		// ===========================================
		// Channel tables
		// ===========================================

		Match.when("channels", () =>
			// Channel visibility: rows materialized in channel_access for this user
			Effect.succeed(buildChannelVisibilityClause(user.internalUserId, schema.channelsTable.deletedAt)),
		),

		Match.when("channel_members", () =>
			// Channel members: only in channels user has access to
			Effect.succeed(
				buildChannelAccessClause(
					user.internalUserId,
					schema.channelMembersTable.channelId,
					schema.channelMembersTable.deletedAt,
				),
			),
		),

		Match.when("channel_sections", () =>
			// Channel sections: only in orgs the user is a member of
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					schema.channelSectionsTable.organizationId,
					schema.channelSectionsTable.deletedAt,
				),
			),
		),

		// ===========================================
		// Message tables
		// ===========================================

		Match.when("messages", () =>
			// Messages: only in channels user has access to
			Effect.succeed(
				buildChannelAccessClause(
					user.internalUserId,
					schema.messagesTable.channelId,
					schema.messagesTable.deletedAt,
				),
			),
		),

		Match.when("message_reactions", () =>
			// Message reactions: only in channels user has access to
			Effect.succeed(
				buildChannelAccessClause(user.internalUserId, schema.messageReactionsTable.channelId),
			),
		),

		Match.when("attachments", () =>
			// Attachments: only in orgs the user is a member of
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					schema.attachmentsTable.organizationId,
					schema.attachmentsTable.deletedAt,
				),
			),
		),

		// ===========================================
		// Notification tables
		// ===========================================

		Match.when("notifications", () =>
			// Users can only see their own notifications (via subquery on organization_members)
			Effect.succeed(
				buildUserMembershipClause(user.internalUserId, schema.notificationsTable.memberId),
			),
		),

		Match.when("pinned_messages", () =>
			// Pinned messages: only in channels user has access to
			Effect.succeed(
				buildChannelAccessClause(user.internalUserId, schema.pinnedMessagesTable.channelId),
			),
		),

		// ===========================================
		// Interaction tables
		// ===========================================

		Match.when("typing_indicators", () =>
			// Typing indicators: only in channels user has access to
			Effect.succeed(
				buildChannelAccessClause(user.internalUserId, schema.typingIndicatorsTable.channelId),
			),
		),

		Match.when("invitations", () =>
			// Invitations: only in orgs the user is a member of (no deletedAt column)
			Effect.succeed(
				buildOrgMembershipClause(user.internalUserId, schema.invitationsTable.organizationId),
			),
		),

		// ===========================================
		// Bot tables
		// ===========================================

		Match.when("bots", () => Effect.succeed(buildDeletedAtNullClause(schema.botsTable.deletedAt))),

		Match.when("bot_commands", () =>
			// All bot commands visible (filtered by bot installation in frontend)
			Effect.succeed(buildNoFilterClause()),
		),

		Match.when("bot_installations", () =>
			// Bot installations: only in orgs the user is a member of (no deletedAt column)
			Effect.succeed(
				buildOrgMembershipClause(user.internalUserId, schema.botInstallationsTable.organizationId),
			),
		),

		// ===========================================
		// Integration tables
		// ===========================================

		Match.when("integration_connections", () =>
			// Integration connections: org-level in user's orgs OR user's own connections
			Effect.succeed(
				buildIntegrationConnectionClause(
					user.internalUserId,
					schema.integrationConnectionsTable.deletedAt,
				),
			),
		),

		// ===========================================
		// Custom Emoji tables
		// ===========================================

		Match.when("custom_emojis", () =>
			Effect.succeed(
				buildOrgMembershipClause(
					user.internalUserId,
					schema.customEmojisTable.organizationId,
					schema.customEmojisTable.deletedAt,
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
					detail: `Missing where clause implementation for table: ${table}`,
					table,
				}),
			),
		),
	)
}

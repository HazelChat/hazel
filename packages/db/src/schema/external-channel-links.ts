import type { ChannelId, ExternalChannelLinkId, OrganizationId, UserId } from "@hazel/schema"
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
import { integrationProviderEnum } from "./integration-connections"

// Sync direction enum
export const syncDirectionEnum = pgEnum("sync_direction", ["inbound", "outbound", "bidirectional"])

// Provider-specific config types
// Outbound messages are sent via Discord REST API using the bot token
export interface DiscordChannelConfig {
	provider: "discord"
}

export interface SlackChannelConfig {
	provider: "slack"
	botToken?: string
}

export type ExternalChannelConfig = DiscordChannelConfig | SlackChannelConfig

// External channel links table - links Hazel channels to external platform channels
export const externalChannelLinksTable = pgTable(
	"external_channel_links",
	{
		id: uuid().primaryKey().defaultRandom().$type<ExternalChannelLinkId>(),

		// Hazel side
		channelId: uuid().notNull().$type<ChannelId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),

		// External side (generic)
		provider: integrationProviderEnum().notNull(), // 'discord' | 'slack'
		externalWorkspaceId: varchar({ length: 255 }).notNull(), // Guild ID or Slack Workspace ID
		externalWorkspaceName: varchar({ length: 255 }).notNull(),
		externalChannelId: varchar({ length: 255 }).notNull(),
		externalChannelName: varchar({ length: 255 }).notNull(),

		// Sync config
		syncDirection: syncDirectionEnum().notNull().default("bidirectional"),

		// Provider-specific config (webhook URLs, etc.)
		config: jsonb().$type<ExternalChannelConfig>(),

		isEnabled: boolean().notNull().default(true),
		createdBy: uuid().notNull().$type<UserId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("ext_chan_links_channel_idx").on(table.channelId),
		index("ext_chan_links_org_idx").on(table.organizationId),
		index("ext_chan_links_provider_idx").on(table.provider),
		index("ext_chan_links_ext_channel_idx").on(table.externalChannelId),
		index("ext_chan_links_enabled_idx").on(table.isEnabled),
		index("ext_chan_links_deleted_at_idx").on(table.deletedAt),
		// Unique constraint: one link per provider/external channel to Hazel channel
		uniqueIndex("ext_chan_links_provider_ext_hazel_unique").on(
			table.provider,
			table.externalChannelId,
			table.channelId,
		),
	],
)

// Type exports
export type ExternalChannelLink = typeof externalChannelLinksTable.$inferSelect
export type NewExternalChannelLink = typeof externalChannelLinksTable.$inferInsert

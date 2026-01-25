import type { ChannelId, ExternalChannelLinkId, ExternalThreadLinkId } from "@hazel/schema"
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"
import { integrationProviderEnum } from "./integration-connections"

// External thread links table - maps Hazel threads to external platform threads
export const externalThreadLinksTable = pgTable(
	"external_thread_links",
	{
		id: uuid().primaryKey().defaultRandom().$type<ExternalThreadLinkId>(),

		// Hazel thread
		hazelThreadId: uuid().notNull().$type<ChannelId>(),

		// External thread
		provider: integrationProviderEnum().notNull(),
		externalThreadId: varchar({ length: 255 }).notNull(),
		externalParentMessageId: varchar({ length: 255 }), // Discord/Slack parent message that started the thread

		// Link to parent channel link
		channelLinkId: uuid().notNull().$type<ExternalChannelLinkId>(),

		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("ext_thread_links_hazel_thread_idx").on(table.hazelThreadId),
		index("ext_thread_links_provider_idx").on(table.provider),
		index("ext_thread_links_ext_thread_idx").on(table.externalThreadId),
		index("ext_thread_links_channel_link_idx").on(table.channelLinkId),
		// Unique constraint: one link per provider/external thread to Hazel thread
		uniqueIndex("ext_thread_links_provider_ext_hazel_unique").on(
			table.provider,
			table.externalThreadId,
			table.hazelThreadId,
		),
	],
)

// Type exports
export type ExternalThreadLink = typeof externalThreadLinksTable.$inferSelect
export type NewExternalThreadLink = typeof externalThreadLinksTable.$inferInsert

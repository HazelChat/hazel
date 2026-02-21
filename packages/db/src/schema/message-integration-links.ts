import type { IntegrationConnectionId, MessageId, MessageIntegrationLinkId } from "@hazel/schema"
import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const linkTypeEnum = pgEnum("integration_link_type", ["created", "mentioned", "resolved", "linked"])

export const messageIntegrationLinksTable = pgTable(
	"message_integration_links",
	{
		id: uuid().primaryKey().defaultRandom().$type<MessageIntegrationLinkId>(),
		messageId: uuid().notNull().$type<MessageId>(),
		connectionId: uuid().notNull().$type<IntegrationConnectionId>(),
		provider: varchar({ length: 50 })
			.notNull()
			.$type<"linear" | "github" | "figma" | "notion" | "discord" | "slack" | "craft">(),

		// External item info
		externalId: varchar({ length: 255 }).notNull(),
		externalUrl: text().notNull(),
		externalTitle: varchar({ length: 500 }),

		// Link type (how was this link created)
		linkType: linkTypeEnum().notNull().default("linked"),

		// Provider-specific metadata (e.g., issue status, priority, etc.)
		metadata: jsonb().$type<Record<string, unknown>>(),

		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("msg_int_link_message_idx").on(table.messageId),
		index("msg_int_link_connection_idx").on(table.connectionId),
		index("msg_int_link_external_idx").on(table.provider, table.externalId),
	],
)

// Type exports
export type MessageIntegrationLink = typeof messageIntegrationLinksTable.$inferSelect
export type NewMessageIntegrationLink = typeof messageIntegrationLinksTable.$inferInsert

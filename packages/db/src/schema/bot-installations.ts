/**
 * Bot Installations Schema
 *
 * Tracks which built-in bots (from @hazel/bots) are installed in each organization.
 * This is separate from the `bots` table which stores custom/third-party bot definitions.
 */

import type { OrganizationId, UserId } from "@hazel/schema"
import { index, jsonb, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core"

export const botInstallationsTable = pgTable(
	"bot_installations",
	{
		id: uuid().primaryKey().defaultRandom(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		botId: varchar({ length: 100 }).notNull(), // e.g., "reminder-bot"
		installedBy: uuid().$type<UserId>(),
		installedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		config: jsonb().$type<Record<string, unknown>>().default({}),
	},
	(table) => [
		index("bot_installations_org_idx").on(table.organizationId),
		unique("bot_installations_org_bot_unique").on(table.organizationId, table.botId),
	],
)

// Type exports
export type BotInstallation = typeof botInstallationsTable.$inferSelect
export type NewBotInstallation = typeof botInstallationsTable.$inferInsert

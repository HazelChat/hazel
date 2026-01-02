import type { BotId, BotInstallationId, OrganizationId, UserId } from "@hazel/schema"
import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

/**
 * Bot installations table - tracks which bots are installed in which organizations
 */
export const botInstallationsTable = pgTable(
	"bot_installations",
	{
		id: uuid().primaryKey().defaultRandom().$type<BotInstallationId>(),
		botId: uuid().notNull().$type<BotId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		installedBy: uuid().notNull().$type<UserId>(),
		installedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("bot_installations_org_idx").on(table.organizationId),
		index("bot_installations_bot_idx").on(table.botId),
		uniqueIndex("bot_installations_bot_org_unique").on(table.botId, table.organizationId),
	],
)

// Type exports
export type BotInstallation = typeof botInstallationsTable.$inferSelect
export type NewBotInstallation = typeof botInstallationsTable.$inferInsert

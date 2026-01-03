import type { BotCommandId, BotId } from "@hazel/schema"
import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

/**
 * Argument definition for a bot command
 */
export interface BotCommandArgument {
	name: string
	description?: string
	required: boolean
	placeholder?: string
	type: "string" | "number" | "user" | "channel"
}

/**
 * Bot commands table - stores slash commands registered by bots
 */
export const botCommandsTable = pgTable(
	"bot_commands",
	{
		id: uuid().primaryKey().defaultRandom().$type<BotCommandId>(),
		botId: uuid().notNull().$type<BotId>(),
		name: varchar({ length: 50 }).notNull(),
		description: text().notNull(),
		arguments: jsonb().$type<BotCommandArgument[]>().default([]),
		usageExample: text(),
		isEnabled: boolean().notNull().default(true),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("bot_commands_bot_id_idx").on(table.botId),
		uniqueIndex("bot_commands_bot_id_name_idx").on(table.botId, table.name),
	],
)

// Type exports
export type BotCommand = typeof botCommandsTable.$inferSelect
export type NewBotCommand = typeof botCommandsTable.$inferInsert

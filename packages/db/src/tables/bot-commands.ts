import { BotCommandId, BotId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, now, timestamptz, uuid, varchar } from "./columns"

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
export const botCommandsTable = PG.table("bot_commands", {
	columns: {
		id: PG.column(uuid(BotCommandId), { defaultExpr: "gen_random_uuid()" }),
		botId: uuid(BotId),
		name: varchar(50),
		description: PG.text,
		arguments: PG.column(PG.nullable(jsonb<BotCommandArgument[]>()), { default: [] }),
		usageExample: PG.nullable(PG.text),
		isEnabled: PG.column(PG.bool, { default: true }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("bot_commands_bot_id_idx", ["botId"]),
		PG.uniqueIndex("bot_commands_bot_id_name_idx", ["botId", "name"]),
	],
})
export type BotCommand = PG.SelectRowOf<typeof botCommandsTable>
export type NewBotCommand = PG.InsertRowOf<typeof botCommandsTable>

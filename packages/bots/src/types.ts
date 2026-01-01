/**
 * Bot SDK type definitions
 * These types are shared between frontend and backend
 */

export interface BotCommandArgument {
	name: string
	type: "string" | "number" | "user" | "channel"
	required: boolean
	placeholder?: string
	description?: string
}

export interface BotCommand {
	name: string
	description: string
	arguments: BotCommandArgument[]
	usageExample?: string
}

export interface BotDefinition {
	id: string
	name: string
	displayName: string
	description: string
	avatar?: string
	commands: BotCommand[]
}

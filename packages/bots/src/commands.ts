/**
 * Bot command definitions
 * These are the static definitions of all available bots and their commands
 */

import type { BotDefinition } from "./types.ts"

export const REMINDER_BOT: BotDefinition = {
	id: "reminder-bot",
	name: "reminder",
	displayName: "Reminder Bot",
	description: "Set reminders that notify you later",
	avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=reminder-bot",
	commands: [
		{
			name: "remind",
			description: "Set a reminder",
			arguments: [
				{
					name: "time",
					type: "string",
					required: true,
					placeholder: "e.g., 5m, 1h, 2d",
					description: "When to remind you (s=seconds, m=minutes, h=hours, d=days)",
				},
				{
					name: "message",
					type: "string",
					required: true,
					placeholder: "What to remind you about",
					description: "The reminder message",
				},
			],
			usageExample: '/remind "5m" "Check the build"',
		},
		{
			name: "reminders",
			description: "List your active reminders",
			arguments: [],
		},
	],
}

export const ALL_BOTS = [REMINDER_BOT] as const

export type BotId = (typeof ALL_BOTS)[number]["id"]

export function getBotById(botId: string): BotDefinition | undefined {
	return ALL_BOTS.find((bot) => bot.id === botId)
}

export function getBotCommand(botId: string, commandName: string) {
	const bot = getBotById(botId)
	if (!bot) return undefined
	return bot.commands.find((cmd) => cmd.name === commandName)
}

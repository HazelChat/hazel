import { useMemo } from "react"
import type { BotCommandData } from "../types"

/**
 * Mock bot commands for UI development
 * TODO: Replace with actual query to bot_commands table
 */
const MOCK_BOT_COMMANDS: BotCommandData[] = [
	{
		id: "summarize",
		name: "summarize",
		description: "Summarize recent messages in this channel",
		bot: {
			id: "bot-summary",
			name: "SummaryBot",
			avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=summary",
		},
		arguments: [{ name: "count", required: false, type: "number", placeholder: "10" }],
		usageExample: "/summarize 20",
	},
	{
		id: "issue",
		name: "issue",
		description: "Create a new Linear issue from this message",
		bot: {
			id: "bot-linear",
			name: "Linear",
			avatarUrl: "https://cdn.brandfetch.io/linear.app/w/64/h/64/theme/dark/icon",
		},
		arguments: [
			{ name: "title", required: true, type: "string" },
			{ name: "description", required: false, type: "string" },
		],
		usageExample: '/issue "Fix login bug"',
	},
	{
		id: "translate",
		name: "translate",
		description: "Translate a message to another language",
		bot: {
			id: "bot-translate",
			name: "TranslateBot",
			avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=translate",
		},
		arguments: [{ name: "language", required: true, type: "string", placeholder: "es" }],
		usageExample: "/translate es",
	},
	{
		id: "remind",
		name: "remind",
		description: "Set a reminder for yourself or the channel",
		bot: {
			id: "bot-remind",
			name: "RemindBot",
			avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=remind",
		},
		arguments: [
			{ name: "time", required: true, type: "string", placeholder: "10m" },
			{ name: "message", required: false, type: "string" },
		],
		usageExample: '/remind 10m "Check the build"',
	},
	{
		id: "poll",
		name: "poll",
		description: "Create a quick poll for the channel",
		bot: {
			id: "bot-poll",
			name: "PollBot",
			avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=poll",
		},
		arguments: [
			{ name: "question", required: true, type: "string" },
			{ name: "options", required: false, type: "string", placeholder: "opt1,opt2,opt3" },
		],
		usageExample: '/poll "Lunch today?" "Pizza,Sushi,Tacos"',
	},
]

/**
 * Hook to get available bot commands for a channel
 * Currently returns mock data for UI development
 *
 * @param channelId - The channel ID to get commands for
 * @returns Array of bot commands available in this channel
 */
export function useBotCommands(_channelId: string): BotCommandData[] {
	// TODO: Replace with actual query like:
	// const { data: installedBots } = useLiveQuery((q) =>
	//   q.from({ bot: botCollection })
	//     .innerJoin({ channelBot: channelBotCollection }, ...)
	//     .where(({ channelBot }) => eq(channelBot.channelId, channelId))
	//     .select(...)
	// )

	return useMemo(() => {
		// Return mock data for now
		return MOCK_BOT_COMMANDS
	}, [])
}

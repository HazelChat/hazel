import { Command, CommandGroup } from "@hazel/bot-sdk"
import { Schema } from "effect"

export const AskCommand = Command.make("ask", {
	description: "Ask the AI agent (supports tool use and reasoning)",
	args: {
		message: Schema.String,
	},
	usageExample: '/ask message="Search for patterns in the codebase"',
})

export const commands = CommandGroup.make(AskCommand)

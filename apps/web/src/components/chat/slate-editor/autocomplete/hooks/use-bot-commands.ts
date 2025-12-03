import { Result, useAtomValue } from "@effect-atom/atom-react"
import { useMemo } from "react"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import type { BotCommandData } from "../types"

/**
 * Hook to get available bot commands for a channel
 * Fetches commands from connected integrations via the API
 *
 * @param _channelId - The channel ID (reserved for future per-channel filtering)
 * @returns Array of bot commands available for the organization's connected integrations
 */
export function useBotCommands(_channelId: string): BotCommandData[] {
	// Fetch available commands from the API
	// The backend will return empty array if user is not in an org context
	const commandsResult = useAtomValue(
		HazelApiClient.query("integration-commands", "getAvailableCommands", {}),
	)

	return useMemo(() => {
		// Handle loading/error states - return empty while loading
		if (Result.isInitial(commandsResult) || Result.isFailure(commandsResult)) {
			return []
		}

		// Get the response
		const response = Result.getOrElse(commandsResult, () => null)
		if (!response) {
			return []
		}

		// Map API response to BotCommandData format
		return response.commands.map(
			(cmd): BotCommandData => ({
				id: cmd.id,
				name: cmd.name,
				description: cmd.description,
				provider: cmd.provider,
				bot: {
					id: cmd.bot.id,
					name: cmd.bot.name,
					avatarUrl: cmd.bot.avatarUrl ?? undefined,
				},
				arguments: cmd.arguments.map((arg) => ({
					name: arg.name,
					description: arg.description ?? undefined,
					required: arg.required,
					placeholder: arg.placeholder ?? undefined,
					type: arg.type,
				})),
				usageExample: cmd.usageExample ?? undefined,
			}),
		)
	}, [commandsResult])
}

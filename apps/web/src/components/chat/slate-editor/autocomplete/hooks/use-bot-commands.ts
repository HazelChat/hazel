import { Result, useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/domain"
import { useMemo } from "react"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import type { BotCommandData } from "../types"

/**
 * Hook to get available bot commands for a channel
 * Fetches commands from both integration commands and bot SDK commands
 *
 * @param orgId - The organization ID to fetch commands for
 * @param _channelId - The channel ID (reserved for future per-channel filtering)
 * @returns Array of bot commands available for the organization
 */
export function useBotCommands(orgId: OrganizationId, _channelId: string): BotCommandData[] {
	// Fetch available commands from integration commands API
	const integrationCommandsResult = useAtomValue(
		HazelApiClient.query("integration-commands", "getAvailableCommands", {
			path: { orgId },
		}),
	)

	// Fetch available commands from bot SDK API
	const botCommandsResult = useAtomValue(
		HazelApiClient.query("bots", "getAvailableCommands", {
			path: { orgId },
		}),
	)

	return useMemo(() => {
		const commands: BotCommandData[] = []

		// Map integration commands
		if (Result.isSuccess(integrationCommandsResult)) {
			const response = Result.getOrElse(integrationCommandsResult, () => null)
			if (response) {
				for (const cmd of response.commands) {
					commands.push({
						id: cmd.id,
						name: cmd.name,
						description: cmd.description,
						provider: cmd.provider,
						source: "integration",
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
					})
				}
			}
		}

		// Map bot SDK commands
		if (Result.isSuccess(botCommandsResult)) {
			const response = Result.getOrElse(botCommandsResult, () => null)
			if (response) {
				for (const cmd of response.commands) {
					commands.push({
						id: cmd.id,
						name: cmd.name,
						description: cmd.description,
						botId: cmd.botId,
						source: "bot-sdk",
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
					})
				}
			}
		}

		return commands
	}, [integrationCommandsResult, botCommandsResult])
}

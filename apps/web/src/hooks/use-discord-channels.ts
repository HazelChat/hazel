import { useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { useCallback, useEffect, useRef, useState } from "react"
import { listDiscordChannelsMutation } from "~/atoms/discord-atoms"
import { exitToast } from "~/lib/toast-exit"

export interface DiscordChannel {
	id: string
	name: string
	type: number
	parentId: string | null
}

interface UseDiscordChannelsResult {
	channels: DiscordChannel[]
	isLoading: boolean
	error: string | null
	refetch: () => Promise<void>
}

/**
 * Hook to fetch Discord channels for a guild via the backend RPC.
 *
 * @param organizationId - The organization ID (for auth)
 * @param guildId - The Discord guild (server) ID to fetch channels from
 */
export function useDiscordChannels(
	organizationId: OrganizationId | null,
	guildId: string | null,
): UseDiscordChannelsResult {
	const [channels, setChannels] = useState<DiscordChannel[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const listChannels = useAtomSet(listDiscordChannelsMutation, { mode: "promiseExit" })
	const listChannelsRef = useRef(listChannels)
	listChannelsRef.current = listChannels

	const fetchChannels = useCallback(async () => {
		if (!organizationId || !guildId) {
			setChannels([])
			return
		}

		setIsLoading(true)
		setError(null)

		const exit = await listChannelsRef.current({
			payload: { organizationId, guildId },
		})

		exitToast(exit)
			.onSuccess((result) => {
				setChannels(result.channels as DiscordChannel[])
			})
			.onErrorTag("DiscordNotConnectedError", () => {
				setError("Discord is not connected")
				setChannels([])
				return { title: "Discord not connected", isRetryable: false }
			})
			.onErrorTag("DiscordApiError", (err) => {
				setError(err.message)
				setChannels([])
				return { title: "Discord API error", description: err.message, isRetryable: true }
			})
			.run()

		setIsLoading(false)
	}, [organizationId, guildId])

	useEffect(() => {
		fetchChannels()
	}, [fetchChannels])

	return {
		channels,
		isLoading,
		error,
		refetch: fetchChannels,
	}
}

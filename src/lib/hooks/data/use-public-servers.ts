import { useQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { useZero } from "~/lib/zero/zero-context"

export const usePublicServers = (serverId: Accessor<string>) => {
	const z = useZero()

	const serverChannelQuery = createMemo(() =>
		z.query.serverChannels
			.related("users")
			.where((eq) => eq.and(eq.cmp("channelType", "!=", "direct"), eq.cmp("serverId", "=", serverId()))),
	)

	const [serverChannels, status] = useQuery(serverChannelQuery)

	const computedChannels = createMemo(() => {
		return serverChannels().filter((channel) => {
			const alreadyInChannel = serverChannels().find((c) => c.id === channel.id)
			if (alreadyInChannel) return false

			return true
		})
	})

	const isLoading = createMemo(() => status().type !== "complete")

	return { channels: computedChannels, isLoading }
}

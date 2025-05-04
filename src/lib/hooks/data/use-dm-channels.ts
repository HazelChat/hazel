import { useQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { useZero } from "~/lib/zero/zero-context"

export const useDmChannels = (serverId: Accessor<string>) => {
	const z = useZero()

	const dmChannelQuery = createMemo(() =>
		z.query.serverChannels
			.related("users")
			.limit(10)
			.where((eq) => eq.and(eq.cmp("channelType", "=", "direct"), eq.cmp("serverId", "=", serverId()))),
	)

	const [recentDmChannels, status] = useQuery(dmChannelQuery)

	const isLoading = createMemo(() => status().type !== "complete")

	return { channels: recentDmChannels, isLoading }
}

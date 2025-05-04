import { useQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { useZero } from "~/lib/zero/zero-context"

export const useServerChannels = (serverId: Accessor<string>) => {
	const z = useZero()

	const serverChannelQuery = createMemo(() =>
		z.query.serverChannels
			.related("users")
			.where((eq) => eq.and(eq.cmp("channelType", "!=", "direct"), eq.cmp("serverId", "=", serverId())))
			.whereExists("users", (eq) => eq.where("id", "=", z.userID)),
	)

	const [serverChannels, status] = useQuery(serverChannelQuery)

	const isLoading = createMemo(() => status().type !== "complete")

	return { channels: serverChannels, isLoading }
}

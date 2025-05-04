import { useQuery } from "@rocicorp/zero/solid"
import { createMemo } from "solid-js"
import { useZero } from "~/lib/zero/zero-context"

export const useChatMentions = (channelId: string) => {
	const z = useZero()

	const mentionQuery = createMemo(() => {
		return z.query.serverChannels.where("id", "=", channelId).related("users").one()
	})

	const [channel, status] = useQuery(mentionQuery)

	const users = createMemo(() => channel()?.users || [])
	const isLoading = createMemo(() => status().type !== "complete")

	return { users, isLoading }
}

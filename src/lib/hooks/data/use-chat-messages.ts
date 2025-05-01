import { useQuery } from "@rocicorp/zero/solid"
import { createMemo } from "solid-js"
import { useZero } from "~/lib/zero-context"

export const useChatMessages = (channelId: string) => {
	const z = useZero()

	const messageQuery = z.query.messages
		.limit(100)
		.related("author")
		.related("replyToMessage", (q) => q.related("author"))
		.related("childMessages")
		.related("reactions")
		.where(({ cmp }) => cmp("channelId", "=", channelId))
		.orderBy("createdAt", "desc")

	const [messages, messagesResult] = useQuery(() => messageQuery)

	const isLoading = createMemo(() => messagesResult().type !== "complete")

	return { messages, isLoading }
}

export type Message = ReturnType<Awaited<ReturnType<typeof useChatMessages>>['messages']>[number]

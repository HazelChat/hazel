import { useQuery } from "@rocicorp/zero/solid"
import { createMemo } from "solid-js"
import { useZero } from "~/lib/zero/zero-context"

export const useChatMessage = (id: string) => {
	const z = useZero()

	const messageQuery = z.query.messages
		.limit(100)
		.related("author")
		.where(({ cmp }) => cmp("id", "=", id))
		.orderBy("createdAt", "desc")
		.one()

	const [messages, messagesResult] = useQuery(() => messageQuery)

	const isLoading = createMemo(() => messagesResult().type !== "complete")

	return { messages, isLoading }
}

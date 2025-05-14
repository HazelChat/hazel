import { createQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { useZero } from "~/lib/zero/zero-context"
import { useChatMessages } from "./use-chat-messages"

export const useChat = (channelId: Accessor<string>) => {
	const z = useZero()

	const { messages, isLoading: isLoadingMessages } = useChatMessages(channelId)

	const [channelMember, channelMemberResult] = createQuery(() =>
		z.query.channelMembers.where(({ cmp }) => cmp("channelId", "=", channelId())).one(),
	)

	const isLoading = createMemo(() => isLoadingMessages() && channelMemberResult().type !== "complete")

	return {
		isLoading,
		channelMember,
		messages,
	}
}

import { createQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { CACHE_AWHILE } from "~/lib/zero/query-cache-policy"
import { useZero } from "~/lib/zero/zero-context"

export const usePinnedMessages = (channelId: Accessor<string>) => {
	const z = useZero()

	const pinnedMessagesQuery = createMemo(() =>
		z.query.pinnedMessages
			.where((eq) => eq.cmp("channelId", "=", channelId()))
			.related("message", (eq) => eq.related("author")),
	)

	const [pinnedMessages, status] = createQuery(pinnedMessagesQuery, CACHE_AWHILE)

	const isLoading = createMemo(() => status().type !== "complete")

	return { pinnedMessages, isLoading }
}

import type { ChannelId, Message, MessageId } from "@maki-chat/api-schema/schema/message.js"
import type { Accessor } from "solid-js"
import { QueryData, useEffectInfiniteQuery, useEffectQuery } from "~/lib/tanstack"
import { ApiClient } from "../common/api-client"

export namespace MessageQueries {
	type InfiniteVars = {
		channelId: ChannelId
		limit?: number
	}
	const messagesKey = QueryData.makeQueryKey<"message", InfiniteVars>("message")
	// const messagesHelpers = QueryData.makeHelpers<Array<Message>>(messagesKey)

	export const createPaginatedMessagesQuery = ({
		channelId,
		limit = 20,
	}: { channelId: Accessor<ChannelId>; limit?: number }) => {
		return useEffectInfiniteQuery({
			queryKey: messagesKey({
				channelId: channelId(),
				limit,
			}),

			queryFn: ({ pageParam }) =>
				ApiClient.use(({ client }) =>
					client.message.getMessages({
						path: {
							channelId: channelId(),
						},
						urlParams: {
							limit: limit,
							cursor: pageParam as MessageId | undefined,
						},
					}),
				),

			getNextPageParam: (lastPage) => (lastPage.pagination.hasNext ? lastPage.pagination.nextCursor : undefined),
			getPreviousPageParam: (firstPage) =>
				firstPage.pagination.hasPrevious ? firstPage.pagination.previousCursor : undefined,
			initialPageParam: undefined as string | undefined,
		})
	}
}

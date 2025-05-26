import type { ChannelId } from "@maki-chat/api-schema/schema/message.js"
import { createFileRoute } from "@tanstack/solid-router"

import { For, Show, createEffect, createSignal, onCleanup } from "solid-js"
import { Button } from "~/components/ui/button"
import { MessageQueries } from "~/lib/services/data-access/message-queries"

export const Route = createFileRoute("/_app/$serverId/chat/test")({
	component: InfiniteScrollMessages,
})

function InfiniteScrollMessages() {
	const [channelId, setChannelId] = createSignal<ChannelId>("cha_IWzcz6x7V-" as ChannelId)
	const [loadMoreRef, setLoadMoreRef] = createSignal<HTMLDivElement>()

	// const messagesQuery = createInfiniteMessages(20)

	const messagesQuery = MessageQueries.createPaginatedMessagesQuery({
		channelId,
		limit: 20,
	})

	createEffect(() => {
		const hasNextPage = messagesQuery.hasNextPage
		const isFetchingNextPage = messagesQuery.isFetchingNextPage
		const loadMoreElement = loadMoreRef()

		if (!hasNextPage || isFetchingNextPage || !loadMoreElement) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					messagesQuery.fetchNextPage()
				}
			},
			{ threshold: 1 },
		)

		observer.observe(loadMoreElement)

		onCleanup(() => {
			observer.unobserve(loadMoreElement)
		})
	})

	const allMessages = () => messagesQuery.data?.pages.flatMap((page) => page.data) ?? []

	return (
		<div class="messages-container">
			<Button onClick={() => setChannelId("cha_IWzcz6x7VB" as ChannelId)}>Set Wrong Channel</Button>
			<Button onClick={() => setChannelId("cha_IWzcz6x7V-" as ChannelId)}>Set Riight Channel</Button>
			<Show when={messagesQuery.isLoading}>
				<div class="loading">Loading messages...</div>
			</Show>

			<Show when={messagesQuery.isError}>
				<div class="error">Error loading messages: {messagesQuery.error?.message}</div>
			</Show>

			<Show when={!messagesQuery.isLoading && !messagesQuery.isError}>
				<div class="messages-list">
					<For each={allMessages()}>
						{(message) => (
							<div class="message-item">
								<div class="message-content">{message.content}</div>
								<div class="message-meta">
									<span class="message-timestamp">
										{/* <Format.RelativeTime value={DateTime.toDate(message.createdAt)} /> */}
									</span>
									<span class="message-user">User: {message.authorId}</span>
								</div>
							</div>
						)}
					</For>
				</div>

				<Show when={messagesQuery.hasNextPage}>
					<div ref={setLoadMoreRef} class="load-trigger">
						<Show when={messagesQuery.isFetchingNextPage} fallback="Scroll for more">
							Loading more...
						</Show>
					</div>
				</Show>
			</Show>
		</div>
	)
}

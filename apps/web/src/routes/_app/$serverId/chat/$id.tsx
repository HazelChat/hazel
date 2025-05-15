import { createFileRoute, useParams } from "@tanstack/solid-router"
import { type Accessor, Index, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import { ChatMessage } from "~/components/chat-ui/chat-message"
import { ChatTopbar } from "~/components/chat-ui/chat-topbar"
import { FloatingBar } from "~/components/chat-ui/floating-bar"
import { useChat } from "~/lib/hooks/data/use-chat"
import type { Message } from "~/lib/hooks/data/use-chat-messages"
import { createChangeEffect } from "~/lib/utils/signals"

import { createIntersectionObserver } from "@solid-primitives/intersection-observer"
import { useZero } from "~/lib/zero/zero-context"

export const Route = createFileRoute("/_app/$serverId/chat/$id")({
	component: RouteComponent,
})

export const chatStore$ = createSignal({
	replyToMessageId: null as string | null,
})

function RouteComponent() {
	const z = useZero()
	const navigate = Route.useNavigate()
	const params = useParams({ from: "/_app/$serverId/chat/$id" })
	let messagesRef: HTMLDivElement | undefined

	const channelId = createMemo(() => params().id)

	const { messages, channelMember, channel, isChannelLoading } = useChat(channelId)

	const [targets, setTargets] = createSignal<Element[]>([])

	createIntersectionObserver(
		targets,
		async (entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const lastMessageId = channelMember()?.lastSeenMessageId
					if (!lastMessageId) {
						return
					}

					const dataId = entry.target.getAttribute("data-id")

					if (lastMessageId === dataId) {
						await z.mutate.channelMembers.update({
							channelId: channelId(),
							userId: z.userID,
							lastSeenMessageId: null,
							notificationCount: 0,
						})
					}
				}
			}
		},
		{ threshold: 0.4 },
	)

	createEffect(() => {
		if (!channel() && !isChannelLoading()) {
			navigate({
				to: "/$serverId",
				params: { serverId: params().serverId },
			})
		}
	})

	const lastMessageId = createMemo(() => {
		return messages().at(0)?.id
	})

	// Smooth-scroll to the bottom of the messages when the last message id changes
	// TODO: Should be only when the last message is from the current user (?)
	createChangeEffect(lastMessageId, (currentId) => {
		if (currentId && messagesRef) {
			// Check if we are 500px from the bottom and only scroll if we are
			if (messagesRef.scrollTop + messagesRef.clientHeight >= messagesRef.scrollHeight - 500) {
				messagesRef.scrollTo({ top: messagesRef.scrollHeight, behavior: "smooth" })
			}
		}
	})

	// Scroll to the bottom of the messages when the chat is switched
	createEffect(() => {
		if (params().id && messagesRef) {
			messagesRef.scrollTo({ top: messagesRef.scrollHeight, behavior: "instant" })
		}
	})

	const processedMessages = createMemo(() => {
		const groupedMessages = messages().reduce<Record<string, Message[]>>((groups, message) => {
			const date = new Date(message.createdAt!).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})

			if (!groups[date]) {
				groups[date] = [] as any
			}
			groups[date].push(message)
			return groups
		}, {})

		const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
			return new Date(a).getTime() - new Date(b).getTime()
		})

		const timeThreshold = 5 * 60 * 1000 // 5 minutes

		const processedGroupedMessages: Record<
			string,
			Accessor<Array<{ message: Message; isGroupStart: boolean; isGroupEnd: boolean }>>
		> = {}

		for (const date of sortedDates) {
			const messagesForDate = groupedMessages[date].reverse() // Still reversed
			const processedMessages: Array<{ message: Message; isGroupStart: boolean; isGroupEnd: boolean }> = []

			for (let i = 0; i < messagesForDate.length; i++) {
				const currentMessage = messagesForDate[i]
				const prevMessage = i > 0 ? messagesForDate[i - 1] : null
				const nextMessage = i < messagesForDate.length - 1 ? messagesForDate[i + 1] : null

				// Determine if this message starts a new group
				let isGroupStart = true
				if (prevMessage) {
					const currentTime = new Date(currentMessage.createdAt!).getTime()
					const prevTime = new Date(prevMessage.createdAt!).getTime()
					const timeDiff = currentTime - prevTime
					if (currentMessage.authorId === prevMessage.authorId && timeDiff < timeThreshold) {
						isGroupStart = false
					}
				}

				// Determine if this message ends a group
				let isGroupEnd = true
				if (nextMessage) {
					const currentTime = new Date(currentMessage.createdAt!).getTime()
					const nextTime = new Date(nextMessage.createdAt!).getTime()
					const timeDiff = nextTime - currentTime
					if (currentMessage.authorId === nextMessage.authorId && timeDiff < timeThreshold) {
						isGroupEnd = false
					}
				}

				processedMessages.push({ message: currentMessage, isGroupStart, isGroupEnd })
			}
			processedGroupedMessages[date] = createMemo(() => processedMessages)
		}

		return { processedGroupedMessages: Object.entries(processedGroupedMessages) }
	})

	return (
		<div class="flex h-screen flex-col">
			<ChatTopbar />
			<div class="flex-1 space-y-6 overflow-y-auto p-4 pl-0" ref={messagesRef}>
				<Show
					when={processedMessages().processedGroupedMessages.length > 0}
					fallback={
						<div class="flex h-full flex-col items-center justify-center">
							<p class="text-center text-muted-foreground">
								No messages yet, be the first to break the ice!
							</p>
						</div>
					}
				>
					<Index each={processedMessages().processedGroupedMessages}>
						{(group) => (
							<div class="flex flex-col">
								<div class="py-2 text-center text-muted-foreground text-sm">
									<span>{group()[0]}</span>
								</div>

								<Index each={group()[1]()}>
									{(message, i) => {
										return (
											<ChatMessage
												ref={(el) => {
													if (el) {
														setTargets((prev) => {
															if (!prev.includes(el)) return [...prev, el]
															return prev
														})
													}
												}}
												message={message().message}
												isGroupStart={message().isGroupStart}
												isGroupEnd={message().isGroupEnd}
												isFirstNewMessage={
													message().message.id === channelMember()?.lastSeenMessageId
												}
												serverId={() => params().serverId}
											/>
										)
									}}
								</Index>
							</div>
						)}
					</Index>
				</Show>
			</div>
			<div class="mx-2 mb-6">
				<FloatingBar channelId={params().id} />
			</div>
		</div>
	)
}

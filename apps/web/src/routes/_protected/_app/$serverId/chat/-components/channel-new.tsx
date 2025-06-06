import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import {
	type Accessor,
	ErrorBoundary,
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
	mapArray,
	on,
	onMount,
} from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { VList, type VListHandle } from "virtua/solid"
import { ChatTypingPresence } from "~/components/chat-ui/chat-typing-presence"
import { FloatingBar } from "~/components/chat-ui/floating-bar"
import { ChatMessage } from "~/components/chat-ui/message/chat-message"
import { createCachedPaginatedQuery, createQuery, resetPaginationId } from "~/lib/convex"
import { convexQuery } from "~/lib/convex-query"
import { useConvexInfiniteQuery } from "~/lib/convex-query/infinite"
import type { Message } from "~/lib/types"

const PAGE_SIZE = 30

// Skeleton component for loading messages
const MessageSkeleton = (props: { isGroupStart: boolean }) => (
	<div class="flex gap-3 px-4 py-2">
		<Show when={props.isGroupStart}>
			<div class="h-10 w-10 animate-pulse rounded-full bg-muted" />
		</Show>
		<Show when={!props.isGroupStart}>
			<div class="w-10" />
		</Show>
		<div class="flex-1 space-y-2">
			<Show when={props.isGroupStart}>
				<div class="h-4 w-24 animate-pulse rounded bg-muted" />
			</Show>
			<div class="space-y-1">
				<div class="h-4 w-3/4 animate-pulse rounded bg-muted/80" />
				<div class="h-4 w-1/2 animate-pulse rounded bg-muted/80" />
			</div>
		</div>
	</div>
)

type ListItem = ListItemMessage | ListItemSkeleton

type ListItemMessage = {
	type: "message"
	data: { message: Message; isGroupStart: boolean; isGroupEnd: boolean }
}

type ListItemSkeleton = { type: "skeleton"; id: string; isGroupStart: boolean }

export function ChannelNew(props: {
	channelId: Accessor<Id<"channels">>
	serverId: Accessor<Id<"servers">>
	isThread: boolean
}) {
	const channelQuery = useQuery(() =>
		convexQuery(api.channels.getChannel, {
			channelId: props.channelId(),
			serverId: props.serverId(),
		}),
	)

	const messagesQuery = useConvexInfiniteQuery(
		api.messages.getMessages,
		{ channelId: props.channelId(), serverId: props.serverId() },
		{ numItems: PAGE_SIZE },
	)

	const messages = createMemo(() => {
		return messagesQuery.data?.pages.flatMap((page) => page.page).reverse() ?? []
	})

	const processedMessages = createMemo(
		mapArray(
			messages,
			(message, index) => {
				const timeThreshold = 5 * 60 * 1000

				const prevMessage = () => messages()[index() - 1]
				const nextMessage = () => messages()[index() + 1]

				const isGroupStart = () => {
					const prev = prevMessage()
					if (!prev) {
						return true
					}

					const timeDiff = message._creationTime - prev._creationTime
					return !(
						message.authorId === prev.authorId &&
						timeDiff < timeThreshold &&
						!prev.replyToMessageId
					)
				}

				const isGroupEnd = () => {
					const next = nextMessage()
					if (!next) {
						return true
					}

					const timeDiff = next._creationTime - message._creationTime
					return !(message.authorId === next.authorId && timeDiff < timeThreshold)
				}

				return {
					message,
					isGroupStart: isGroupStart(),
					isGroupEnd: isGroupEnd(),
				}
			},
			{ fallback: () => [] },
		),
	)

	const [shouldStickToBottom, setShouldStickToBottom] = createSignal(true)
	const [vlistRef, setVlistRef] = createSignal<VListHandle | undefined>(undefined)

	createEffect(
		on(processedMessages, (items) => {
			if (shouldStickToBottom() && vlistRef() && items.length > 0) {
				// Defer scrolling to a microtask to allow virtua to process the new items
				queueMicrotask(() => {
					vlistRef()?.scrollToIndex(items.length - 1, { align: "end" })
				})
			}
		}),
	)

	return (
		<ErrorBoundary
			fallback={(err, reset) => {
				if (err.message?.includes("ResizeObserver")) {
					// Micro-task retry - let DOM settle
					Promise.resolve().then(() => {
						reset()
					})
					return null
				}
				throw err
			}}
		>
			<div class="flex flex-1 flex-col">
				<VList
					class="flex-1"
					overscan={15}
					shift
					data={processedMessages()}
					ref={setVlistRef}
					onScroll={async (offset) => {
						if (!vlistRef()) {
							return
						}

						setShouldStickToBottom(
							offset >= vlistRef()!.scrollSize - vlistRef()!.viewportSize - 120,
						)

						if (offset < 900) {
							// Only try to load if not exhausted
							if (messagesQuery.hasNextPage && !messagesQuery.isFetching) {
								messagesQuery.fetchNextPage()
							}
						}
					}}
				>
					{(item) => (
						<ChatMessage
							message={() => item.message}
							isGroupStart={() => item.isGroupStart}
							isGroupEnd={() => item.isGroupEnd}
							isFirstNewMessage={() =>
								item.message._id === channelQuery.data?.currentUser?.lastSeenMessageId
							}
							serverId={props.serverId}
							isThread={props.isThread}
						/>
					)}
				</VList>

				<div class="mx-2 flex flex-col gap-1.5">
					<FloatingBar />
					<ChatTypingPresence />
				</div>
			</div>
		</ErrorBoundary>
	)
}

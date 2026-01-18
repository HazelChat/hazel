import { LegendList, type LegendListRef, type ViewToken } from "@legendapp/list"
import type { ChannelId } from "@hazel/schema"
import { useLiveInfiniteQuery } from "@tanstack/react-db"
import { memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useOverlayPosition } from "react-aria"
import { createPortal } from "react-dom"
import type { MessageWithPinned, ProcessedMessage } from "~/atoms/chat-query-atoms"
import { useVisibleMessageNotificationCleaner } from "~/hooks/use-visible-message-notification-cleaner"

import { Route } from "~/routes/_app/$orgSlug/chat/$id"
import { MessageItem } from "./message-item"
import { MessageToolbar } from "./message-toolbar"

type MessageRowHeader = { id: string; type: "header"; date: string }
type MessageRowItem = { id: string; type: "row" } & ProcessedMessage
type MessageRow = MessageRowHeader | MessageRowItem

interface MessageVirtualListProps {
	messageRows: MessageRow[]
	stickyIndices: number[]
	onHoverChange: (messageId: string | null, ref: HTMLDivElement | null) => void
	hasNextPage: boolean
	fetchNextPage: () => void
	onViewableItemsChanged?: (info: { viewableItems: ViewToken<MessageRow>[] }) => void
}

const MessageVirtualList = memo(
	({
		messageRows,
		stickyIndices,
		onHoverChange,
		hasNextPage,
		fetchNextPage,
		onViewableItemsChanged,
		ref,
	}: MessageVirtualListProps & { ref: React.Ref<LegendListRef> }) => {
		return (
			<LegendList<MessageRow>
				ref={ref}
				alignItemsAtEnd
				maintainScrollAtEnd
				maintainVisibleContentPosition
				suggestEstimatedItemSize
				data={messageRows}
				onStartReached={() => {
					if (hasNextPage) {
						fetchNextPage()
					}
				}}
				// recycleItems
				estimatedItemSize={80}
				keyExtractor={(it) => it.id}
				initialScrollIndex={messageRows.length - 1}
				stickyHeaderIndices={stickyIndices}
				viewabilityConfig={{
					itemVisiblePercentThreshold: 50,
					minimumViewTime: 300,
				}}
				onViewableItemsChanged={onViewableItemsChanged}
				renderItem={(props) =>
					props.item.type === "header" ? (
						<div className="sticky top-0 z-0 my-4 flex items-center justify-center">
							<span className="rounded-full bg-secondary px-3 py-1 font-mono text-muted-fg text-xs shadow-sm">
								{props.item.date}
							</span>
						</div>
					) : (
						<MessageItem
							message={props.item.message}
							isGroupStart={props.item.isGroupStart}
							isGroupEnd={props.item.isGroupEnd}
							isFirstNewMessage={props.item.isFirstNewMessage}
							isPinned={props.item.isPinned}
							isHighlighted={false}
							onHoverChange={onHoverChange}
						/>
					)
				}
				style={{ flex: 1, minHeight: 0 }}
			/>
		)
	},
)

MessageVirtualList.displayName = "MessageVirtualList"

export interface MessageListRef {
	scrollToBottom: () => void
	// TODO: Implement scroll-to-message - see GitHub issue
}

export function MessageList({ ref }: { ref?: React.Ref<MessageListRef> }) {
	const { messagesInfiniteQuery } = Route.useLoaderData()
	const { id } = Route.useParams()
	const channelId = id as ChannelId

	const legendListRef = useRef<LegendListRef>(null)
	const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
	const targetRef = useRef<HTMLDivElement | null>(null)
	const [isToolbarMenuOpen, setIsToolbarMenuOpen] = useState(false)
	const isToolbarHoveredRef = useRef(false)
	const overlayRef = useRef<HTMLDivElement>(null)
	const hideTimeoutRef = useRef<number | null>(null)

	// Hook for clearing notifications when messages become visible
	const { onVisibleMessagesChange } = useVisibleMessageNotificationCleaner({
		channelId,
	})

	// Handle viewable items changes from LegendList
	const handleViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken<MessageRow>[] }) => {
			// Extract message IDs from viewable items (exclude headers)
			const visibleMessageIds = viewableItems
				.filter((item) => item.item?.type === "row")
				.map((item) => item.item.id)

			onVisibleMessagesChange(visibleMessageIds)
		},
		[onVisibleMessagesChange],
	)

	useImperativeHandle(ref, () => ({
		scrollToBottom: () => {
			legendListRef.current?.scrollToEnd({ animated: true })
		},
	}))

	const { data, fetchNextPage, hasNextPage, isLoading, collection } = useLiveInfiniteQuery(
		messagesInfiniteQuery,
		{
			pageSize: 30,
			getNextPageParam: (lastPage) => (lastPage.length === 30 ? lastPage.length : undefined),
		},
	)

	const messages = (data || []) as MessageWithPinned[]

	const hoveredMessage = useMemo(
		() => messages.find((m) => m.id === hoveredMessageId) || null,
		[messages, hoveredMessageId],
	)

	const { overlayProps } = useOverlayPosition({
		targetRef,
		overlayRef,
		placement: "top end",
		offset: -6,
		shouldFlip: true,
		isOpen: hoveredMessageId !== null,
	})

	const handleHoverChange = useCallback(
		(messageId: string | null, ref: HTMLDivElement | null) => {
			if (messageId) {
				if (hideTimeoutRef.current) {
					clearTimeout(hideTimeoutRef.current)
					hideTimeoutRef.current = null
				}
				setHoveredMessageId(messageId)
				targetRef.current = ref
			} else if (!isToolbarMenuOpen && !isToolbarHoveredRef.current) {
				hideTimeoutRef.current = window.setTimeout(() => {
					setHoveredMessageId(null)
					targetRef.current = null
					hideTimeoutRef.current = null
				}, 200)
			}
		},
		[isToolbarMenuOpen],
	)

	const processedMessages = useMemo(() => {
		const timeThreshold = 5 * 60 * 1000
		const chronologicalMessages = [...messages].reverse()

		return chronologicalMessages.map((message, index): ProcessedMessage => {
			const prevMessage = index > 0 ? chronologicalMessages[index - 1] : null
			const isGroupStart =
				!prevMessage ||
				message.authorId !== prevMessage.authorId ||
				message.createdAt.getTime() - prevMessage.createdAt.getTime() > timeThreshold ||
				!!prevMessage.replyToMessageId

			const nextMessage =
				index < chronologicalMessages.length - 1 ? chronologicalMessages[index + 1] : null
			const isGroupEnd =
				!nextMessage ||
				message.authorId !== nextMessage.authorId ||
				nextMessage.createdAt.getTime() - message.createdAt.getTime() > timeThreshold

			const isFirstNewMessage = false
			const isPinned = !!message.pinnedMessage?.id

			return {
				message,
				isGroupStart,
				isGroupEnd,
				isFirstNewMessage,
				isPinned,
			}
		})
	}, [messages])

	const { messageRows, stickyIndices } = useMemo(() => {
		const rows: MessageRow[] = []
		const sticky: number[] = []
		let idx = 0
		let lastDate = ""

		for (const processedMessage of processedMessages) {
			const date = new Date(processedMessage.message.createdAt).toDateString()
			if (date !== lastDate) {
				rows.push({ id: `header-${date}`, type: "header", date })
				sticky.push(idx)
				idx++
				lastDate = date
			}
			rows.push({
				id: processedMessage.message.id,
				type: "row",
				...processedMessage,
			})
			idx++
		}
		return { messageRows: rows, stickyIndices: sticky }
	}, [processedMessages])

	const containerStyle = useMemo(
		() => ({
			overflowAnchor: "auto" as const,
			scrollBehavior: "auto" as const,
			opacity: isLoading && messages.length > 0 ? 0.7 : 1,
		}),
		[isLoading, messages.length],
	)

	// Show empty state if no messages (no skeleton loader needed since route loader preloads data)
	if (messages.length === 0) {
		return (
			<div className="flex size-full flex-col items-center justify-center p-4 sm:p-8">
				<div className="relative aspect-square w-full max-w-sm">
					<img
						src="/images/squirrle_ocean.png"
						alt="squirrel"
						className="mask-size-[110%_90%] mask-linear-to-r mask-from-black mask-to-transparent mask-center mask-no-repeat mask-[url(/images/image-mask.png)] h-full w-full rounded-md bg-center bg-cover bg-no-repeat object-cover opacity-50"
					/>
				</div>
				<p className="font-bold font-mono text-fg text-xl">Quiet as an ocean gazing squirrel...</p>
			</div>
		)
	}

	return (
		<div
			className="isolate flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-2 transition-opacity duration-200"
			style={containerStyle}
		>
			{hoveredMessageId && (
				<style>{`#message-${hoveredMessageId} { background-color: var(--color-secondary) !important; }`}</style>
			)}
			<MessageVirtualList
				ref={legendListRef}
				messageRows={messageRows}
				stickyIndices={stickyIndices}
				onHoverChange={handleHoverChange}
				hasNextPage={hasNextPage}
				fetchNextPage={fetchNextPage}
				onViewableItemsChanged={handleViewableItemsChanged}
			/>

			{(hoveredMessageId || isToolbarMenuOpen) &&
				hoveredMessage &&
				createPortal(
					<div
						ref={overlayRef}
						{...overlayProps}
						style={{ ...overlayProps.style, zIndex: 50 }}
						role="group"
						onMouseEnter={() => {
							if (hideTimeoutRef.current) {
								clearTimeout(hideTimeoutRef.current)
								hideTimeoutRef.current = null
							}
							isToolbarHoveredRef.current = true
						}}
						onMouseLeave={() => {
							isToolbarHoveredRef.current = false
						}}
					>
						{/* Invisible padding for larger hitbox */}
						<div className="-m-3 p-3">
							<MessageToolbar
								message={hoveredMessage}
								onMenuOpenChange={setIsToolbarMenuOpen}
							/>
						</div>
					</div>,
					document.body,
				)}
		</div>
	)
}

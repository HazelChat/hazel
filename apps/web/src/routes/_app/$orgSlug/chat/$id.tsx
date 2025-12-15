import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId } from "@hazel/schema"
import { createLiveQueryCollection, eq } from "@tanstack/db"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useCallback, useEffect, useRef } from "react"
import { clearChannelNotificationsMutation } from "~/atoms/channel-member-atoms"
import { ChatHeader } from "~/components/chat/chat-header"
import { ChatTabBar } from "~/components/chat/chat-tab-bar"
import type { MessageListRef } from "~/components/chat/message-list"
import { ThreadPanel } from "~/components/chat/thread-panel"
import { messageCollection, pinnedMessageCollection, userCollection } from "~/db/collections"
import { useChat } from "~/hooks/use-chat"
import { useOrganization } from "~/hooks/use-organization"
import { ChatProvider } from "~/providers/chat-provider"

export const Route = createFileRoute("/_app/$orgSlug/chat/$id")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const channelId = params.id as ChannelId

		// Create infinite query collection for messages
		// This replaces the simple messageCollection.preload() with pagination support
		const messagesInfiniteQuery = createLiveQueryCollection({
			query: (q) =>
				q
					.from({ message: messageCollection })
					.leftJoin({ pinned: pinnedMessageCollection }, ({ message, pinned }) =>
						eq(message.id, pinned.messageId),
					)
					.leftJoin({ author: userCollection }, ({ message, author }) =>
						eq(message.authorId, author.id),
					)
					.where(({ message }) => eq(message.channelId, channelId))
					.select(({ message, pinned, author }) => ({
						...message,
						pinnedMessage: pinned,
						author: author,
					}))
					.orderBy(({ message }) => message.createdAt, "desc")
					.limit(30)
					.offset(0),
		})

		// Preload the collection before navigation completes
		await messagesInfiniteQuery.preload()

		return {
			messagesInfiniteQuery,
		}
	},
})

function ChatLayout() {
	const { activeThreadChannelId, activeThreadMessageId, closeThread, organizationId, channelId } = useChat()
	const { orgSlug } = Route.useParams()

	return (
		<div className="flex h-[calc(100dvh-4rem)] overflow-hidden md:h-dvh">
			{/* Main Chat Area */}
			<div className="flex min-h-0 flex-1 flex-col">
				<ChatHeader />
				<ChatTabBar orgSlug={orgSlug} channelId={channelId} />
				<Outlet />
			</div>

			{/* Thread Panel - Slide in from right */}
			{activeThreadChannelId && activeThreadMessageId && (
				<div className="slide-in-from-right w-[480px] animate-in duration-200">
					<ThreadPanel
						organizationId={organizationId}
						threadChannelId={activeThreadChannelId}
						originalMessageId={activeThreadMessageId}
						onClose={closeThread}
					/>
				</div>
			)}
		</div>
	)
}

function RouteComponent() {
	const { id, orgSlug } = Route.useParams()
	const { organizationId } = useOrganization()
	const messageListRef = useRef<MessageListRef>(null)

	const handleMessageSent = useCallback(() => {
		messageListRef.current?.scrollToBottom()
	}, [])

	// Clear notifications when entering the channel
	// Note: Runs twice in dev due to StrictMode - this is expected and harmless
	const clearNotifications = useAtomSet(clearChannelNotificationsMutation, { mode: "promiseExit" })

	useEffect(() => {
		clearNotifications({ payload: { channelId: id as ChannelId } })
		// eslint-disable-next-line react-hooks/exhaustive-deps -- clearNotifications is stable
	}, [id, clearNotifications])

	return (
		<ChatProvider
			channelId={id as ChannelId}
			organizationId={organizationId!}
			onMessageSent={handleMessageSent}
		>
			<ChatLayout />
		</ChatProvider>
	)
}

import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import type { Channel, Message, PinnedMessage } from "@hazel/db/models"
import type { ChannelId, MessageId, OrganizationId } from "@hazel/db/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@workos-inc/authkit-react"
import type { FunctionReturnType } from "convex/server"
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { channelCollection, messageCollection, pinnedMessageCollection } from "~/db/collections"
import { useNotificationSound } from "~/hooks/use-notification-sound"

type TypingUser = FunctionReturnType<typeof api.typingIndicator.list>[0]
type TypingUsers = TypingUser[]

interface ChatContextValue {
	channelId: ChannelId
	organizationId: OrganizationId
	channel: typeof Channel.Model.Type | undefined
	messages: (typeof Message.Model.Type)[]
	pinnedMessages: (typeof PinnedMessage.Model.Type)[] | undefined
	loadNext: (() => void) | undefined
	loadPrev: (() => void) | undefined
	isLoadingMessages: boolean
	isLoadingNext: boolean
	isLoadingPrev: boolean
	sendMessage: (props: { content: string; attachments?: string[] }) => void
	editMessage: (messageId: MessageId, content: string) => Promise<void>
	deleteMessage: (messageId: MessageId) => void
	addReaction: (messageId: MessageId, emoji: string) => void
	removeReaction: (messageId: MessageId, emoji: string) => void
	pinMessage: (messageId: MessageId) => void
	unpinMessage: (messageId: MessageId) => void
	startTyping: () => void
	stopTyping: () => void
	typingUsers: TypingUsers
	createThread: (messageId: MessageId) => Promise<void>
	openThread: (threadChannelId: ChannelId, originalMessageId: MessageId) => void
	closeThread: () => void
	activeThreadChannelId: ChannelId | null
	activeThreadMessageId: MessageId | null
	replyToMessageId: MessageId | null
	setReplyToMessageId: (messageId: MessageId | null) => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function useChat() {
	const context = useContext(ChatContext)
	if (!context) {
		throw new Error("useChat must be used within a ChatProvider")
	}
	return context
}

interface ChatProviderProps {
	channelId: ChannelId
	organizationId: OrganizationId
	children: ReactNode
}

export function ChatProvider({ channelId, organizationId, children }: ChatProviderProps) {
	const { user } = useAuth()
	const { playSound } = useNotificationSound()

	// Reply state
	const [replyToMessageId, setReplyToMessageId] = useState<MessageId | null>(null)
	// Thread state
	const [activeThreadChannelId, setActiveThreadChannelId] = useState<ChannelId | null>(null)
	const [activeThreadMessageId, setActiveThreadMessageId] = useState<MessageId | null>(null)

	// Keep track of previous messages to show during loading
	const previousMessagesRef = useRef<(typeof Message.Model.Type)[]>([])
	// Keep track of the channel ID to clear messages when switching channels
	const previousChannelIdRef = useRef<ChannelId | null>(null)
	// Keep track of pagination functions to avoid losing them during loading
	const loadNextRef = useRef<(() => void) | undefined>(undefined)
	const loadPrevRef = useRef<(() => void) | undefined>(undefined)
	// Track message count to detect new messages
	const prevMessageCountRef = useRef<number>(0)

	// Clear previous messages when channel changes
	useEffect(() => {
		if (previousChannelIdRef.current && previousChannelIdRef.current !== channelId) {
			// Channel has changed, clear previous messages to prevent stale data
			previousMessagesRef.current = []
			loadNextRef.current = undefined
			loadPrevRef.current = undefined
			setReplyToMessageId(null)
		}
		previousChannelIdRef.current = channelId
	}, [channelId])

	// Get channel data from TanStack DB
	const { data: channelData } = useLiveQuery(
		(q) =>
			q
				.from({ channel: channelCollection })
				.where(({ channel }) => eq(channel.id, channelId))
				.orderBy(({ channel }) => channel.createdAt, "desc")
				.limit(1),
		[channelId],
	)

	const channel = channelData?.[0]

	// Fetch messages from TanStack DB (TODO: Add pagination)
	const { data: messagesData, isLoading: messagesLoading } = useLiveQuery(
		(q) =>
			q
				.from({ message: messageCollection })
				.where(({ message }) => eq(message.channelId, channelId))
				.orderBy(({ message }) => message.createdAt, "desc")
				.limit(50), // TODO: Implement proper pagination
		[channelId],
	)

	// Fetch pinned messages from TanStack DB
	const { data: pinnedMessages } = useLiveQuery(
		(q) =>
			q
				.from({ pinned: pinnedMessageCollection })
				.where(({ pinned }) => eq(pinned.channelId, channelId))
				.orderBy(({ pinned }) => pinned.pinnedAt, "desc"),
		[channelId],
	)

	// Fetch typing users
	// TODO: Implement
	// const typingUsersQuery = useQuery(convexQuery(api.typingIndicator.list, { channelId, organizationId }))
	const typingUsers: TypingUsers = []

	// Mutations
	const sendMessageMutation = useConvexMutation(api.messages.createMessage)
	const editMessageMutation = useConvexMutation(api.messages.updateMessage)
	const deleteMessageMutation = useConvexMutation(api.messages.deleteMessage)
	const addReactionMutation = useConvexMutation(api.messages.createReaction)
	const removeReactionMutation = useConvexMutation(api.messages.deleteReaction)
	const pinMessageMutation = useConvexMutation(api.pinnedMessages.createPinnedMessage)
	const unpinMessageMutation = useConvexMutation(api.pinnedMessages.deletePinnedMessage)
	const updateTypingMutation = useConvexMutation(api.typingIndicator.update)
	const stopTypingMutation = useConvexMutation(api.typingIndicator.stop)
	const createChannelMutation = useConvexMutation(api.channels.createChannel)

	// Message operations
	const sendMessage = ({
		content,
		attachments,
	}: {
		content: string
		attachments?: Id<"attachments">[]
	}) => {
		sendMessageMutation({
			channelId,
			organizationId,
			content,
			attachedFiles: attachments?.map((id) => id) || [], // TODO: Update mutation to use proper attachment IDs
			replyToMessageId: replyToMessageId || undefined, // TODO: Update mutation to use MessageId
		})
		// Clear reply state after sending
		setReplyToMessageId(null)
	}

	const editMessage = async (messageId: MessageId, content: string) => {
		await editMessageMutation({
			organizationId,
			id: messageId, // TODO: Update mutation to use MessageId
			content,
		})
	}

	const deleteMessage = (messageId: MessageId) => {
		deleteMessageMutation({
			organizationId,
			id: messageId, // TODO: Update mutation to use MessageId
		})
	}

	const addReaction = (messageId: MessageId, emoji: string) => {
		addReactionMutation({
			organizationId,
			messageId: messageId, // TODO: Update mutation to use MessageId
			emoji,
		})
	}

	const removeReaction = (messageId: MessageId, emoji: string) => {
		removeReactionMutation({
			organizationId,
			id: messageId, // TODO: Update mutation to use MessageId
			emoji,
		})
	}

	const pinMessage = (messageId: MessageId) => {
		pinMessageMutation({
			organizationId,
			messageId: messageId, // TODO: Update mutation to use MessageId
			channelId: channelId, // TODO: Update mutation to use ChannelId
		})
	}

	const unpinMessage = (messageId: MessageId) => {
		unpinMessageMutation({
			organizationId,
			messageId: messageId, // TODO: Update mutation to use MessageId
			channelId: channelId, // TODO: Update mutation to use ChannelId
		})
	}

	const startTyping = () => {
		updateTypingMutation({
			organizationId,
			channelId: channelId, // TODO: Update mutation to use ChannelId
		})
	}

	const stopTyping = () => {
		stopTypingMutation({
			organizationId,
			channelId: channelId, // TODO: Update mutation to use ChannelId
		})
	}

	const createThread = async (messageId: MessageId) => {
		// Find the message to create thread for
		const message = messages.find((m) => m.id === messageId)
		if (!message) {
			console.error("Message not found for thread creation")
			return
		}

		// Check if thread already exists
		if (message.threadChannelId) {
			// Open existing thread
			setActiveThreadChannelId(message.threadChannelId)
			setActiveThreadMessageId(messageId)
		} else {
			// Create new thread channel
			const threadChannelId = await createChannelMutation({
				organizationId,
				name: "Thread",
				type: "thread" as const,
				parentChannelId: channelId, // TODO: Update mutation to use ChannelId
				threadMessageId: messageId, // TODO: Update mutation to use MessageId
			})

			// Open the newly created thread
			setActiveThreadChannelId(threadChannelId)
			setActiveThreadMessageId(messageId)
		}
	}

	const openThread = (threadChannelId: ChannelId, originalMessageId: MessageId) => {
		setActiveThreadChannelId(threadChannelId)
		setActiveThreadMessageId(originalMessageId)
	}

	const closeThread = () => {
		setActiveThreadChannelId(null)
		setActiveThreadMessageId(null)
	}

	console.log("messagesData", messagesData)

	// Use messages directly from TanStack DB
	const currentMessages = messagesData || []

	// Update previous messages when we have new data
	if (currentMessages.length > 0) {
		previousMessagesRef.current = currentMessages
	}

	// Use previous messages during loading states to prevent flashing
	const messages = currentMessages.length > 0 ? currentMessages : previousMessagesRef.current

	// Play sound when new messages arrive from other users (only when window is not focused)
	useEffect(() => {
		// Skip on first render or when switching channels
		if (prevMessageCountRef.current === 0 || previousChannelIdRef.current !== channelId) {
			prevMessageCountRef.current = messages.length
			return
		}

		// Check if we have new messages
		if (messages.length > prevMessageCountRef.current) {
			// Get the new messages
			const newMessagesCount = messages.length - prevMessageCountRef.current
			const newMessages = messages.slice(0, newMessagesCount)

			// Check if any of the new messages are from other users
			// TODO: Join with users to get author info
			const hasOtherUserMessages = newMessages.some((msg) => msg.authorId !== user?.id)

			// Only play sound if window is not focused to avoid duplicate with NotificationManager
			if (hasOtherUserMessages && document.hidden) {
				playSound()
			}
		}

		prevMessageCountRef.current = messages.length
	}, [messages.length, channelId, user?.id, playSound, messages])

	// TODO: Implement pagination for TanStack DB
	// For now, set these to undefined/false
	const loadNext = undefined
	const loadPrev = undefined
	const isLoadingMessages = messagesLoading
	const isLoadingNext = false
	const isLoadingPrev = false

	// biome-ignore lint/correctness/useExhaustiveDependencies: Dependencies are correctly managed
	const contextValue = useMemo<ChatContextValue>(
		() => ({
			channelId,
			organizationId,
			channel,
			messages,
			pinnedMessages,
			loadNext,
			loadPrev,
			isLoadingMessages,
			isLoadingNext,
			isLoadingPrev,
			sendMessage,
			editMessage,
			deleteMessage,
			addReaction,
			removeReaction,
			pinMessage,
			unpinMessage,
			startTyping,
			stopTyping,
			typingUsers,
			createThread,
			openThread,
			closeThread,
			activeThreadChannelId,
			activeThreadMessageId,
			replyToMessageId,
			setReplyToMessageId,
		}),
		[
			channelId,
			channel,
			messages,
			pinnedMessages,
			loadNext,
			loadPrev,
			isLoadingMessages,
			isLoadingNext,
			isLoadingPrev,
			typingUsers,
			organizationId,
			activeThreadChannelId,
			activeThreadMessageId,
			replyToMessageId,
		],
	)

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

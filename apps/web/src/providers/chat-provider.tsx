import type { Channel, Message } from "@hazel/db/models"
import {
	ChannelId,
	MessageId,
	MessageReactionId,
	type OrganizationId,
	PinnedMessageId,
	UserId,
} from "@hazel/db/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import type { FunctionReturnType } from "convex/server"
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuid } from "uuid"
import {
	channelCollection,
	messageCollection,
	messageReactionCollection,
	pinnedMessageCollection,
} from "~/db/collections"
import { useNotificationSound } from "~/hooks/use-notification-sound"
import { useUser } from "~/lib/auth"

type TypingUser = any
type TypingUsers = TypingUser[]

interface ChatContextValue {
	channelId: ChannelId
	organizationId: OrganizationId
	channel: typeof Channel.Model.Type | undefined
	messages: (typeof Message.Model.Type)[]
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
	const { user } = useUser()
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

	// Fetch typing users
	// TODO: Implement
	// const typingUsersQuery = useQuery(convexQuery(api.typingIndicator.list, { channelId, organizationId }))
	const typingUsers: TypingUsers = []

	// Message operations
	const sendMessage = ({
		content,
		attachments: _attachments,
	}: {
		content: string
		attachments?: string[]
	}) => {
		if (!user?.id) return
		messageCollection.insert({
			id: MessageId.make(uuid()),
			channelId,
			authorId: user.id,
			content,
			replyToMessageId,
			threadChannelId: null,
			createdAt: new Date(),
			updatedAt: null,
			deletedAt: null,
		})
		// Clear reply state after sending
		setReplyToMessageId(null)
	}

	const editMessage = async (messageId: MessageId, content: string) => {
		messageCollection.update(messageId, (message) => {
			message.content = content
			message.updatedAt = new Date()
		})
	}

	const deleteMessage = (messageId: MessageId) => {
		messageCollection.delete(messageId)
	}

	const addReaction = (messageId: MessageId, emoji: string) => {
		if (!user?.id) return

		messageReactionCollection.insert({
			id: MessageReactionId.make(uuid()),
			messageId,
			userId: UserId.make(user.id),
			emoji,
			createdAt: new Date(),
		})
	}

	const removeReaction = (_messageId: MessageId, _emoji: string) => {
		if (!user?.id) return

		// Find the user's reaction for this message and emoji
		// Note: This would ideally use a proper query to find the reaction ID
		// For now, we'll need to implement this based on how reactions are stored
		// TODO: Add proper reaction lookup logic
		console.log("removeReaction not fully implemented - need reaction ID lookup")
	}

	const pinMessage = (messageId: MessageId) => {
		if (!user?.id) return

		pinnedMessageCollection.insert({
			id: PinnedMessageId.make(uuid()),
			channelId,
			messageId,
			pinnedBy: UserId.make(user.id),
			pinnedAt: new Date(),
		})
	}

	const unpinMessage = (_messageId: MessageId) => {
		// Find the pinned message record to delete
		// Note: This would ideally use a proper query to find the pinned message ID
		// For now, we'll need to implement this based on how pinned messages are stored
		// TODO: Add proper pinned message lookup logic
		console.log("unpinMessage not fully implemented - need pinned message ID lookup")
	}

	const startTyping = () => {
		// TODO: Implement startTypingMutation
	}

	const stopTyping = () => {
		// TODO: Implement stopTypingMutation
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
			const threadChannelId = ChannelId.make(uuid())
			channelCollection.insert({
				id: threadChannelId,
				organizationId,
				name: "Thread",
				type: "thread" as const,
				parentChannelId: channelId,
				createdAt: new Date(),
				updatedAt: null,
				deletedAt: null,
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

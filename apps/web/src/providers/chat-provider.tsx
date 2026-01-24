import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { Channel } from "@hazel/domain/models"
import {
	type AttachmentId,
	ChannelId,
	type MessageId,
	type MessageReactionId,
	type OrganizationId,
	type PinnedMessageId,
	UserId,
} from "@hazel/schema"
import { Exit } from "effect"
import { toast } from "sonner"
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react"
import {
	activeThreadChannelIdAtom,
	activeThreadMessageIdAtom,
	isUploadingAtomFamily,
	replyToMessageAtomFamily,
	type UploadingFile,
	uploadedAttachmentsAtomFamily,
	uploadingFilesAtomFamily,
} from "~/atoms/chat-atoms"
import { channelByIdAtomFamily } from "~/atoms/chat-query-atoms"
import {
	createThreadAction,
	deleteMessageAction,
	editMessageAction,
	pinMessageAction,
	sendMessageAction,
	toggleReactionAction,
	unpinMessageAction,
} from "~/db/actions"
import { useAuth } from "~/lib/auth"
import { exitToast } from "~/lib/toast-exit"

interface SendMessageProps {
	content: string
	attachments?: AttachmentId[]
	clearContent?: () => void
	restoreContent?: (content: string) => void
}

interface ChatContextValue {
	channelId: ChannelId
	organizationId: OrganizationId
	channel: typeof Channel.Model.Type | undefined
	sendMessage: (props: SendMessageProps) => void
	editMessage: (messageId: MessageId, content: string) => Promise<void>
	deleteMessage: (messageId: MessageId) => void
	addReaction: (messageId: MessageId, channelId: ChannelId, emoji: string) => void
	removeReaction: (reactionId: MessageReactionId) => void
	pinMessage: (messageId: MessageId) => void
	unpinMessage: (pinnedMessageId: PinnedMessageId) => void
	createThread: (messageId: MessageId, threadChannelId: ChannelId | null) => Promise<void>
	openThread: (threadChannelId: ChannelId, originalMessageId: MessageId) => void
	closeThread: () => void
	activeThreadChannelId: ChannelId | null
	activeThreadMessageId: MessageId | null
	isThreadCreating: boolean
	replyToMessageId: MessageId | null
	setReplyToMessageId: (messageId: MessageId | null) => void
	attachmentIds: AttachmentId[]
	addAttachment: (attachmentId: AttachmentId) => void
	removeAttachment: (attachmentId: AttachmentId) => void
	clearAttachments: () => void
	isUploading: boolean
	setIsUploading: (value: boolean) => void
	uploadingFiles: UploadingFile[]
	addUploadingFile: (file: Omit<UploadingFile, "progress">) => void
	updateUploadingFileProgress: (fileId: string, progress: number) => void
	removeUploadingFile: (fileId: string) => void
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
	onMessageSent?: () => void
}

export function ChatProvider({ channelId, organizationId, children, onMessageSent }: ChatProviderProps) {
	const { user } = useAuth()

	const sendMessageMutation = useAtomSet(sendMessageAction, { mode: "promiseExit" })
	const toggleReactionMutation = useAtomSet(toggleReactionAction, { mode: "promiseExit" })
	const createThreadMutation = useAtomSet(createThreadAction, { mode: "promiseExit" })
	const editMessageMutation = useAtomSet(editMessageAction, { mode: "promiseExit" })
	const deleteMessageMutation = useAtomSet(deleteMessageAction, { mode: "promiseExit" })
	const pinMessageMutation = useAtomSet(pinMessageAction, { mode: "promiseExit" })
	const unpinMessageMutation = useAtomSet(unpinMessageAction, { mode: "promiseExit" })

	const replyToMessageId = useAtomValue(replyToMessageAtomFamily(channelId))
	const setReplyToMessageId = useAtomSet(replyToMessageAtomFamily(channelId))

	const activeThreadChannelId = useAtomValue(activeThreadChannelIdAtom)
	const setActiveThreadChannelId = useAtomSet(activeThreadChannelIdAtom)
	const activeThreadMessageId = useAtomValue(activeThreadMessageIdAtom)
	const setActiveThreadMessageId = useAtomSet(activeThreadMessageIdAtom)

	const attachmentIds = useAtomValue(uploadedAttachmentsAtomFamily(channelId))
	const setAttachmentIds = useAtomSet(uploadedAttachmentsAtomFamily(channelId))

	const isUploading = useAtomValue(isUploadingAtomFamily(channelId))
	const setIsUploading = useAtomSet(isUploadingAtomFamily(channelId))

	const uploadingFiles = useAtomValue(uploadingFilesAtomFamily(channelId))
	const setUploadingFiles = useAtomSet(uploadingFilesAtomFamily(channelId))

	const channelResult = useAtomValue(channelByIdAtomFamily(channelId))
	const channel = Result.getOrElse(channelResult, () => undefined)

	// Track pending thread creation to disable composer until thread is created
	const [pendingThreadChannelId, setPendingThreadChannelId] = useState<ChannelId | null>(null)
	const isThreadCreating =
		pendingThreadChannelId === activeThreadChannelId && pendingThreadChannelId !== null

	const addAttachment = useCallback(
		(attachmentId: AttachmentId) => {
			setAttachmentIds((prev) => [...prev, attachmentId])
		},
		[setAttachmentIds],
	)

	const removeAttachment = useCallback(
		(attachmentId: AttachmentId) => {
			setAttachmentIds((prev) => prev.filter((id) => id !== attachmentId))
		},
		[setAttachmentIds],
	)

	const clearAttachments = useCallback(() => {
		setAttachmentIds([])
	}, [setAttachmentIds])

	const addUploadingFile = useCallback(
		(file: Omit<UploadingFile, "progress">) => {
			setUploadingFiles((prev) => [...prev, { ...file, progress: 0 }])
		},
		[setUploadingFiles],
	)

	const updateUploadingFileProgress = useCallback(
		(fileId: string, progress: number) => {
			setUploadingFiles((prev) => prev.map((f) => (f.fileId === fileId ? { ...f, progress } : f)))
		},
		[setUploadingFiles],
	)

	const removeUploadingFile = useCallback(
		(fileId: string) => {
			setUploadingFiles((prev) => prev.filter((f) => f.fileId !== fileId))
		},
		[setUploadingFiles],
	)

	// Store pending message data for manual retry
	const pendingMessageRef = useRef<{
		content: string
		replyToMessageId: MessageId | null
		attachmentIds: AttachmentId[]
		clearContent?: () => void
		restoreContent?: (content: string) => void
	} | null>(null)

	const sendMessage = useCallback(
		async ({ content, attachments, clearContent, restoreContent }: SendMessageProps) => {
			if (!user?.id) return
			const attachmentsToSend = attachments ?? attachmentIds

			// Save state for potential restore on error
			const savedReplyToMessageId = replyToMessageId
			const savedAttachmentIds = [...attachmentsToSend]

			// Store pending message data for manual retry
			pendingMessageRef.current = {
				content,
				replyToMessageId: savedReplyToMessageId,
				attachmentIds: savedAttachmentIds,
				clearContent,
				restoreContent,
			}

			// Optimistically clear everything
			clearContent?.()
			setReplyToMessageId(null)
			clearAttachments()

			const tx = await sendMessageMutation({
				channelId,
				authorId: UserId.make(user.id),
				content,
				replyToMessageId: savedReplyToMessageId,
				threadChannelId: null,
				attachmentIds: savedAttachmentIds as AttachmentId[] | undefined,
			})

			if (Exit.isSuccess(tx)) {
				pendingMessageRef.current = null
				onMessageSent?.()
			} else {
				// Restore state on error (after automatic retries exhausted)
				restoreContent?.(content)
				setReplyToMessageId(savedReplyToMessageId)
				setAttachmentIds(savedAttachmentIds)

				exitToast(tx)
					.onErrorTag("RateLimitExceededError", (e) => ({
						title: "Rate limit exceeded",
						description: `Please wait ${Math.ceil(e.retryAfterMs / 1000)} seconds before sending another message.`,
						isRetryable: false,
					}))
					.onErrorTag("ChannelNotFoundError", () => ({
						title: "Channel not found",
						description: "This channel may have been deleted.",
						isRetryable: false,
					}))
					.withRetry({
						label: "Retry",
						onRetry: () => {
							// Manual retry after all automatic retries exhausted
							if (pendingMessageRef.current) {
								const pending = pendingMessageRef.current
								sendMessage({
									content: pending.content,
									attachments: pending.attachmentIds,
									clearContent: pending.clearContent,
									restoreContent: pending.restoreContent,
								})
							}
						},
					})
					.run()
			}
		},
		[
			channelId,
			user?.id,
			replyToMessageId,
			attachmentIds,
			sendMessageMutation,
			setReplyToMessageId,
			setAttachmentIds,
			clearAttachments,
			onMessageSent,
		],
	)

	const editMessage = useCallback(
		async (messageId: MessageId, content: string) => {
			const exit = await editMessageMutation({ messageId, content })
			exitToast(exit)
				.onErrorTag("RateLimitExceededError", (e) => ({
					title: "Rate limit exceeded",
					description: `Please wait ${Math.ceil(e.retryAfterMs / 1000)} seconds before trying again.`,
					isRetryable: false,
				}))
				.onErrorTag("MessageNotFoundError", () => ({
					title: "Message not found",
					description: "This message may have been deleted.",
					isRetryable: false,
				}))
				.run()
		},
		[editMessageMutation],
	)

	const deleteMessage = useCallback(
		async (messageId: MessageId) => {
			const exit = await deleteMessageMutation({ messageId })
			exitToast(exit)
				.onErrorTag("RateLimitExceededError", (e) => ({
					title: "Rate limit exceeded",
					description: `Please wait ${Math.ceil(e.retryAfterMs / 1000)} seconds before trying again.`,
					isRetryable: false,
				}))
				.onErrorTag("MessageNotFoundError", () => ({
					title: "Message not found",
					description: "This message may have already been deleted.",
					isRetryable: false,
				}))
				.run()
		},
		[deleteMessageMutation],
	)

	const addReaction = useCallback(
		async (messageId: MessageId, channelId: ChannelId, emoji: string) => {
			if (!user?.id) return

			const tx = await toggleReactionMutation({
				messageId,
				channelId,
				emoji,
				userId: UserId.make(user.id),
			})

			exitToast(tx)
				.onErrorTag("MessageNotFoundError", () => ({
					title: "Message not found",
					description: "This message may have been deleted.",
					isRetryable: false,
				}))
				.run()
		},
		[user?.id, toggleReactionMutation],
	)

	// Note: removeReaction is deprecated - use addReaction which toggles reactions
	// Keeping for interface compatibility but this is a no-op since toggleReaction handles removal
	const removeReaction = useCallback((_reactionId: MessageReactionId) => {
		console.warn("removeReaction is deprecated - use addReaction to toggle reactions")
	}, [])

	const pinMessage = useCallback(
		async (messageId: MessageId) => {
			if (!user?.id) return

			const exit = await pinMessageMutation({
				messageId,
				channelId,
				userId: UserId.make(user.id),
			})

			exitToast(exit)
				.successMessage("Message pinned")
				.onErrorTag("MessageNotFoundError", () => ({
					title: "Message not found",
					description: "This message may have been deleted.",
					isRetryable: false,
				}))
				.run()
		},
		[channelId, user?.id, pinMessageMutation],
	)

	const unpinMessage = useCallback(
		async (pinnedMessageId: PinnedMessageId) => {
			const exit = await unpinMessageMutation({ pinnedMessageId })

			exitToast(exit)
				.successMessage("Message unpinned")
				.onErrorTag("PinnedMessageNotFoundError", () => ({
					title: "Pin not found",
					description: "This message may have already been unpinned.",
					isRetryable: false,
				}))
				.run()
		},
		[unpinMessageMutation],
	)

	const createThread = useCallback(
		async (messageId: MessageId, existingThreadChannelId: ChannelId | null) => {
			// Prevent nested threads
			if (channel?.type === "thread") {
				toast.error("Cannot create threads within threads")
				return
			}

			if (existingThreadChannelId) {
				// Thread already exists - just open it
				setActiveThreadChannelId(existingThreadChannelId)
				setActiveThreadMessageId(messageId)
			} else {
				if (!user?.id) return

				// Generate thread channel ID upfront for optimistic UI
				const threadChannelId = ChannelId.make(crypto.randomUUID())

				// Open panel IMMEDIATELY with optimistic ID
				setActiveThreadChannelId(threadChannelId)
				setActiveThreadMessageId(messageId)

				// Track that this thread is being created (disables composer)
				setPendingThreadChannelId(threadChannelId)

				// Create thread in background
				const exit = await createThreadMutation({
					threadChannelId,
					messageId,
					parentChannelId: channelId,
					organizationId,
					currentUserId: UserId.make(user.id),
				})

				// Clear pending state
				setPendingThreadChannelId(null)

				exitToast(exit)
					.onErrorTag("MessageNotFoundError", () => ({
						title: "Message not found",
						description: "The message no longer exists",
						isRetryable: false,
					}))
					.onErrorTag("NestedThreadError", () => ({
						title: "Cannot create thread",
						description: "Threads cannot be created within threads",
						isRetryable: false,
					}))
					.run()

				// Close panel on failure
				if (!Exit.isSuccess(exit)) {
					setActiveThreadChannelId(null)
					setActiveThreadMessageId(null)
				}
			}
		},
		[
			channel?.type,
			channelId,
			organizationId,
			user?.id,
			createThreadMutation,
			setActiveThreadChannelId,
			setActiveThreadMessageId,
		],
	)

	const openThread = useCallback(
		(threadChannelId: ChannelId, originalMessageId: MessageId) => {
			setActiveThreadChannelId(threadChannelId)
			setActiveThreadMessageId(originalMessageId)
		},
		[setActiveThreadChannelId, setActiveThreadMessageId],
	)

	const closeThread = useCallback(() => {
		setActiveThreadChannelId(null)
		setActiveThreadMessageId(null)
	}, [setActiveThreadChannelId, setActiveThreadMessageId])

	const contextValue = useMemo<ChatContextValue>(
		() => ({
			channelId,
			organizationId,
			channel,
			sendMessage,
			editMessage,
			deleteMessage,
			addReaction,
			removeReaction,
			pinMessage,
			unpinMessage,
			createThread,
			openThread,
			closeThread,
			activeThreadChannelId,
			activeThreadMessageId,
			isThreadCreating,
			replyToMessageId,
			setReplyToMessageId,
			attachmentIds,
			addAttachment,
			removeAttachment,
			clearAttachments,
			isUploading,
			setIsUploading,
			uploadingFiles,
			addUploadingFile,
			updateUploadingFileProgress,
			removeUploadingFile,
		}),
		[
			channelId,
			organizationId,
			channel,
			sendMessage,
			editMessage,
			deleteMessage,
			addReaction,
			removeReaction,
			pinMessage,
			unpinMessage,
			createThread,
			openThread,
			closeThread,
			activeThreadChannelId,
			activeThreadMessageId,
			isThreadCreating,
			replyToMessageId,
			setReplyToMessageId,
			attachmentIds,
			addAttachment,
			removeAttachment,
			clearAttachments,
			isUploading,
			setIsUploading,
			uploadingFiles,
			addUploadingFile,
			updateUploadingFileProgress,
			removeUploadingFile,
		],
	)

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

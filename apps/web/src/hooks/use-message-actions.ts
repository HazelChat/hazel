import type { PinnedMessageId } from "@hazel/schema"
import { useCallback, useMemo } from "react"
import { toast } from "sonner"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { useChat } from "~/hooks/use-chat"
import { useEmojiStats } from "~/hooks/use-emoji-stats"
import { useAuth } from "~/lib/auth"

/**
 * Shared hook for message action handlers.
 * Used by both MessageToolbar and MessageContextMenu.
 */
export function useMessageActions(message: MessageWithPinned) {
	const {
		addReaction,
		setReplyToMessageId,
		deleteMessage,
		pinMessage,
		unpinMessage,
		createThread,
		channel,
	} = useChat()
	const { topEmojis, trackEmojiUsage } = useEmojiStats()
	const { user: currentUser } = useAuth()

	// Derived state
	const isOwnMessage = currentUser?.id === message.authorId
	const isPinned = message.pinnedMessage?.id !== undefined

	const handleReaction = useCallback(
		(emoji: string | { emoji: string; label: string }) => {
			const emojiString = typeof emoji === "string" ? emoji : emoji.emoji
			trackEmojiUsage(emojiString)
			addReaction(message.id, message.channelId, emojiString)
		},
		[addReaction, message.id, message.channelId, trackEmojiUsage],
	)

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(message.content)
		toast.success("Copied!", {
			description: "Message content has been copied to your clipboard.",
		})
	}, [message.content])

	const handleReply = useCallback(() => {
		setReplyToMessageId(message.id)
	}, [setReplyToMessageId, message.id])

	const handleThread = useCallback(() => {
		createThread(message.id, message.threadChannelId)
	}, [createThread, message.id, message.threadChannelId])

	const handlePin = useCallback(() => {
		if (isPinned && message.pinnedMessage?.id) {
			unpinMessage(message.pinnedMessage.id as PinnedMessageId)
		} else {
			pinMessage(message.id)
		}
	}, [isPinned, message.pinnedMessage?.id, pinMessage, unpinMessage, message.id])

	const handleDelete = useCallback(() => {
		deleteMessage(message.id)
	}, [deleteMessage, message.id])

	const handleCopyId = useCallback(() => {
		navigator.clipboard.writeText(message.id)
		toast.success("Copied!", {
			description: "Message ID has been copied to your clipboard.",
		})
	}, [message.id])

	return useMemo(
		() => ({
			// Actions
			handleReaction,
			handleCopy,
			handleReply,
			handleThread,
			handlePin,
			handleDelete,
			handleCopyId,
			// Derived state
			isOwnMessage,
			isPinned,
			topEmojis,
			channel,
		}),
		[
			handleReaction,
			handleCopy,
			handleReply,
			handleThread,
			handlePin,
			handleDelete,
			handleCopyId,
			isOwnMessage,
			isPinned,
			topEmojis,
			channel,
		],
	)
}

import { useAtomValue } from "@effect-atom/atom-react"
import type { MessageId } from "@hazel/schema"
import { format } from "date-fns"
import { memo, useCallback, useMemo, useRef } from "react"
import { useHover } from "react-aria"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { processedReactionsAtomFamily } from "~/atoms/message-atoms"
import IconPin from "~/components/icons/icon-pin"
import { extractUrls } from "~/components/link-preview"
import { StatusEmojiWithTooltip } from "~/components/status/user-status-badge"
import { Badge } from "~/components/ui/badge"
import { useChat } from "~/hooks/use-chat"
import { useEmojiStats } from "~/hooks/use-emoji-stats"
import { useUserPresence } from "~/hooks/use-presence"
import { useAuth } from "~/lib/auth"
import { cn } from "~/lib/utils"
import { useMessageHover } from "~/providers/message-hover-provider"
import { InlineThreadPreview } from "./inline-thread-preview"
import { MessageAttachments } from "./message-attachments"
import { MessageContent } from "./message-content"
import { MessageContextMenu } from "./message-context-menu"
import { MessageReplySection } from "./message-reply-section"
import { ReactionButton } from "./reaction-button"
import { UserProfilePopover } from "./user-profile-popover"

/**
 * Position of the message within a group of consecutive messages from the same author
 * - 'start': First message in a group (shows avatar)
 * - 'middle': Message between start and end
 * - 'end': Last message in a group
 * - 'standalone': Single message (both start and end)
 */
export type MessageGroupPosition = "start" | "middle" | "end" | "standalone"

/**
 * Visual highlight style for the message
 * - 'new': First new/unread message highlight
 * - 'pinned': Pinned message with special styling
 * - 'search': Highlighted from search result (animated)
 * - 'none': No highlight
 */
export type MessageHighlight = "new" | "pinned" | "search" | "none"

/**
 * Variant-based props for MessageItem
 * Replaces boolean prop proliferation with semantic groupings
 */
export interface MessageItemVariants {
	/** Position within a message group - controls avatar visibility and spacing */
	groupPosition?: MessageGroupPosition
	/** Highlight style for the message - controls visual emphasis */
	highlight?: MessageHighlight
}

interface MessageItemProps {
	message: MessageWithPinned
	/**
	 * Variant configuration for the message item
	 * @example { groupPosition: 'start', highlight: 'pinned' }
	 */
	variants?: MessageItemVariants
	/**
	 * @deprecated Use `variants.groupPosition` instead
	 */
	isGroupStart?: boolean
	/**
	 * @deprecated Use `variants.groupPosition` instead
	 */
	isGroupEnd?: boolean
	/**
	 * @deprecated Use `variants.highlight === 'new'` instead
	 */
	isFirstNewMessage?: boolean
	/**
	 * @deprecated Use `variants.highlight === 'pinned'` instead
	 */
	isPinned?: boolean
	/**
	 * @deprecated Use `variants.highlight === 'search'` instead
	 */
	isHighlighted?: boolean
}

export const MessageItem = memo(function MessageItem({
	message,
	variants,
	// Legacy props for backwards compatibility
	isGroupStart: legacyIsGroupStart = false,
	isGroupEnd: legacyIsGroupEnd = false,
	isFirstNewMessage: legacyIsFirstNewMessage = false,
	isPinned: legacyIsPinned = false,
	isHighlighted: legacyIsHighlighted = false,
}: MessageItemProps) {
	// Resolve variants with backwards compatibility
	const groupPosition =
		variants?.groupPosition ?? resolveGroupPosition(legacyIsGroupStart, legacyIsGroupEnd)
	const highlight =
		variants?.highlight ?? resolveHighlight(legacyIsFirstNewMessage, legacyIsPinned, legacyIsHighlighted)

	// Derived state from variants
	const isGroupStart = groupPosition === "start" || groupPosition === "standalone"
	const isGroupEnd = groupPosition === "end" || groupPosition === "standalone"
	const isFirstNewMessage = highlight === "new"
	const isPinned = highlight === "pinned"
	const isHighlighted = highlight === "search"
	const { addReaction } = useChat()
	const { trackEmojiUsage } = useEmojiStats()
	const { actions } = useMessageHover()

	const messageRef = useRef<HTMLDivElement>(null)

	const { user: currentUser } = useAuth()

	const isRepliedTo = !!message?.replyToMessageId

	// Check if message has embeds (rich/webhook embeds or URL-based embeds)
	const hasEmbed = useMemo(() => {
		// Check for rich/webhook embeds
		if (message.embeds && message.embeds.length > 0) return true
		// Check for URL-based embeds (tweets, YouTube, Linear, GitHub, link previews)
		const urls = extractUrls(message.content)
		return urls.length > 0
	}, [message.embeds, message.content])

	const showAvatar = isGroupStart || isRepliedTo || hasEmbed

	// Stabilize atom key to prevent atom family recreation on every render
	const reactionsAtomKey = useMemo(
		() => `${message.id}:${currentUser?.id || ""}` as `${MessageId}:${string}`,
		[message.id, currentUser?.id],
	)
	// Use atom for reactions - automatically deduplicated and memoized
	const aggregatedReactions = useAtomValue(processedReactionsAtomFamily(reactionsAtomKey))

	const { hoverProps } = useHover({
		onHoverStart: () => {
			actions.setHovered(message.id, messageRef.current)
		},
		onHoverEnd: () => {
			actions.setHovered(null, null)
		},
	})

	// Memoize reaction handler to prevent ReactionButton re-renders
	const handleReaction = useCallback(
		(emoji: string) => {
			if (!message) return
			trackEmojiUsage(emoji)
			// addReaction now handles the toggle logic internally
			addReaction(message.id, message.channelId, emoji)
		},
		[message?.id, message?.channelId, trackEmojiUsage, addReaction],
	)

	// Memoize reply click handler
	const handleReplyClick = useCallback(() => {
		if (!message.replyToMessageId) return
		const replyElement = document.getElementById(`message-${message.replyToMessageId}`)
		if (!replyElement) return
		replyElement.scrollIntoView({ behavior: "smooth", block: "center" })
		// Add a highlight effect
		replyElement.classList.add("bg-secondary/30")
		setTimeout(() => {
			replyElement.classList.remove("bg-secondary/30")
		}, 2000)
	}, [message.replyToMessageId])

	if (!message) return null

	return (
		<MessageContextMenu message={message}>
			<div
				{...hoverProps}
				ref={messageRef}
				id={`message-${message.id}`}
				className={cn(
					"group relative flex flex-col rounded-lg px-0.5 py-1 hover:bg-secondary",
					isGroupStart ? "mt-2" : "",
					isGroupEnd ? "mb-2" : "",
					isFirstNewMessage
						? "rounded-l-none border-success border-l-2 bg-success/10 hover:bg-success/5"
						: "",
					isPinned
						? "rounded-l-none border-warning border-l-4 bg-warning/10 pl-2 shadow-sm hover:bg-warning/15"
						: "",
					isHighlighted && "bg-accent/20 transition-colors duration-300",
				)}
				data-id={message.id}
			>
				{/* Reply Section */}
				{isRepliedTo && message.replyToMessageId && (
					<MessageReplySection
						replyToMessageId={message.replyToMessageId}
						onClick={handleReplyClick}
					/>
				)}

				{/* Main Content Row */}
				<div className="flex gap-4">
					{showAvatar ? (
						<UserProfilePopover userId={message.authorId} />
					) : (
						<div className="flex w-10 items-center justify-end pr-1 text-[10px] text-muted-fg leading-tight opacity-0 group-hover:opacity-100">
							{format(message.createdAt, "HH:mm")}
						</div>
					)}

					{/* Content Section */}
					<div className="min-w-0 flex-1">
						{/* Author header (only when showing avatar) */}
						{showAvatar && <MessageAuthorHeader message={message} isPinned={isPinned} />}

						{/* Message Content - using compound component */}
						<MessageContent.Provider
							message={message}
							organizationId={currentUser?.organizationId ?? undefined}
						>
							<MessageContent.Text />
							<MessageContent.Embeds />
						</MessageContent.Provider>

						{/* Attachments */}
						<MessageAttachments messageId={message.id} />

						{/* Reactions */}
						{aggregatedReactions.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{aggregatedReactions.map(([emoji, data]) => (
									<ReactionButton
										key={emoji}
										emoji={emoji}
										data={data}
										onReaction={handleReaction}
										currentUserId={currentUser?.id}
									/>
								))}
							</div>
						)}

						{/* Thread Preview */}
						{message.threadChannelId && (
							<InlineThreadPreview
								threadChannelId={message.threadChannelId}
								messageId={message.id}
							/>
						)}
					</div>
				</div>
			</div>
		</MessageContextMenu>
	)
})

export const MessageAuthorHeader = ({
	message,
	isPinned = false,
}: {
	message: MessageWithPinned
	isPinned?: boolean
}) => {
	// Author is now directly attached to the message via leftJoin
	const user = message.author
	const { statusEmoji, customMessage, statusExpiresAt, quietHours } = useUserPresence(message.authorId)

	const isEdited = message.updatedAt && message.updatedAt.getTime() > message.createdAt.getTime()

	if (!user) return null

	const fullName = `${user.firstName} ${user.lastName}`

	return (
		<div className="flex items-baseline gap-2">
			<span className="font-semibold text-fg">{fullName}</span>
			<StatusEmojiWithTooltip
				emoji={statusEmoji}
				message={customMessage}
				expiresAt={statusExpiresAt}
				quietHours={quietHours}
			/>
			{user.userType === "machine" && (
				<Badge intent="primary" isCircle={false}>
					APP
				</Badge>
			)}
			<span className="text-muted-fg text-xs">
				{format(message.createdAt, "HH:mm")}
				{isEdited && " (edited)"}
			</span>
			{isPinned && (
				<span className="flex items-center gap-1 text-warning text-xs" title="Pinned message">
					<IconPin className="size-3" />
					<span>Pinned</span>
				</span>
			)}
		</div>
	)
}

/**
 * Helper to resolve group position from legacy boolean props
 */
function resolveGroupPosition(isGroupStart: boolean, isGroupEnd: boolean): MessageGroupPosition {
	if (isGroupStart && isGroupEnd) return "standalone"
	if (isGroupStart) return "start"
	if (isGroupEnd) return "end"
	return "middle"
}

/**
 * Helper to resolve highlight from legacy boolean props
 * Priority: pinned > new > search > none
 */
function resolveHighlight(
	isFirstNewMessage: boolean,
	isPinned: boolean,
	isHighlighted: boolean,
): MessageHighlight {
	if (isPinned) return "pinned"
	if (isFirstNewMessage) return "new"
	if (isHighlighted) return "search"
	return "none"
}

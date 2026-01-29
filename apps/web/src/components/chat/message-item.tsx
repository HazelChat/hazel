import { useAtomValue } from "@effect-atom/atom-react"
import { format } from "date-fns"
import { memo, useRef } from "react"
import { useHover } from "react-aria"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { processedReactionsAtomFamily } from "~/atoms/message-atoms"
import IconPin from "~/components/icons/icon-pin"
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

interface MessageItemProps {
	message: MessageWithPinned
	isGroupStart?: boolean
	isGroupEnd?: boolean
	isFirstNewMessage?: boolean
	isPinned?: boolean
	isHighlighted?: boolean
}

export const MessageItem = memo(function MessageItem({
	message,
	isGroupStart = false,
	isGroupEnd = false,
	isFirstNewMessage = false,
	isPinned = false,
	isHighlighted = false,
}: MessageItemProps) {
	const { addReaction } = useChat()
	const { trackEmojiUsage } = useEmojiStats()
	const { actions } = useMessageHover()

	const messageRef = useRef<HTMLDivElement>(null)

	const { user: currentUser } = useAuth()

	const showAvatar = isGroupStart || !!message?.replyToMessageId
	const isRepliedTo = !!message?.replyToMessageId

	// Use atom for reactions - automatically deduplicated and memoized
	const aggregatedReactions = useAtomValue(
		processedReactionsAtomFamily({ messageId: message.id, currentUserId: currentUser?.id || "" }),
	)

	const { hoverProps } = useHover({
		onHoverStart: () => {
			actions.setHovered(message.id, messageRef.current)
		},
		onHoverEnd: () => {
			actions.setHovered(null, null)
		},
	})

	const handleReaction = (emoji: string) => {
		if (!message) return
		trackEmojiUsage(emoji)
		// addReaction now handles the toggle logic internally
		addReaction(message.id, message.channelId, emoji)
	}

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
						onClick={() => {
							const replyElement = document.getElementById(
								`message-${message.replyToMessageId}`,
							)
							if (replyElement) {
								replyElement.scrollIntoView({ behavior: "smooth", block: "center" })
								// Add a highlight effect
								replyElement.classList.add("bg-secondary/30")
								setTimeout(() => {
									replyElement.classList.remove("bg-secondary/30")
								}, 2000)
							}
						}}
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

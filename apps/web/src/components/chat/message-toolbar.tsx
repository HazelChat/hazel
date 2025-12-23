import type { PinnedMessageId } from "@hazel/schema"
import { useState } from "react"
import { toast } from "sonner"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { EmojiPickerDialog } from "~/components/emoji-picker"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "~/components/ui/menu"
import { Separator } from "~/components/ui/separator"
import { Toolbar } from "~/components/ui/toolbar"
import { Tooltip, TooltipContent } from "~/components/ui/tooltip"
import { useChat } from "~/hooks/use-chat"
import { useEmojiStats } from "~/hooks/use-emoji-stats"
import { useAuth } from "~/lib/auth"
import IconCopy from "../icons/icon-copy"
import IconDotsVertical from "../icons/icon-dots-vertical"
import IconEmojiAdd from "../icons/icon-emoji-add"
import IconReply from "../icons/icon-reply"
import IconStar from "../icons/icon-star"
import IconThread from "../icons/icon-thread"
import IconTrash from "../icons/icon-trash"
import { DeleteMessageModal } from "./delete-message-modal"

interface MessageToolbarProps {
	message: MessageWithPinned
	onMenuOpenChange?: (isOpen: boolean) => void
}

export function MessageToolbar({ message, onMenuOpenChange }: MessageToolbarProps) {
	const { addReaction, setReplyToMessageId, deleteMessage, pinMessage, unpinMessage, createThread, channel } =
		useChat()
	const { topEmojis, trackEmojiUsage } = useEmojiStats()
	const { user: currentUser } = useAuth()
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)

	// Derived state
	const isOwnMessage = currentUser?.id === message.authorId
	const isPinned = message.pinnedMessage?.id !== undefined

	const handleReaction = (emoji: string | { emoji: string; label: string }) => {
		const emojiString = typeof emoji === "string" ? emoji : emoji.emoji
		trackEmojiUsage(emojiString)
		addReaction(message.id, message.channelId, emojiString)
	}

	const handleCopy = () => {
		navigator.clipboard.writeText(message.content)
		toast.success("Copied!", {
			description: "Message content has been copied to your clipboard.",
		})
	}

	const handleReply = () => {
		setReplyToMessageId(message.id)
	}

	const handleThread = () => {
		createThread(message.id, message.threadChannelId)
	}

	const handlePin = () => {
		if (isPinned && message.pinnedMessage?.id) {
			unpinMessage(message.pinnedMessage.id as PinnedMessageId)
		} else {
			pinMessage(message.id)
		}
	}

	const handleDelete = () => {
		deleteMessage(message.id)
	}

	const handleDeleteModalChange = (open: boolean) => {
		setDeleteModalOpen(open)
		onMenuOpenChange?.(open)
	}

	return (
		<Toolbar aria-label="Message actions" className="rounded-lg border border-border bg-bg shadow-sm">
			{/* Quick Reactions */}
			{topEmojis.map((emoji) => (
				<Tooltip key={emoji}>
					<Button
						size="sq-sm"
						intent="plain"
						onPress={() => handleReaction(emoji)}
						aria-label={`React with ${emoji}`}
						className="!p-1.5 text-base hover:bg-secondary"
					>
						{emoji}
					</Button>
					<TooltipContent>React with {emoji}</TooltipContent>
				</Tooltip>
			))}
			<Separator orientation="vertical" className="mx-0.5 h-4" />

			{/* More Reactions Button */}
			<EmojiPickerDialog onEmojiSelect={handleReaction}>
				<Tooltip>
					<Button
						size="sq-sm"
						intent="plain"
						aria-label="Add reaction"
						className="p-1.5! hover:bg-secondary"
					>
						<IconEmojiAdd data-slot="icon" className="size-3.5" />
					</Button>
					<TooltipContent>Add reaction</TooltipContent>
				</Tooltip>
			</EmojiPickerDialog>

			{/* Copy Button */}
			<Tooltip>
				<Button
					size="sq-sm"
					intent="plain"
					onPress={handleCopy}
					aria-label="Copy message"
					className="p-1.5! hover:bg-secondary"
				>
					<IconCopy data-slot="icon" className="size-3.5" />
				</Button>
				<TooltipContent>Copy message</TooltipContent>
			</Tooltip>

			{/* Reply Button */}
			<Tooltip>
				<Button
					size="sq-sm"
					intent="plain"
					onPress={handleReply}
					aria-label="Reply"
					className="!p-1.5 hover:bg-secondary"
				>
					<IconReply data-slot="icon" className="size-3.5" />
				</Button>
				<TooltipContent>Reply</TooltipContent>
			</Tooltip>

			{/* Delete Button (Own Messages Only) */}
			{isOwnMessage && (
				<Tooltip>
					<Button
						size="sq-sm"
						intent="plain"
						onPress={() => handleDeleteModalChange(true)}
						aria-label="Delete message"
						className="!p-1.5 text-danger hover:bg-danger/10"
					>
						<IconTrash data-slot="icon" className="size-3.5" />
					</Button>
					<TooltipContent>Delete message</TooltipContent>
				</Tooltip>
			)}

			{/* Divider before more options */}
			<Separator orientation="vertical" className="mx-0.5 h-4" />

			{/* More Options Menu */}
			<Tooltip>
				<Menu>
					<MenuTrigger aria-label="More actions" className="!p-1.5 rounded-md hover:bg-secondary">
						<IconDotsVertical className="size-3.5" />
					</MenuTrigger>
					<MenuContent placement="bottom end">
						{channel?.type !== "thread" && (
							<MenuItem onAction={handleThread}>
								<IconThread data-slot="icon" />
								<MenuLabel>Reply in thread</MenuLabel>
							</MenuItem>
						)}
						<MenuItem onAction={handlePin}>
							<IconStar data-slot="icon" />
							<MenuLabel>{isPinned ? "Unpin message" : "Pin message"}</MenuLabel>
						</MenuItem>
					</MenuContent>
				</Menu>
				<TooltipContent>More actions</TooltipContent>
			</Tooltip>

			{/* Delete Confirmation Modal */}
			<DeleteMessageModal
				isOpen={deleteModalOpen}
				onOpenChange={handleDeleteModalChange}
				onConfirm={handleDelete}
			/>
		</Toolbar>
	)
}

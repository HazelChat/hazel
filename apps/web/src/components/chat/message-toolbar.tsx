import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import { EmojiPickerDialog } from "~/components/emoji-picker"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "~/components/ui/menu"
import { Separator } from "~/components/ui/separator"
import { Toolbar } from "~/components/ui/toolbar"
import { Tooltip, TooltipContent } from "~/components/ui/tooltip"
import { useMessageActions } from "~/hooks/use-message-actions"
import { useSingleModalState } from "~/hooks/use-modal-state"
import { useMessageHover } from "~/providers/message-hover-provider"
import IconCopy from "../icons/icon-copy"
import IconDotsVertical from "../icons/icon-dots-vertical"
import IconEmojiAdd from "../icons/icon-emoji-add"
import IconReply from "../icons/icon-reply"
import { IconStar } from "../icons/icon-star"
import IconThread from "../icons/icon-thread"
import IconTrash from "../icons/icon-trash"
import { DeleteMessageModal } from "./delete-message-modal"

interface MessageToolbarProps {
	message: MessageWithPinned
}

export function MessageToolbar({ message }: MessageToolbarProps) {
	const { actions } = useMessageHover()
	const {
		handleReaction,
		handleCopy,
		handleReply,
		handleThread,
		handlePin,
		handleDelete,
		isOwnMessage,
		isPinned,
		topEmojis,
		channel,
	} = useMessageActions(message)

	const deleteModal = useSingleModalState()

	const handleDeleteModalChange = (open: boolean) => {
		deleteModal.setIsOpen(open)
		actions.setToolbarMenuOpen(open)
	}

	return (
		<Toolbar aria-label="Message actions" className="rounded-lg border border-border bg-bg shadow-sm">
			{/* Quick Reactions - Show only 3 in toolbar */}
			{topEmojis.slice(0, 3).map((emoji) => (
				<Tooltip key={emoji}>
					<Button
						size="sq-sm"
						intent="plain"
						onPress={() => handleReaction(emoji)}
						aria-label={`React with ${emoji}`}
						className="p-1.5! text-base hover:bg-secondary"
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
					className="p-1.5! hover:bg-secondary"
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
						onPress={deleteModal.open}
						aria-label="Delete message"
						className="p-1.5! text-danger hover:bg-danger/10"
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
					<MenuTrigger aria-label="More actions" className="p-1.5! rounded-md hover:bg-secondary">
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
				isOpen={deleteModal.isOpen}
				onOpenChange={handleDeleteModalChange}
				onConfirm={handleDelete}
			/>
		</Toolbar>
	)
}

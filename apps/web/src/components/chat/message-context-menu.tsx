import { type ReactNode, useState } from "react"
import type { MessageWithPinned } from "~/atoms/chat-query-atoms"
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "~/components/emoji-picker"
import IconCopy from "~/components/icons/icon-copy"
import IconEmojiAdd from "~/components/icons/icon-emoji-add"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconReply from "~/components/icons/icon-reply"
import { IconStar } from "~/components/icons/icon-star"
import IconThread from "~/components/icons/icon-thread"
import IconTrash from "~/components/icons/icon-trash"
import IconUnpin from "~/components/icons/icon-unpin"
import { Button } from "~/components/ui/button"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuHeader,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "~/components/ui/context-menu"
import { ModalContent } from "~/components/ui/modal"
import { useMessageActions } from "~/hooks/use-message-actions"
import { DeleteMessageModal } from "./delete-message-modal"

interface MessageContextMenuProps {
	message: MessageWithPinned
	children: ReactNode
}

export function MessageContextMenu({ message, children }: MessageContextMenuProps) {
	const {
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
	} = useMessageActions(message)

	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger className="block w-full text-left">{children}</ContextMenuTrigger>
				<ContextMenuContent className="min-w-56">
					{/* Quick Reactions Row */}
					<ContextMenuHeader className="flex items-center gap-1 px-1 py-1">
						{topEmojis.map((emoji) => (
							<Button
								key={emoji}
								size="sq-md"
								intent="plain"
								onPress={() => handleReaction(emoji)}
								aria-label={`React with ${emoji}`}
								className="p-1! text-lg hover:bg-secondary"
							>
								{emoji}
							</Button>
						))}
					</ContextMenuHeader>
					<ContextMenuSeparator />

					{/* Add Reaction */}
					<ContextMenuItem onAction={() => setEmojiPickerOpen(true)}>
						<ContextMenuLabel>Add Reaction</ContextMenuLabel>
						<IconEmojiAdd data-slot="icon" className="ml-auto size-4 text-muted-fg" />
					</ContextMenuItem>
					<ContextMenuSeparator />

					{/* Reply */}
					<ContextMenuItem onAction={handleReply}>
						<ContextMenuLabel>Reply</ContextMenuLabel>
						<IconReply data-slot="icon" className="ml-auto size-4 text-muted-fg" />
					</ContextMenuItem>

					{/* Reply in Thread (only if not in thread channel) */}
					{channel?.type !== "thread" && (
						<ContextMenuItem onAction={handleThread}>
							<ContextMenuLabel>Reply in Thread</ContextMenuLabel>
							<IconThread data-slot="icon" className="ml-auto size-4 text-muted-fg" />
						</ContextMenuItem>
					)}
					<ContextMenuSeparator />

					{/* Copy Text */}
					<ContextMenuItem onAction={handleCopy}>
						<ContextMenuLabel>Copy Text</ContextMenuLabel>
						<IconCopy data-slot="icon" className="ml-auto size-4 text-muted-fg" />
					</ContextMenuItem>

					{/* Pin/Unpin Message */}
					<ContextMenuItem onAction={handlePin}>
						<ContextMenuLabel>{isPinned ? "Unpin Message" : "Pin Message"}</ContextMenuLabel>
						{isPinned ? (
							<IconUnpin data-slot="icon" className="ml-auto size-4 text-muted-fg" />
						) : (
							<IconStar data-slot="icon" className="ml-auto size-4 text-muted-fg" />
						)}
					</ContextMenuItem>
					<ContextMenuSeparator />

					{/* Delete Message (own messages only) */}
					{isOwnMessage && (
						<ContextMenuItem onAction={() => setDeleteModalOpen(true)} intent="danger">
							<ContextMenuLabel>Delete Message</ContextMenuLabel>
							<IconTrash data-slot="icon" className="ml-auto size-4" />
						</ContextMenuItem>
					)}

					{/* Copy Message ID */}
					<ContextMenuItem onAction={handleCopyId}>
						<ContextMenuLabel>Copy Message ID</ContextMenuLabel>
						<IconHashtag data-slot="icon" className="ml-auto size-4 text-muted-fg" />
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			{/* Delete Confirmation Modal */}
			<DeleteMessageModal
				isOpen={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				onConfirm={handleDelete}
			/>

			{/* Emoji Picker Modal */}
			<ModalContent
				isOpen={emojiPickerOpen}
				onOpenChange={setEmojiPickerOpen}
				size="xs"
				closeButton={false}
				className="overflow-hidden p-0!"
			>
				<EmojiPicker
					className="h-[420px]"
					onEmojiSelect={(emoji) => {
						handleReaction(emoji)
						setEmojiPickerOpen(false)
					}}
				>
					<EmojiPickerSearch />
					<EmojiPickerContent />
					<EmojiPickerFooter />
				</EmojiPicker>
			</ModalContent>
		</>
	)
}

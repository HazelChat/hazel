"use client"

import { type ReactElement, useState } from "react"
import { Dialog, DialogTrigger, Popover } from "react-aria-components"
import { EmojiPicker } from "./emoji-picker"
import { EmojiPickerContent } from "./emoji-picker-content"
import { EmojiPickerFooter } from "./emoji-picker-footer"
import { EmojiPickerSearch } from "./emoji-picker-search"

interface EmojiPickerDialogProps {
	children: ReactElement
	onEmojiSelect: (emoji: { emoji: string; label: string }) => void
}

function EmojiPickerDialog({ children, onEmojiSelect }: EmojiPickerDialogProps) {
	const [isOpen, setIsOpen] = useState(false)

	const handleEmojiSelect = (emoji: { emoji: string; label: string }) => {
		onEmojiSelect(emoji)
		setIsOpen(false)
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			{children}
			<Popover>
				<Dialog aria-label="Emoji picker" className="rounded-lg">
					<EmojiPicker className="h-[420px]" onEmojiSelect={handleEmojiSelect}>
						<EmojiPickerSearch />
						<EmojiPickerContent />
						<EmojiPickerFooter />
					</EmojiPicker>
				</Dialog>
			</Popover>
		</DialogTrigger>
	)
}

export { EmojiPickerDialog }

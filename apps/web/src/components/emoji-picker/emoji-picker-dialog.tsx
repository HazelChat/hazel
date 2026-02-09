"use client"

import { type ReactElement, useCallback, useEffect, useRef, useState } from "react"
import { Dialog, DialogTrigger, Popover } from "react-aria-components"
import { useOrganization } from "~/hooks/use-organization"
import { CustomEmojiSection } from "./custom-emoji-section"
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
	const [searchQuery, setSearchQuery] = useState("")
	const pickerRef = useRef<HTMLDivElement>(null)
	const { organizationId } = useOrganization()

	const handleEmojiSelect = (emoji: { emoji: string; label: string }) => {
		onEmojiSelect(emoji)
		setIsOpen(false)
	}

	// Mirror frimousse search input value to our state for custom emoji filtering
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery("")
			return
		}

		const picker = pickerRef.current
		if (!picker) return

		const searchInput = picker.querySelector<HTMLInputElement>('[data-slot="emoji-picker-search"]')
		if (!searchInput) return

		const handleInput = () => {
			setSearchQuery(searchInput.value)
		}

		searchInput.addEventListener("input", handleInput)
		return () => searchInput.removeEventListener("input", handleInput)
	}, [isOpen])

	const handleCustomEmojiSelect = useCallback(
		(emoji: { emoji: string; label: string }) => {
			handleEmojiSelect(emoji)
		},
		[onEmojiSelect],
	)

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			{children}
			<Popover>
				<Dialog aria-label="Emoji picker" className="rounded-lg">
					<div ref={pickerRef}>
						<EmojiPicker className="h-[420px]" onEmojiSelect={handleEmojiSelect}>
							<EmojiPickerSearch />
							<EmojiPickerContent />
							{organizationId && (
								<CustomEmojiSection
									organizationId={organizationId}
									searchQuery={searchQuery}
									onEmojiSelect={handleCustomEmojiSelect}
								/>
							)}
							<EmojiPickerFooter />
						</EmojiPicker>
					</div>
				</Dialog>
			</Popover>
		</DialogTrigger>
	)
}

export { EmojiPickerDialog }

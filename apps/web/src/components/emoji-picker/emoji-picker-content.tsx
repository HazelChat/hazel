"use client"

import { Loading01 } from "@untitledui/icons"
import {
	type EmojiPickerListCategoryHeaderProps,
	type EmojiPickerListEmojiProps,
	type EmojiPickerListRowProps,
	EmojiPicker as EmojiPickerPrimitive,
} from "frimousse"
import type * as React from "react"
import { cn } from "~/lib/utils"

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
	return (
		<div {...props} className="scroll-my-1 px-1" data-slot="emoji-picker-row">
			{children}
		</div>
	)
}

function EmojiPickerEmoji({ emoji, className, ...props }: EmojiPickerListEmojiProps) {
	return (
		<button
			{...props}
			className={cn(
				"flex size-7 items-center justify-center rounded-sm text-base data-[active]:bg-accent",
				className,
			)}
			data-slot="emoji-picker-emoji"
		>
			{emoji.emoji}
		</button>
	)
}

function EmojiPickerCategoryHeader({ category, ...props }: EmojiPickerListCategoryHeaderProps) {
	return (
		<div
			{...props}
			className="bg-bg px-3 pt-3.5 pb-2 text-secondary-fg text-xs leading-none"
			data-slot="emoji-picker-category-header"
		>
			{category.label}
		</div>
	)
}

function EmojiPickerContent({
	className,
	...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Viewport>) {
	return (
		<EmojiPickerPrimitive.Viewport
			className={cn("relative flex-1 outline-hidden", className)}
			data-slot="emoji-picker-viewport"
			{...props}
		>
			<EmojiPickerPrimitive.Loading
				className="absolute inset-0 flex items-center justify-center text-muted-fg"
				data-slot="emoji-picker-loading"
			>
				<Loading01 className="size-4 animate-spin" />
			</EmojiPickerPrimitive.Loading>
			<EmojiPickerPrimitive.Empty
				className="absolute inset-0 flex items-center justify-center text-secondary-fg text-sm"
				data-slot="emoji-picker-empty"
			>
				No emoji found.
			</EmojiPickerPrimitive.Empty>
			<EmojiPickerPrimitive.List
				className="select-none pb-1"
				components={{
					Row: EmojiPickerRow,
					Emoji: EmojiPickerEmoji,
					CategoryHeader: EmojiPickerCategoryHeader,
				}}
				data-slot="emoji-picker-list"
			/>
		</EmojiPickerPrimitive.Viewport>
	)
}

export { EmojiPickerContent }

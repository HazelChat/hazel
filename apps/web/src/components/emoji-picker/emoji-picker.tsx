"use client"

import { EmojiPicker as EmojiPickerPrimitive } from "frimousse"
import type * as React from "react"
import { cn } from "~/lib/utils"

function EmojiPicker({ className, ...props }: React.ComponentProps<typeof EmojiPickerPrimitive.Root>) {
	return (
		<EmojiPickerPrimitive.Root
			className={cn(
				"isolate flex h-full w-fit flex-col overflow-hidden rounded-md border-border bg-secondary text-fg",
				className,
			)}
			data-slot="emoji-picker"
			{...props}
		/>
	)
}

export { EmojiPicker }

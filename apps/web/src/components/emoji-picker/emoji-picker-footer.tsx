"use client"

import { EmojiPicker as EmojiPickerPrimitive } from "frimousse"
import type * as React from "react"
import { cn } from "~/lib/utils"

function EmojiPickerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex w-full min-w-0 max-w-(--frimousse-viewport-width) items-center gap-1 border-border border-t p-2",
				className,
			)}
			data-slot="emoji-picker-footer"
			{...props}
		>
			<EmojiPickerPrimitive.ActiveEmoji>
				{({ emoji }) =>
					emoji ? (
						<>
							<div className="flex size-7 flex-none items-center justify-center text-lg">
								{emoji.emoji}
							</div>
							<span className="truncate text-secondary-fg text-xs">{emoji.label}</span>
						</>
					) : (
						<span className="ml-1.5 flex h-7 items-center truncate text-secondary-fg text-xs">
							Select an emoji…
						</span>
					)
				}
			</EmojiPickerPrimitive.ActiveEmoji>
		</div>
	)
}

export { EmojiPickerFooter }

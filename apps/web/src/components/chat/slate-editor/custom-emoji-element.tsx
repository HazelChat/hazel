"use client"

import { Focusable } from "react-aria-components"
import type { RenderElementProps } from "slate-react"
import { EmojiPreview } from "~/components/emoji-preview"
import { Tooltip, TooltipContent } from "~/components/ui/tooltip"
import type { CustomEmojiElement as CustomEmojiElementType } from "./types"

interface CustomEmojiElementProps extends RenderElementProps {
	element: CustomEmojiElementType
}

export function CustomEmojiElement({ attributes, children, element }: CustomEmojiElementProps) {
	return (
		<Tooltip delay={300} closeDelay={0}>
			<Focusable>
				<span {...attributes} contentEditable={false}>
					<img
						src={element.imageUrl}
						alt={`:${element.name}:`}
						className="inline-block size-5 align-text-bottom"
					/>
					{children}
				</span>
			</Focusable>
			<TooltipContent>
				<EmojiPreview customEmojiUrl={element.imageUrl} shortcode={element.name} size="sm" />
			</TooltipContent>
		</Tooltip>
	)
}

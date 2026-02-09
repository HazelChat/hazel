"use client"

import type { RenderElementProps } from "slate-react"
import type { CustomEmojiElement as CustomEmojiElementType } from "./types"

interface CustomEmojiElementProps extends RenderElementProps {
	element: CustomEmojiElementType
}

export function CustomEmojiElement({ attributes, children, element }: CustomEmojiElementProps) {
	return (
		<span {...attributes} contentEditable={false}>
			<img
				src={element.imageUrl}
				alt={`:${element.name}:`}
				className="inline-block size-5 align-text-bottom"
			/>
			{children}
		</span>
	)
}

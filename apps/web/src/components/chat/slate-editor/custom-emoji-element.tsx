"use client"

import type { RenderElementProps } from "slate-react"
import { useEmojiTooltip } from "./emoji-tooltip-provider"
import type { CustomEmojiElement as CustomEmojiElementType } from "./types"

interface CustomEmojiElementProps extends RenderElementProps {
	element: CustomEmojiElementType
}

export function CustomEmojiElement({ attributes, children, element }: CustomEmojiElementProps) {
	const tooltipCtx = useEmojiTooltip()

	return (
		<span
			{...attributes}
			contentEditable={false}
			onMouseEnter={
				tooltipCtx
					? (e) =>
							tooltipCtx.show(
								{ customEmojiUrl: element.imageUrl, shortcode: element.name },
								e.currentTarget,
							)
					: undefined
			}
			onMouseLeave={tooltipCtx ? () => tooltipCtx.hide() : undefined}
		>
			<img
				src={element.imageUrl}
				alt={`:${element.name}:`}
				className="inline-block size-5 align-text-bottom"
			/>
			{children}
		</span>
	)
}

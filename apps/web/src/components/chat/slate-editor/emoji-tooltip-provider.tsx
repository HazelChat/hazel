"use client"

import { useCallback, useRef } from "react"
import { EmojiPreview } from "~/components/emoji-preview"
import { useDataTooltip } from "~/hooks/use-data-tooltip"

interface EmojiTooltipData {
	emoji?: string
	customEmojiUrl?: string
	shortcode: string
}

const SELECTOR = "[data-emoji-tooltip]"

export function EmojiTooltipProvider({ children }: { children: React.ReactNode }) {
	const containerRef = useRef<HTMLDivElement>(null)

	const extractData = useCallback((el: HTMLElement): EmojiTooltipData | null => {
		const shortcode = el.dataset.shortcode
		if (!shortcode) return null

		return {
			emoji: el.dataset.emoji,
			customEmojiUrl: el.dataset.customEmojiUrl,
			shortcode,
		}
	}, [])

	const { visible, data, anchor } = useDataTooltip(containerRef, SELECTOR, extractData)

	return (
		<div ref={containerRef} className="relative">
			{children}
			{visible && data && (
				<div
					className="pointer-events-none fixed z-50 rounded-lg border border-overlay bg-overlay px-3 py-2 shadow-lg"
					style={{
						left: anchor.x,
						top: anchor.y,
						transform: "translate(-50%, -100%) translateY(-8px)",
					}}
				>
					<EmojiPreview
						emoji={data.emoji}
						customEmojiUrl={data.customEmojiUrl}
						shortcode={data.shortcode}
						size="sm"
					/>
				</div>
			)}
		</div>
	)
}

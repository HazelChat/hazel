"use client"

import type { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { embedSectionStyles, useEmbedContext } from "./embed"

export interface EmbedBadge {
	text: string
	color?: number
}

export interface EmbedAuthorProps {
	/** URL for the author's icon/logo */
	iconUrl?: string
	/** Author/source name to display */
	name: ReactNode
	/** Optional URL to link the author name */
	url?: string
	/** Additional content to render on the right side (e.g., status badge) */
	trailing?: ReactNode
	/** Status badge from embed data (rendered if no custom trailing) */
	badge?: EmbedBadge
	/** Additional class names */
	className?: string
}

/** Convert integer color to hex string */
function colorToHex(color: number): string {
	return `#${color.toString(16).padStart(6, "0")}`
}

/**
 * Author row for the embed - typically shows provider branding.
 * Example: [Linear icon] ENG-123 [Status badge]
 */
export function EmbedAuthor({ iconUrl, name, url, trailing, badge, className }: EmbedAuthorProps) {
	const { accentColor } = useEmbedContext()

	const nameElement = <span className="font-medium font-mono text-fg text-xs">{name}</span>

	// Render badge if provided and no custom trailing
	const badgeElement = badge && (
		<span
			className="rounded-full px-2 py-0.5 font-medium text-[11px]"
			style={{
				backgroundColor: badge.color ? `${colorToHex(badge.color)}18` : "var(--color-muted)",
				color: badge.color ? colorToHex(badge.color) : "var(--color-muted-fg)",
			}}
		>
			{badge.text}
		</span>
	)

	const trailingContent = trailing ?? badgeElement

	return (
		<div
			className={cn(embedSectionStyles({ position: "top" }), "flex items-center gap-2", className)}
			style={{
				background: accentColor
					? `linear-gradient(to right, ${accentColor}08, transparent)`
					: undefined,
			}}
		>
			{iconUrl && <img src={iconUrl} alt="" className="size-5 rounded-sm" />}

			{url ? (
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="hover:underline"
					onClick={(e) => e.stopPropagation()}
				>
					{nameElement}
				</a>
			) : (
				nameElement
			)}

			{trailingContent && <div className="ml-auto flex items-center gap-2">{trailingContent}</div>}
		</div>
	)
}

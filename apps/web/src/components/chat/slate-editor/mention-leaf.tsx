"use client"

import type { RenderLeafProps } from "slate-react"
import { MarkdownLeaf } from "./slate-markdown-decorators"

interface MentionLeafProps extends RenderLeafProps {
	/** Whether to make mentions interactive (clickable) */
	interactive?: boolean
	/** Render mode: "composer" shows markdown syntax, "viewer" hides markers */
	mode?: "composer" | "viewer"
}

/**
 * Leaf renderer for markdown text (no longer handles mentions - they are elements now)
 * This is now just a simple wrapper around MarkdownLeaf
 */
export function MentionLeaf({
	interactive = false,
	mode = "composer",
	leaf,
	children,
	...props
}: MentionLeafProps) {
	// Mentions are now handled as void inline elements, not as decorated text
	// This component now only handles markdown styling
	return (
		<MarkdownLeaf {...props} leaf={leaf} mode={mode}>
			{children}
		</MarkdownLeaf>
	)
}

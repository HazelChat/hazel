"use client"

import type { RenderLeafProps } from "slate-react"
import { LINK_PATTERN, type MarkdownDecorationType, MarkdownLeaf } from "./slate-markdown-decorators"

interface LinkLeafProps extends RenderLeafProps {
	/** Whether to make links interactive (clickable) */
	interactive?: boolean
	/** Render mode: "composer" shows markdown syntax, "viewer" hides markers */
	mode?: "composer" | "viewer"
}

/**
 * Leaf renderer with interactive links support
 * Extends MarkdownLeaf to add click handlers for links
 */
export function LinkLeaf({
	interactive = false,
	mode = "composer",
	leaf,
	children,
	...props
}: LinkLeafProps) {
	// Check if this leaf is a link - MUST be before any hooks
	const markdownType = (leaf as any).type as MarkdownDecorationType | undefined
	const isLink = markdownType === "link"

	// If not a link, just use the regular MarkdownLeaf
	if (!isLink) {
		return (
			<MarkdownLeaf {...props} leaf={leaf} mode={mode}>
				{children}
			</MarkdownLeaf>
		)
	}

	// Extract URL and text from the link
	const text = (leaf as any).text as string
	if (!text) {
		return (
			<MarkdownLeaf {...props} leaf={leaf} mode={mode}>
				{children}
			</MarkdownLeaf>
		)
	}

	// Parse the link: [text](url)
	const match = text.match(LINK_PATTERN)
	if (!match) {
		return (
			<MarkdownLeaf {...props} leaf={leaf} mode={mode}>
				{children}
			</MarkdownLeaf>
		)
	}

	const linkText = match[1] // The display text
	const url = match[2] // The URL

	// If not interactive (composer mode), just render styled text
	if (!interactive) {
		return (
			<MarkdownLeaf {...props} leaf={leaf} mode={mode}>
				{mode === "viewer" ? linkText : children}
			</MarkdownLeaf>
		)
	}

	// Render interactive link (viewer mode)
	return (
		<a
			{...props.attributes}
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="cursor-pointer text-primary underline hover:text-primary-hover"
			onClick={(e) => {
				// Prevent Slate from handling the click
				e.stopPropagation()
			}}
		>
			{linkText}
		</a>
	)
}

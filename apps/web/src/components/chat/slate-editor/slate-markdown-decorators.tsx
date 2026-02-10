import type { BaseRange } from "slate"
import type { RenderLeafProps } from "slate-react"
import { Focusable } from "react-aria-components"
import { EmojiPreview } from "~/components/emoji-preview"
import { Tooltip, TooltipContent } from "~/components/ui/tooltip"

// Markdown patterns for Discord-style highlighting
const MARKDOWN_PATTERNS = [
	{
		pattern: /(\*\*)([^*]+)(\*\*)/g,
		type: "bold" as const,
	},
	{
		pattern: /(\*)([^*]+)(\*)/g,
		type: "italic" as const,
	},
	{
		pattern: /(~~)([^~]+)(~~)/g,
		type: "strikethrough" as const,
	},
	{
		pattern: /(`)([^`]+)(`)/g,
		type: "code" as const,
	},
	{
		pattern: /(__)([^_]+)(__)/g,
		type: "underline" as const,
	},
	{
		pattern: /(_)([^_]+)(_)/g,
		type: "italic" as const,
	},
	{
		pattern: /(==)([^=]+)(==)/g,
		type: "highlight" as const,
	},
	{
		pattern: /(\|\|)([^|]+)(\|\|)/g,
		type: "spoiler" as const,
	},
] as const

// Link pattern: [text](url)
export const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g

// Plain URL pattern: matches http(s):// or www. URLs
export const URL_PATTERN = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/g

export type MarkdownDecorationType = (typeof MARKDOWN_PATTERNS)[number]["type"] | "link" | "url"

export interface MarkdownRange extends BaseRange {
	[key: string]: unknown
	type: MarkdownDecorationType
	isMarker?: boolean
	url?: string
	linkText?: string
}

/**
 * Decorate text nodes with markdown syntax highlighting
 * This makes the markdown tokens visible but styled (Discord-style)
 * @param entry - The node and path tuple
 * @param parentElement - Optional parent element to check type
 */
export function decorateMarkdown(entry: [node: any, path: number[]], parentElement?: any): MarkdownRange[] {
	const [node, path] = entry
	const ranges: MarkdownRange[] = []

	if (!node.text) {
		return ranges
	}

	// Skip markdown decoration in code blocks
	if (parentElement?.type === "code-block") {
		return ranges
	}

	const text = node.text

	// Decorate markdown links (high priority)
	const linkMatches = text.matchAll(LINK_PATTERN)
	for (const match of linkMatches) {
		if (match.index === undefined) continue

		const fullMatch = match[0] // Full match: [text](url)
		const linkText = match[1] // Captured text between [ ]
		const url = match[2] // Captured URL between ( )

		// Mark entire link as a single range with metadata
		ranges.push({
			anchor: { path, offset: match.index },
			focus: { path, offset: match.index + fullMatch.length },
			type: "link",
			isMarker: false,
			url,
			linkText,
		})
	}

	// Decorate plain URLs (lower priority than markdown links)
	const urlMatches = text.matchAll(URL_PATTERN)
	for (const match of urlMatches) {
		if (match.index === undefined) continue

		const url = match[0]

		// Skip if this URL is part of a markdown link
		const overlapsMarkdownLink = ranges.some(
			(range) =>
				range.type === "link" &&
				match.index !== undefined &&
				match.index >= range.anchor.offset &&
				match.index < range.focus.offset,
		)
		if (overlapsMarkdownLink) continue

		// Normalize URL (add https:// if it starts with www.)
		const normalizedUrl = url.startsWith("www.") ? `https://${url}` : url

		ranges.push({
			anchor: { path, offset: match.index },
			focus: { path, offset: match.index + url.length },
			type: "url",
			isMarker: false,
			url: normalizedUrl,
		})
	}

	// Decorate other markdown patterns
	for (const { pattern, type } of MARKDOWN_PATTERNS) {
		const matches = text.matchAll(pattern)

		for (const match of matches) {
			if (match.index === undefined) continue

			const fullMatch = match[0]
			const openMarker = match[1]
			const content = match[2]
			const closeMarker = match[3]

			// Skip if the markers are escaped or incomplete
			if (!openMarker || !content || !closeMarker) continue

			// Skip if this overlaps with a link
			const specialOverlap = ranges.some(
				(range) =>
					range.type === "link" &&
					match.index !== undefined &&
					match.index < range.focus.offset &&
					match.index + fullMatch.length > range.anchor.offset,
			)
			if (specialOverlap) continue

			// Opening marker range
			ranges.push({
				anchor: { path, offset: match.index },
				focus: { path, offset: match.index + openMarker.length },
				type,
				isMarker: true,
			})

			// Content range
			ranges.push({
				anchor: { path, offset: match.index + openMarker.length },
				focus: { path, offset: match.index + openMarker.length + content.length },
				type,
				isMarker: false,
			})

			// Closing marker range
			ranges.push({
				anchor: { path, offset: match.index + openMarker.length + content.length },
				focus: { path, offset: match.index + fullMatch.length },
				type,
				isMarker: true,
			})
		}
	}

	return ranges
}

export interface MarkdownLeafProps extends RenderLeafProps {
	/** Render mode: "composer" shows markdown syntax, "viewer" hides markers */
	mode?: "composer" | "viewer"
}

/**
 * Render leaf with markdown styling and code syntax highlighting
 * Markers are dimmed, content is styled, code tokens get Prism classes
 */
export function MarkdownLeaf({ attributes, children, leaf, mode = "composer" }: MarkdownLeafProps) {
	// Check for emoji decoration — runs before markdown so emoji inside bold/italic still gets tooltip
	const leafRecord = leaf as unknown as Record<string, unknown>
	if (leafRecord.type === "emoji" && leafRecord.shortcode) {
		const emoji = leafRecord.emoji as string
		const shortcode = leafRecord.shortcode as string
		return (
			<Tooltip delay={300} closeDelay={0}>
				<Focusable>
					<span {...attributes}>{children}</span>
				</Focusable>
				<TooltipContent>
					<EmojiPreview emoji={emoji} shortcode={shortcode} size="sm" />
				</TooltipContent>
			</Tooltip>
		)
	}

	// Base classes for all markdown leaves
	let className = ""

	// Check if this is a code token from Prism decoration
	if (leafRecord.token) {
		// Build className from all token types (e.g., "token keyword", "token function")
		const tokenClasses: string[] = ["token"]
		for (const key in leafRecord) {
			if (key !== "text" && key !== "token" && leafRecord[key] === true) {
				tokenClasses.push(key)
			}
		}
		className = tokenClasses.join(" ")
	} else {
		// Check if this leaf has markdown decoration
		const markdownLeaf = leaf as unknown as Partial<MarkdownRange>
		const markdownType = markdownLeaf.type
		const isMarker = markdownLeaf.isMarker
		const url = markdownLeaf.url
		const linkText = markdownLeaf.linkText

		// Handle markdown links [text](url) - render as actual <a> tag
		if (markdownType === "link" && url && linkText) {
			return (
				<a
					{...attributes}
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="cursor-pointer text-primary underline hover:text-primary-hover"
				>
					{linkText}
				</a>
			)
		}

		// Handle plain URLs - render as actual <a> tag
		if (markdownType === "url" && url) {
			return (
				<a
					{...attributes}
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="cursor-pointer text-primary underline hover:text-primary-hover"
				>
					{children}
				</a>
			)
		}

		if (markdownType) {
			if (isMarker) {
				// In viewer mode, hide markers completely
				if (mode === "viewer") {
					className = "hidden"
				} else {
					// In composer mode, style the markers (**, *, ~~, `, etc.) - make them dimmed
					className = "text-muted-fg/50 select-none"
				}
			} else {
				// Style the content based on type
				switch (markdownType) {
					case "bold":
						className = "font-bold"
						break
					case "italic":
						className = "italic"
						break
					case "strikethrough":
						className = "line-through"
						break
					case "code":
						className = "bg-accent/50 rounded px-1 py-0.5 font-mono text-sm"
						break
					case "underline":
						className = "underline"
						break
					case "highlight":
						className = "bg-highlight rounded px-0.5"
						break
					case "spoiler":
						className = "bg-muted blur-sm hover:blur-none transition-all"
						break
				}
			}
		}
	}

	return (
		<span {...attributes} className={className}>
			{children}
		</span>
	)
}

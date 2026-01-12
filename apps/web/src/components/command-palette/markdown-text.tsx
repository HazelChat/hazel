import type { ReactNode } from "react"

interface MarkdownTextProps {
	text: string
	searchQuery?: string
	className?: string
}

type TagType = "strong" | "em" | "s" | "u" | "mark" | "code"

// Markdown patterns ordered by priority (longer markers first to avoid conflicts)
const MARKDOWN_PATTERNS: Array<{ pattern: RegExp; tag: TagType; className: string }> = [
	{ pattern: /\*\*([^*]+)\*\*/g, tag: "strong", className: "font-bold" },
	{ pattern: /~~([^~]+)~~/g, tag: "s", className: "line-through" },
	{ pattern: /__([^_]+)__/g, tag: "u", className: "underline" },
	{ pattern: /==([^=]+)==/g, tag: "mark", className: "bg-highlight rounded px-0.5" },
	{ pattern: /`([^`]+)`/g, tag: "code", className: "bg-accent/50 rounded px-1 py-0.5 font-mono text-xs" },
	{ pattern: /\*([^*]+)\*/g, tag: "em", className: "italic" },
	{ pattern: /_([^_]+)_/g, tag: "em", className: "italic" },
]

interface Segment {
	text: string
	style: string
	tag: TagType | null
}

/**
 * Parse text into segments with markdown styling
 */
function parseMarkdown(text: string): Segment[] {
	// Track which ranges have formatting applied
	interface Range {
		start: number
		end: number
		style: string
		tag: TagType
		contentStart: number
		contentEnd: number
	}

	const ranges: Range[] = []

	// Find all markdown matches
	for (const { pattern, tag, className } of MARKDOWN_PATTERNS) {
		const regex = new RegExp(pattern.source, pattern.flags)
		let match: RegExpExecArray | null
		while ((match = regex.exec(text)) !== null) {
			const fullMatch = match[0]
			const content = match[1]
			if (!content) continue

			const start = match.index
			const end = start + fullMatch.length

			// Calculate content boundaries (excluding markers)
			const markerLength = (fullMatch.length - content.length) / 2
			const contentStart = start + markerLength
			const contentEnd = contentStart + content.length

			// Check for overlaps with existing ranges
			const overlaps = ranges.some(
				(r) =>
					(start >= r.start && start < r.end) ||
					(end > r.start && end <= r.end) ||
					(start <= r.start && end >= r.end),
			)

			if (!overlaps) {
				ranges.push({
					start,
					end,
					style: className,
					tag,
					contentStart,
					contentEnd,
				})
			}
		}
	}

	// Sort ranges by start position
	ranges.sort((a, b) => a.start - b.start)

	// Build segments
	const segments: Segment[] = []
	let currentPos = 0

	for (const range of ranges) {
		// Add plain text before this range
		if (range.start > currentPos) {
			segments.push({
				text: text.slice(currentPos, range.start),
				style: "",
				tag: null,
			})
		}

		// Add the styled content (without markers)
		segments.push({
			text: text.slice(range.contentStart, range.contentEnd),
			style: range.style,
			tag: range.tag,
		})

		currentPos = range.end
	}

	// Add remaining text
	if (currentPos < text.length) {
		segments.push({
			text: text.slice(currentPos),
			style: "",
			tag: null,
		})
	}

	// If no segments, return the original text as a single segment
	if (segments.length === 0) {
		return [{ text, style: "", tag: null }]
	}

	return segments
}

/**
 * Apply search query highlighting to text
 */
function highlightSearchQuery(text: string, query: string): ReactNode[] {
	if (!query.trim()) return [text]

	const parts: ReactNode[] = []
	const loweredText = text.toLowerCase()
	const loweredQuery = query.toLowerCase()
	let lastIndex = 0
	let index = loweredText.indexOf(loweredQuery)
	let keyCounter = 0

	while (index !== -1) {
		// Add text before match
		if (index > lastIndex) {
			parts.push(text.slice(lastIndex, index))
		}

		// Add highlighted match
		parts.push(
			<mark key={keyCounter++} className="bg-warning/30 text-inherit">
				{text.slice(index, index + query.length)}
			</mark>,
		)

		lastIndex = index + query.length
		index = loweredText.indexOf(loweredQuery, lastIndex)
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex))
	}

	return parts.length > 0 ? parts : [text]
}

/**
 * Render a segment with its styling
 */
function renderSegment(segment: Segment, searchQuery: string, key: number): ReactNode {
	const content = highlightSearchQuery(segment.text, searchQuery)

	if (!segment.tag) {
		return <span key={key}>{content}</span>
	}

	// Render with the appropriate tag
	switch (segment.tag) {
		case "strong":
			return (
				<strong key={key} className={segment.style}>
					{content}
				</strong>
			)
		case "em":
			return (
				<em key={key} className={segment.style}>
					{content}
				</em>
			)
		case "s":
			return (
				<s key={key} className={segment.style}>
					{content}
				</s>
			)
		case "u":
			return (
				<u key={key} className={segment.style}>
					{content}
				</u>
			)
		case "mark":
			return (
				<mark key={key} className={segment.style}>
					{content}
				</mark>
			)
		case "code":
			return (
				<code key={key} className={segment.style}>
					{content}
				</code>
			)
	}
}

/**
 * Lightweight component for rendering inline markdown with search highlighting.
 * Supports: **bold**, *italic*, _italic_, ~~strikethrough~~, `code`, __underline__, ==highlight==
 */
export function MarkdownText({ text, searchQuery = "", className }: MarkdownTextProps) {
	const segments = parseMarkdown(text)

	return <p className={className}>{segments.map((segment, i) => renderSegment(segment, searchQuery, i))}</p>
}

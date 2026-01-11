import type { BaseRange, NodeEntry, Text } from "slate"
import type { RenderLeafProps } from "slate-react"
import type { FilterType } from "~/lib/search-filter-parser"

/**
 * Search filter decoration types
 */
export interface SearchFilterRange extends BaseRange {
	filterKeyword?: boolean
	filterValue?: boolean
	filterType?: FilterType
}

// Pattern to match filter:value pairs
// Captures: (filter_keyword)(:)(value OR "quoted value")
const FILTER_PATTERN = /\b(from|in|has|before|after)(:)("([^"]+)"|(\S*))/gi

/**
 * Decorate text nodes with search filter syntax highlighting
 * Highlights filter keywords (from:, in:, etc.) in primary color
 */
export function decorateSearchFilters(entry: NodeEntry<Text>): SearchFilterRange[] {
	const [node, path] = entry
	const ranges: SearchFilterRange[] = []

	if (!node.text) {
		return ranges
	}

	const text = node.text

	// Reset regex
	FILTER_PATTERN.lastIndex = 0

	let match: RegExpExecArray | null
	while ((match = FILTER_PATTERN.exec(text)) !== null) {
		if (match.index === undefined) continue

		const keyword = match[1] // "from", "in", etc.
		const colon = match[2] // ":"
		const fullValue = match[3] || "" // value including quotes if present

		// Skip if match groups are undefined
		if (!keyword || !colon) continue

		const filterType = keyword.toLowerCase() as FilterType

		// Highlight the keyword + colon (e.g., "from:")
		const keywordEnd = match.index + keyword.length + colon.length
		ranges.push({
			anchor: { path, offset: match.index },
			focus: { path, offset: keywordEnd },
			filterKeyword: true,
			filterType,
		})

		// Highlight the value if present
		if (fullValue) {
			ranges.push({
				anchor: { path, offset: keywordEnd },
				focus: { path, offset: keywordEnd + fullValue.length },
				filterValue: true,
				filterType,
			})
		}
	}

	return ranges
}

/**
 * Render leaf with search filter styling
 */
export function SearchFilterLeaf({ attributes, children, leaf }: RenderLeafProps) {
	const filterLeaf = leaf as unknown as Partial<SearchFilterRange>

	let className = ""

	if (filterLeaf.filterKeyword) {
		// Filter keywords (from:, in:, etc.) in primary color
		className = "text-primary font-medium"
	} else if (filterLeaf.filterValue) {
		// Filter values in normal text color (optional: could style differently)
		className = "text-fg"
	}

	return (
		<span {...attributes} className={className}>
			{children}
		</span>
	)
}

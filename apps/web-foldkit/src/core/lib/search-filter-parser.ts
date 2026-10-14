/**
 * Discord-style search filter parser
 * Supports: from:username, in:channel-name, has:image|file|link, before:date, after:date
 */

export type FilterType = "from" | "in" | "has" | "before" | "after"

export const VALID_FILTER_TYPES: FilterType[] = ["from", "in", "has", "before", "after"]

export const HAS_FILTER_VALUES = ["image", "file", "link", "embed"] as const
export type HasFilterValue = (typeof HAS_FILTER_VALUES)[number]

export interface SearchFilter {
	type: FilterType
	value: string
	displayValue: string
	id: string
}

export interface RawFilter {
	type: FilterType
	value: string
	raw: string
}

export interface PartialFilter {
	type: FilterType
	partial: string
}

export interface ParsedSearchInput {
	textQuery: string
	filters: RawFilter[]
	partialFilter: PartialFilter | null
}

// Regex to match completed filters: type:value or type:"quoted value"
const FILTER_REGEX = /\b(from|in|has|before|after):("([^"]+)"|(\S+))/gi

// Regex to detect partial filter being typed at end of string
const PARTIAL_FILTER_REGEX = /\b(from|in|has|before|after):([^"\s]*)$/i

/**
 * Parse search input to extract filters and remaining text query
 */
export function parseSearchInput(input: string): ParsedSearchInput {
	const filters: RawFilter[] = []
	let remainder = input
	let partialFilter: PartialFilter | null = null

	// First, check for partial filter at the end (user is still typing)
	const partialMatch = PARTIAL_FILTER_REGEX.exec(input)
	if (partialMatch && partialMatch[1] && partialMatch[2] !== undefined) {
		const type = partialMatch[1].toLowerCase() as FilterType
		const partial = partialMatch[2]

		// Only treat as partial if there's no space after the colon
		// and the value doesn't look complete
		if (partial === "" || !partial.includes(" ")) {
			partialFilter = { type, partial }
			// Remove partial filter from remainder for text query
			remainder = remainder.slice(0, partialMatch.index).trim()
		}
	}

	// Extract completed filters
	let match: RegExpExecArray | null
	const completedFilterPositions: { start: number; end: number }[] = []

	// Reset regex lastIndex
	FILTER_REGEX.lastIndex = 0

	while ((match = FILTER_REGEX.exec(input)) !== null) {
		if (!match[1]) continue
		const type = match[1].toLowerCase() as FilterType
		const value = match[3] || match[4] || "" // Quoted or unquoted value

		// Skip if this overlaps with partial filter
		if (
			partialFilter &&
			match.index + match[0].length >=
				input.length - (partialFilter.partial.length + partialFilter.type.length + 1)
		) {
			continue
		}

		filters.push({
			type,
			value,
			raw: match[0],
		})

		completedFilterPositions.push({
			start: match.index,
			end: match.index + match[0].length,
		})
	}

	// Remove all completed filters from remainder to get text query
	// Process in reverse order to maintain correct indices
	completedFilterPositions.sort((a, b) => b.start - a.start)
	for (const pos of completedFilterPositions) {
		remainder = remainder.slice(0, pos.start) + remainder.slice(pos.end)
	}

	// Clean up the text query
	const textQuery = remainder.replace(/\s+/g, " ").trim()

	return {
		textQuery,
		filters,
		partialFilter,
	}
}

/**
 * Serialize filters back to string format
 */
export function serializeFilters(filters: SearchFilter[]): string {
	return filters
		.map((f) => {
			const value = f.value.includes(" ") ? `"${f.value}"` : f.value
			return `${f.type}:${value}`
		})
		.join(" ")
}

/**
 * Build full search string from filters and text query
 */
export function buildSearchString(filters: SearchFilter[], textQuery: string): string {
	const filterString = serializeFilters(filters)
	return [filterString, textQuery].filter(Boolean).join(" ")
}

/**
 * Check if a filter type supports autocomplete suggestions
 */
export function filterTypeSupportsAutocomplete(type: FilterType): boolean {
	return type === "from" || type === "in" || type === "has"
}

/**
 * Parse date string for before/after filters
 * Supports: YYYY-MM-DD, "yesterday", "lastweek", "lastmonth"
 */
export function parseDateFilter(value: string): Date | null {
	const lowered = value.toLowerCase()

	// Handle relative dates
	const now = new Date()
	switch (lowered) {
		case "today":
			return new Date(now.getFullYear(), now.getMonth(), now.getDate())
		case "yesterday":
			return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
		case "lastweek":
			return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
		case "lastmonth":
			return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
	}

	// Try ISO date format
	const isoDate = new Date(value)
	if (!Number.isNaN(isoDate.getTime())) {
		return isoDate
	}

	return null
}

/**
 * Get human-readable label for filter type
 */
export function getFilterTypeLabel(type: FilterType): string {
	switch (type) {
		case "from":
			return "From"
		case "in":
			return "In"
		case "has":
			return "Has"
		case "before":
			return "Before"
		case "after":
			return "After"
	}
}

/**
 * Token types for syntax highlighting
 */
export type InputTokenType = "filter-keyword" | "filter-value" | "text"

export interface InputToken {
	type: InputTokenType
	text: string
	filterType?: FilterType
}

// Regex to match filter patterns for tokenization (captures keyword and value separately)
const TOKEN_FILTER_REGEX = /\b(from|in|has|before|after):("([^"]+)"|(\S*))/gi

/**
 * Tokenize search input for syntax highlighting
 * Returns an array of tokens that can be styled differently
 */
export function tokenizeSearchInput(input: string): InputToken[] {
	if (!input) return []

	const tokens: InputToken[] = []
	let lastIndex = 0

	// Reset regex
	TOKEN_FILTER_REGEX.lastIndex = 0

	let match: RegExpExecArray | null
	while ((match = TOKEN_FILTER_REGEX.exec(input)) !== null) {
		// Add any text before this match
		if (match.index > lastIndex) {
			tokens.push({
				type: "text",
				text: input.slice(lastIndex, match.index),
			})
		}

		const filterType = match[1]?.toLowerCase() as FilterType
		const fullValue = match[2] || "" // includes quotes if present
		const keyword = `${match[1]}:`

		// Add the filter keyword (e.g., "from:")
		tokens.push({
			type: "filter-keyword",
			text: keyword,
			filterType,
		})

		// Add the filter value if present
		if (fullValue) {
			tokens.push({
				type: "filter-value",
				text: fullValue,
				filterType,
			})
		}

		lastIndex = match.index + match[0].length
	}

	// Add any remaining text after the last match
	if (lastIndex < input.length) {
		const remaining = input.slice(lastIndex)

		// Check if remaining text is a partial filter keyword (e.g., "fro" or "from:")
		const partialKeywordMatch = /^(from|in|has|before|after):?$/i.exec(remaining.trim())
		if (partialKeywordMatch && remaining.trim() === remaining) {
			// Only if it's at the end with no leading space in remaining
			tokens.push({
				type: "filter-keyword",
				text: remaining,
				filterType: partialKeywordMatch[1]?.toLowerCase() as FilterType,
			})
		} else {
			tokens.push({
				type: "text",
				text: remaining,
			})
		}
	}

	return tokens
}

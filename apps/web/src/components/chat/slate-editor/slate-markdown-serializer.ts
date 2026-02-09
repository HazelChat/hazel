import { Node } from "slate"

// Define our custom element and text types
export interface ParagraphElement {
	type: "paragraph"
	children: CustomText[]
}

export interface BlockquoteElement {
	type: "blockquote"
	children: CustomText[]
}

export interface CodeBlockElement {
	type: "code-block"
	language?: string
	children: CustomText[]
}

export interface SubtextElement {
	type: "subtext"
	children: CustomText[]
}

export interface ListItemElement {
	type: "list-item"
	ordered?: boolean
	children: CustomText[]
}

export interface MentionElement {
	type: "mention"
	userId: string
	displayName: string
	children: [{ text: "" }]
}

export interface CustomEmojiElement {
	type: "custom-emoji"
	name: string
	imageUrl: string
	children: [{ text: "" }]
}

export interface TableElement {
	type: "table"
	children: TableRowElement[]
}

export interface TableRowElement {
	type: "table-row"
	children: TableCellElement[]
}

export interface TableCellElement {
	type: "table-cell"
	header?: boolean
	align?: "left" | "center" | "right"
	children: CustomDescendant[]
}

export interface HeadingElement {
	type: "heading"
	level: 1 | 2 | 3
	children: CustomText[]
}

export interface CustomText {
	text: string
}

export type CustomElement =
	| ParagraphElement
	| BlockquoteElement
	| CodeBlockElement
	| SubtextElement
	| ListItemElement
	| MentionElement
	| CustomEmojiElement
	| TableElement
	| TableRowElement
	| TableCellElement
	| HeadingElement
export type CustomDescendant = CustomElement | CustomText

/**
 * Extract mentions from markdown text
 * Returns array of { prefix, value } for each mention found
 */
export function extractMentionsFromMarkdown(
	markdown: string,
): Array<{ prefix: "userId" | "directive"; value: string }> {
	const mentions: Array<{ prefix: "userId" | "directive"; value: string }> = []
	const pattern = /@\[(userId|directive):([^\]]+)\]/g
	let match: RegExpExecArray | null

	// biome-ignore lint/suspicious/noAssignInExpressions: regex matching pattern
	while ((match = pattern.exec(markdown)) !== null) {
		const prefix = match[1] as "userId" | "directive"
		const value = match[2]

		if (prefix && value) {
			mentions.push({
				prefix,
				value,
			})
		}
	}

	return mentions
}

/**
 * Check if text contains mention pattern
 */
export function hasMentionPattern(text: string): boolean {
	return /@\[(userId|directive):([^\]]+)\]/.test(text)
}

/**
 * Serialize Slate value to plain markdown string
 * This converts the editor content to markdown that can be sent to the backend
 */
export function serializeToMarkdown(nodes: CustomDescendant[]): string {
	return nodes
		.map((node) => {
			if ("text" in node) {
				return node.text
			}

			const element = node as CustomElement

			switch (element.type) {
				case "custom-emoji": {
					const ce = element as CustomEmojiElement
					return `![custom-emoji:${ce.name}](${ce.imageUrl})`
				}
				case "mention": {
					// Serialize mention back to markdown syntax
					const mentionElement = element as MentionElement
					const isSpecialMention =
						mentionElement.userId === "channel" || mentionElement.userId === "here"
					return isSpecialMention
						? `@[directive:${mentionElement.userId}]`
						: `@[userId:${mentionElement.userId}]`
				}
				case "paragraph": {
					// For paragraphs, we need to serialize children which might include mentions
					const text = element.children.map((child) => serializeToMarkdown([child])).join("")
					return text
				}
				case "blockquote": {
					const text = element.children.map((child) => serializeToMarkdown([child])).join("")
					// Prefix each line with "> "
					return text
						.split("\n")
						.map((line) => `> ${line}`)
						.join("\n")
				}
				case "code-block": {
					const text = Node.string(element)
					// Wrap in triple backticks with optional language
					const lang = element.language || ""
					return `\`\`\`${lang}\n${text}\n\`\`\``
				}
				case "subtext": {
					const text = element.children.map((child) => serializeToMarkdown([child])).join("")
					// Prefix with -#
					return `-# ${text}`
				}
				case "list-item": {
					const text = element.children.map((child) => serializeToMarkdown([child])).join("")
					// Prefix with - for unordered or number for ordered
					return element.ordered ? `1. ${text}` : `- ${text}`
				}
				case "table": {
					const tableElement = element as TableElement
					const rows = tableElement.children
					if (rows.length === 0) return ""

					const lines: string[] = []
					for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
						const row = rows[rowIndex]
						if (!row) continue
						const cells = row.children
						const cellTexts = cells.map((cell) =>
							cell.children.map((child) => serializeToMarkdown([child])).join(""),
						)
						lines.push(`| ${cellTexts.join(" | ")} |`)

						// After the header row (first row), add separator
						if (rowIndex === 0) {
							const separators = cells.map((cell) => {
								const align = cell.align
								if (align === "center") return ":---:"
								if (align === "right") return "---:"
								return "---"
							})
							lines.push(`| ${separators.join(" | ")} |`)
						}
					}
					return lines.join("\n")
				}
				case "table-row":
				case "table-cell": {
					// Rows and cells are handled by table parent
					return ""
				}
				case "heading": {
					const headingElement = element as HeadingElement
					const text = headingElement.children.map((child) => serializeToMarkdown([child])).join("")
					const prefix = "#".repeat(headingElement.level)
					return `${prefix} ${text}`
				}
				default: {
					const text = Node.string(element)
					return text
				}
			}
		})
		.join("\n")
}

/**
 * Parse inline mentions and custom emojis into a mixed array of text, mention, and custom-emoji nodes
 */
function parseInlineContent(text: string): Array<CustomText | MentionElement | CustomEmojiElement> {
	const nodes: Array<CustomText | MentionElement | CustomEmojiElement> = []
	// Combined pattern: mentions (@[prefix:value]) or custom emojis (![custom-emoji:name](url))
	const inlinePattern = /@\[(userId|directive):([^\]]+)\]|!\[custom-emoji:([^\]]+)\]\(([^)]+)\)/g
	let lastIndex = 0
	let match: RegExpExecArray | null

	// biome-ignore lint/suspicious/noAssignInExpressions: regex matching pattern
	while ((match = inlinePattern.exec(text)) !== null) {
		// Add text before the match
		if (match.index > lastIndex) {
			nodes.push({ text: text.slice(lastIndex, match.index) })
		}

		if (match[1] && match[2]) {
			// Mention match
			nodes.push({
				type: "mention",
				userId: match[2],
				displayName: match[2],
				children: [{ text: "" }],
			})
		} else if (match[3] && match[4]) {
			// Custom emoji match
			nodes.push({
				type: "custom-emoji",
				name: match[3],
				imageUrl: match[4],
				children: [{ text: "" }],
			})
		}

		lastIndex = match.index + match[0].length
	}

	// Add remaining text after last match
	if (lastIndex < text.length) {
		nodes.push({ text: text.slice(lastIndex) })
	}

	// If no inline elements found, return the text as-is
	if (nodes.length === 0) {
		nodes.push({ text })
	}

	return nodes
}

/**
 * Check if a line looks like a GFM table row
 */
function isTableRow(line: string): boolean {
	return line.startsWith("|") && line.endsWith("|")
}

/**
 * Check if a line is a GFM table separator row (e.g., |---|:---:|---:|)
 */
function isTableSeparator(line: string): boolean {
	if (!isTableRow(line)) return false
	// Remove outer pipes and check if all cells are separator patterns
	const inner = line.slice(1, -1)
	const cells = inner.split("|")
	return cells.every((cell) => /^\s*:?-+:?\s*$/.test(cell))
}

/**
 * Parse alignment from a separator cell (e.g., :---:, ---:, :---, ---)
 */
function parseAlignment(separator: string): "left" | "center" | "right" | undefined {
	const trimmed = separator.trim()
	const leftColon = trimmed.startsWith(":")
	const rightColon = trimmed.endsWith(":")

	if (leftColon && rightColon) return "center"
	if (rightColon) return "right"
	if (leftColon) return "left"
	return undefined
}

/**
 * Parse a table row into cell contents
 */
function parseTableRow(line: string): string[] {
	// Remove outer pipes and split by |
	const inner = line.slice(1, -1)
	return inner.split("|").map((cell) => cell.trim())
}

/**
 * Parse a GFM table from lines starting at index i
 * Returns the table element and the new index after the table
 */
function parseTable(lines: string[], startIndex: number): { table: TableElement; endIndex: number } | null {
	const tableLines: string[] = []
	let i = startIndex

	// Collect all consecutive table rows
	while (i < lines.length && lines[i] && isTableRow(lines[i]!)) {
		tableLines.push(lines[i]!)
		i++
	}

	// Need at least 2 lines (header + separator)
	if (tableLines.length < 2) return null

	// Second line must be separator
	if (!isTableSeparator(tableLines[1]!)) return null

	// Parse alignments from separator row
	const separatorCells = parseTableRow(tableLines[1]!)
	const alignments = separatorCells.map(parseAlignment)

	// Parse header row
	const headerCells = parseTableRow(tableLines[0]!)
	const headerRow: TableRowElement = {
		type: "table-row",
		children: headerCells.map((cell, idx) => ({
			type: "table-cell" as const,
			header: true,
			align: alignments[idx],
			children: parseInlineContent(cell) as CustomDescendant[],
		})),
	}

	// Parse data rows (skip header and separator)
	const dataRows: TableRowElement[] = tableLines.slice(2).map((line) => {
		const cells = parseTableRow(line)
		return {
			type: "table-row" as const,
			children: cells.map((cell, idx) => ({
				type: "table-cell" as const,
				header: false,
				align: alignments[idx],
				children: parseInlineContent(cell) as CustomDescendant[],
			})),
		}
	})

	const table: TableElement = {
		type: "table",
		children: [headerRow, ...dataRows],
	}

	return { table, endIndex: i }
}

/**
 * Deserialize markdown string to Slate value
 * This converts markdown from the backend back to Slate nodes for editing
 */
export function deserializeFromMarkdown(markdown: string): CustomDescendant[] {
	if (!markdown || markdown.trim() === "") {
		return [
			{
				type: "paragraph",
				children: [{ text: "" }],
			},
		]
	}

	const nodes: CustomDescendant[] = []
	const lines = markdown.split("\n")
	let i = 0

	while (i < lines.length) {
		const line = lines[i]
		if (!line) {
			i++
			continue
		}

		// Check for code block (```)
		if (line.startsWith("```")) {
			const languageMatch = line.match(/^```(\w+)?/)
			const language = languageMatch?.[1] || undefined
			const codeLines: string[] = []

			i++ // Skip opening ```
			while (i < lines.length) {
				const codeLine = lines[i]
				// Only break on closing ```, not on empty lines
				if (codeLine?.startsWith("```")) break
				codeLines.push(codeLine ?? "")
				i++
			}
			i++ // Skip closing ```

			nodes.push({
				type: "code-block",
				language,
				children: [{ text: codeLines.join("\n") }],
			})
			continue
		}

		// Check for headings (# ## ###)
		const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
		if (headingMatch) {
			const level = headingMatch[1]!.length as 1 | 2 | 3
			const content = headingMatch[2]!
			nodes.push({
				type: "heading",
				level,
				children: parseInlineContent(content) as CustomText[],
			})
			i++
			continue
		}

		// Check for GFM table
		if (isTableRow(line)) {
			const result = parseTable(lines, i)
			if (result) {
				nodes.push(result.table)
				i = result.endIndex
				continue
			}
		}

		// Check for multi-line blockquote (>>>)
		if (line.startsWith(">>> ")) {
			const quoteText = line.slice(4) // Remove ">>> "
			const restOfMessage = lines.slice(i + 1).join("\n")
			const fullQuote = restOfMessage ? `${quoteText}\n${restOfMessage}` : quoteText

			nodes.push({
				type: "blockquote",
				children: parseInlineContent(fullQuote) as CustomText[],
			})
			break // Multi-line quote consumes rest of message
		}

		// Check for single-line blockquote (>)
		if (line.startsWith("> ")) {
			const quoteLines: string[] = []
			while (i < lines.length) {
				const quoteLine = lines[i]
				if (!quoteLine || !quoteLine.startsWith("> ")) break
				quoteLines.push(quoteLine.slice(2)) // Remove "> "
				i++
			}

			const quoteText = quoteLines.join("\n")
			nodes.push({
				type: "blockquote",
				children: parseInlineContent(quoteText) as CustomText[],
			})
			continue
		}

		// Check for subtext (-#)
		if (line.startsWith("-# ")) {
			const subtextContent = line.slice(3) // Remove "-# "
			nodes.push({
				type: "subtext",
				children: parseInlineContent(subtextContent) as CustomText[],
			})
			i++
			continue
		}

		// Check for unordered list (- or *)
		if (line.match(/^[-*] /)) {
			const listContent = line.slice(2) // Remove "- " or "* "
			nodes.push({
				type: "list-item",
				ordered: false,
				children: parseInlineContent(listContent) as CustomText[],
			})
			i++
			continue
		}

		// Check for ordered list (1. 2. etc)
		if (line.match(/^\d+\. /)) {
			const listContent = line.replace(/^\d+\. /, "") // Remove number and ". "
			nodes.push({
				type: "list-item",
				ordered: true,
				children: parseInlineContent(listContent) as CustomText[],
			})
			i++
			continue
		}

		// Default: paragraph with inline content (including mentions)
		nodes.push({
			type: "paragraph",
			children: parseInlineContent(line) as CustomText[],
		})
		i++
	}

	return nodes.length > 0 ? nodes : [{ type: "paragraph", children: [{ text: "" }] }]
}

/**
 * Create an empty Slate value
 */
export function createEmptyValue(): CustomDescendant[] {
	return [
		{
			type: "paragraph",
			children: [{ text: "" }],
		},
	]
}

/**
 * Check if Slate value is effectively empty
 */
export function isValueEmpty(nodes: CustomDescendant[]): boolean {
	if (!nodes || nodes.length === 0) return true

	const hasMeaningfulContent = (node: CustomDescendant): boolean => {
		if ("text" in node) {
			return node.text.trim().length > 0
		}

		const element = node as CustomElement

		// Inline void nodes carry semantic content even though Node.string() is empty.
		if (element.type === "mention" || element.type === "custom-emoji") {
			return true
		}

		if ("children" in element && Array.isArray(element.children)) {
			return element.children.some((child) => hasMeaningfulContent(child as CustomDescendant))
		}

		return Node.string(element).trim().length > 0
	}

	return !nodes.some((node) => hasMeaningfulContent(node))
}

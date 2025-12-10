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
				default: {
					const text = Node.string(element)
					return text
				}
			}
		})
		.join("\n")
}

/**
 * Parse inline mentions and text into a mixed array of text and mention nodes
 */
function parseInlineContent(text: string): Array<CustomText | MentionElement> {
	const nodes: Array<CustomText | MentionElement> = []
	const mentionPattern = /@\[(userId|directive):([^\]]+)\]/g
	let lastIndex = 0
	let match: RegExpExecArray | null

	// biome-ignore lint/suspicious/noAssignInExpressions: regex matching pattern
	while ((match = mentionPattern.exec(text)) !== null) {
		// Add text before the mention
		if (match.index > lastIndex) {
			nodes.push({ text: text.slice(lastIndex, match.index) })
		}

		// Add the mention element
		const value = match[2]

		// Only add mention if value exists (type guard)
		if (value) {
			nodes.push({
				type: "mention",
				userId: value,
				displayName: value,
				children: [{ text: "" }],
			})
		}

		lastIndex = match.index + match[0].length
	}

	// Add remaining text after last mention
	if (lastIndex < text.length) {
		nodes.push({ text: text.slice(lastIndex) })
	}

	// If no mentions found, return the text as-is
	if (nodes.length === 0) {
		nodes.push({ text })
	}

	return nodes
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

	// Check if any node has actual text content
	for (const node of nodes) {
		if ("text" in node) {
			// Text node - check if it has non-whitespace content
			if (node.text.trim().length > 0) return false
		} else {
			// Element node - check if it has text content
			const element = node as CustomElement
			const textContent = Node.string(element).trim()

			if (textContent.length > 0) return false
		}
	}

	return true
}

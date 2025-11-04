import { Node } from "slate"

// Define our custom element and text types
export interface ParagraphElement {
	type: "paragraph"
	children: CustomText[]
}

export interface CustomText {
	text: string
}

export type CustomElement = ParagraphElement
export type CustomDescendant = CustomElement | CustomText

/**
 * Serialize Slate value to plain markdown string
 * This converts the editor content to markdown that can be sent to the backend
 */
export function serializeToMarkdown(nodes: CustomDescendant[]): string {
	return nodes.map((n) => Node.string(n)).join("\n")
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

	// Split by newlines to create separate paragraph nodes
	const lines = markdown.split("\n")

	return lines.map((line) => ({
		type: "paragraph",
		children: [{ text: line }],
	}))
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

	const text = serializeToMarkdown(nodes).trim()

	// Remove normal whitespace + zero-width + non-breaking spaces
	const cleaned = text.replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g, "")

	return cleaned.length === 0
}

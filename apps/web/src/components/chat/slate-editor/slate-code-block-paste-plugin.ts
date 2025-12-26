import type { BaseEditor } from "slate"
import { Editor, Element as SlateElement, Transforms } from "slate"
import type { HistoryEditor } from "slate-history"
import type { ReactEditor } from "slate-react"
import { isCodeBlockElement } from "./types"

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

/**
 * Plugin to handle paste operations inside code blocks.
 * Preserves multi-line plain text when pasting into code blocks instead of
 * creating separate code block elements for each line.
 */
export function withCodeBlockPaste<T extends CustomEditor>(editor: T): T {
	const { insertData } = editor

	editor.insertData = (data: DataTransfer) => {
		const { selection } = editor

		if (!selection) {
			insertData(data)
			return
		}

		// Check if cursor is inside a code block
		const [codeBlockEntry] = Editor.nodes(editor, {
			match: (n) => SlateElement.isElement(n) && isCodeBlockElement(n),
			mode: "lowest",
		})

		if (!codeBlockEntry) {
			insertData(data)
			return
		}

		// In code block - insert plain text preserving newlines
		const text = data.getData("text/plain")
		if (text) {
			Transforms.insertText(editor, text)
		} else {
			insertData(data)
		}
	}

	return editor
}

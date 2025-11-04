"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import type { Descendant } from "slate"
import { createEditor, Editor, Transforms } from "slate"
import { withHistory } from "slate-history"
import {
	Editable,
	ReactEditor,
	type RenderElementProps,
	type RenderLeafProps,
	Slate,
	withReact,
} from "slate-react"
import { cx } from "~/utils/cx"
import { decorateMarkdown, MarkdownLeaf } from "./slate-markdown-decorators"
import {
	type CustomDescendant,
	type CustomElement,
	createEmptyValue,
	isValueEmpty,
	serializeToMarkdown,
} from "./slate-markdown-serializer"

export interface SlateMessageEditorRef {
	focusAndInsertText: (text: string) => void
	clearContent: () => void
}

interface SlateMessageEditorProps {
	placeholder?: string
	className?: string
	onSubmit?: (content: string) => void | Promise<void>
	onUpdate?: (content: string) => void
	isUploading?: boolean
}

// Define custom element renderer
const Element = ({ attributes, children, element }: RenderElementProps) => {
	const customElement = element as CustomElement

	switch (customElement.type) {
		case "paragraph":
			return <p {...attributes}>{children}</p>
		default:
			return <p {...attributes}>{children}</p>
	}
}

// Define custom leaf renderer with markdown highlighting
const Leaf = (props: RenderLeafProps) => {
	return <MarkdownLeaf {...props} />
}

export const SlateMessageEditor = forwardRef<SlateMessageEditorRef, SlateMessageEditorProps>(
	({ placeholder = "Type a message...", className, onSubmit, onUpdate, isUploading = false }, ref) => {
		// Create Slate editor with React and History plugins
		const editor = useMemo(() => withHistory(withReact(createEditor())), [])

		const [value, setValue] = useState<CustomDescendant[]>(createEmptyValue())

		const focusAndInsertTextInternal = useCallback(
			(text: string) => {
				requestAnimationFrame(() => {
					const dialog = document.querySelector('[role="dialog"]')
					const activeElement = document.activeElement
					if (dialog && activeElement && dialog.contains(activeElement)) {
						return
					}

					// Focus at end
					ReactEditor.focus(editor)
					Transforms.select(editor, Editor.end(editor, []))

					requestAnimationFrame(() => {
						Editor.insertText(editor, text)
					})
				})
			},
			[editor],
		)

		// Clear content and focus
		const resetAndFocus = useCallback(() => {
			setValue(createEmptyValue())

			// Reset the editor
			Transforms.delete(editor, {
				at: {
					anchor: Editor.start(editor, []),
					focus: Editor.end(editor, []),
				},
			})

			// Insert new empty paragraph
			Transforms.insertNodes(editor, createEmptyValue())

			setTimeout(() => {
				const dialog = document.querySelector('[role="dialog"]')
				const activeElement = document.activeElement
				if (dialog && activeElement && dialog.contains(activeElement)) return

				ReactEditor.focus(editor)
				Transforms.select(editor, Editor.start(editor, []))
			}, 0)
		}, [editor])

		// Expose imperative API
		useImperativeHandle(
			ref,
			() => ({
				focusAndInsertText: focusAndInsertTextInternal,
				clearContent: resetAndFocus,
			}),
			[focusAndInsertTextInternal, resetAndFocus],
		)

		// Handle submit
		const handleSubmit = async () => {
			if (!onSubmit) return
			if (isUploading) return

			const textContent = serializeToMarkdown(value).trim()

			if (!textContent || textContent.length === 0 || isValueEmpty(value)) return

			await onSubmit(textContent)

			resetAndFocus()
		}

		// Handle key down
		const handleKeyDown = (event: React.KeyboardEvent) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault()
				if (!isUploading) {
					handleSubmit()
				}
			}
		}

		// Handle value changes
		const handleChange = (newValue: Descendant[]) => {
			setValue(newValue as CustomDescendant[])

			if (onUpdate) {
				const text = serializeToMarkdown(newValue as CustomDescendant[])
				onUpdate(text)
			}
		}

		// Global keydown listener to focus editor on typing
		useEffect(() => {
			const handleGlobalKeyDown = (event: KeyboardEvent) => {
				const target = event.target as HTMLElement

				// Check if there's an actually visible/open dialog
				const hasDialog = !!document.querySelector(
					'[role="dialog"]:not([data-react-aria-hidden="true"] *)',
				)

				if (
					target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.contentEditable === "true"
				) {
					return
				}

				if (hasDialog) {
					return
				}

				if (event.ctrlKey || event.altKey || event.metaKey) {
					return
				}

				const isPrintableChar = event.key.length === 1

				if (isPrintableChar) {
					event.preventDefault()
					focusAndInsertTextInternal(event.key)
				}
			}

			document.addEventListener("keydown", handleGlobalKeyDown)

			return () => {
				document.removeEventListener("keydown", handleGlobalKeyDown)
			}
		}, [focusAndInsertTextInternal])

		return (
			<div className={cx("relative w-full", className)}>
				<Slate editor={editor} initialValue={value} onChange={handleChange}>
					<Editable
						className={cx(
							"w-full overflow-y-auto px-3 py-2 text-base md:text-sm",
							"rounded-xl bg-transparent",
							"focus:border-primary focus:outline-hidden",
							"caret-primary",
							"placeholder:text-muted-fg",
							"min-h-11",
						)}
						placeholder={placeholder}
						renderElement={Element}
						renderLeaf={Leaf}
						decorate={decorateMarkdown}
						onKeyDown={handleKeyDown}
					/>
				</Slate>
			</div>
		)
	},
)

SlateMessageEditor.displayName = "SlateMessageEditor"

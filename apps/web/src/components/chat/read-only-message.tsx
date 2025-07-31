import { Image } from "@tiptap/extension-image"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyleKit } from "@tiptap/extension-text-style"
import type { Editor, EditorContentProps, EditorOptions } from "@tiptap/react"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import type { ComponentProps, HTMLAttributes, ReactNode, Ref } from "react"
import { createContext, useContext, useEffect, useId } from "react"
import { HintText } from "~/components/base/input/hint-text"
import { Label } from "~/components/base/input/label"
import { cx } from "~/utils/cx"

type EditorContextType = {
	editor: Editor
	editorId: string
	isDisabled?: boolean
	limit?: number
	isInvalid?: boolean
}

const EditorContext = createContext<EditorContextType | null>(null)

const useEditorContext = () => {
	const context = useContext(EditorContext)
	if (!context) {
		throw new Error("useEditorContext must be used within a EditorProvider")
	}
	return context
}

interface TextEditorRootProps extends Partial<EditorOptions> {
	className?: string
	limit?: number
	placeholder?: string
	children?: ReactNode | ((item: Editor) => ReactNode)
	inputClassName?: string
	ref?: Ref<HTMLDivElement>
}

const TextEditorRoot = ({
	className,
	inputClassName,
	children,
	limit,
	placeholder = "Write something...",
	...editorOptions
}: TextEditorRootProps) => {
	const id = useId()
	const editorId = `editor-${id}`

	const editor = useEditor({
		...editorOptions,
		editable: false,
		immediatelyRender: true,
		extensions: [
			StarterKit.configure({
				blockquote: {
					HTMLAttributes: {
						class: "my-3.5 border-l-4 border-secondary pl-4",
					},
				},
				bulletList: {
					HTMLAttributes: {
						class: "list-disc ml-7",
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal ml-7",
					},
				},
				link: {
					openOnClick: false,
					autolink: true,
					defaultProtocol: "https",
					HTMLAttributes: {
						class: "text-primary underline",
					},
				},
			}),
			TextStyleKit,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Image.configure({
				HTMLAttributes: {
					class: "my-3",
				},
			}),
			Placeholder.configure({
				placeholder: ({ node }) => {
					if (node.type.name === "bulletList" || node.type.name === "orderedList") return ""
					return placeholder
				},
				emptyEditorClass:
					"first:before:text-placeholder first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:absolute",
			}),
		],

		editorProps: {
			attributes: {
				id: editorId,
				"aria-labelledby": `${editorId}-label`,
				"aria-describedby": `${editorId}-hint`,

				class: cx(
					"w-full overflow-y-auto text-md leading-[1.5] text-primary caret-fg-brand-primary shadow-xs transition duration-100 ease-linear ring-inset selection:bg-fg-brand-primary/10 placeholder:text-placeholder autofill:rounded-lg autofill:text-primary focus:ring-2 focus:ring-brand focus:outline-hidden",

					inputClassName,
				),
			},
		},
	})

	useEffect(() => {
		const setLink = () => {
			if (!editor) return

			const previousUrl = editor.getAttributes("link").href
			const url = window.prompt("Please enter a link", previousUrl)

			// Cancelled.
			if (url === null) {
				return
			}

			// If empty, remove link.
			if (url === "") {
				editor.chain().focus().extendMarkRange("link").unsetLink().run()

				return
			}

			// Update link.
			editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
		}

		// Add a keyboard shortcut listener to handle link clicks
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.metaKey && event.key === "k") {
				setLink()
			}
		}

		document.addEventListener("keydown", handleKeyDown)

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
		}
	}, [editor])

	if (!editor) {
		return null
	}

	return (
		<EditorContext.Provider value={{ editor, limit, editorId }}>
			<div className={cx("flex w-full flex-col gap-3", className)}>
				{typeof children === "function" ? children(editor) : children}
			</div>
		</EditorContext.Provider>
	)
}

interface TextEditorContentProps extends Omit<EditorContentProps, "editor"> {
	ref?: Ref<HTMLDivElement>
}

const TextEditorContent = ({ ...props }: TextEditorContentProps) => {
	const { editor, isDisabled } = useEditorContext()
	return <EditorContent disabled={isDisabled} {...props} editor={editor} />
}

interface TextEditorLabelProps extends ComponentProps<typeof Label> {}

const TextEditorLabel = ({ children, ...props }: TextEditorLabelProps) => {
	const { editor, editorId } = useEditorContext()

	return (
		<Label
			{...props}
			id={`${editorId}-label`}
			onClick={() => {
				editor.chain().focus().run()
			}}
		>
			{children}
		</Label>
	)
}

interface TextEditorHintTextProps extends HTMLAttributes<HTMLElement> {}

const TextEditorHintText = ({ children, ...props }: TextEditorHintTextProps) => {
	const { editor, editorId, limit, isInvalid } = useEditorContext()

	if (!children && !limit) return null

	const charactersLeft =
		typeof limit === "number" ? limit - editor.storage?.characterCount?.characters() : 0
	const exceedsLimit = charactersLeft < 0

	return (
		<HintText
			{...props}
			id={`${editorId}-hint`}
			isInvalid={isInvalid || exceedsLimit}
			className={cx(limit && "tabular-nums", props.className)}
		>
			{children ||
				`${charactersLeft.toLocaleString()} character${charactersLeft === 1 ? "" : "s"} left`}
		</HintText>
	)
}

export const TextEditor = {
	Root: TextEditorRoot,
	Content: TextEditorContent,
	Label: TextEditorLabel,
	HintText: TextEditorHintText,
}

export { useEditorContext }

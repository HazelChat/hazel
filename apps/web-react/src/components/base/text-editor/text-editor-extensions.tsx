import type { Editor } from "@tiptap/react"
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold01,
	Dotpoints01,
	Image01,
	Italic01,
	Link01,
	Stars02,
	Type01,
	Underline01,
} from "@untitledui/icons"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	type Color,
	ColorField,
	ColorSwatch,
	Dialog,
	DialogTrigger,
	Label,
	Popover,
	parseColor,
	Radio,
	RadioGroup,
} from "react-aria-components"
import { InputBase } from "@/components/base/input/input"
import { Select } from "@/components/base/select/select"
import { Tooltip } from "@/components/base/tooltip/tooltip"
import { cx } from "@/utils/cx"
import { useEditorContext } from "./text-editor"
import { EditorButton } from "./text-editor-button"

const fonts = [
	{ id: "Inter", label: "Inter" },
	{ id: "Comic Sans MS, Comic Sans", label: "Comic Sans" },
	{ id: "serif", label: "serif" },
	{ id: "monospace", label: "monospace" },
	{ id: "cursive", label: "cursive" },
]

const fontSizes = [
	{ id: "12px", label: "12px" },
	{ id: "14px", label: "14px" },
	{ id: "16px", label: "16px" },
	{ id: "18px", label: "18px" },
	{ id: "20px", label: "20px" },
	{ id: "22px", label: "22px" },
	{ id: "24px", label: "24px" },
	{ id: "26px", label: "26px" },
	{ id: "28px", label: "28px" },
	{ id: "30px", label: "30px" },
	{ id: "32px", label: "32px" },
]

const colorSwatches = [
	"#181D27",
	"#252B37",
	"#414651",
	"#535862",
	"#717680",
	"#A4A7AE",
	"#D5D7DA",
	"#FFFFFF",
	"#079455",
	"#1570EF",
	"#444CE7",
	"#6938EF",
	"#BA24D5",
	"#DD2590",
	"#D92D20",
	"#E04F16",
]

/**
 * Text editor button that toggles bold text.
 */
export const TextEditorBold = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Bold ⌘B"
			isDisabled={isDisabled}
			isActive={editor.isActive("bold")}
			onClick={() => editor.chain().focus().toggleBold().run()}
			className={className}
		>
			<Bold01 className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that toggles italic text.
 */
export const TextEditorItalic = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Italic ⌘I"
			isDisabled={isDisabled}
			isActive={editor.isActive("italic")}
			onClick={() => editor.chain().focus().toggleItalic().run()}
			className={className}
		>
			<Italic01 className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that toggles underline text.
 */
export const TextEditorUnderline = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Underline ⌘U"
			isDisabled={isDisabled}
			isActive={editor.isActive("underline")}
			onClick={() => editor.chain().focus().toggleUnderline().run()}
			className={className}
		>
			<Underline01 className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that toggles bullet list.
 */
export const TextEditorBulletList = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Bullet list"
			isDisabled={isDisabled}
			isActive={editor.isActive("bulletList")}
			onClick={() => editor.chain().focus().toggleBulletList().run()}
			className={className}
		>
			<Dotpoints01 className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that toggles left alignment.
 */
export const TextEditorAlignLeft = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Left align"
			isDisabled={isDisabled}
			isActive={editor.isActive("textAlign", { align: "left" })}
			onClick={() => editor.chain().focus().setTextAlign("left").run()}
			className={className}
		>
			<AlignLeft className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that toggles center alignment.
 */
export const TextEditorAlignCenter = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Center align"
			isDisabled={isDisabled}
			isActive={editor.isActive("textAlign", { align: "center" })}
			onClick={() => editor.chain().focus().setTextAlign("center").run()}
			className={className}
		>
			<AlignCenter className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that toggles right alignment.
 */
export const TextEditorAlignRight = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Align right ⌘R"
			isDisabled={isDisabled}
			isActive={editor.isActive("alignRight")}
			onClick={() => editor.chain().focus().setTextAlign("right").run()}
			className={className}
		>
			<AlignRight className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that toggles justify alignment.
 */
export const TextEditorAlignJustify = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton
			aria-label="Align justify ⌘J"
			isDisabled={isDisabled}
			isActive={editor.isActive("alignJustify")}
			onClick={() => editor.chain().focus().setTextAlign("justify").run()}
			className={className}
		>
			<AlignJustify className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button that generates text.
 */
export const TextEditorGenerate = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<EditorButton aria-label="Generate" isDisabled={isDisabled}>
			<Stars02 className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button for inserting a link.
 */
export const TextEditorLink = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	const setLink = useCallback(() => {
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
	}, [editor])

	return (
		<EditorButton
			aria-label="Link ⌘K"
			isDisabled={isDisabled}
			isActive={editor.isActive("link")}
			onClick={setLink}
			className={className}
		>
			<Link01 className="size-5" />
		</EditorButton>
	)
}

/**
 * Text editor button for inserting an image.
 */
export const TextEditorImage = ({ className }: { className?: string }) => {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const { editor, isDisabled } = useEditorContext()

	const triggerFileUpload = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			if (!file) return

			const blobUrl = URL.createObjectURL(file)
			editor.chain().focus().setImage({ src: blobUrl }).run()
		},
		[editor],
	)

	return (
		<>
			<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
			<EditorButton
				aria-label="Insert image"
				isDisabled={isDisabled}
				isActive={editor.isActive("image")}
				onClick={triggerFileUpload}
				className={className}
			>
				<Image01 className="size-5" />
			</EditorButton>
		</>
	)
}

/**
 * Text editor button for changing the text color.
 */
export const TextEditorColor = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()
	const [selectionColor, setSelectionColor] = useState<string | undefined>()
	const [customColor, setCustomColor] = useState<Color>(parseColor("#7F56D9"))
	const [color, setColor] = useState<Color>(parseColor(colorSwatches[0]))

	useEffect(() => {
		const handleSelectionUpdate = ({ editor }: { editor: Editor }) => {
			setSelectionColor(editor.getAttributes("textStyle").color)
		}

		editor.on("selectionUpdate", handleSelectionUpdate)

		return () => {
			editor.off("selectionUpdate", handleSelectionUpdate)
		}
	}, [editor])

	const handleCustomColorChange = (value: Color | null) => {
		if (!value) return

		// If the custom color is already selected, update the color.
		if (color.toString("hex") === customColor.toString("hex")) {
			setColor(value)
		}

		setCustomColor(value)
	}

	return (
		<DialogTrigger>
			<Tooltip title="Text color">
				<EditorButton
					aria-label="Text color"
					isDisabled={isDisabled}
					isActive={editor.isActive("underline")}
					className={className}
				>
					<div
						style={{
							outlineColor: selectionColor || colorSwatches[0],
							backgroundColor: selectionColor || colorSwatches[0],
						}}
						className="size-4 rounded-full ring-1 ring-black/10 ring-inset in-pressed:outline-[1.5px] in-pressed:outline-offset-2"
					/>
				</EditorButton>
			</Tooltip>

			<Popover>
				<Dialog className="rounded-xl bg-primary_alt p-3 shadow-lg ring-1 ring-secondary_alt outline-none">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
						<RadioGroup
							className="flex flex-col items-start gap-2"
							value={color?.toString("hex")}
							onChange={(value) => {
								setColor(parseColor(value))
								editor.chain().focus().setColor(value).run()
							}}
						>
							<div className="grid grid-cols-8 gap-1">
								{colorSwatches.map((color) => (
									<Radio key={color} value={color} className="p-0.5">
										{({ isSelected, isFocused }) => (
											<ColorSwatch
												style={{
													outlineColor: color,
												}}
												color={color}
												className={cx(
													"size-4 cursor-pointer rounded-full ring-1 ring-black/10 ring-inset",
													(isSelected || isFocused) && "outline-2 outline-offset-2",
												)}
											/>
										)}
									</Radio>
								))}
							</div>
							<div className="flex w-full shrink-0 items-center">
								<Label className="mr-3 text-sm font-semibold text-primary">Custom</Label>
								<Radio value={customColor.toString("hex")}>
									{({ isSelected, isFocused }) => (
										<>
											<ColorSwatch
												style={{
													outlineColor: customColor.toString("hex"),
													backgroundColor: customColor.toString("hex"),
												}}
												className={cx(
													"mr-2 size-4 shrink-0 cursor-pointer rounded-full ring-1 ring-black/10 ring-inset",
													(isSelected || isFocused) && "outline-2 outline-offset-2",
												)}
											/>
										</>
									)}
								</Radio>
								<ColorField
									className="flex min-w-0 flex-1"
									value={customColor}
									onChange={handleCustomColorChange}
								>
									<InputBase size="sm" wrapperClassName="flex-1 w-23 min-w-0" />
								</ColorField>
							</div>
						</RadioGroup>
					</div>
				</Dialog>
			</Popover>
		</DialogTrigger>
	)
}

/**
 * Text editor button for changing the text font family.
 */
export const TextEditorFontFamily = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<Select
			aria-label="Font family"
			size="sm"
			items={fonts}
			isDisabled={isDisabled}
			className={cx("w-full md:w-38", className)}
			defaultSelectedKey={fonts[0].id}
			placeholderIcon={Type01}
			onSelectionChange={(value) =>
				editor
					.chain()
					.focus()
					.setFontFamily(value as string)
					.run()
			}
		>
			{(font) => (
				<Select.Item
					id={font.id}
					style={{
						fontFamily: font.id,
					}}
				>
					{font.label}
				</Select.Item>
			)}
		</Select>
	)
}

/**
 * Text editor button for changing the text font size.
 */
export const TextEditorFontSize = ({ className }: { className?: string }) => {
	const { editor, isDisabled } = useEditorContext()

	return (
		<Select
			aria-label="Font size"
			size="sm"
			items={fontSizes}
			isDisabled={isDisabled}
			className={cx("w-full md:w-22", className)}
			defaultSelectedKey={fontSizes[2].id}
			onSelectionChange={(value) =>
				editor
					.chain()
					.focus()
					.setFontSize(value as string)
					.run()
			}
		>
			{(fontSize) => (
				<Select.Item id={fontSize.id} className="[&_svg:not([data-icon])]:hidden">
					{fontSize.label}
				</Select.Item>
			)}
		</Select>
	)
}

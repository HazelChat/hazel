import { BubbleMenu } from "@tiptap/react"
import { cx } from "@/utils/cx"
import { useEditorContext } from "./text-editor"
import {
	TextEditorAlignCenter,
	TextEditorAlignLeft,
	TextEditorBold,
	TextEditorItalic,
	TextEditorLink,
	TextEditorUnderline,
} from "./text-editor-extensions"

interface TextEditorTooltipProps {
	className?: string
}

export const TextEditorTooltip = ({ className }: TextEditorTooltipProps) => {
	const { editor } = useEditorContext()

	return (
		<BubbleMenu
			editor={editor}
			tippyOptions={{
				duration: 100,
			}}
			className={cx(
				"dark-mode z-10 flex flex-wrap gap-0.5 rounded-xl bg-primary p-1.5 shadow-lg ring-1 ring-secondary ring-inset md:flex-nowrap",
				className,
			)}
		>
			<TextEditorBold />
			<TextEditorItalic />
			<TextEditorUnderline />
			<TextEditorAlignLeft />
			<TextEditorAlignCenter />
			<TextEditorLink />
		</BubbleMenu>
	)
}

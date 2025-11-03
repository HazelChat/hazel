"use client"

import { PlateView, usePlateViewEditor } from "platejs/react"
import { memo, useMemo } from "react"
import { cn } from "~/lib/utils"
import { BasicBlocksKitStatic } from "./editor/plugins/basic-blocks-kit-static"
import { BasicMarksKitStatic } from "./editor/plugins/basic-marks-kit-static"
import { CodeBlockKit } from "./editor/plugins/code-block-kit"
import { MarkdownKit } from "./editor/plugins/markdown-kit"

export const MarkdownReadonly = memo(({ content, className }: { content: string; className?: string }) => {
	const editor = usePlateViewEditor({
		plugins: [...BasicBlocksKitStatic, ...BasicMarksKitStatic, ...MarkdownKit, ...CodeBlockKit],
	})

	const editorValue = useMemo(() => editor.api.markdown.deserialize(content), [editor, content])

	return (
		<PlateView
			editor={editor}
			value={editorValue}
			className={cn(
				"w-full cursor-text select-text whitespace-pre-wrap break-words text-sm",
				"[&_strong]:font-bold",
				className,
			)}
		/>
	)
})

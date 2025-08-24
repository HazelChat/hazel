import { MarkdownPlugin } from "@platejs/markdown"
import type { VariantProps } from "class-variance-authority"
import type { PlateStaticProps } from "platejs"
import { createPlateEditor } from "platejs/react"
import { memo, useMemo } from "react"
import { EditorStatic, type editorVariants } from "./editor/editor-ui/editor-static"
import { BasicNodesKit } from "./editor/plugins/basic-nodes-kit"
import { MarkdownKit } from "./editor/plugins/markdown-kit"
import { MentionKit } from "./editor/plugins/mention-kit"

const editor = createPlateEditor({
	plugins: [...BasicNodesKit, ...MarkdownKit, ...MentionKit],
})

export const MarkdownReadonly = memo(
	({
		content,
		...props
	}: Omit<PlateStaticProps & VariantProps<typeof editorVariants>, "editor" | "value"> & {
		content: string
	}) => {
		const editorValue = useMemo(() => editor.api.markdown.deserialize(content), [content])
		return <EditorStatic {...props} value={editorValue} editor={editor}></EditorStatic>
	},
)

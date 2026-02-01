import { useMemo } from "react"
import { marked } from "marked"
import remend from "remend"
import { cn } from "~/lib/utils"

interface StreamingMarkdownProps {
	children: string
	isAnimating?: boolean
	className?: string
}

// Configure marked to match SlateMessageViewer output
marked.setOptions({
	gfm: true,
	breaks: false,
})

export function StreamingMarkdown({ children, isAnimating = false, className }: StreamingMarkdownProps) {
	const html = useMemo(() => {
		// remend closes incomplete markdown (unclosed code blocks, bold, etc)
		const completed = remend(children || "")
		const parsed = marked.parse(completed, { async: false }) as string
		// Clean up the HTML:
		// 1. Remove empty paragraphs
		// 2. Remove excessive whitespace between tags
		// 3. Trim whitespace
		return parsed
			.replace(/<p>\s*<\/p>/g, "")
			.replace(/>\s+</g, "><")
			.trim()
	}, [children])

	return (
		<div
			className={cn(
				// Match SlateMessageViewer styling
				"w-full",
				"[&_p]:my-0",
				"[&_blockquote]:relative [&_blockquote]:my-1 [&_blockquote]:pl-4 [&_blockquote]:italic",
				"[&_pre]:my-2 [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-sm [&_pre]:overflow-x-auto",
				"[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm",
				"[&_pre_code]:bg-transparent [&_pre_code]:p-0",
				"[&_ul]:my-0 [&_ol]:my-0",
				"[&_li]:my-0.5 [&_li]:ml-4",
				"[&_strong]:font-bold",
				className,
			)}
			aria-live="polite"
			aria-busy={isAnimating}
		>
			<span dangerouslySetInnerHTML={{ __html: html }} />
			{isAnimating && (
				<span
					className="ml-0.5 text-primary animate-[ai-cursor-blink_1s_ease-in-out_infinite]"
					aria-hidden="true"
				>
					|
				</span>
			)}
		</div>
	)
}

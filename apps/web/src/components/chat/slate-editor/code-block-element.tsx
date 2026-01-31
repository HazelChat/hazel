import { useState } from "react"
import type { Text } from "slate"
import type { RenderElementProps } from "slate-react"
import IconCheck from "~/components/icons/icon-check"
import { IconChevronDown } from "~/components/icons/icon-chevron-down"
import { IconChevronUp } from "~/components/icons/icon-chevron-up"
import IconCopy from "~/components/icons/icon-copy"
import { cx } from "~/utils/cx"
import type { CodeBlockElement as CodeBlockElementType } from "./types"

/** Maximum number of lines to show before collapsing */
const COLLAPSE_THRESHOLD = 15

export interface CodeBlockElementProps extends RenderElementProps {
	element: CodeBlockElementType
	/** Whether to show copy button and language badge (default: true) */
	showControls?: boolean
}

export function CodeBlockElement({
	attributes,
	children,
	element,
	showControls = true,
}: CodeBlockElementProps) {
	const [copied, setCopied] = useState(false)
	const [expanded, setExpanded] = useState(false)

	// Extract the text content from the code block
	const codeText = element.children.map((child) => (child as Text).text || "").join("")
	const language = element.language || "plaintext"

	// Count lines to determine if we should show collapse controls
	const lineCount = codeText.split("\n").length
	const isCollapsible = showControls && lineCount > COLLAPSE_THRESHOLD

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(codeText)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			console.error("Failed to copy code")
		}
	}

	return (
		<div {...attributes} className="group relative my-2">
			{showControls && (
				<div className="absolute top-2 right-2 z-10 flex items-center gap-2">
					{language && language !== "plaintext" && (
						<span className="rounded-md bg-info-subtle px-2 py-0.5 font-medium text-info-subtle-fg text-xs">
							{language}
						</span>
					)}
					<span
						role="button"
						tabIndex={0}
						onClick={handleCopy}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								handleCopy()
							}
						}}
						className="cursor-pointer rounded bg-accent-9/10 p-1.5 opacity-0 transition-opacity hover:bg-accent-9/20 group-hover:opacity-100"
						contentEditable={false}
						title="Copy code"
					>
						{copied ? (
							<IconCheck data-slot="icon" className="size-3.5 text-success" />
						) : (
							<IconCopy data-slot="icon" className="size-3.5" />
						)}
					</span>
				</div>
			)}
			<pre
				className={cx(
					"overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted p-4 pr-24 font-mono text-sm",
					isCollapsible && !expanded && "max-h-80 overflow-hidden",
				)}
			>
				<code>{children}</code>
			</pre>
			{/* Gradient fade and show more/less button */}
			{isCollapsible && (
				<div
					className={cx(
						"absolute right-0 bottom-0 left-0 flex items-end justify-center pb-2",
						!expanded && "bg-gradient-to-t from-muted via-muted/80 to-transparent pt-12",
					)}
					contentEditable={false}
				>
					<span
						role="button"
						tabIndex={0}
						onClick={() => setExpanded(!expanded)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								setExpanded(!expanded)
							}
						}}
						className="flex cursor-pointer items-center gap-1 rounded-md bg-accent-9/20 px-3 py-1.5 font-medium text-xs transition-colors hover:bg-accent-9/30"
					>
						{expanded ? (
							<>
								<IconChevronUp data-slot="icon" className="size-3.5" />
								Show less
							</>
						) : (
							<>
								<IconChevronDown data-slot="icon" className="size-3.5" />
								Show more ({lineCount} lines)
							</>
						)}
					</span>
				</div>
			)}
		</div>
	)
}

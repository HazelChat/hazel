import { memo } from "react"
import { useLiveMessage } from "~/hooks/use-live-message"
import { cn } from "~/lib/utils"
import { SlateMessageViewer } from "./slate-editor/slate-message-viewer"

interface LiveMessageProps {
	messageId: string
	initialContent?: string
	className?: string
}

/**
 * LiveMessage component for displaying streaming AI responses
 *
 * Connects to a Durable Stream and displays content as it arrives,
 * with a blinking cursor animation while streaming is in progress.
 */
export const LiveMessage = memo(function LiveMessage({
	messageId,
	initialContent = "",
	className,
}: LiveMessageProps) {
	const { content, isStreaming, error } = useLiveMessage(messageId)

	// Use streamed content if available, otherwise fall back to initial
	const displayContent = content || initialContent

	if (error) {
		return (
			<div className={cn("text-danger", className)}>
				<span className="text-sm">Error: {error}</span>
			</div>
		)
	}

	return (
		<div className={cn("relative", className)}>
			{displayContent ? (
				<SlateMessageViewer content={displayContent} />
			) : isStreaming ? (
				<span className="text-muted-fg text-sm italic">Thinking...</span>
			) : null}

			{/* Streaming cursor indicator */}
			{isStreaming && (
				<span
					className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-primary align-middle"
					aria-label="Streaming in progress"
				/>
			)}
		</div>
	)
})

LiveMessage.displayName = "LiveMessage"

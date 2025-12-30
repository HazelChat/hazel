import { memo } from "react"
import { useConversationStream } from "~/hooks/use-conversation-stream"
import { cn } from "~/lib/utils"
import { SlateMessageViewer } from "./slate-editor/slate-message-viewer"

interface LiveMessageProps {
	conversationId: string
	promptId: string
	initialContent?: string
	className?: string
}

/**
 * LiveMessage component for displaying streaming AI responses
 *
 * Connects to a conversation's response stream and displays content
 * as it arrives, with a blinking cursor animation while streaming.
 */
export const LiveMessage = memo(function LiveMessage({
	conversationId,
	promptId,
	initialContent = "",
	className,
}: LiveMessageProps) {
	const { responses, streamingPromptIds, errors } = useConversationStream(conversationId)

	const content = responses.get(promptId) ?? ""
	const isStreaming = streamingPromptIds.has(promptId)
	const error = errors.get(promptId)

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

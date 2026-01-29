import { cn } from "~/lib/utils"
import { useChat } from "~/providers/chat-provider"
import { ReplyIndicator } from "../reply-indicator"

interface ComposerReplyIndicatorProps {
	className?: string
}

export function ComposerReplyIndicator({ className }: ComposerReplyIndicatorProps) {
	const { replyToMessageId, setReplyToMessageId, attachmentIds, uploadingFiles } = useChat()

	if (!replyToMessageId) {
		return null
	}

	return (
		<ReplyIndicator
			className={cn(
				uploadingFiles.length > 0 || attachmentIds.length > 0 ? "rounded-t-none border-t-0" : "",
				className,
			)}
			replyToMessageId={replyToMessageId}
			onClose={() => setReplyToMessageId(null)}
		/>
	)
}

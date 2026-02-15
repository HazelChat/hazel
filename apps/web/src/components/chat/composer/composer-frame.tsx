import { cn } from "~/lib/utils"
import { useChatDraft } from "~/providers/chat-provider"

interface ComposerFrameProps {
	children: React.ReactNode
	className?: string
	/** Compact mode for thread composers */
	compact?: boolean
}

export function ComposerFrame({ children, className, compact = false }: ComposerFrameProps) {
	const { replyToMessageId, editingMessageId, attachmentIds, uploadingFiles } = useChatDraft()

	const hasTopContent =
		replyToMessageId || editingMessageId || attachmentIds.length > 0 || uploadingFiles.length > 0

	return (
		<div
			className={cn(
				"relative inset-ring inset-ring-secondary flex h-max flex-col rounded-xl bg-secondary",
				hasTopContent && "rounded-t-none",
				compact && "gap-0",
				className,
			)}
		>
			{children}
		</div>
	)
}

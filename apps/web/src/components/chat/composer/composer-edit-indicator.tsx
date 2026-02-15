import IconClose from "~/components/icons/icon-close"
import IconEdit from "~/components/icons/icon-edit"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useChatDraft, useChatStable } from "~/providers/chat-provider"
import { useComposerActions } from "./composer-context"

interface ComposerEditIndicatorProps {
	className?: string
}

export function ComposerEditIndicator({ className }: ComposerEditIndicatorProps) {
	const { editingMessageId, uploadingFiles, attachmentIds } = useChatDraft()
	const { setEditingMessageId } = useChatStable()
	const { clear } = useComposerActions()

	if (!editingMessageId) {
		return null
	}

	const handleCancel = () => {
		setEditingMessageId(null)
		clear()
	}

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-2 rounded-t-lg border border-border border-b-0 bg-secondary px-3 py-2",
				uploadingFiles.length > 0 || attachmentIds.length > 0 ? "rounded-t-none border-t-0" : "",
				className,
			)}
		>
			<div className="flex items-center gap-2 text-sm">
				<IconEdit className="size-3.5 text-primary" />
				<span className="font-semibold text-primary">Editing message</span>
			</div>
			<Button
				size="sq-xs"
				intent="plain"
				onPress={handleCancel}
				aria-label="Cancel editing"
				className="!p-1"
			>
				<IconClose data-slot="icon" className="size-3.5" />
			</Button>
		</div>
	)
}

import { useRef } from "react"
import { Button as AriaButton } from "react-aria-components"
import { EmojiPickerDialog } from "~/components/emoji-picker"
import IconEmoji1 from "~/components/icons/icon-emoji-1"
import IconPaperclip from "~/components/icons/icon-paperclip2"
import { useEmojiStats } from "~/hooks/use-emoji-stats"
import { useFileUploadHandler } from "~/hooks/use-file-upload-handler"
import { cn } from "~/lib/utils"
import { useComposerContext } from "./composer-context"

interface ComposerActionsProps {
	className?: string
	/** Minimal mode hides labels, showing only icons */
	minimal?: boolean
}

export function ComposerActions({ className, minimal = false }: ComposerActionsProps) {
	const { channelId, organizationId, editorRef } = useComposerContext()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const { trackEmojiUsage } = useEmojiStats()

	const { handleFileInputChange, isUploading } = useFileUploadHandler({
		organizationId,
		channelId,
	})

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await handleFileInputChange(e)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleEmojiSelect = (emoji: { emoji: string; label: string }) => {
		trackEmojiUsage(emoji.emoji)
		editorRef.current?.focusAndInsertText(emoji.emoji)
	}

	return (
		<>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				className="hidden"
				onChange={handleFileSelect}
				accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
				aria-label="File upload"
			/>

			<div className={cn("flex w-full items-center justify-between gap-3 px-3 py-2", className)}>
				<div className="flex items-center gap-3">
					{/* Attach button */}
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
						className="inline-flex items-center gap-1.5 rounded-xs p-0 font-semibold text-muted-fg text-xs transition-colors hover:text-fg disabled:opacity-50"
					>
						<IconPaperclip className="size-4 text-muted-fg" />
						{!minimal && "Attach"}
					</button>

					{/* Emoji picker */}
					<EmojiPickerDialog onEmojiSelect={handleEmojiSelect}>
						<AriaButton
							type="button"
							className="inline-flex items-center gap-1.5 rounded-xs p-0 font-semibold text-muted-fg text-xs transition-colors hover:text-fg"
						>
							<IconEmoji1 className="size-4 text-muted-fg" />
							{!minimal && "Emoji"}
						</AriaButton>
					</EmojiPickerDialog>
				</div>
			</div>
		</>
	)
}

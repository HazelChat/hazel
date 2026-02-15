import { forwardRef, useRef } from "react"
import { Button as AriaButton } from "react-aria-components"
import { EmojiPickerDialog } from "~/components/emoji-picker"
import IconEmoji1 from "~/components/icons/icon-emoji-1"
import IconPaperclip from "~/components/icons/icon-paperclip2"
import { useEmojiStats } from "~/hooks/use-emoji-stats"
import { useFileUploadHandler } from "~/hooks/use-file-upload-handler"
import { useOrganization } from "~/hooks/use-organization"
import { useChatStable } from "~/providers/chat-provider"

export interface MessageComposerActionsRef {
	cleanup: () => void
}

interface MessageComposerActionsProps {
	onEmojiSelect?: (emoji: string) => void
	onSubmit?: () => void
}

export const MessageComposerActions = forwardRef<MessageComposerActionsRef, MessageComposerActionsProps>(
	({ onEmojiSelect }, _ref) => {
		const { organizationId } = useOrganization()
		const fileInputRef = useRef<HTMLInputElement>(null)
		const { trackEmojiUsage } = useEmojiStats()
		const { channelId } = useChatStable()

		// Use consolidated file upload handler
		const { handleFileInputChange, isUploading } = useFileUploadHandler({
			organizationId: organizationId!,
			channelId,
		})

		const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
			await handleFileInputChange(e)
			// Reset input (handleFileInputChange already does this, but be explicit)
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		}

		const handleEmojiSelect = (emoji: { emoji: string; label: string }) => {
			trackEmojiUsage(emoji.emoji)
			if (onEmojiSelect) {
				onEmojiSelect(emoji.emoji)
			}
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

				{/* Bottom action bar */}
				<div className="flex w-full items-center justify-between gap-3 px-3 py-2">
					<div className="flex items-center gap-3">
						{" "}
						{/* Attach button */}
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
							className="inline-flex items-center gap-1.5 rounded-xs p-0 font-semibold text-muted-fg text-xs transition-colors hover:text-fg disabled:opacity-50"
						>
							<IconPaperclip className="size-4 text-muted-fg" />
							Attach
						</button>
						{/* Emoji picker */}
						<EmojiPickerDialog onEmojiSelect={handleEmojiSelect}>
							<AriaButton
								type="button"
								className="inline-flex items-center gap-1.5 rounded-xs p-0 font-semibold text-muted-fg text-xs transition-colors hover:text-fg"
							>
								<IconEmoji1 className="size-4 text-muted-fg" />
								Emoji
							</AriaButton>
						</EmojiPickerDialog>
					</div>
				</div>
			</>
		)
	},
)

MessageComposerActions.displayName = "MessageComposerActions"

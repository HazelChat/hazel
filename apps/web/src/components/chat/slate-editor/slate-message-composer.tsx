import { useChat } from "~/providers/chat-provider"
import { Composer } from "../composer"

interface SlateMessageComposerProps {
	placeholder?: string
}

/**
 * Full-featured message composer with all capabilities.
 *
 * This is a convenience wrapper around the Composer compound component
 * that provides the standard channel composer layout with:
 * - Drag-and-drop file upload zone
 * - Attachment previews
 * - Reply indicator
 * - Rich text editor
 * - Actions bar (attach, emoji)
 *
 * For custom layouts (e.g., thread composers without attachments),
 * use the Composer compound component directly.
 *
 * @example Standard channel composer
 * ```tsx
 * <SlateMessageComposer placeholder="Type a message..." />
 * ```
 *
 * @example Custom thread composer (using Composer directly)
 * ```tsx
 * <Composer.Provider channelId={threadChannelId} organizationId={orgId}>
 *   <Composer.Frame compact>
 *     <Composer.Editor placeholder="Reply in thread..." />
 *     <Composer.Actions minimal />
 *   </Composer.Frame>
 * </Composer.Provider>
 * ```
 */
export const SlateMessageComposer = ({ placeholder = "Type a message..." }: SlateMessageComposerProps) => {
	const { channelId, organizationId } = useChat()

	return (
		<Composer.Provider channelId={channelId} organizationId={organizationId} placeholder={placeholder}>
			<Composer.DropZone>
				<Composer.AttachmentPreviews />
				<Composer.ReplyIndicator />
				<Composer.Frame>
					<Composer.Editor />
					<Composer.Actions />
				</Composer.Frame>
			</Composer.DropZone>
		</Composer.Provider>
	)
}

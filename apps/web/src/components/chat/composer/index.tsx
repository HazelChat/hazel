import { ComposerActions } from "./composer-actions"
import { ComposerAttachmentPreviews } from "./composer-attachment-previews"
import { ComposerProvider } from "./composer-context"
import { ComposerDropZone } from "./composer-drop-zone"
import { ComposerEditor } from "./composer-editor"
import { ComposerFrame } from "./composer-frame"
import { ComposerReplyIndicator } from "./composer-reply-indicator"

/**
 * Compound component for composing messages.
 *
 * This allows flexible composition of the message composer UI,
 * enabling different layouts for main channel, threads, and edit mode.
 *
 * @example Main channel composer - full featured
 * ```tsx
 * <Composer.Provider channelId={channelId} organizationId={organizationId}>
 *   <Composer.DropZone>
 *     <Composer.AttachmentPreviews />
 *     <Composer.ReplyIndicator />
 *     <Composer.Frame>
 *       <Composer.Editor placeholder="Type a message..." />
 *       <Composer.Actions />
 *     </Composer.Frame>
 *   </Composer.DropZone>
 * </Composer.Provider>
 * ```
 *
 * @example Thread composer - minimal variant
 * ```tsx
 * <Composer.Provider channelId={threadChannelId} organizationId={organizationId} placeholder="Reply in thread...">
 *   <Composer.Frame compact>
 *     <Composer.Editor />
 *     <Composer.Actions minimal />
 *   </Composer.Frame>
 * </Composer.Provider>
 * ```
 *
 * @example Full-featured thread composer
 * ```tsx
 * <Composer.Provider channelId={threadChannelId} organizationId={organizationId}>
 *   <Composer.DropZone>
 *     <Composer.AttachmentPreviews />
 *     <Composer.Frame>
 *       <Composer.Editor placeholder="Reply in thread..." />
 *       <Composer.Actions />
 *     </Composer.Frame>
 *   </Composer.DropZone>
 * </Composer.Provider>
 * ```
 */
export const Composer = {
	Provider: ComposerProvider,
	DropZone: ComposerDropZone,
	AttachmentPreviews: ComposerAttachmentPreviews,
	ReplyIndicator: ComposerReplyIndicator,
	Frame: ComposerFrame,
	Editor: ComposerEditor,
	Actions: ComposerActions,
}

export { useComposerContext, useComposerState, useComposerActions, useComposerMeta } from "./composer-context"

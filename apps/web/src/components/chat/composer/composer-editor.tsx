import { and, eq, useLiveQuery } from "@tanstack/react-db"
import { useCallback, useMemo } from "react"
import { channelMemberCollection } from "~/db/collections"
import { useFileUploadHandler } from "~/hooks/use-file-upload-handler"
import { useTyping } from "~/hooks/use-typing"
import { useAuth } from "~/lib/auth"
import { useChat } from "~/providers/chat-provider"
import { SlateMessageEditor } from "../slate-editor/slate-message-editor"
import { useComposerContext } from "./composer-context"

interface ComposerEditorProps {
	placeholder?: string
	className?: string
}

export function ComposerEditor({ placeholder, className }: ComposerEditorProps) {
	const { user } = useAuth()
	const composerContext = useComposerContext()
	const { channelId, organizationId, editorRef, placeholder: defaultPlaceholder } = composerContext

	const {
		sendMessage,
		attachmentIds,
		activeThreadChannelId,
	} = useChat()

	const { handleFilesUpload, isUploading } = useFileUploadHandler({
		organizationId,
		channelId,
	})

	const { data: channelMembersData } = useLiveQuery(
		(q) =>
			q
				.from({ member: channelMemberCollection })
				.where(({ member }) =>
					and(eq(member.channelId, channelId), eq(member.userId, user?.id || "")),
				)
				.orderBy(({ member }) => member.createdAt, "desc")
				.findOne(),
		[channelId, user?.id],
	)

	const currentChannelMember = useMemo(() => {
		return channelMembersData || null
	}, [channelMembersData])

	const { handleContentChange, stopTyping } = useTyping({
		channelId,
		memberId: currentChannelMember?.id || null,
	})

	const handleUpdate = useCallback(
		(content: string) => {
			handleContentChange(content)
		},
		[handleContentChange],
	)

	const handleSubmit = useCallback(
		async (content: string) => {
			// Allow empty content if there are attachments
			if (!content.trim() && attachmentIds.length === 0) return

			sendMessage({
				content: content.trim(),
				clearContent: () => editorRef.current?.clearContent(),
				restoreContent: (savedContent: string) => {
					editorRef.current?.setContent(savedContent)
					editorRef.current?.focus()
				},
			})
			stopTyping()
		},
		[sendMessage, attachmentIds.length, editorRef, stopTyping],
	)

	return (
		<SlateMessageEditor
			ref={editorRef}
			placeholder={placeholder ?? defaultPlaceholder}
			orgId={user?.organizationId ?? undefined}
			channelId={channelId}
			className={className}
			onSubmit={handleSubmit}
			onUpdate={handleUpdate}
			isUploading={isUploading}
			hasAttachments={attachmentIds.length > 0}
			disableGlobalKeyboardFocus={!!activeThreadChannelId && channelId !== activeThreadChannelId}
			onFilePaste={handleFilesUpload}
		/>
	)
}

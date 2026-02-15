import type { MessageId } from "@hazel/schema"
import { and, eq, useLiveQuery } from "@tanstack/react-db"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { channelMemberCollection, messageCollection } from "~/db/collections"
import { useFileUploadHandler } from "~/hooks/use-file-upload-handler"
import { useTyping } from "~/hooks/use-typing"
import { useAuth } from "~/lib/auth"
import { useChatDraft, useChatStable, useChatThread } from "~/providers/chat-provider"
import { SlateMessageEditor } from "../slate-editor/slate-message-editor"
import { useComposerContext } from "./composer-context"

interface ComposerEditorProps {
	placeholder?: string
	className?: string
}

export function ComposerEditor({ placeholder, className }: ComposerEditorProps) {
	const { user } = useAuth()
	const { state, meta } = useComposerContext()
	const { channelId, organizationId, placeholder: defaultPlaceholder } = state
	const { editorRef } = meta

	const { sendMessage, editMessage, setEditingMessageId } = useChatStable()
	const { editingMessageId, attachmentIds } = useChatDraft()
	const { activeThreadChannelId } = useChatThread()

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

	// Query the current user's last message in this channel for Arrow Up editing
	const { data: lastOwnMessage } = useLiveQuery(
		(q) =>
			q
				.from({ message: messageCollection })
				.where(({ message }) =>
					and(eq(message.channelId, channelId), eq(message.authorId, user?.id ?? "")),
				)
				.orderBy(({ message }) => message.createdAt, "desc")
				.findOne(),
		[channelId, user?.id],
	)

	// Query the message being edited (for toolbar/context menu triggered edits)
	const { data: editingMessage } = useLiveQuery(
		(q) =>
			q
				.from({ message: messageCollection })
				.where(({ message }) => eq(message.id, editingMessageId ?? ""))
				.findOne(),
		[editingMessageId],
	)

	// Track previous editingMessageId to detect external changes
	const prevEditingMessageIdRef = useRef<MessageId | null>(null)

	// Populate editor when editingMessageId is set externally (toolbar/context menu)
	useEffect(() => {
		if (editingMessageId && editingMessageId !== prevEditingMessageIdRef.current && editingMessage) {
			editorRef.current?.setContent(editingMessage.content)
			editorRef.current?.focus()
		}
		prevEditingMessageIdRef.current = editingMessageId
	}, [editingMessageId, editingMessage, editorRef])

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

	const handleArrowUpEmpty = useCallback(() => {
		if (!lastOwnMessage) return

		setEditingMessageId(lastOwnMessage.id as MessageId)
	}, [lastOwnMessage, setEditingMessageId])

	const handleEscape = useCallback(() => {
		if (editingMessageId) {
			setEditingMessageId(null)
			editorRef.current?.clearContent()
		}
	}, [editingMessageId, setEditingMessageId, editorRef])

	const handleSubmit = useCallback(
		(content: string) => {
			if (editingMessageId) {
				if (!content.trim()) return
				setEditingMessageId(null)
				editorRef.current?.clearContent()
				editMessage(editingMessageId, content.trim())
				return
			}

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
		[
			editingMessageId,
			editMessage,
			setEditingMessageId,
			sendMessage,
			attachmentIds.length,
			editorRef,
			stopTyping,
		],
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
			onArrowUpEmpty={handleArrowUpEmpty}
			onEscape={handleEscape}
		/>
	)
}

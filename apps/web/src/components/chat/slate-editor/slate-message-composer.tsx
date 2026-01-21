import { and, eq, inArray, useLiveQuery } from "@tanstack/react-db"
import { FileIcon } from "@untitledui/file-icons"
import { useCallback, useMemo, useRef } from "react"
import { type DropItem, DropZone } from "react-aria-components"
import IconClose from "~/components/icons/icon-close"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"
import { attachmentCollection, channelMemberCollection } from "~/db/collections"
import { useDragDetection } from "~/hooks/use-drag-detection"
import { useFileUpload } from "~/hooks/use-file-upload"
import { useTyping } from "~/hooks/use-typing"
import { useAuth } from "~/lib/auth"
import { cn } from "~/lib/utils"
import { useChat } from "~/providers/chat-provider"
import { formatFileSize, getFileTypeFromName } from "~/utils/file-utils"
import { MessageComposerActions } from "../message-composer-actions"
import { ReplyIndicator } from "../reply-indicator"
import { SlateMessageEditor, type SlateMessageEditorRef } from "./slate-message-editor"

interface SlateMessageComposerProps {
	placeholder?: string
}

// File types accepted for upload (same as message-composer-actions.tsx)
const ACCEPTED_FILE_TYPES = [
	"image/*",
	"video/*",
	"audio/*",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
]

export const SlateMessageComposer = ({ placeholder = "Type a message..." }: SlateMessageComposerProps) => {
	const { user } = useAuth()
	const {
		sendMessage,
		replyToMessageId,
		setReplyToMessageId,
		channelId,
		organizationId,
		attachmentIds,
		removeAttachment,
		isUploading,
		uploadingFiles,
		addAttachment,
		setIsUploading,
		addUploadingFile,
		updateUploadingFileProgress,
		removeUploadingFile,
		activeThreadChannelId,
	} = useChat()

	const editorRef = useRef<SlateMessageEditorRef>(null)
	const { isDraggingOnPage } = useDragDetection()

	const { uploadFile } = useFileUpload({
		organizationId,
		channelId,
		onProgress: updateUploadingFileProgress,
	})

	// Handle files dropped via drag-and-drop
	const handleFileDrop = useCallback(
		async (files: File[]) => {

			if (files.length === 0) return

			setIsUploading(true)
			// Upload files sequentially

			for (const file of files) {
				const fileId = crypto.randomUUID()

				addUploadingFile({
					fileId,
					fileName: file.name,
					fileSize: file.size,
				})

				const attachmentId = await uploadFile(file, fileId)

				removeUploadingFile(fileId)

				if (attachmentId) {
					addAttachment(attachmentId)
				}
			}
			setIsUploading(false)
		},
		[uploadFile, addUploadingFile, removeUploadingFile, addAttachment, setIsUploading],
	)

	// Handle drop event from DropZone
	const handleDrop = useCallback(
		async (e: { items: DropItem[] }) => {
			const fileItems = e.items.filter(
				(item): item is DropItem & { kind: "file"; getFile: () => Promise<File> } =>
					item.kind === "file",
			)

			const files: File[] = []
			for (const item of fileItems) {
				files.push(await item.getFile())
			}

			if (files.length > 0) {
				await handleFileDrop(files)
			}
		},
		[handleFileDrop],
	)

	// Check if dropped types are acceptable
	const getDropOperation = useCallback((types: { has: (type: string) => boolean }) => {
		// Check for common file types
		const hasAcceptableType = ACCEPTED_FILE_TYPES.some((type) => {
			if (type.endsWith("/*")) {
				// For wildcard types like "image/*", check common specific types
				const specificTypes =
					type === "image/*"
						? ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
						: type === "video/*"
							? ["video/mp4", "video/webm", "video/quicktime"]
							: type === "audio/*"
								? ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"]
								: []
				return specificTypes.some((t) => types.has(t))
			}
			return types.has(type)
		})

		return hasAcceptableType ? "copy" : "cancel"
	}, [])

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

	const { data: attachments } = useLiveQuery(
		(q) =>
			q
				.from({
					attachments: attachmentCollection,
				})
				.where(({ attachments }) => inArray(attachments.id, attachmentIds)),
		[attachmentIds],
	)

	const handleUpdate = (content: string) => {
		handleContentChange(content)
	}

	const handleSubmit = async (content: string) => {
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
	}

	const handleEmojiSelect = (emoji: string) => {
		editorRef.current?.focusAndInsertText(emoji)
	}

	return (
		<DropZone
			getDropOperation={getDropOperation}
			onDrop={handleDrop}
			isDisabled={isUploading}
			className="relative"
		>
			{({ isDropTarget }) => (
				<div className="relative flex h-max items-center gap-3">
					{/* Drop overlay - stronger when hovering over zone */}
					{isDropTarget && (
						<div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-primary/10">
							<span className="font-medium text-primary">Drop files here</span>
						</div>
					)}

					{/* Subtle indicator when dragging anywhere on page */}
					{isDraggingOnPage && !isDropTarget && (
						<div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-primary/50 border-dashed bg-primary/5">
							<span className="font-medium text-primary/70">Drop files here</span>
						</div>
					)}

					<div className="w-full">
						{/* Completed Attachments */}
						{(attachmentIds.length > 0 || uploadingFiles.length > 0) && (
							<div
								className={cn(
									"border border-border border-b-0 bg-secondary px-2 py-1",
									uploadingFiles.length > 0 ? "rounded-t-none border-t-0" : "rounded-t-lg",
									replyToMessageId && "border-b-0",
								)}
							>
								<div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
									{attachmentIds.map((attachmentId) => {
										const attachment = attachments?.find((a) => a?.id === attachmentId)
										const fileName = attachment?.fileName || "File"
										const fileSize = attachment?.fileSize || 0
										const fileType = getFileTypeFromName(fileName)

										return (
											<div
												key={attachmentId}
												className="group flex items-center gap-2 rounded-lg bg-bg p-2 transition-colors hover:bg-secondary"
											>
												<FileIcon
													type={fileType}
													className="size-8 shrink-0 text-muted-fg"
												/>
												<div className="min-w-0 flex-1">
													<div className="truncate font-medium text-fg text-sm">
														{fileName}
													</div>
													<div className="text-muted-fg text-xs">
														{formatFileSize(fileSize)}
													</div>
												</div>
												<Button
													intent="plain"
													size="sq-xs"
													onPress={() => removeAttachment(attachmentId)}
												>
													<IconClose data-slot="icon" />
												</Button>
											</div>
										)
									})}

									{uploadingFiles.map((file: any) => {
										const fileType = getFileTypeFromName(file.fileName)
										const progress = file.progress ?? 0

										return (
											<div
												key={file.fileId}
												className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-bg p-2 transition-colors hover:bg-secondary"
											>
												<FileIcon
													type={fileType}
													className="size-8 shrink-0 text-muted-fg"
												/>
												<div className="min-w-0 flex-1">
													<div className="truncate font-medium text-fg text-sm">
														{file.fileName}
													</div>
													<div className="text-muted-fg text-xs">
														{progress < 100
															? `${progress}% of ${formatFileSize(file.fileSize)}`
															: formatFileSize(file.fileSize)}
													</div>
												</div>
												<Loader className="size-4" />
												{/* Progress bar */}
												<div className="absolute inset-x-0 -bottom-px h-1 bg-muted">
													<div
														className="h-full bg-primary transition-all duration-200"
														style={{ width: `${progress}%` }}
													/>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						)}

						{/* Container for reply indicator and attachment preview */}
						{replyToMessageId && (
							<ReplyIndicator
								className={
									uploadingFiles.length > 0 || attachmentIds.length > 0
										? "rounded-t-none border-t-0"
										: ""
								}
								replyToMessageId={replyToMessageId}
								onClose={() => setReplyToMessageId(null)}
							/>
						)}

						{/* Editor container with actions */}
						<div
							className={cn(
								"relative inset-ring inset-ring-secondary flex h-max flex-col rounded-xl bg-secondary",
								(replyToMessageId || attachmentIds.length > 0 || uploadingFiles.length > 0) &&
								"rounded-t-none",
								isDropTarget && "ring-2 ring-primary ring-inset",
							)}
						>
							<SlateMessageEditor
								ref={editorRef}
								placeholder={placeholder}
								orgId={user?.organizationId ?? undefined}
								channelId={channelId}
								className="w-full"
								onSubmit={handleSubmit}
								onUpdate={handleUpdate}
								isUploading={isUploading}
								hasAttachments={attachmentIds.length > 0}
								disableGlobalKeyboardFocus={
									!!activeThreadChannelId && channelId !== activeThreadChannelId
								}
								onFilePaste={handleFileDrop}
							/>
							<MessageComposerActions onEmojiSelect={handleEmojiSelect} />
						</div>
					</div>
				</div>
			)}
		</DropZone>
	)
}

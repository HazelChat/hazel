import type { ChannelId, OrganizationId } from "@hazel/schema"
import { useCallback } from "react"
import { useFileUpload } from "~/hooks/use-file-upload"
import { useChatDraft, useChatStable } from "~/providers/chat-provider"

interface UseFileUploadHandlerOptions {
	organizationId: OrganizationId
	channelId: ChannelId
}

/**
 * Consolidated hook for handling file uploads in the message composer.
 *
 * This hook encapsulates all file upload logic including:
 * - Tracking uploading files state
 * - Progress reporting
 * - Adding completed attachments
 *
 * @example
 * ```tsx
 * const { handleFilesUpload, isUploading } = useFileUploadHandler({
 *   organizationId,
 *   channelId,
 * })
 *
 * // Handle drag-and-drop or file input
 * await handleFilesUpload(files)
 * ```
 */
export function useFileUploadHandler({ organizationId, channelId }: UseFileUploadHandlerOptions) {
	const {
		addAttachment,
		setIsUploading,
		addUploadingFile,
		updateUploadingFileProgress,
		removeUploadingFile,
	} = useChatStable()
	const { isUploading } = useChatDraft()

	const { uploadFile } = useFileUpload({
		organizationId,
		channelId,
		onProgress: updateUploadingFileProgress,
	})

	/**
	 * Upload multiple files sequentially.
	 * Updates uploading state and adds completed attachments.
	 */
	const handleFilesUpload = useCallback(
		async (files: File[]) => {
			if (files.length === 0) return

			setIsUploading(true)

			for (const file of files) {
				const fileId = crypto.randomUUID()

				// Add to uploading files state (shows loading spinner)
				addUploadingFile({
					fileId,
					fileName: file.name,
					fileSize: file.size,
				})

				// Upload the file with file ID for progress tracking
				const attachmentId = await uploadFile(file, fileId)

				// Remove from uploading files state
				removeUploadingFile(fileId)

				// Add to completed attachments if successful
				if (attachmentId) {
					addAttachment(attachmentId)
				}
			}

			setIsUploading(false)
		},
		[uploadFile, addUploadingFile, removeUploadingFile, addAttachment, setIsUploading],
	)

	/**
	 * Handle file input change event.
	 * Extracts files from the event and uploads them.
	 */
	const handleFileInputChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files
			if (files && files.length > 0) {
				await handleFilesUpload(Array.from(files))
			}
			// Reset input value to allow re-selecting the same file
			e.target.value = ""
		},
		[handleFilesUpload],
	)

	return {
		handleFilesUpload,
		handleFileInputChange,
		isUploading,
	}
}

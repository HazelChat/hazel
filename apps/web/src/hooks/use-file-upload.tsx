import { useAtomSet } from "@effect-atom/atom-react"
import type { AttachmentId, ChannelId, OrganizationId } from "@hazel/schema"
import { Exit } from "effect"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "~/lib/auth"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"
import { uploadErrorMessages, uploadToStorage } from "~/lib/upload-to-storage"

interface UseFileUploadOptions {
	organizationId: OrganizationId
	channelId: ChannelId
	maxFileSize?: number
	onProgress?: (fileId: string, progress: number) => void
}

export function useFileUpload({
	organizationId,
	channelId,
	maxFileSize = 10 * 1024 * 1024,
	onProgress,
}: UseFileUploadOptions) {
	const { user } = useAuth()
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
	const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

	const presignMutation = useAtomSet(HazelApiClient.mutation("uploads", "presign"), {
		mode: "promiseExit",
	})

	const completeUploadMutation = useAtomSet(HazelRpcClient.mutation("attachment.complete"), {
		mode: "promiseExit",
	})

	const failUploadMutation = useAtomSet(HazelRpcClient.mutation("attachment.fail"), {
		mode: "promiseExit",
	})

	const uploadFile = useCallback(
		async (file: File, fileId?: string): Promise<AttachmentId | null> => {
			const trackingId = fileId || crypto.randomUUID()

			if (!user?.id) {
				toast.error("Authentication required", {
					description: "You must be logged in to upload files",
				})
				return null
			}

			if (file.size > maxFileSize) {
				toast.error("File too large", {
					description: `File size exceeds ${maxFileSize / 1024 / 1024}MB limit`,
				})
				return null
			}

			// Create abort controller for this upload
			const abortController = new AbortController()
			abortControllersRef.current.set(trackingId, abortController)

			try {
				// Step 1: Get presigned URL from unified endpoint (creates attachment with "uploading" status)
				const presignRes = await presignMutation({
					payload: {
						type: "attachment" as const,
						fileName: file.name,
						fileSize: file.size,
						contentType: file.type || "application/octet-stream",
						organizationId,
						channelId,
					},
				})

				if (!Exit.isSuccess(presignRes)) {
					toast.error("Upload failed", {
						description: "Failed to get upload URL. Please try again.",
					})
					return null
				}

				const { uploadUrl, resourceId: attachmentId } = presignRes.value

				if (!attachmentId) {
					toast.error("Upload failed", {
						description: "Failed to create attachment record. Please try again.",
					})
					return null
				}

				// Step 2: Upload file directly to storage using shared utility
				const uploadResult = await uploadToStorage(uploadUrl, file, {
					timeout: 120000, // 2 minutes for larger files
					signal: abortController.signal,
					onProgress: (percent) => {
						setUploadProgress((prev) => ({ ...prev, [trackingId]: percent }))
						onProgress?.(trackingId, percent)
					},
				})

				// Clean up abort controller
				abortControllersRef.current.delete(trackingId)

				if (!uploadResult.success) {
					// Don't show error for aborted uploads (user cancelled)
					if (uploadResult.errorType !== "aborted") {
						// Mark attachment as failed in the database
						await failUploadMutation({
							payload: {
								id: attachmentId,
								reason: `Storage upload failed: ${uploadResult.errorType}`,
							},
						})
						toast.error("Upload failed", {
							description: uploadErrorMessages[uploadResult.errorType ?? "server"],
						})
					} else {
						// Still mark as failed for aborted uploads
						await failUploadMutation({
							payload: { id: attachmentId, reason: "Upload cancelled" },
						})
					}
					return null
				}

				// Step 3: Mark attachment as complete
				const completeRes = await completeUploadMutation({ payload: { id: attachmentId } })

				if (!Exit.isSuccess(completeRes)) {
					// Mark attachment as failed in the database
					await failUploadMutation({
						payload: { id: attachmentId, reason: "Failed to finalize upload" },
					})
					toast.error("Upload failed", {
						description: "Failed to finalize upload. Please try again.",
					})
					return null
				}

				// Clear progress for this file
				setUploadProgress((prev) => {
					const next = { ...prev }
					delete next[trackingId]
					return next
				})

				return attachmentId
			} catch (error) {
				console.error("File upload error:", error)
				toast.error("Upload failed", {
					description: "An unexpected error occurred. Please try again.",
				})
				return null
			}
		},
		[
			maxFileSize,
			organizationId,
			channelId,
			user?.id,
			presignMutation,
			completeUploadMutation,
			failUploadMutation,
			onProgress,
		],
	)

	const cancelUpload = useCallback((fileId: string) => {
		const controller = abortControllersRef.current.get(fileId)
		if (controller) {
			controller.abort()
		}
	}, [])

	const getProgress = useCallback(
		(fileId: string) => {
			return uploadProgress[fileId] ?? 0
		},
		[uploadProgress],
	)

	return {
		uploadFile,
		cancelUpload,
		getProgress,
		uploadProgress,
	}
}

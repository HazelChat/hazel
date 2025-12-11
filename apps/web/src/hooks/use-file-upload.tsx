import { useAtomSet } from "@effect-atom/atom-react"
import type { AttachmentId, ChannelId, OrganizationId } from "@hazel/schema"
import { Exit } from "effect"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "~/lib/auth"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

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

	const getUploadUrlMutation = useAtomSet(HazelApiClient.mutation("attachments", "getUploadUrl"), {
		mode: "promiseExit",
	})

	const completeUploadMutation = useAtomSet(HazelRpcClient.mutation("attachment.complete"), {
		mode: "promiseExit",
	})

	// Upload file directly to R2 using XHR (for progress tracking)
	const uploadToR2 = useCallback(
		(url: string, file: File, fileId: string): Promise<boolean> => {
			return new Promise((resolve) => {
				const xhr = new XMLHttpRequest()
				const abortController = new AbortController()
				abortControllersRef.current.set(fileId, abortController)

				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const percent = Math.round((event.loaded / event.total) * 100)
						setUploadProgress((prev) => ({ ...prev, [fileId]: percent }))
						onProgress?.(fileId, percent)
					}
				}

				xhr.onload = () => {
					abortControllersRef.current.delete(fileId)
					resolve(xhr.status >= 200 && xhr.status < 300)
				}

				xhr.onerror = () => {
					abortControllersRef.current.delete(fileId)
					resolve(false)
				}

				xhr.onabort = () => {
					abortControllersRef.current.delete(fileId)
					resolve(false)
				}

				xhr.open("PUT", url)
				xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream")
				xhr.send(file)
			})
		},
		[onProgress],
	)

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

			try {
				// Step 1: Get presigned URL from backend (creates attachment with "uploading" status)
				const urlRes = await getUploadUrlMutation({
					payload: {
						fileName: file.name,
						fileSize: file.size,
						contentType: file.type || "application/octet-stream",
						organizationId,
						channelId,
					},
				})

				if (!Exit.isSuccess(urlRes)) {
					toast.error("Upload failed", {
						description: "Failed to get upload URL. Please try again.",
					})
					return null
				}

				const { uploadUrl, attachmentId } = urlRes.value

				// Step 2: Upload file directly to R2 using XHR (for progress tracking)
				const uploadSuccess = await uploadToR2(uploadUrl, file, trackingId)

				if (!uploadSuccess) {
					toast.error("Upload failed", {
						description: "Failed to upload file. Please try again.",
					})
					return null
				}

				// Step 3: Mark attachment as complete
				const completeRes = await completeUploadMutation({ payload: { id: attachmentId } })

				if (!Exit.isSuccess(completeRes)) {
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
		[maxFileSize, organizationId, channelId, user?.id, getUploadUrlMutation, completeUploadMutation, uploadToR2],
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

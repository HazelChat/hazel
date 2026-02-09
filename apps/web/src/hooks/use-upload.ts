import { useAtomSet } from "@effect-atom/atom-react"
import type {
	AttachmentUploadRequest,
	BotAvatarUploadRequest,
	CustomEmojiUploadRequest,
	OrganizationAvatarUploadRequest,
	PresignUploadRequest,
	UserAvatarUploadRequest,
} from "@hazel/domain/http"
import type { AttachmentId, BotId, ChannelId, OrganizationId } from "@hazel/schema"
import { Exit } from "effect"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { uploadErrorMessages, uploadToStorage } from "~/lib/upload-to-storage"

// ============ Constants ============

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_EMOJI_SIZE = 256 * 1024 // 256KB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_EMOJI_TYPES = ["image/png", "image/gif", "image/webp"]

// ============ Types ============

export type UploadType = "user-avatar" | "bot-avatar" | "organization-avatar" | "attachment" | "custom-emoji"

export interface UserAvatarUploadParams {
	type: "user-avatar"
	file: File
}

export interface BotAvatarUploadParams {
	type: "bot-avatar"
	botId: BotId
	file: File
}

export interface OrganizationAvatarUploadParams {
	type: "organization-avatar"
	organizationId: OrganizationId
	file: File
}

export interface AttachmentUploadParams {
	type: "attachment"
	file: File
	organizationId: OrganizationId
	channelId: ChannelId
	/** Optional tracking ID for progress callbacks */
	trackingId?: string
}

export interface CustomEmojiUploadParams {
	type: "custom-emoji"
	organizationId: OrganizationId
	file: File
}

export type UploadParams =
	| UserAvatarUploadParams
	| BotAvatarUploadParams
	| OrganizationAvatarUploadParams
	| AttachmentUploadParams
	| CustomEmojiUploadParams

export interface UploadResult {
	/** The public URL of the uploaded file */
	publicUrl: string
	/** The storage key of the uploaded file */
	key: string
	/** For attachments, the AttachmentId */
	resourceId?: AttachmentId
}

// ============ Hook ============

/**
 * Unified upload hook for user avatars, bot avatars, and attachments.
 *
 * Handles presigning, uploading with progress tracking, and error handling.
 *
 * @example
 * ```tsx
 * // User avatar
 * const { upload, isUploading, progress } = useUpload()
 * const result = await upload({ type: "user-avatar", file })
 *
 * // Bot avatar
 * const result = await upload({ type: "bot-avatar", botId, file })
 *
 * // Attachment
 * const result = await upload({
 *   type: "attachment",
 *   file,
 *   organizationId,
 *   channelId,
 *   trackingId: "my-file-1"
 * })
 * ```
 */
export function useUpload() {
	const [isUploading, setIsUploading] = useState(false)
	const [progress, setProgress] = useState<number | Record<string, number>>(0)
	const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

	const presignMutation = useAtomSet(HazelApiClient.mutation("uploads", "presign"), {
		mode: "promiseExit",
	})

	/**
	 * Upload a file to storage.
	 *
	 * @returns The upload result with publicUrl and key, or null if upload failed
	 */
	const upload = useCallback(
		async (params: UploadParams): Promise<UploadResult | null> => {
			const { file } = params
			const trackingId =
				params.type === "attachment" ? (params.trackingId ?? crypto.randomUUID()) : "default"
			const isAvatar =
				params.type === "user-avatar" ||
				params.type === "bot-avatar" ||
				params.type === "organization-avatar"
			const isEmoji = params.type === "custom-emoji"

			// Validate file type for avatars
			if (isAvatar && !ALLOWED_AVATAR_TYPES.includes(file.type)) {
				toast.error("Invalid file type", {
					description: "Please select a JPEG, PNG, or WebP image",
				})
				return null
			}

			// Validate file type for custom emojis
			if (isEmoji && !ALLOWED_EMOJI_TYPES.includes(file.type)) {
				toast.error("Invalid file type", {
					description: "Please select a PNG, GIF, or WebP image",
				})
				return null
			}

			// Validate file size
			const maxSize = isEmoji ? MAX_EMOJI_SIZE : isAvatar ? MAX_AVATAR_SIZE : MAX_ATTACHMENT_SIZE
			if (file.size > maxSize) {
				toast.error("File too large", {
					description: `File size must be less than ${isEmoji ? "256KB" : `${maxSize / 1024 / 1024}MB`}`,
				})
				return null
			}

			setIsUploading(true)

			// Create abort controller for this upload
			const abortController = new AbortController()
			abortControllersRef.current.set(trackingId, abortController)

			try {
				// Step 1: Get presigned URL from backend
				const presignPayload = buildPresignPayload(params)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Union type not compatible with mutation typing
				const presignRes = await presignMutation({ payload: presignPayload as any })

				if (!Exit.isSuccess(presignRes)) {
					toast.error("Upload failed", {
						description: "Failed to get upload URL. Please try again.",
					})
					return null
				}

				const { uploadUrl, key, publicUrl, resourceId } = presignRes.value

				// Step 2: Upload file to storage with progress tracking
				const uploadResult = await uploadToStorage(uploadUrl, file, {
					timeout: isAvatar ? 60000 : 120000,
					signal: abortController.signal,
					onProgress: (percent) => {
						if (params.type === "attachment") {
							setProgress((prev) =>
								typeof prev === "object"
									? { ...prev, [trackingId]: percent }
									: { [trackingId]: percent },
							)
						} else {
							setProgress(percent)
						}
					},
				})

				// Clean up abort controller
				abortControllersRef.current.delete(trackingId)

				if (!uploadResult.success) {
					// Don't show error for aborted uploads
					if (uploadResult.errorType !== "aborted") {
						toast.error("Upload failed", {
							description: uploadErrorMessages[uploadResult.errorType ?? "server"],
						})
					}
					return null
				}

				// Clear progress for this upload
				if (params.type === "attachment") {
					setProgress((prev) => {
						if (typeof prev === "object") {
							const next = { ...prev }
							delete next[trackingId]
							return Object.keys(next).length > 0 ? next : 0
						}
						return 0
					})
				} else {
					setProgress(0)
				}

				return {
					publicUrl,
					key,
					resourceId,
				}
			} catch (error) {
				console.error("Upload error:", error)
				toast.error("Upload failed", {
					description: "An unexpected error occurred. Please try again.",
				})
				return null
			} finally {
				abortControllersRef.current.delete(trackingId)
				setIsUploading(false)
			}
		},
		[presignMutation],
	)

	/**
	 * Cancel an in-progress upload.
	 *
	 * @param trackingId - The tracking ID of the upload to cancel (for attachments)
	 */
	const cancelUpload = useCallback((trackingId = "default") => {
		const controller = abortControllersRef.current.get(trackingId)
		if (controller) {
			controller.abort()
		}
	}, [])

	/**
	 * Get the progress of a specific upload (for attachments).
	 *
	 * @param trackingId - The tracking ID of the upload
	 * @returns Progress percentage (0-100)
	 */
	const getProgress = useCallback(
		(trackingId: string) => {
			return typeof progress === "object" ? (progress[trackingId] ?? 0) : 0
		},
		[progress],
	)

	return {
		upload,
		cancelUpload,
		isUploading,
		progress,
		getProgress,
	}
}

// ============ Helpers ============

function buildPresignPayload(params: UploadParams): PresignUploadRequest {
	const { file } = params

	switch (params.type) {
		case "user-avatar": {
			const payload: UserAvatarUploadRequest = {
				type: "user-avatar",
				contentType: file.type,
				fileSize: file.size,
			}
			return payload
		}
		case "bot-avatar": {
			const payload: BotAvatarUploadRequest = {
				type: "bot-avatar",
				botId: params.botId,
				contentType: file.type,
				fileSize: file.size,
			}
			return payload
		}
		case "organization-avatar": {
			const payload: OrganizationAvatarUploadRequest = {
				type: "organization-avatar",
				organizationId: params.organizationId,
				contentType: file.type,
				fileSize: file.size,
			}
			return payload
		}
		case "attachment": {
			const payload: AttachmentUploadRequest = {
				type: "attachment",
				fileName: file.name,
				contentType: file.type || "application/octet-stream",
				fileSize: file.size,
				organizationId: params.organizationId,
				channelId: params.channelId,
			}
			return payload
		}
		case "custom-emoji": {
			const payload: CustomEmojiUploadRequest = {
				type: "custom-emoji",
				organizationId: params.organizationId,
				contentType: file.type,
				fileSize: file.size,
			}
			return payload
		}
	}
}

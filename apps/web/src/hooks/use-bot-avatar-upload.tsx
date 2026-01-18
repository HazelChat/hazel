import { useAtomSet } from "@effect-atom/atom-react"
import type { BotId } from "@hazel/schema"
import { Exit } from "effect"
import { useCallback } from "react"
import { toast } from "sonner"
import { updateBotAvatarMutation } from "~/atoms/bot-atoms"
import { useUpload } from "./use-upload"

export function useBotAvatarUpload(botId: BotId) {
	const updateBotAvatar = useAtomSet(updateBotAvatarMutation, { mode: "promiseExit" })

	const { upload, isUploading, progress } = useUpload()

	const uploadBotAvatar = useCallback(
		async (file: File): Promise<string | null> => {
			// Upload using the unified hook
			const result = await upload({
				type: "bot-avatar",
				botId,
				file,
			})

			if (!result) {
				return null
			}

			// Construct the public URL on frontend (backend may not have S3_PUBLIC_URL set)
			const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL
			if (!r2PublicUrl) {
				console.error("VITE_R2_PUBLIC_URL environment variable is not set")
				toast.error("Configuration error", {
					description: "Image upload is not configured. Please contact support.",
				})
				return null
			}
			const publicUrl = `${r2PublicUrl}/${result.key}`

			// Update bot's avatar URL via RPC
			const updateResult = await updateBotAvatar({
				payload: {
					id: botId,
					avatarUrl: publicUrl,
				},
			})

			if (!Exit.isSuccess(updateResult)) {
				toast.error("Upload failed", {
					description: "Failed to update avatar. Please try again.",
				})
				return null
			}

			toast.success("Avatar updated")
			return publicUrl
		},
		[botId, upload, updateBotAvatar],
	)

	return {
		uploadBotAvatar,
		isUploading,
		uploadProgress: typeof progress === "number" ? progress : 0,
	}
}

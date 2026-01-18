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

			// Update bot's avatar URL via RPC
			const updateResult = await updateBotAvatar({
				payload: {
					id: botId,
					avatarUrl: result.publicUrl,
				},
			})

			if (!Exit.isSuccess(updateResult)) {
				toast.error("Upload failed", {
					description: "Failed to update avatar. Please try again.",
				})
				return null
			}

			toast.success("Avatar updated")
			return result.publicUrl
		},
		[botId, upload, updateBotAvatar],
	)

	return {
		uploadBotAvatar,
		isUploading,
		uploadProgress: typeof progress === "number" ? progress : 0,
	}
}

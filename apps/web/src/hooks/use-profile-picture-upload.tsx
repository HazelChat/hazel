import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react"
import type { UserId } from "@hazel/schema"
import { Exit } from "effect"
import { useCallback } from "react"
import { toast } from "sonner"
import { updateUserAction } from "~/db/actions"
import { currentUserQueryAtom, useAuth } from "~/lib/auth"
import { useUpload } from "./use-upload"

export function useProfilePictureUpload() {
	const { user } = useAuth()
	const refreshCurrentUser = useAtomRefresh(currentUserQueryAtom)
	const updateUserMutation = useAtomSet(updateUserAction, { mode: "promiseExit" })

	const { upload, isUploading, progress } = useUpload()

	const uploadProfilePicture = useCallback(
		async (file: File): Promise<string | null> => {
			if (!user?.id) {
				toast.error("Authentication required", {
					description: "You must be logged in to upload a profile picture",
				})
				return null
			}

			// Upload using the unified hook
			const result = await upload({
				type: "user-avatar",
				file,
			})

			if (!result) {
				return null
			}

			// Update user's avatar URL
			const updateResult = await updateUserMutation({
				userId: user.id as UserId,
				avatarUrl: result.publicUrl,
			})

			if (!Exit.isSuccess(updateResult)) {
				toast.error("Upload failed", {
					description: "Failed to update profile. Please try again.",
				})
				return null
			}

			// Refresh the current user query to update UI immediately
			refreshCurrentUser()

			toast.success("Profile picture updated")
			return result.publicUrl
		},
		[user?.id, upload, updateUserMutation, refreshCurrentUser],
	)

	return {
		uploadProfilePicture,
		isUploading,
		uploadProgress: typeof progress === "number" ? progress : 0,
	}
}

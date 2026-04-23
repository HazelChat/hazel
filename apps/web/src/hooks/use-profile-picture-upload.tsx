import { useUser } from "@clerk/react"
import { useAtomRefresh } from "@effect/atom-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { userAtom } from "~/lib/auth"

export function useProfilePictureUpload() {
	const { user: clerkUser } = useUser()
	const refreshCurrentUser = useAtomRefresh(userAtom)
	const [isUploading, setIsUploading] = useState(false)

	const uploadProfilePicture = useCallback(
		async (file: File): Promise<string | null> => {
			if (!clerkUser) {
				toast.error("Authentication required", {
					description: "You must be logged in to upload a profile picture",
				})
				return null
			}

			setIsUploading(true)
			try {
				const updated = await clerkUser.setProfileImage({ file })
				refreshCurrentUser()
				toast.success("Profile picture updated")
				return updated.publicUrl ?? null
			} catch (error) {
				console.error(error)
				toast.error("Upload failed", {
					description: "Failed to update profile picture. Please try again.",
				})
				return null
			} finally {
				setIsUploading(false)
			}
		},
		[clerkUser, refreshCurrentUser],
	)

	return {
		uploadProfilePicture,
		isUploading,
		uploadProgress: isUploading ? 50 : 0,
	}
}

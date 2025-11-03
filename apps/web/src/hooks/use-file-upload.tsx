import { useAtomSet } from "@effect-atom/atom-react"
import type { AttachmentId, ChannelId, OrganizationId } from "@hazel/db/schema"
import { Exit } from "effect"
import { useCallback } from "react"
import { toast } from "sonner"
import { useAuth } from "~/lib/auth"
import { HazelApiClient } from "~/lib/services/common/atom-client"

interface UseFileUploadOptions {
	organizationId: OrganizationId
	channelId: ChannelId
	maxFileSize?: number
}

export function useFileUpload({
	organizationId,
	channelId,
	maxFileSize = 10 * 1024 * 1024,
}: UseFileUploadOptions) {
	const { user } = useAuth()

	const uploadFileMutation = useAtomSet(HazelApiClient.mutation("attachments", "upload"), {
		mode: "promiseExit",
	})

	const uploadFile = useCallback(
		async (file: File): Promise<AttachmentId | null> => {
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

			const formData = new FormData()
			formData.append("file", file, file.name)
			formData.append("organizationId", organizationId)
			formData.append("channelId", channelId)

			const res = await uploadFileMutation({
				payload: formData,
			})

			if (Exit.isSuccess(res)) {
				return res.value.data.id
			}

			// Show error toast if upload failed
			toast.error("Upload failed", {
				description: "Failed to upload file. Please try again.",
			})

			return null
		},
		[maxFileSize, organizationId, channelId, user?.id, uploadFileMutation],
	)

	return {
		uploadFile,
	}
}

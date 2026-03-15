import { useAtomSet } from "@effect/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { Exit } from "effect"
import { useCallback } from "react"
import { toast } from "sonner"
import { updateOrganizationAction } from "~/db/actions"
import { useUpload } from "./use-upload"

export function useOrganizationAvatarUpload(organizationId: OrganizationId) {
	const updateOrganization = useAtomSet(updateOrganizationAction, {
		mode: "promiseExit",
	})

	const { upload, isUploading, progress } = useUpload()

	const uploadOrganizationAvatar = useCallback(
		async (file: File): Promise<string | null> => {
			if (!organizationId) {
				toast.error("Organization required", {
					description: "Organization ID is required to upload an avatar",
				})
				return null
			}

			// Upload using the unified hook
			const result = await upload({
				type: "organization-avatar",
				organizationId,
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

			// Update organization's logo URL (optimistic update happens in action's onMutate)
			const updateResult = await updateOrganization({
				organizationId,
				logoUrl: publicUrl,
			})

			if (!Exit.isSuccess(updateResult)) {
				toast.error("Upload failed", {
					description: "Failed to update organization. Please try again.",
				})
				return null
			}

			toast.success("Organization logo updated")
			return publicUrl
		},
		[organizationId, upload, updateOrganization],
	)

	return {
		uploadOrganizationAvatar,
		isUploading,
		uploadProgress: typeof progress === "number" ? progress : 0,
	}
}

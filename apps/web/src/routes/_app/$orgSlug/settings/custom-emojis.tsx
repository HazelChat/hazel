import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Exit } from "effect"
import IconEmojiAdd from "~/components/icons/icon-emoji-add"
import IconTrash from "~/components/icons/icon-trash"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { TextField } from "~/components/ui/text-field"
import { createCustomEmojiAction, deleteCustomEmojiAction } from "~/db/actions"
import { customEmojiCollection, organizationMemberCollection, userCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { useUpload } from "~/hooks/use-upload"
import { useAuth } from "~/lib/auth"
import type { CustomEmojiId } from "@hazel/schema"

export const Route = createFileRoute("/_app/$orgSlug/settings/custom-emojis")({
	component: CustomEmojisSettings,
})

const EMOJI_NAME_REGEX = /^[a-z0-9_-]+$/

function CustomEmojisSettings() {
	const { organizationId, organization } = useOrganization()
	const { user, isLoading: isAuthLoading } = useAuth()

	const [name, setName] = useState("")
	const [nameError, setNameError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	const { upload, isUploading } = useUpload()

	const createCustomEmoji = useAtomSet(createCustomEmojiAction, { mode: "promiseExit" })
	const deleteCustomEmoji = useAtomSet(deleteCustomEmojiAction, { mode: "promiseExit" })

	// Get custom emojis for this org
	const { data: customEmojis, isLoading: isLoadingEmojis } = useLiveQuery(
		(q) =>
			q
				.from({ emoji: customEmojiCollection })
				.where(({ emoji }) => eq(emoji.organizationId, organizationId))
				.where(({ emoji }) => isNull(emoji.deletedAt))
				.orderBy(({ emoji }) => emoji.createdAt, "desc"),
		[organizationId],
	)

	// Check permissions
	const { data: teamMembers, isLoading: isLoadingMembers } = useLiveQuery(
		(q) =>
			q
				.from({ members: organizationMemberCollection })
				.where(({ members }) => eq(members.organizationId, organizationId))
				.innerJoin({ user: userCollection }, ({ members, user }) => eq(members.userId, user.id))
				.where(({ user }) => eq(user.userType, "user"))
				.select(({ members }) => ({ ...members })),
		[organizationId],
	)

	const currentUserMember = teamMembers?.find((m) => m.userId === user?.id)
	const isAdmin = currentUserMember?.role === "owner" || currentUserMember?.role === "admin"
	const isPermissionsLoading = isAuthLoading || isLoadingMembers

	const validateName = (value: string): string | null => {
		if (!value) return "Name is required"
		if (value.length > 64) return "Name must be 64 characters or less"
		if (!EMOJI_NAME_REGEX.test(value)) return "Only lowercase letters, numbers, hyphens, and underscores"
		return null
	}

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toLowerCase()
		setName(value)
		setNameError(validateName(value))
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Validate
		const allowedTypes = ["image/png", "image/gif", "image/webp"]
		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type", { description: "Please select a PNG, GIF, or WebP image" })
			return
		}
		if (file.size > 256 * 1024) {
			toast.error("File too large", { description: "Emoji images must be under 256KB" })
			return
		}

		setSelectedFile(file)
		setPreviewUrl(URL.createObjectURL(file))
	}

	const handleUpload = async () => {
		if (!organizationId || !selectedFile || !name || nameError || !user) return

		// Upload image
		const result = await upload({
			type: "custom-emoji",
			organizationId,
			file: selectedFile,
		})

		if (!result) return

		// Construct public URL
		const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL
		if (!r2PublicUrl) {
			toast.error("Configuration error", {
				description: "Image upload is not configured. Please contact support.",
			})
			return
		}
		const publicUrl = `${r2PublicUrl}/${result.key}`

		// Create emoji record
		const createResult = await createCustomEmoji({
			organizationId,
			name,
			imageUrl: publicUrl,
			createdBy: user.id,
		})

		if (Exit.isSuccess(createResult)) {
			toast.success(`Emoji :${name}: created`)
			setName("")
			setSelectedFile(null)
			setPreviewUrl(null)
			if (fileInputRef.current) fileInputRef.current.value = ""
		} else {
			toast.error("Failed to create emoji", {
				description: "The name may already be taken. Please try another.",
			})
		}
	}

	const handleDelete = async (emojiId: CustomEmojiId, emojiName: string) => {
		const result = await deleteCustomEmoji({ emojiId })
		if (Exit.isSuccess(result)) {
			toast.success(`Emoji :${emojiName}: deleted`)
		} else {
			toast.error("Failed to delete emoji")
		}
	}

	if (!organizationId) return null

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			{/* Upload Section */}
			{(isAdmin || isPermissionsLoading) && (
				<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
					<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<IconEmojiAdd className="size-5 text-muted-fg" />
								<h2 className="font-semibold text-fg text-lg">Add Custom Emoji</h2>
							</div>
							<p className="text-muted-fg text-sm">
								Upload custom emojis for your workspace. PNG, GIF, or WebP under 256KB.
							</p>
						</div>
					</div>

					<div className="p-4 md:p-6">
						<div className="flex flex-col gap-4">
							<div className="flex items-start gap-4">
								{/* Preview / Upload Button */}
								<button
									type="button"
									className="flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-bg-muted/30 transition-colors hover:border-primary hover:bg-bg-muted/50"
									onClick={() => fileInputRef.current?.click()}
								>
									{previewUrl ? (
										<img
											src={previewUrl}
											alt="Preview"
											className="size-12 rounded object-contain"
										/>
									) : (
										<IconEmojiAdd className="size-6 text-muted-fg" />
									)}
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/png,image/gif,image/webp"
									className="hidden"
									onChange={handleFileSelect}
								/>

								{/* Name Input */}
								<div className="flex flex-1 flex-col gap-2">
									<TextField className="max-w-xs">
										<Label>Shortcode</Label>
										<Input
											value={name}
											onChange={handleNameChange}
											placeholder="e.g. partyparrot"
											aria-invalid={!!nameError}
										/>
										{nameError ? (
											<Description className="text-danger">{nameError}</Description>
										) : (
											<Description>
												{name
													? `:${name}:`
													: "Lowercase, numbers, hyphens, underscores"}
											</Description>
										)}
									</TextField>
								</div>
							</div>

							<Button
								intent="primary"
								size="sm"
								className="self-start"
								onPress={handleUpload}
								isDisabled={
									!selectedFile ||
									!name ||
									!!nameError ||
									isUploading ||
									isPermissionsLoading ||
									!isAdmin
								}
							>
								{isUploading ? "Uploading..." : "Add Emoji"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Emoji List */}
			<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
				<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
					<div className="flex flex-col gap-0.5">
						<h2 className="font-semibold text-fg text-lg">Custom Emojis</h2>
						<p className="text-muted-fg text-sm">
							{customEmojis?.length ?? 0} custom emoji
							{(customEmojis?.length ?? 0) !== 1 ? "s" : ""} in this workspace
						</p>
					</div>
				</div>

				<div className="p-4 md:p-6">
					{isLoadingEmojis ? (
						<p className="text-muted-fg text-sm">Loading...</p>
					) : !customEmojis?.length ? (
						<p className="text-muted-fg text-sm">No custom emojis yet.</p>
					) : (
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{customEmojis.map((emoji) => (
								<div
									key={emoji.id}
									className="flex items-center gap-3 rounded-lg border border-border p-3"
								>
									<img
										src={emoji.imageUrl}
										alt={emoji.name}
										className="size-8 rounded object-contain"
									/>
									<div className="flex flex-1 flex-col">
										<span className="font-medium text-fg text-sm">:{emoji.name}:</span>
									</div>
									{isAdmin && (
										<Button
											intent="danger"
											size="sm"
											onPress={() =>
												handleDelete(emoji.id as CustomEmojiId, emoji.name)
											}
										>
											<IconTrash data-slot="icon" />
										</Button>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

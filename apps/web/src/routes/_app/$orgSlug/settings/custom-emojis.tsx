import { useAtomSet } from "@effect-atom/atom-react"
import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Exit } from "effect"
import { EmojiConfiguratorModal } from "~/components/emoji-configurator/emoji-configurator-modal"
import IconEmoji1 from "~/components/icons/icon-emoji-1"
import IconEmojiAdd from "~/components/icons/icon-emoji-add"
import IconTrash from "~/components/icons/icon-trash"
import { IconWarning } from "~/components/icons/icon-warning"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { EmptyState } from "~/components/ui/empty-state"
import { Modal, ModalContent } from "~/components/ui/modal"
import { createCustomEmojiAction, deleteCustomEmojiAction } from "~/db/actions"
import { customEmojiCollection, organizationMemberCollection, userCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { useUpload } from "~/hooks/use-upload"
import { useAuth } from "~/lib/auth"
import type { CustomEmojiId } from "@hazel/schema"

export const Route = createFileRoute("/_app/$orgSlug/settings/custom-emojis")({
	component: CustomEmojisSettings,
})

function CustomEmojisSettings() {
	const { organizationId, organization } = useOrganization()
	const { user, isLoading: isAuthLoading } = useAuth()

	const fileInputRef = useRef<HTMLInputElement>(null)
	const [configuratorFile, setConfiguratorFile] = useState<File | null>(null)
	const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<{ id: CustomEmojiId; name: string } | null>(null)

	const { upload, isUploading } = useUpload()

	const createCustomEmoji = useAtomSet(createCustomEmojiAction, { mode: "promiseExit" })
	const deleteCustomEmoji = useAtomSet(deleteCustomEmojiAction, { mode: "promiseExit" })

	// Get custom emojis for this org with creator info
	const { data: customEmojis, isLoading: isLoadingEmojis } = useLiveQuery(
		(q) =>
			q
				.from({ emoji: customEmojiCollection })
				.where(({ emoji }) => eq(emoji.organizationId, organizationId))
				.where(({ emoji }) => isNull(emoji.deletedAt))
				.innerJoin({ creator: userCollection }, ({ emoji, creator }) =>
					eq(emoji.createdBy, creator.id),
				)
				.orderBy(({ emoji }) => emoji.createdAt, "desc")
				.select(({ emoji, creator }) => ({
					...emoji,
					creatorFirstName: creator.firstName,
					creatorLastName: creator.lastName,
				})),
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

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const allowedTypes = ["image/png", "image/gif", "image/webp"]
		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type", { description: "Please select a PNG, GIF, or WebP image" })
			return
		}

		setConfiguratorFile(file)
		setIsConfiguratorOpen(true)
		// Reset file input so re-selecting the same file triggers onChange
		if (fileInputRef.current) fileInputRef.current.value = ""
	}

	const handleConfiguratorSave = async (blob: Blob, name: string) => {
		if (!organizationId || !user) return

		setIsConfiguratorOpen(false)
		setConfiguratorFile(null)

		const file = new File([blob], `${name}.webp`, { type: "image/webp" })

		const result = await upload({
			type: "custom-emoji",
			organizationId,
			file,
		})

		if (!result) return

		const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL
		if (!r2PublicUrl) {
			toast.error("Configuration error", {
				description: "Image upload is not configured. Please contact support.",
			})
			return
		}
		const publicUrl = `${r2PublicUrl}/${result.key}`

		const createResult = await createCustomEmoji({
			organizationId,
			name,
			imageUrl: publicUrl,
			createdBy: user.id,
		})

		if (Exit.isSuccess(createResult)) {
			toast.success(`Emoji :${name}: created`)
		} else {
			toast.error("Failed to create emoji", {
				description: "The name may already be taken. Please try another.",
			})
		}
	}

	const handleDelete = async (emojiId: CustomEmojiId, emojiName: string) => {
		setDeleteTarget(null)
		const result = await deleteCustomEmoji({ emojiId })
		if (Exit.isSuccess(result)) {
			toast.success(`Emoji :${emojiName}: deleted`)
		} else {
			toast.error("Failed to delete emoji")
		}
	}

	if (!organizationId) return null

	return (
		<>
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
									Upload custom emojis for your workspace. PNG, GIF, or WebP.
								</p>
							</div>
						</div>

						<div className="p-4 md:p-6">
							<Button
								intent="outline"
								onPress={() => fileInputRef.current?.click()}
								isDisabled={isUploading || isPermissionsLoading || !isAdmin}
							>
								<IconEmojiAdd data-slot="icon" />
								{isUploading ? "Uploading..." : "Upload Emoji"}
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/gif,image/webp"
								className="hidden"
								onChange={handleFileSelect}
							/>
						</div>
					</div>
				)}

				{/* Emoji List */}
				<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
					<div className="border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6">
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<IconEmoji1 className="size-5 text-muted-fg" />
								<h2 className="font-semibold text-fg text-lg">Custom Emojis</h2>
								<span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-xs">
									{customEmojis?.length ?? 0} emoji
									{(customEmojis?.length ?? 0) !== 1 ? "s" : ""}
								</span>
							</div>
							<p className="text-muted-fg text-sm">Manage custom emojis for your workspace.</p>
						</div>
					</div>

					{isLoadingEmojis ? (
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead className="border-border border-b bg-bg">
									<tr>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Emoji
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Shortcode
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Added by
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Added
										</th>
										<th className="px-4 py-3 text-right font-medium text-muted-fg text-xs">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{Array.from({ length: 5 }).map((_, i) => (
										<tr key={i}>
											<td className="px-4 py-4">
												<div className="size-8 animate-pulse rounded bg-secondary" />
											</td>
											<td className="px-4 py-4">
												<div className="h-4 w-24 animate-pulse rounded bg-secondary" />
											</td>
											<td className="px-4 py-4">
												<div className="h-4 w-28 animate-pulse rounded bg-secondary" />
											</td>
											<td className="px-4 py-4">
												<div className="h-4 w-20 animate-pulse rounded bg-secondary" />
											</td>
											<td className="px-4 py-4 text-right">
												<div className="size-8 animate-pulse rounded bg-secondary" />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : !customEmojis?.length ? (
						<EmptyState
							icon={IconEmoji1}
							title="No custom emojis yet"
							description="Upload custom emojis to use in messages across your workspace."
							action={
								isAdmin ? (
									<Button
										intent="primary"
										size="sm"
										onPress={() => fileInputRef.current?.click()}
									>
										Upload emoji
									</Button>
								) : undefined
							}
						/>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead className="border-border border-b bg-bg">
									<tr>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Emoji
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Shortcode
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Added by
										</th>
										<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
											Added
										</th>
										<th className="px-4 py-3 text-right font-medium text-muted-fg text-xs">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{customEmojis.map((emoji) => (
										<tr key={emoji.id} className="hover:bg-secondary/50">
											<td className="px-4 py-4">
												<img
													src={emoji.imageUrl}
													alt={emoji.name}
													className="size-8 rounded object-contain"
												/>
											</td>
											<td className="px-4 py-4">
												<span className="font-medium text-fg text-sm">
													:{emoji.name}:
												</span>
											</td>
											<td className="px-4 py-4">
												<span className="text-muted-fg text-sm">
													{emoji.creatorFirstName} {emoji.creatorLastName}
												</span>
											</td>
											<td className="px-4 py-4">
												<span className="text-muted-fg text-sm">
													{emoji.createdAt
														? formatDistanceToNow(new Date(emoji.createdAt), {
																addSuffix: true,
															})
														: "—"}
												</span>
											</td>
											<td className="px-4 py-4">
												{isAdmin && (
													<div className="flex justify-end">
														<Button
															intent="danger"
															size="sq-sm"
															onPress={() =>
																setDeleteTarget({
																	id: emoji.id as CustomEmojiId,
																	name: emoji.name,
																})
															}
														>
															<IconTrash data-slot="icon" />
														</Button>
													</div>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<Modal>
				<ModalContent
					isOpen={!!deleteTarget}
					onOpenChange={(open) => !open && setDeleteTarget(null)}
					size="md"
				>
					<Dialog>
						<DialogHeader>
							<div className="flex size-12 items-center justify-center rounded-lg border border-danger/10 bg-danger/5">
								<IconWarning className="size-6 text-danger" />
							</div>
							<DialogTitle>Delete custom emoji</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete <strong>:{deleteTarget?.name}:</strong>?
								Messages that use this emoji will show the text code instead.
							</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<DialogClose intent="secondary">Cancel</DialogClose>
							<Button
								intent="danger"
								onPress={() =>
									deleteTarget && handleDelete(deleteTarget.id, deleteTarget.name)
								}
							>
								Delete emoji
							</Button>
						</DialogFooter>
					</Dialog>
				</ModalContent>
			</Modal>

			{/* Emoji Configurator Modal */}
			<EmojiConfiguratorModal
				isOpen={isConfiguratorOpen}
				onOpenChange={(open) => {
					setIsConfiguratorOpen(open)
					if (!open) setConfiguratorFile(null)
				}}
				imageFile={configuratorFile}
				onSave={handleConfiguratorSave}
			/>
		</>
	)
}

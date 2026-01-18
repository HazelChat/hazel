import { useState } from "react"
import { Button, type DropItem, DropZone, FileTrigger } from "react-aria-components"
import { toast } from "sonner"
import { BotAvatar } from "~/components/bots/bot-avatar"
import IconEdit from "~/components/icons/icon-edit"
import { AvatarCropModal } from "~/components/profile/avatar-crop-modal"
import { Loader } from "~/components/ui/loader"
import type { BotWithUser } from "~/db/hooks"
import { useBotAvatarUpload } from "~/hooks/use-bot-avatar-upload"
import { useDragDetection } from "~/hooks/use-drag-detection"
import { cx } from "~/utils/cx"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

interface BotAvatarUploadProps {
	bot: BotWithUser
	className?: string
}

export function BotAvatarUpload({ bot, className }: BotAvatarUploadProps) {
	const { uploadBotAvatar, isUploading, uploadProgress } = useBotAvatarUpload(bot.id)
	const { isDraggingOnPage } = useDragDetection()
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isCropModalOpen, setIsCropModalOpen] = useState(false)

	// Shared file validation and processing
	const processFile = (file: File) => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error("Invalid file type", {
				description: "Please select a JPEG, PNG, or WebP image",
			})
			return
		}

		if (file.size > MAX_FILE_SIZE) {
			toast.error("File too large", {
				description: "Image must be less than 5MB",
			})
			return
		}

		setSelectedFile(file)
		setIsCropModalOpen(true)
	}

	// Handle files from FileTrigger (click to upload)
	const handleFileSelect = (files: FileList | null) => {
		const file = files?.[0]
		if (file) processFile(file)
	}

	// Handle files from DropZone (drag and drop)
	const handleDrop = async (e: { items: DropItem[] }) => {
		const fileItem = e.items.find(
			(item): item is DropItem & { kind: "file"; getFile: () => Promise<File> } => item.kind === "file",
		)
		if (!fileItem) return

		const file = await fileItem.getFile()
		processFile(file)
	}

	const handleCropComplete = async (croppedBlob: Blob) => {
		setIsCropModalOpen(false)

		// Convert Blob to File for existing upload function
		const croppedFile = new File([croppedBlob], "avatar.webp", { type: "image/webp" })
		await uploadBotAvatar(croppedFile)

		setSelectedFile(null)
	}

	const handleCropModalOpenChange = (open: boolean) => {
		setIsCropModalOpen(open)
		if (!open) {
			setSelectedFile(null)
		}
	}

	return (
		<div className={cx("relative inline-block", className)}>
			<DropZone
				getDropOperation={(types) =>
					types.has("image/jpeg") || types.has("image/png") || types.has("image/webp")
						? "copy"
						: "cancel"
				}
				onDrop={handleDrop}
				isDisabled={isUploading}
				className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
			>
				{({ isDropTarget }) => (
					<FileTrigger acceptedFileTypes={ALLOWED_TYPES} onSelect={handleFileSelect}>
						<Button
							className={cx(
								"group relative size-24 cursor-pointer rounded-xl transition-all duration-200",
								isUploading && "pointer-events-none",
								isDropTarget && "scale-105",
							)}
							style={{
								// @ts-expect-error CSS property
								cornerShape: "squircle",
							}}
							aria-label="Change bot avatar"
							aria-busy={isUploading}
						>
							{/* Avatar */}
							<BotAvatar bot={bot} size="4xl" className="transition-all duration-200" />

							{/* Drop target overlay - strong indicator when hovering */}
							{isDropTarget && (
								<div
									className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-primary/20 backdrop-blur-sm"
									style={{
										// @ts-expect-error CSS property
										cornerShape: "squircle",
									}}
								>
									<span className="font-medium text-white text-xs drop-shadow-md">
										Drop here
									</span>
								</div>
							)}

							{/* Indicator when dragging anywhere on page */}
							{isDraggingOnPage && !isDropTarget && (
								<div
									className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-primary/20 backdrop-blur-sm"
									style={{
										// @ts-expect-error CSS property
										cornerShape: "squircle",
									}}
								>
									<span className="font-medium text-fg text-xs">Drop image</span>
								</div>
							)}

							{/* Hover overlay with edit icon / uploading state */}
							{!isDropTarget && !isDraggingOnPage && (
								<div
									className={cx(
										"absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 transition-opacity duration-200",
										isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100",
									)}
									style={{
										// @ts-expect-error CSS property
										cornerShape: "squircle",
									}}
								>
									{isUploading ? (
										<div className="flex flex-col items-center gap-2">
											<Loader className="size-6 text-white drop-shadow-md" />
											<span className="font-medium text-white text-xs drop-shadow-md">
												Uploading...
											</span>
										</div>
									) : (
										<div className="flex flex-col items-center gap-1">
											<IconEdit className="size-6 text-white drop-shadow-md" />
											<span className="font-medium text-white text-xs drop-shadow-md">
												Edit
											</span>
										</div>
									)}
								</div>
							)}

							{/* Linear progress bar at bottom */}
							{isUploading && (
								<div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-xl bg-white/20">
									<div
										className="h-full bg-white transition-[width] duration-150"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
							)}
						</Button>
					</FileTrigger>
				)}
			</DropZone>

			{/* Helper text */}
			<p className="mt-2 text-center text-muted-fg text-xs">Click or drop image</p>

			{/* Avatar cropping modal */}
			<AvatarCropModal
				isOpen={isCropModalOpen}
				onOpenChange={handleCropModalOpenChange}
				imageFile={selectedFile}
				onCropComplete={handleCropComplete}
			/>
		</div>
	)
}

import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react"
import { Exit } from "effect"
import { useState } from "react"
import { Button, type DropItem, DropZone, FileTrigger } from "react-aria-components"
import { toast } from "sonner"
import { resetUserAvatarMutation } from "~/atoms/user-atoms"
import IconEdit from "~/components/icons/icon-edit"
import { Avatar } from "~/components/ui/avatar/avatar"
import { Loader } from "~/components/ui/loader"
import { useDragDetection } from "~/hooks/use-drag-detection"
import { useProfilePictureUpload } from "~/hooks/use-profile-picture-upload"
import { currentUserQueryAtom } from "~/lib/auth"
import { cx } from "~/utils/cx"
import { AvatarCropModal } from "./avatar-crop-modal"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

interface ProfilePictureUploadProps {
	currentAvatarUrl?: string | null
	userId: string
	userInitials?: string
	className?: string
	showReset?: boolean
}

export function ProfilePictureUpload({
	currentAvatarUrl,
	userId,
	userInitials,
	className,
	showReset = false,
}: ProfilePictureUploadProps) {
	const { uploadProfilePicture, isUploading, uploadProgress } = useProfilePictureUpload()
	const { isDraggingOnPage } = useDragDetection()
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isCropModalOpen, setIsCropModalOpen] = useState(false)
	const [isResetting, setIsResetting] = useState(false)

	const resetAvatar = useAtomSet(resetUserAvatarMutation, { mode: "promiseExit" })
	const refreshCurrentUser = useAtomRefresh(currentUserQueryAtom)

	const handleResetAvatar = async () => {
		if (!userId) return

		setIsResetting(true)
		try {
			const result = await resetAvatar({ payload: void 0 })

			if (Exit.isSuccess(result)) {
				refreshCurrentUser()
				toast.success("Profile picture reset to account photo")
			} else {
				console.error(result.cause)
				toast.error("Failed to reset profile picture")
			}
		} finally {
			setIsResetting(false)
		}
	}

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
		await uploadProfilePicture(croppedFile)

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
							aria-label="Change profile picture"
							aria-busy={isUploading}
						>
							{/* Avatar */}
							<Avatar
								src={currentAvatarUrl}
								alt="Your profile picture"
								initials={userInitials}
								size="4xl"
								className="transition-all duration-200"
							/>

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

			{/* Reset link */}
			{showReset && (
				<button
					type="button"
					onClick={handleResetAvatar}
					disabled={isResetting || isUploading}
					className="mt-1 w-full text-center text-muted-fg text-xs underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isResetting ? "Resetting..." : "Reset to account photo"}
				</button>
			)}

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

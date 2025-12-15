import type { Attachment, User } from "@hazel/domain/models"
import { PlayIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import { IconDownload } from "~/components/icons/icon-download"
import { Button } from "~/components/ui/button"
import { getFileTypeFromName } from "~/utils/file-utils"
import { ImageViewerModal, type ViewerImage } from "../image-viewer-modal"

type AttachmentWithUser = typeof Attachment.Model.Type & {
	user: typeof User.Model.Type | null
}

interface ChannelFilesMediaGridProps {
	attachments: AttachmentWithUser[]
}

function MediaItem({
	attachment,
	isVideo,
	onClick,
}: {
	attachment: AttachmentWithUser
	isVideo: boolean
	onClick: () => void
}) {
	const [imageError, setImageError] = useState(false)
	const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || "https://cdn.hazel.sh"
	const mediaUrl = `${publicUrl}/${attachment.id}`

	const handleDownload = (e: React.MouseEvent) => {
		e.stopPropagation()
		const link = document.createElement("a")
		link.href = mediaUrl
		link.download = attachment.fileName
		link.target = "_blank"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	if (imageError) {
		return null
	}

	return (
		<button
			type="button"
			className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-secondary/30 transition-colors hover:border-muted-fg/50"
			onClick={onClick}
		>
			{isVideo ? (
				<>
					{/* biome-ignore lint/a11y/useMediaCaption: decorative thumbnail */}
					<video
						src={mediaUrl}
						className="size-full object-cover"
						preload="metadata"
						onError={() => setImageError(true)}
					/>
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-black/60">
							<PlayIcon className="ml-0.5 size-6 text-white" />
						</div>
					</div>
				</>
			) : (
				<img
					src={mediaUrl}
					alt={attachment.fileName}
					className="size-full object-cover"
					onError={() => setImageError(true)}
				/>
			)}

			{/* Hover overlay with download button */}
			<div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
				<Button
					intent="secondary"
					size="sq-sm"
					onPress={handleDownload as unknown as () => void}
					aria-label={`Download ${attachment.fileName}`}
					className="pointer-events-auto bg-bg/90"
				>
					<IconDownload />
				</Button>
			</div>
		</button>
	)
}

export function ChannelFilesMediaGrid({ attachments }: ChannelFilesMediaGridProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)

	if (attachments.length === 0) {
		return null
	}

	// Separate images from videos for the image viewer
	const images = attachments.filter((a) => {
		const fileType = getFileTypeFromName(a.fileName)
		return ["jpg", "png", "gif", "webp", "svg"].includes(fileType)
	})

	const handleMediaClick = (attachment: AttachmentWithUser, _index: number) => {
		const fileType = getFileTypeFromName(attachment.fileName)
		const isVideo = ["mp4", "webm"].includes(fileType)

		if (isVideo) {
			// For videos, open in new tab or use video player
			const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || "https://cdn.hazel.sh"
			window.open(`${publicUrl}/${attachment.id}`, "_blank")
		} else {
			// For images, open in modal
			const imageIndex = images.findIndex((img) => img.id === attachment.id)
			if (imageIndex !== -1) {
				setSelectedIndex(imageIndex)
				setIsModalOpen(true)
			}
		}
	}

	// Convert images to ViewerImage format
	const viewerImages: ViewerImage[] = images.map((attachment) => ({
		type: "attachment" as const,
		attachment,
	}))

	const selectedImage = images[selectedIndex]

	return (
		<>
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{attachments.map((attachment, index) => {
					const fileType = getFileTypeFromName(attachment.fileName)
					const isVideo = ["mp4", "webm"].includes(fileType)

					return (
						<MediaItem
							key={attachment.id}
							attachment={attachment}
							isVideo={isVideo}
							onClick={() => handleMediaClick(attachment, index)}
						/>
					)
				})}
			</div>

			{images.length > 0 && (
				<ImageViewerModal
					isOpen={isModalOpen}
					onOpenChange={setIsModalOpen}
					images={viewerImages}
					initialIndex={selectedIndex}
					author={selectedImage?.user ?? undefined}
					createdAt={selectedImage?.uploadedAt.getTime() ?? Date.now()}
				/>
			)}
		</>
	)
}

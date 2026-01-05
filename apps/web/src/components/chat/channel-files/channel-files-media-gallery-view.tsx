import type { Attachment, User } from "@hazel/domain/models"
import type { ChannelId } from "@hazel/schema"
import IconPlay from "~/components/icons/icon-play"
import { useState } from "react"
import { IconDownload } from "~/components/icons/icon-download"
import { Button } from "~/components/ui/button"
import { useChannelAttachments } from "~/db/hooks"
import { getFileCategory, getFileTypeFromName } from "~/utils/file-utils"
import { ImageViewerModal, type ViewerImage } from "../image-viewer-modal"

type AttachmentWithUser = typeof Attachment.Model.Type & {
	user: typeof User.Model.Type | null
}

interface MediaGalleryViewProps {
	channelId: ChannelId
}

function MasonryItem({
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
			className="group relative mb-2 w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg"
			onClick={onClick}
		>
			{isVideo ? (
				<>
					{/* biome-ignore lint/a11y/useMediaCaption: decorative thumbnail */}
					<video
						src={mediaUrl}
						className="w-full object-cover"
						preload="metadata"
						onError={() => setImageError(true)}
					/>
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-black/60">
							<IconPlay className="ml-0.5 size-6 text-white" />
						</div>
					</div>
				</>
			) : (
				<img
					src={mediaUrl}
					alt={attachment.fileName}
					className="w-full object-cover"
					loading="lazy"
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

export function MediaGalleryView({ channelId }: MediaGalleryViewProps) {
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)

	const { attachments: allAttachments } = useChannelAttachments(channelId)

	// Filter to only media (images + videos)
	const attachments = allAttachments
		.filter((a) => {
			const category = getFileCategory(a.attachments.fileName)
			return category === "image" || category === "video"
		})
		.map((a) => ({ ...a.attachments, user: a.user ?? null }))

	// Filter images for the ImageViewerModal (exclude videos)
	const images = attachments.filter((a) => {
		const fileType = getFileTypeFromName(a.fileName)
		return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType)
	})

	const handleMediaClick = (attachment: AttachmentWithUser) => {
		const fileType = getFileTypeFromName(attachment.fileName)
		const isVideo = ["mp4", "webm"].includes(fileType)

		if (isVideo) {
			// For videos, open in new tab
			const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || "https://cdn.hazel.sh"
			window.open(`${publicUrl}/${attachment.id}`, "_blank")
		} else {
			// For images, find index in images array and open viewer
			const imageIndex = images.findIndex((img) => img.id === attachment.id)
			if (imageIndex !== -1) {
				setSelectedImageIndex(imageIndex)
				setIsImageViewerOpen(true)
			}
		}
	}

	// Convert images to ViewerImage format for ImageViewerModal
	const viewerImages: ViewerImage[] = images.map((attachment) => ({
		type: "attachment" as const,
		attachment,
	}))

	const selectedImage = images[selectedImageIndex]
	const imageCount = images.length
	const videoCount = attachments.length - imageCount

	if (attachments.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center p-8 text-muted-fg">
				No media found in this channel
			</div>
		)
	}

	return (
		<>
			<div className="flex-1 overflow-y-auto p-4">
				{/* Stats */}
				<p className="mb-4 text-muted-fg text-sm">
					{imageCount} {imageCount === 1 ? "photo" : "photos"}
					{videoCount > 0 && `, ${videoCount} ${videoCount === 1 ? "video" : "videos"}`}
				</p>

				{/* Masonry grid */}
				<div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
					{attachments.map((attachment) => {
						const fileType = getFileTypeFromName(attachment.fileName)
						const isVideo = ["mp4", "webm"].includes(fileType)

						return (
							<MasonryItem
								key={attachment.id}
								attachment={attachment}
								isVideo={isVideo}
								onClick={() => handleMediaClick(attachment)}
							/>
						)
					})}
				</div>
			</div>

			{/* Single image viewer modal */}
			{images.length > 0 && (
				<ImageViewerModal
					isOpen={isImageViewerOpen}
					onOpenChange={setIsImageViewerOpen}
					images={viewerImages}
					initialIndex={selectedImageIndex}
					author={selectedImage?.user ?? undefined}
					createdAt={selectedImage?.uploadedAt.getTime() ?? Date.now()}
				/>
			)}
		</>
	)
}

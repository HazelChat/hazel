import type { Attachment, User } from "@hazel/domain/models"
import type { ChannelId } from "@hazel/schema"
import IconPlay from "~/components/icons/icon-play"
import { Link, useParams } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { IconDownload } from "~/components/icons/icon-download"
import { Button } from "~/components/ui/button"
import { useBreakpoint } from "~/hooks/use-breakpoint"
import { getFileTypeFromName } from "~/utils/file-utils"
import { ImageViewerModal, type ViewerImage } from "../image-viewer-modal"

type AttachmentWithUser = typeof Attachment.Model.Type & {
	user: typeof User.Model.Type | null
}

interface ChannelFilesMediaGridProps {
	attachments: AttachmentWithUser[]
	channelId: ChannelId
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
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handler added
		<div
			role="button"
			tabIndex={0}
			className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-secondary/30 transition-colors hover:border-muted-fg/50"
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault()
					onClick()
				}
			}}
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
							<IconPlay className="ml-0.5 size-6 text-white" />
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
		</div>
	)
}

export function ChannelFilesMediaGrid({ attachments, channelId }: ChannelFilesMediaGridProps) {
	const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const { orgSlug } = useParams({ strict: false })

	// Calculate visible count based on breakpoint
	const isXl = useBreakpoint("xl")
	const isLg = useBreakpoint("lg")
	const isSm = useBreakpoint("sm")

	const visibleCount = useMemo(() => {
		if (isXl) return 5
		if (isLg) return 4
		if (isSm) return 3
		return 2
	}, [isXl, isLg, isSm])

	if (attachments.length === 0) {
		return null
	}

	// Slice to show only one row
	const visibleAttachments = attachments.slice(0, visibleCount)
	const remainingCount = attachments.length - visibleCount
	const hasMore = remainingCount > 0

	// Separate images from videos for the image viewer
	const images = attachments.filter((a) => {
		const fileType = getFileTypeFromName(a.fileName)
		return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType)
	})

	const handleMediaClick = (attachment: AttachmentWithUser) => {
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
				setIsImageViewerOpen(true)
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
				{visibleAttachments.map((attachment, index) => {
					const fileType = getFileTypeFromName(attachment.fileName)
					const isVideo = ["mp4", "webm"].includes(fileType)
					const isLastItem = index === visibleAttachments.length - 1

					// Show "See all" link on the last item when there are more
					if (isLastItem && hasMore) {
						const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || "https://cdn.hazel.sh"
						const mediaUrl = `${publicUrl}/${attachment.id}`

						return (
							<Link
								key={attachment.id}
								to="/$orgSlug/chat/$id/files/media"
								params={{ orgSlug: orgSlug!, id: channelId }}
								className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary/30"
							>
								{isVideo ? (
									// biome-ignore lint/a11y/useMediaCaption: decorative thumbnail
									<video
										src={mediaUrl}
										className="size-full object-cover"
										preload="metadata"
									/>
								) : (
									<img
										src={mediaUrl}
										alt={attachment.fileName}
										className="size-full object-cover"
									/>
								)}
								<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
									<span className="font-semibold text-2xl">+{remainingCount}</span>
									<span className="text-sm text-white/80">See all</span>
								</div>
							</Link>
						)
					}

					return (
						<MediaItem
							key={attachment.id}
							attachment={attachment}
							isVideo={isVideo}
							onClick={() => handleMediaClick(attachment)}
						/>
					)
				})}
			</div>

			{/* Single image viewer modal */}
			{images.length > 0 && (
				<ImageViewerModal
					isOpen={isImageViewerOpen}
					onOpenChange={setIsImageViewerOpen}
					images={viewerImages}
					initialIndex={selectedIndex}
					author={selectedImage?.user ?? undefined}
					createdAt={selectedImage?.uploadedAt.getTime() ?? Date.now()}
				/>
			)}
		</>
	)
}

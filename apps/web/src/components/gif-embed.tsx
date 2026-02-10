import type { User } from "@hazel/domain/models"
import { useState } from "react"
import { ImageViewerModal, type ViewerImage } from "~/components/chat/image-viewer-modal"
import { extractGiphyMediaUrl } from "~/components/link-preview"

interface GifEmbedProps {
	url: string
	author?: typeof User.Model.Type
	createdAt?: number
}

export function GifEmbed({ url, author, createdAt }: GifEmbedProps) {
	const mediaUrl = extractGiphyMediaUrl(url)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const viewerImages: ViewerImage[] = [{ type: "url", url: mediaUrl, alt: "GIF" }]

	return (
		<div className="mt-1">
			<button type="button" className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
				<img
					src={mediaUrl}
					alt="GIF"
					className="max-h-[300px] max-w-sm rounded-md transition-opacity hover:opacity-90"
					loading="lazy"
					draggable={false}
				/>
			</button>
			<a
				href="https://giphy.com"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-0.5 block text-[10px] text-muted-fg hover:text-fg/60"
			>
				via GIPHY
			</a>
			<ImageViewerModal
				isOpen={isModalOpen}
				onOpenChange={setIsModalOpen}
				images={viewerImages}
				initialIndex={0}
				author={author}
				createdAt={createdAt ?? Date.now()}
			/>
		</div>
	)
}

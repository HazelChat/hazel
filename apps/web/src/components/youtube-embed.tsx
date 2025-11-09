"use client"

import { extractYoutubeTimestamp } from "./link-preview"

interface YoutubeEmbedProps {
	videoId: string
	url: string
}

export function YoutubeEmbed({ videoId, url }: YoutubeEmbedProps) {
	// Extract timestamp if present
	const startTime = extractYoutubeTimestamp(url)

	// Build iframe URL with optional start parameter
	const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`)
	if (startTime) {
		embedUrl.searchParams.set("start", startTime.toString())
	}

	return (
		<div className="mt-2 w-full max-w-xl overflow-hidden rounded-lg border border-fg/15 pressed:border-fg/15 bg-muted/40 pressed:bg-muted hover:border-fg/15 hover:bg-muted">
			<div className="relative aspect-video w-full">
				<iframe
					src={embedUrl.toString()}
					title="YouTube video player"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
					className="absolute inset-0 size-full"
				/>
			</div>
		</div>
	)
}

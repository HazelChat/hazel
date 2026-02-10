import type { GiphyGif } from "@hazel/domain/http"
import { useEffect, useRef, useState } from "react"

interface GifPickerGridProps {
	gifs: GiphyGif[]
	isLoading: boolean
	hasMore: boolean
	onLoadMore: () => void
	onGifSelect: (gifUrl: string) => void
}

function GifThumbnail({ gif, onSelect }: { gif: GiphyGif; onSelect: (url: string) => void }) {
	const [isHovered, setIsHovered] = useState(false)
	const still = gif.images.fixed_width_still.url
	const animated = gif.images.fixed_width.url
	const width = Number.parseInt(gif.images.fixed_width.width, 10)
	const height = Number.parseInt(gif.images.fixed_width.height, 10)
	const aspectRatio = width && height ? width / height : 1

	return (
		<button
			type="button"
			className="w-full cursor-pointer overflow-hidden rounded-md bg-muted/60 transition-opacity hover:opacity-90"
			style={{ aspectRatio }}
			onClick={() => onSelect(gif.images.original.url)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			title={gif.title}
		>
			<img
				src={isHovered ? animated : still}
				alt={gif.title}
				className="h-full w-full object-cover"
				loading="lazy"
				draggable={false}
			/>
		</button>
	)
}

export function GifPickerGrid({ gifs, isLoading, hasMore, onLoadMore, onGifSelect }: GifPickerGridProps) {
	const sentinelRef = useRef<HTMLDivElement>(null)

	const isLoadingRef = useRef(isLoading)
	isLoadingRef.current = isLoading
	const hasMoreRef = useRef(hasMore)
	hasMoreRef.current = hasMore
	const onLoadMoreRef = useRef(onLoadMore)
	onLoadMoreRef.current = onLoadMore

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
					onLoadMoreRef.current()
				}
			},
			{ rootMargin: "200px" },
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [])

	if (gifs.length === 0) {
		if (isLoading) {
			return (
				<div className="flex flex-1 items-center justify-center py-4">
					<div className="size-5 animate-spin rounded-full border-2 border-fg/20 border-t-fg/60" />
				</div>
			)
		}
		return (
			<div className="flex flex-1 items-center justify-center text-sm text-muted-fg">No GIFs found</div>
		)
	}

	// Split into 2 columns for masonry layout
	const col1: GiphyGif[] = []
	const col2: GiphyGif[] = []
	let h1 = 0
	let h2 = 0
	for (const gif of gifs) {
		const w = Number.parseInt(gif.images.fixed_width.width, 10) || 200
		const h = Number.parseInt(gif.images.fixed_width.height, 10) || 200
		const ratio = h / w
		if (h1 <= h2) {
			col1.push(gif)
			h1 += ratio
		} else {
			col2.push(gif)
			h2 += ratio
		}
	}

	return (
		<div className="flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin">
			<div className="flex gap-2">
				<div className="flex w-1/2 flex-col gap-2">
					{col1.map((gif) => (
						<GifThumbnail key={gif.id} gif={gif} onSelect={onGifSelect} />
					))}
				</div>
				<div className="flex w-1/2 flex-col gap-2">
					{col2.map((gif) => (
						<GifThumbnail key={gif.id} gif={gif} onSelect={onGifSelect} />
					))}
				</div>
			</div>
			{isLoading && (
				<div className="flex justify-center py-4">
					<div className="size-5 animate-spin rounded-full border-2 border-fg/20 border-t-fg/60" />
				</div>
			)}
			<div ref={sentinelRef} className="h-1" />
		</div>
	)
}

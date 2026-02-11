import type { KlipyGif } from "@hazel/domain/http"
import { Collection, GridList, GridListItem, GridListLoadMoreItem } from "react-aria-components"
import { Loader } from "../ui/loader"

interface GifPickerGridProps {
	gifs: KlipyGif[]
	isLoading: boolean
	isLoadingMore: boolean
	hasMore: boolean
	onLoadMore: () => void
	onGifSelect: (gifUrl: string) => void
}

export function GifPickerGrid({
	gifs,
	isLoading,
	isLoadingMore,
	hasMore,
	onLoadMore,
	onGifSelect,
}: GifPickerGridProps) {
	const canLoadMore = hasMore && !isLoading && gifs.length > 0

	return (
		<GridList
			aria-label="GIF results"
			layout="grid"
			disallowTypeAhead
			escapeKeyBehavior="none"
			className="flex-1 columns-2 gap-2 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin relative"
			onAction={(key) => {
				const gif = gifs.find((g) => g.slug === key)
				if (gif) onGifSelect(gif.file.hd.gif.url)
			}}
			renderEmptyState={() =>
				isLoading ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<Loader />
					</div>
				) : (
					<div className="absolute inset-0 flex items-center justify-center">No GIFs found</div>
				)
			}
		>
			<Collection items={gifs}>
				{(gif) => (
					<GridListItem
						id={gif.slug}
						textValue={gif.title}
						className={({ isPressed }) =>
							`relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-md bg-muted/60 outline-none transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary ${isPressed ? "scale-95" : ""}`
						}
						style={{
							aspectRatio: `${gif.file.sm.gif.width} / ${gif.file.sm.gif.height}`,
						}}
					>
						{({ isHovered, isFocusVisible }) => (
							<>
								<img
									src={
										isHovered || isFocusVisible
											? gif.file.sm.webp.url
											: gif.file.sm.jpg.url
									}
									alt={gif.title}
									className="h-full w-full object-cover"
									loading="lazy"
									draggable={false}
								/>
								{isFocusVisible && (
									<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
										<span className="text-xs text-white line-clamp-1">{gif.title}</span>
									</div>
								)}
							</>
						)}
					</GridListItem>
				)}
			</Collection>
			<GridListLoadMoreItem
				isLoading={isLoadingMore}
				onLoadMore={canLoadMore ? onLoadMore : undefined}
				scrollOffset={0.5}
				className={isLoadingMore ? "flex justify-center py-4" : "h-0"}
			>
				{isLoadingMore ? (
					<div className="size-5 animate-spin rounded-full border-2 border-fg/20 border-t-fg/60" />
				) : null}
			</GridListLoadMoreItem>
		</GridList>
	)
}

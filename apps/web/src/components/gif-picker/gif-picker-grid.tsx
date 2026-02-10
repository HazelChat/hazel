import type { GiphyGif } from "@hazel/domain/http"
import { Collection, GridList, GridListItem, GridListLoadMoreItem } from "react-aria-components"

interface GifPickerGridProps {
	gifs: GiphyGif[]
	isLoading: boolean
	hasMore: boolean
	onLoadMore: () => void
	onGifSelect: (gifUrl: string) => void
}

export function GifPickerGrid({ gifs, isLoading, hasMore, onLoadMore, onGifSelect }: GifPickerGridProps) {
	return (
		<GridList
			aria-label="GIF results"
			className="flex-1 columns-2 gap-2 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin"
			onAction={(key) => {
				const gif = gifs.find((g) => g.id === key)
				if (gif) onGifSelect(gif.images.original.url)
			}}
			renderEmptyState={() =>
				isLoading ? null : (
					<div className="flex flex-1 items-center justify-center text-sm text-muted-fg">
						No GIFs found
					</div>
				)
			}
		>
			<Collection items={gifs}>
				{(gif) => (
					<GridListItem
						id={gif.id}
						textValue={gif.title}
						className="mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-md bg-muted/60 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"
						style={{
							aspectRatio: `${gif.images.fixed_width.width} / ${gif.images.fixed_width.height}`,
						}}
					>
						{({ isHovered }) => (
							<img
								src={
									isHovered ? gif.images.fixed_width.url : gif.images.fixed_width_still.url
								}
								alt={gif.title}
								className="h-full w-full object-cover"
								loading="lazy"
								draggable={false}
							/>
						)}
					</GridListItem>
				)}
			</Collection>
			<GridListLoadMoreItem
				isLoading={isLoading}
				onLoadMore={hasMore ? onLoadMore : undefined}
				scrollOffset={0.5}
				className="flex justify-center py-4"
			>
				<div className="size-5 animate-spin rounded-full border-2 border-fg/20 border-t-fg/60" />
			</GridListLoadMoreItem>
		</GridList>
	)
}

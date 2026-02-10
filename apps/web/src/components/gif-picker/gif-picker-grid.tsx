import type { GiphyGif } from "@hazel/domain/http"
import { Collection, GridList, GridListItem, GridListLoadMoreItem } from "react-aria-components"

interface GifPickerGridProps {
	gifs: GiphyGif[]
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
	return (
		<GridList
			aria-label="GIF results"
			layout="grid"
			disallowTypeAhead
			escapeKeyBehavior="none"
			className="flex-1 columns-2 gap-2 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin"
			onAction={(key) => {
				const gif = gifs.find((g) => g.id === key)
				if (gif) onGifSelect(gif.images.original.url)
			}}
			renderEmptyState={() =>
				isLoading ? (
					<div className="flex flex-1 items-center justify-center py-8">
						<div className="size-5 animate-spin rounded-full border-2 border-fg/20 border-t-fg/60" />
					</div>
				) : (
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
						className={({ isPressed }) =>
							`relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-md bg-muted/60 outline-none transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary ${isPressed ? "scale-95" : ""}`
						}
						style={{
							aspectRatio: `${gif.images.fixed_width.width} / ${gif.images.fixed_width.height}`,
						}}
					>
						{({ isHovered, isFocusVisible }) => (
							<>
								<img
									src={
										isHovered || isFocusVisible
											? gif.images.fixed_width.url
											: gif.images.fixed_width_still.url
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
				onLoadMore={hasMore ? onLoadMore : undefined}
				scrollOffset={0.5}
				className="flex justify-center py-4"
			>
				<div className="size-5 animate-spin rounded-full border-2 border-fg/20 border-t-fg/60" />
			</GridListLoadMoreItem>
		</GridList>
	)
}

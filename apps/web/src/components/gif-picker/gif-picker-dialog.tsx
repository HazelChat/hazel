import { type ReactElement, useCallback, useRef, useState } from "react"
import { Dialog, DialogTrigger, Popover } from "react-aria-components"
import { GifPickerAttribution } from "./gif-picker-attribution"
import { GifPickerCategories } from "./gif-picker-categories"
import { GifPickerGrid } from "./gif-picker-grid"
import { GifPickerSearch } from "./gif-picker-search"
import { useGiphy } from "./use-giphy"

interface GifPickerDialogProps {
	children: ReactElement
	onGifSelect: (gifUrl: string) => void
}

export function GifPickerDialog({ children, onGifSelect }: GifPickerDialogProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			{children}
			<Popover>
				<Dialog aria-label="GIF picker" className="rounded-lg">
					{isOpen && (
						<GifPickerContent
							onGifSelect={(url) => {
								onGifSelect(url)
								setIsOpen(false)
							}}
						/>
					)}
				</Dialog>
			</Popover>
		</DialogTrigger>
	)
}

function GifPickerContent({ onGifSelect }: { onGifSelect: (gifUrl: string) => void }) {
	const { gifs, categories, isLoading, hasMore, loadMore, search, searchQuery } = useGiphy()
	const [query, setQuery] = useState("")
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	const handleSearchChange = useCallback(
		(value: string) => {
			setQuery(value)
			if (debounceRef.current) clearTimeout(debounceRef.current)
			debounceRef.current = setTimeout(() => search(value), 300)
		},
		[search],
	)

	const handleCategorySelect = useCallback(
		(name: string) => {
			setQuery(name)
			if (debounceRef.current) clearTimeout(debounceRef.current)
			search(name)
		},
		[search],
	)

	return (
		<div className="flex h-[420px] w-[400px] flex-col overflow-hidden rounded-lg border border-fg/15 bg-overlay shadow-lg">
			<GifPickerSearch value={query} onChange={handleSearchChange} />
			{!searchQuery && (
				<GifPickerCategories categories={categories} onCategorySelect={handleCategorySelect} />
			)}
			<GifPickerGrid
				gifs={gifs}
				isLoading={isLoading}
				hasMore={hasMore}
				onLoadMore={loadMore}
				onGifSelect={onGifSelect}
			/>
			<GifPickerAttribution />
		</div>
	)
}

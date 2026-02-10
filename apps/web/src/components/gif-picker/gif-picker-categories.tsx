import type { GiphyCategory } from "@hazel/domain/http"
import { Button } from "react-aria-components"

interface GifPickerCategoriesProps {
	categories: GiphyCategory[]
	onCategorySelect: (category: string) => void
}

export function GifPickerCategories({ categories, onCategorySelect }: GifPickerCategoriesProps) {
	if (categories.length === 0) return null

	return (
		<div className="flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-none">
			{categories.slice(0, 12).map((category) => (
				<Button
					key={category.name_encoded}
					onPress={() => onCategorySelect(category.name)}
					className="shrink-0 rounded-full border border-fg/10 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-fg transition-colors hover:border-fg/20 hover:bg-muted hover:text-fg"
				>
					{category.name}
				</Button>
			))}
		</div>
	)
}

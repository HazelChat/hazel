import type { KlipyCategory } from "@hazel/domain/http"
import { Button } from "react-aria-components"

interface GifPickerCategoriesProps {
	categories: KlipyCategory[]
	selectedCategory: string | null
	onCategorySelect: (category: string) => void
}

export function GifPickerCategories({
	categories,
	selectedCategory,
	onCategorySelect,
}: GifPickerCategoriesProps) {
	if (categories.length === 0) return null

	return (
		<div className="flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-none">
			{categories.slice(0, 12).map((category) => {
				const isSelected = selectedCategory === category.category
				return (
					<Button
						key={category.query}
						onPress={() => onCategorySelect(category.category)}
						className={`shrink-0 outline-none rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
							isSelected
								? "border-primary bg-primary text-on-primary"
								: "border-fg/10 bg-muted/40 text-muted-fg hover:border-fg/20 hover:bg-muted hover:text-fg"
						}`}
					>
						{category.category}
					</Button>
				)
			})}
		</div>
	)
}

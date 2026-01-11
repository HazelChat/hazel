import { Button } from "react-aria-components"
import IconClose from "~/components/icons/icon-close"
import { getFilterTypeLabel, type SearchFilter } from "~/lib/search-filter-parser"
import { cn } from "~/lib/utils"

interface SearchFilterChipProps {
	filter: SearchFilter
	onRemove: () => void
	className?: string
}

/**
 * Individual removable filter chip
 */
export function SearchFilterChip({ filter, onRemove, className }: SearchFilterChipProps) {
	const label = getFilterTypeLabel(filter.type)

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs",
				"ring-1 ring-inset ring-border",
				className,
			)}
		>
			<span className="text-muted-fg">{label}:</span>
			<span className="font-medium text-fg">{filter.displayValue}</span>
			<Button
				onPress={onRemove}
				aria-label={`Remove ${label} filter`}
				className="ml-0.5 rounded p-0.5 text-muted-fg transition-colors hover:bg-muted hover:text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			>
				<IconClose className="size-3" />
			</Button>
		</span>
	)
}

interface SearchFilterChipGroupProps {
	filters: SearchFilter[]
	onRemove: (index: number) => void
	className?: string
}

/**
 * Group of filter chips
 */
export function SearchFilterChipGroup({ filters, onRemove, className }: SearchFilterChipGroupProps) {
	if (filters.length === 0) return null

	return (
		<div className={cn("flex flex-wrap items-center gap-1", className)}>
			{filters.map((filter, index) => (
				<SearchFilterChip
					key={`${filter.type}-${filter.id}-${index}`}
					filter={filter}
					onRemove={() => onRemove(index)}
				/>
			))}
		</div>
	)
}

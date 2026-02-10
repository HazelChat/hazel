import { SearchField, SearchInput } from "~/components/ui/search-field"

interface GifPickerSearchProps {
	value: string
	onChange: (value: string) => void
}

export function GifPickerSearch({ value, onChange }: GifPickerSearchProps) {
	return (
		<div className="px-3 pt-3 pb-2">
			<SearchField value={value} onChange={onChange} aria-label="Search GIFs" autoFocus>
				<SearchInput placeholder="Search GIFs..." />
			</SearchField>
		</div>
	)
}

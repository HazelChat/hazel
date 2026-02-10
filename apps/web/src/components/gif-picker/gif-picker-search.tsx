interface GifPickerSearchProps {
	value: string
	onChange: (value: string) => void
}

export function GifPickerSearch({ value, onChange }: GifPickerSearchProps) {
	return (
		<div className="px-3 pt-3 pb-2">
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search GIFs..."
				className="w-full rounded-md border border-fg/15 bg-muted/40 px-3 py-1.5 text-sm text-fg placeholder:text-muted-fg focus:border-primary focus:outline-none"
				autoFocus
			/>
		</div>
	)
}

import type { Key } from "react-aria-components"
import { SearchField, SearchInput } from "~/components/ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import type { FileCategory } from "~/utils/file-utils"

export type FileFilterType = "all" | FileCategory

interface ChannelFilesHeaderProps {
	searchQuery: string
	onSearchChange: (query: string) => void
	filterType: FileFilterType
	onFilterChange: (type: FileFilterType) => void
	fileCount: number
}

const filterOptions = [
	{ id: "all", label: "All Files" },
	{ id: "image", label: "Images" },
	{ id: "video", label: "Videos" },
	{ id: "document", label: "Documents" },
] as const

export function ChannelFilesHeader({
	searchQuery,
	onSearchChange,
	filterType,
	onFilterChange,
	fileCount,
}: ChannelFilesHeaderProps) {
	const handleFilterChange = (key: Key | null) => {
		if (key) {
			onFilterChange(key as FileFilterType)
		}
	}

	return (
		<div className="flex flex-shrink-0 items-center gap-3 px-4 py-3">
			<div className="flex-1">
				<SearchField value={searchQuery} onChange={onSearchChange} className="w-full max-w-xs">
					<SearchInput placeholder="Search files..." />
				</SearchField>
			</div>

			<Select selectedKey={filterType} onSelectionChange={handleFilterChange}>
				<SelectTrigger className="w-36" />
				<SelectContent>
					{filterOptions.map((option) => (
						<SelectItem key={option.id} id={option.id}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<span className="whitespace-nowrap text-muted-fg text-sm">
				{fileCount} {fileCount === 1 ? "file" : "files"}
			</span>
		</div>
	)
}

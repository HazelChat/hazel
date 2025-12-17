import type { ChannelId } from "@hazel/schema"
import { useMemo, useState } from "react"
import { IconFolders } from "~/components/icons/icon-folder"
import { useChannelAttachments } from "~/db/hooks"
import { type FileCategory, getFileCategory } from "~/utils/file-utils"
import { ChannelFilesDocumentsList } from "./channel-files-documents-list"
import { ChannelFilesHeader, type FileFilterType } from "./channel-files-header"
import { ChannelFilesMediaGrid } from "./channel-files-media-grid"

interface ChannelFilesViewProps {
	channelId: ChannelId
}

export function ChannelFilesView({ channelId }: ChannelFilesViewProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterType, setFilterType] = useState<FileFilterType>("all")

	const { attachments } = useChannelAttachments(channelId)

	// Filter attachments based on search and type
	const filteredAttachments = useMemo(() => {
		let result = attachments

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			result = result.filter((a) => a.attachments.fileName.toLowerCase().includes(query))
		}

		// Apply type filter
		if (filterType !== "all") {
			result = result.filter((a) => getFileCategory(a.attachments.fileName) === filterType)
		}

		return result
	}, [attachments, searchQuery, filterType])

	// Separate into media and documents
	const mediaAttachments = useMemo(() => {
		return filteredAttachments
			.filter((a) => {
				const category = getFileCategory(a.attachments.fileName)
				return category === "image" || category === "video"
			})
			.map((a) => ({ ...a.attachments, user: a.user ?? null }))
	}, [filteredAttachments])

	const documentAttachments = useMemo(() => {
		return filteredAttachments
			.filter((a) => getFileCategory(a.attachments.fileName) === "document")
			.map((a) => ({ ...a.attachments, user: a.user ?? null }))
	}, [filteredAttachments])

	const hasMedia = mediaAttachments.length > 0
	const hasDocuments = documentAttachments.length > 0
	const isEmpty = !hasMedia && !hasDocuments

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			<ChannelFilesHeader
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				filterType={filterType}
				onFilterChange={setFilterType}
				fileCount={filteredAttachments.length}
			/>

			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-6 p-4">
					{isEmpty && (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<IconFolders className="mb-3 size-12 text-muted-fg" />
							<h3 className="font-medium text-fg text-lg">No files found</h3>
							<p className="text-muted-fg text-sm">
								{searchQuery || filterType !== "all"
									? "Try adjusting your search or filter"
									: "Files shared in this channel will appear here"}
							</p>
						</div>
					)}

					{hasMedia && (
						<section>
							<h2 className="mb-3 font-medium text-muted-fg text-xs uppercase tracking-wide">
								Media
							</h2>
							<ChannelFilesMediaGrid attachments={mediaAttachments} channelId={channelId} />
						</section>
					)}

					{hasDocuments && (
						<section>
							<h2 className="mb-3 font-medium text-muted-fg text-xs uppercase tracking-wide">
								Documents
							</h2>
							<ChannelFilesDocumentsList attachments={documentAttachments} />
						</section>
					)}
				</div>
			</div>
		</div>
	)
}

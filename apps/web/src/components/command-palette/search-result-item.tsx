import type { Channel, Message, User } from "@hazel/domain/models"
import { formatDistanceToNow } from "date-fns"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconPaperclip from "~/components/icons/icon-paperclip2"
import { Avatar } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"

interface SearchResultItemProps {
	message: typeof Message.Model.Type
	author: typeof User.Model.Type | null
	channel: typeof Channel.Model.Type | null
	attachmentCount: number
	searchQuery?: string
	isSelected?: boolean
	onSelect: () => void
}

/**
 * Highlight search query matches in text
 */
function highlightMatches(text: string, query: string): React.ReactNode {
	if (!query.trim()) return text

	const parts: React.ReactNode[] = []
	const loweredText = text.toLowerCase()
	const loweredQuery = query.toLowerCase()
	let lastIndex = 0
	let index = loweredText.indexOf(loweredQuery)

	while (index !== -1) {
		// Add text before match
		if (index > lastIndex) {
			parts.push(text.slice(lastIndex, index))
		}

		// Add highlighted match
		parts.push(
			<mark key={index} className="bg-warning/30 text-inherit">
				{text.slice(index, index + query.length)}
			</mark>,
		)

		lastIndex = index + query.length
		index = loweredText.indexOf(loweredQuery, lastIndex)
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex))
	}

	return parts.length > 0 ? parts : text
}

/**
 * Truncate message content and add ellipsis
 */
function truncateContent(content: string, maxLength = 120): string {
	if (content.length <= maxLength) return content
	return `${content.slice(0, maxLength).trim()}...`
}

/**
 * Format timestamp relative to now
 */
function formatRelativeTime(date: Date): string {
	return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Individual search result item
 */
export function SearchResultItem({
	message,
	author,
	channel,
	attachmentCount,
	searchQuery = "",
	isSelected = false,
	onSelect,
}: SearchResultItemProps) {
	const authorName = author ? `${author.firstName} ${author.lastName}`.trim() : "Unknown"
	const truncatedContent = truncateContent(message.content)
	const highlightedContent = highlightMatches(truncatedContent, searchQuery)

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"group flex w-full cursor-pointer gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
				"hover:bg-secondary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				isSelected && "bg-secondary",
			)}
		>
			{/* Author Avatar */}
			<Avatar
				size="sm"
				src={author?.avatarUrl ?? undefined}
				alt={authorName}
				className="mt-0.5 shrink-0"
			/>

			{/* Content */}
			<div className="min-w-0 flex-1">
				{/* Header: Author name, channel, timestamp */}
				<div className="flex items-center gap-2 text-sm">
					<span className="truncate font-medium text-fg">{authorName}</span>

					{channel && (
						<>
							<span className="text-muted-fg">in</span>
							<span className="inline-flex items-center gap-0.5 truncate text-muted-fg">
								<IconHashtag className="size-3" />
								{channel.name}
							</span>
						</>
					)}

					<span className="ml-auto shrink-0 text-muted-fg text-xs">
						{formatRelativeTime(message.createdAt)}
					</span>
				</div>

				{/* Message Content */}
				<p className="mt-0.5 line-clamp-2 text-muted-fg text-sm">{highlightedContent}</p>

				{/* Attachment Indicator */}
				{attachmentCount > 0 && (
					<div className="mt-1 flex items-center gap-1 text-muted-fg text-xs">
						<IconPaperclip className="size-3" />
						<span>
							{attachmentCount} {attachmentCount === 1 ? "attachment" : "attachments"}
						</span>
					</div>
				)}
			</div>
		</button>
	)
}

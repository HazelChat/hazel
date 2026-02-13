import type { Attachment, User } from "@hazel/domain/models"
import { FileIcon } from "@untitledui/file-icons"
import { IconDownload } from "~/components/icons/icon-download"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { getAttachmentUrl } from "~/utils/attachment-url"
import { formatFileSize, getFileTypeFromName } from "~/utils/file-utils"

type AttachmentWithUser = typeof Attachment.Model.Type & {
	user: typeof User.Model.Type | null
}

interface ChannelFilesDocumentsListProps {
	attachments: AttachmentWithUser[]
}

function formatRelativeTime(date: Date): string {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays === 0) {
		return "Today"
	}
	if (diffDays === 1) {
		return "Yesterday"
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`
	}
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7)
		return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
	}
	return date.toLocaleDateString()
}

function DocumentItem({ attachment }: { attachment: AttachmentWithUser }) {
	const fileType = getFileTypeFromName(attachment.fileName)

	const handleDownload = () => {
		const link = document.createElement("a")
		link.href = getAttachmentUrl(attachment)
		link.download = attachment.fileName
		link.target = "_blank"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const uploaderName = attachment.user
		? `${attachment.user.firstName} ${attachment.user.lastName}`
		: "Unknown"

	const initials = attachment.user
		? `${attachment.user.firstName.charAt(0)}${attachment.user.lastName.charAt(0)}`
		: "?"

	return (
		<div className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/60">
			<FileIcon type={fileType} className="size-10 shrink-0 text-muted-fg" />

			<div className="min-w-0 flex-1">
				<div className="truncate font-medium text-fg text-sm">{attachment.fileName}</div>
				<div className="flex items-center gap-2 text-muted-fg text-xs">
					<span>{formatFileSize(attachment.fileSize)}</span>
					<span aria-hidden="true">·</span>
					<span>{formatRelativeTime(attachment.uploadedAt)}</span>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Avatar
					size="xs"
					src={attachment.user?.avatarUrl}
					initials={initials}
					seed={uploaderName}
					alt={uploaderName}
				/>
				<span className="hidden text-muted-fg text-xs sm:inline">{uploaderName}</span>
			</div>

			<Button
				intent="plain"
				size="sq-sm"
				onPress={handleDownload}
				aria-label={`Download ${attachment.fileName}`}
				className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<IconDownload />
			</Button>
		</div>
	)
}

export function ChannelFilesDocumentsList({ attachments }: ChannelFilesDocumentsListProps) {
	if (attachments.length === 0) {
		return null
	}

	return (
		<div className="flex flex-col gap-2">
			{attachments.map((attachment) => (
				<DocumentItem key={attachment.id} attachment={attachment} />
			))}
		</div>
	)
}

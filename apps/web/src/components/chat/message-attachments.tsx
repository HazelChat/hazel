import type { Attachment } from "@hazel/db/models"
import type { MessageId } from "@hazel/db/schema"
import { FileIcon } from "@untitledui/file-icons"
import { Download01 } from "@untitledui/icons"
import { useState } from "react"
import { useAttachments } from "~/db/hooks"
import { cx } from "~/utils/cx"
import { ButtonUtility } from "../base/buttons/button-utility"

interface MessageAttachmentsProps {
	messageId: MessageId
}

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

const getFileTypeFromName = (fileName: string): string => {
	const extension = fileName.split(".").pop()?.toLowerCase() || ""

	const typeMap: Record<string, string> = {
		jpg: "jpg",
		jpeg: "jpg",
		png: "png",
		gif: "gif",
		webp: "webp",
		svg: "svg",
		pdf: "pdf",
		doc: "doc",
		docx: "docx",
		xls: "xls",
		xlsx: "xlsx",
		txt: "txt",
		csv: "csv",
		mp4: "mp4",
		webm: "webm",
		mp3: "mp3",
		wav: "wav",
	}

	return typeMap[extension] || "file"
}

interface AttachmentItemProps {
	attachment: typeof Attachment.Model.Type
}

function AttachmentItem({ attachment }: AttachmentItemProps) {
	const [imageError, setImageError] = useState(false)
	const fileType = getFileTypeFromName(attachment.fileName)

	const handleDownload = () => {
		// Create a temporary anchor element to trigger download
		const link = document.createElement("a")
		link.href = "TODO LINK"
		link.download = attachment.fileName
		link.target = "_blank"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	// Check if it's an image or video based on extension
	const isImage = ["jpg", "png", "gif", "webp", "svg"].includes(fileType)
	const isVideo = ["mp4", "webm"].includes(fileType)

	if (isImage && !imageError) {
		// Display image with preview
		return (
			<div className="group relative inline-block">
				<div className="relative overflow-hidden rounded-lg bg-secondary">
					<img
						src={"TODO LINK"}
						alt={attachment.fileName}
						className="h-48 w-64 object-cover"
						onError={() => setImageError(true)}
					/>
					<div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
						<ButtonUtility
							icon={Download01}
							size="sm"
							color="secondary"
							className="bg-primary"
							aria-label="Download file"
							onClick={handleDownload}
						/>
					</div>
				</div>
				<div className="mt-1 text-secondary text-xs">{attachment.fileName}</div>
			</div>
		)
	}

	if (isVideo) {
		// Display video player
		return (
			<div className="group relative inline-block">
				<div className="relative overflow-hidden rounded-lg bg-secondary">
					{/** biome-ignore lint/a11y/useMediaCaption: <explanation> */}
					<video src={"TODO LINK"} className="h-48 w-64 object-cover" controls preload="metadata">
						Your browser does not support the video tag.
					</video>
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
						<ButtonUtility
							icon={Download01}
							size="sm"
							color="secondary"
							className="pointer-events-auto bg-primary"
							aria-label="Download file"
							onClick={handleDownload}
						/>
					</div>
				</div>
				<div className="mt-1 text-secondary text-xs">{attachment.fileName}</div>
			</div>
		)
	}

	// For other files, show a compact file card
	return (
		<div className="group flex items-center gap-3 rounded-lg bg-secondary p-3 transition-colors hover:bg-tertiary">
			<FileIcon type={fileType} className="size-10 text-fg-quaternary" />
			<div className="min-w-0 flex-1">
				<div className="truncate font-medium text-secondary text-sm">{attachment.fileName}</div>
				<div className="text-quaternary text-xs">{formatFileSize(attachment.fileSize)}</div>
			</div>
			<ButtonUtility
				icon={Download01}
				size="sm"
				color="tertiary"
				className="opacity-0 transition-opacity group-hover:opacity-100"
				aria-label="Download file"
				onClick={handleDownload}
			/>
		</div>
	)
}

export function MessageAttachments({ messageId }: MessageAttachmentsProps) {
	const { attachments } = useAttachments(messageId)

	if (attachments.length === 0) {
		return null
	}

	// Check if all attachments are images/videos for grid layout
	const allMedia = attachments.every((attachment) => {
		const fileType = getFileTypeFromName(attachment.fileName)
		return ["jpg", "png", "gif", "webp", "svg", "mp4", "webm"].includes(fileType)
	})

	return (
		<div
			className={cx(
				"mt-2",
				allMedia ? "grid max-w-2xl grid-cols-2 gap-2" : "flex max-w-md flex-col gap-2",
			)}
		>
			{attachments.map((attachment) => (
				<AttachmentItem key={attachment.id} attachment={attachment} />
			))}
		</div>
	)
}

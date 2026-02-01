import { useCallback } from "react"
import { type DropItem, DropZone } from "react-aria-components"
import { useDragDetection } from "~/hooks/use-drag-detection"
import { useFileUploadHandler } from "~/hooks/use-file-upload-handler"
import { useComposerContext } from "./composer-context"

// File types accepted for upload
const ACCEPTED_FILE_TYPES = [
	"image/*",
	"video/*",
	"audio/*",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
]

interface ComposerDropZoneProps {
	children: React.ReactNode
}

export function ComposerDropZone({ children }: ComposerDropZoneProps) {
	const { state } = useComposerContext()
	const { channelId, organizationId } = state
	const { isDraggingOnPage } = useDragDetection()

	const { handleFilesUpload, isUploading } = useFileUploadHandler({
		organizationId,
		channelId,
	})

	const handleDrop = useCallback(
		async (e: { items: DropItem[] }) => {
			const fileItems = e.items.filter(
				(item): item is DropItem & { kind: "file"; getFile: () => Promise<File> } =>
					item.kind === "file",
			)

			const files: File[] = []
			for (const item of fileItems) {
				files.push(await item.getFile())
			}

			if (files.length > 0) {
				await handleFilesUpload(files)
			}
		},
		[handleFilesUpload],
	)

	const getDropOperation = useCallback((types: { has: (type: string) => boolean }) => {
		const hasAcceptableType = ACCEPTED_FILE_TYPES.some((type) => {
			if (type.endsWith("/*")) {
				const specificTypes =
					type === "image/*"
						? ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
						: type === "video/*"
							? ["video/mp4", "video/webm", "video/quicktime"]
							: type === "audio/*"
								? ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"]
								: []
				return specificTypes.some((t) => types.has(t))
			}
			return types.has(type)
		})

		return hasAcceptableType ? "copy" : "cancel"
	}, [])

	return (
		<DropZone
			getDropOperation={getDropOperation}
			onDrop={handleDrop}
			isDisabled={isUploading}
			className="relative"
		>
			{({ isDropTarget }) => (
				<div className="relative flex h-max items-center gap-3">
					{/* Drop overlay - stronger when hovering over zone */}
					{isDropTarget && (
						<div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-primary/10">
							<span className="font-medium text-primary">Drop files here</span>
						</div>
					)}

					{/* Subtle indicator when dragging anywhere on page */}
					{isDraggingOnPage && !isDropTarget && (
						<div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-primary/50 border-dashed bg-primary/5">
							<span className="font-medium text-primary/70">Drop files here</span>
						</div>
					)}

					<div className="w-full">{children}</div>
				</div>
			)}
		</DropZone>
	)
}

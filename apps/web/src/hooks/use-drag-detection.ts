import { useEffect, useState } from "react"

/**
 * Hook to detect when files are being dragged anywhere on the page.
 * Useful for showing drop zone indicators before the user hovers over them.
 */
export function useDragDetection() {
	const [isDraggingOnPage, setIsDraggingOnPage] = useState(false)

	useEffect(() => {
		// Counter to track nested dragenter/dragleave events
		let dragCounter = 0

		const handleDragEnter = (e: DragEvent) => {
			// Only track file drags
			if (e.dataTransfer?.types.includes("Files")) {
				dragCounter++
				setIsDraggingOnPage(true)
			}
		}

		const handleDragLeave = () => {
			dragCounter--
			if (dragCounter === 0) {
				setIsDraggingOnPage(false)
			}
		}

		const handleDrop = () => {
			dragCounter = 0
			setIsDraggingOnPage(false)
		}

		const handleDragEnd = () => {
			dragCounter = 0
			setIsDraggingOnPage(false)
		}

		document.addEventListener("dragenter", handleDragEnter)
		document.addEventListener("dragleave", handleDragLeave)
		document.addEventListener("drop", handleDrop)
		document.addEventListener("dragend", handleDragEnd)

		return () => {
			document.removeEventListener("dragenter", handleDragEnter)
			document.removeEventListener("dragleave", handleDragLeave)
			document.removeEventListener("drop", handleDrop)
			document.removeEventListener("dragend", handleDragEnd)
		}
	}, [])

	return { isDraggingOnPage }
}

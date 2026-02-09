import { useCallback, useEffect, useRef, useState } from "react"
import type { ContentBounds } from "~/utils/emoji-crop"

export interface ZoomPanState {
	zoom: number
	panX: number
	panY: number
	rotation: 0 | 90 | 180 | 270
}

interface UseZoomPanInteractionOptions {
	/** Natural image width in pixels */
	imageWidth: number
	/** Natural image height in pixels */
	imageHeight: number
	/** Size of the crop window in display pixels */
	cropSize: number
	/** Bounding box of non-transparent content, used to compute initial zoom/pan */
	contentBounds?: ContentBounds | null
}

export interface UseZoomPanInteractionReturn {
	state: ZoomPanState
	minZoom: number
	maxZoom: number
	isDragging: boolean
	setZoom: (zoom: number) => void
	rotateClockwise: () => void
	handlePointerDown: (e: React.PointerEvent) => void
	/** Register this on a DOM element via ref + addEventListener({ passive: false }) */
	handleWheel: (e: WheelEvent) => void
	getImageTransform: () => { x: number; y: number; scale: number; rotation: number }
}

/**
 * Computes the minimum zoom such that the image fully covers the crop window.
 * When rotated 90/270, the image's width/height are effectively swapped.
 */
function computeMinZoom(
	imageWidth: number,
	imageHeight: number,
	cropSize: number,
	rotation: 0 | 90 | 180 | 270,
): number {
	const isRotated = rotation === 90 || rotation === 270
	const effectiveW = isRotated ? imageHeight : imageWidth
	const effectiveH = isRotated ? imageWidth : imageHeight
	// Scale needed so image covers cropSize in both dimensions
	return Math.max(cropSize / effectiveW, cropSize / effectiveH)
}

function clampPan(
	panX: number,
	panY: number,
	zoom: number,
	imageWidth: number,
	imageHeight: number,
	cropSize: number,
	rotation: 0 | 90 | 180 | 270,
): { panX: number; panY: number } {
	const isRotated = rotation === 90 || rotation === 270
	const scaledW = (isRotated ? imageHeight : imageWidth) * zoom
	const scaledH = (isRotated ? imageWidth : imageHeight) * zoom

	// The image can move such that the crop window is always covered
	const maxPanX = (scaledW - cropSize) / 2
	const maxPanY = (scaledH - cropSize) / 2

	return {
		panX: Math.max(-maxPanX, Math.min(maxPanX, panX)),
		panY: Math.max(-maxPanY, Math.min(maxPanY, panY)),
	}
}

/**
 * Computes initial zoom/pan to frame the visible content within the crop window.
 * If no contentBounds, falls back to minZoom centered (same as before).
 */
function computeInitialState(
	imageWidth: number,
	imageHeight: number,
	cropSize: number,
	contentBounds: ContentBounds | null | undefined,
): ZoomPanState {
	const minZoom = computeMinZoom(imageWidth, imageHeight, cropSize, 0)

	if (!contentBounds) {
		return { zoom: minZoom, panX: 0, panY: 0, rotation: 0 }
	}

	// Zoom to fill crop with content (+ 5% padding)
	const contentZoom = cropSize / (Math.max(contentBounds.width, contentBounds.height) * 1.05)
	const zoom = Math.max(minZoom, contentZoom)

	// Content center offset from image center, in image pixels
	const contentCenterX = contentBounds.x + contentBounds.width / 2
	const contentCenterY = contentBounds.y + contentBounds.height / 2
	const imageCenterX = imageWidth / 2
	const imageCenterY = imageHeight / 2

	// Pan to center content: offset in image space → display space
	const rawPanX = -(contentCenterX - imageCenterX) * zoom
	const rawPanY = -(contentCenterY - imageCenterY) * zoom

	const clamped = clampPan(rawPanX, rawPanY, zoom, imageWidth, imageHeight, cropSize, 0)
	return { zoom, rotation: 0, ...clamped }
}

export function useZoomPanInteraction({
	imageWidth,
	imageHeight,
	cropSize,
	contentBounds,
}: UseZoomPanInteractionOptions): UseZoomPanInteractionReturn {
	const [state, setState] = useState<ZoomPanState>(() => {
		return computeInitialState(imageWidth, imageHeight, cropSize, contentBounds)
	})
	const [isDragging, setIsDragging] = useState(false)

	const dragRef = useRef<{
		startX: number
		startY: number
		startPanX: number
		startPanY: number
	} | null>(null)

	const minZoom = computeMinZoom(imageWidth, imageHeight, cropSize, state.rotation)
	const maxZoom = minZoom * 3

	// Re-compute initial state when image or content bounds change
	useEffect(() => {
		setState(computeInitialState(imageWidth, imageHeight, cropSize, contentBounds))
	}, [imageWidth, imageHeight, cropSize, contentBounds])

	const setZoom = useCallback(
		(newZoom: number) => {
			setState((prev) => {
				const clamped = clampPan(
					prev.panX,
					prev.panY,
					newZoom,
					imageWidth,
					imageHeight,
					cropSize,
					prev.rotation,
				)
				return { ...prev, zoom: newZoom, ...clamped }
			})
		},
		[imageWidth, imageHeight, cropSize],
	)

	const rotateClockwise = useCallback(() => {
		setState((prev) => {
			const newRotation = ((prev.rotation + 90) % 360) as 0 | 90 | 180 | 270
			const newMinZoom = computeMinZoom(imageWidth, imageHeight, cropSize, newRotation)
			const newMaxZoom = newMinZoom * 3
			const newZoom = Math.max(newMinZoom, Math.min(newMaxZoom, prev.zoom))
			const clamped = clampPan(0, 0, newZoom, imageWidth, imageHeight, cropSize, newRotation)
			return { zoom: newZoom, rotation: newRotation, ...clamped }
		})
	}, [imageWidth, imageHeight, cropSize])

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault()
			dragRef.current = {
				startX: e.clientX,
				startY: e.clientY,
				startPanX: state.panX,
				startPanY: state.panY,
			}
			setIsDragging(true)
			;(e.target as HTMLElement).setPointerCapture(e.pointerId)
		},
		[state.panX, state.panY],
	)

	const handlePointerMove = useCallback(
		(e: PointerEvent) => {
			if (!dragRef.current) return
			const deltaX = e.clientX - dragRef.current.startX
			const deltaY = e.clientY - dragRef.current.startY
			const newPanX = dragRef.current.startPanX + deltaX
			const newPanY = dragRef.current.startPanY + deltaY

			setState((prev) => {
				const clamped = clampPan(
					newPanX,
					newPanY,
					prev.zoom,
					imageWidth,
					imageHeight,
					cropSize,
					prev.rotation,
				)
				return { ...prev, ...clamped }
			})
		},
		[imageWidth, imageHeight, cropSize],
	)

	const handlePointerUp = useCallback(() => {
		dragRef.current = null
		setIsDragging(false)
	}, [])

	useEffect(() => {
		if (isDragging) {
			window.addEventListener("pointermove", handlePointerMove)
			window.addEventListener("pointerup", handlePointerUp)
			return () => {
				window.removeEventListener("pointermove", handlePointerMove)
				window.removeEventListener("pointerup", handlePointerUp)
			}
		}
	}, [isDragging, handlePointerMove, handlePointerUp])

	// Native WheelEvent handler — must be registered with { passive: false }
	const handleWheel = useCallback(
		(e: WheelEvent) => {
			e.preventDefault()
			const zoomDelta = -e.deltaY * 0.001
			setState((prev) => {
				const currentMin = computeMinZoom(imageWidth, imageHeight, cropSize, prev.rotation)
				const currentMax = currentMin * 3
				const newZoom = Math.max(currentMin, Math.min(currentMax, prev.zoom + zoomDelta))
				const clamped = clampPan(
					prev.panX,
					prev.panY,
					newZoom,
					imageWidth,
					imageHeight,
					cropSize,
					prev.rotation,
				)
				return { ...prev, zoom: newZoom, ...clamped }
			})
		},
		[imageWidth, imageHeight, cropSize],
	)

	const getImageTransform = useCallback((): {
		x: number
		y: number
		scale: number
		rotation: number
	} => {
		return {
			x: state.panX,
			y: state.panY,
			scale: state.zoom,
			rotation: state.rotation,
		}
	}, [state])

	return {
		state,
		minZoom,
		maxZoom,
		isDragging,
		setZoom,
		rotateClockwise,
		handlePointerDown,
		handleWheel,
		getImageTransform,
	}
}

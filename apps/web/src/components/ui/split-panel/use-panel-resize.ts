import { useCallback, useEffect, useRef, useState } from "react"
import { clampPanelWidth, PANEL_CONSTRAINTS, snapToNearestPoint } from "~/atoms/panel-atoms"

const STEP_SMALL = 10
const STEP_LARGE = 50

export interface UsePanelResizeOptions {
	/** Initial width of the panel */
	initialWidth: number
	/** Minimum width constraint */
	minWidth?: number
	/** Maximum width constraint */
	maxWidth?: number
	/** Reference to the container element for calculating max width */
	containerRef?: React.RefObject<HTMLElement | null>
	/** Panel position (affects resize direction) */
	position?: "left" | "right"
	/** Callback when width changes during drag */
	onWidthChange?: (width: number) => void
	/** Callback when resize ends (for persistence) */
	onWidthChangeEnd?: (width: number) => void
	/** Enable snap points */
	enableSnap?: boolean
	/** Custom snap points as fractions (0-1) of container */
	snapPoints?: readonly number[]
	/** Snap threshold in pixels */
	snapThreshold?: number
}

export interface UsePanelResizeReturn {
	/** Current panel width */
	width: number
	/** Whether currently dragging */
	isDragging: boolean
	/** Props to spread on the resize handle element */
	handleProps: {
		onPointerDown: (e: React.PointerEvent) => void
		onKeyDown: (e: React.KeyboardEvent) => void
		tabIndex: number
		role: "separator"
		"aria-orientation": "vertical"
		"aria-valuenow": number
		"aria-valuemin": number
		"aria-valuemax": number
		"aria-label": string
	}
	/** Set width programmatically */
	setWidth: (width: number) => void
}

export function usePanelResize({
	initialWidth,
	minWidth = PANEL_CONSTRAINTS.minWidth,
	maxWidth = PANEL_CONSTRAINTS.maxWidth,
	containerRef,
	position = "right",
	onWidthChange,
	onWidthChangeEnd,
	enableSnap = true,
	snapPoints = PANEL_CONSTRAINTS.snapPoints,
	snapThreshold = PANEL_CONSTRAINTS.snapThreshold,
}: UsePanelResizeOptions): UsePanelResizeReturn {
	const [width, setWidthState] = useState(initialWidth)
	const [isDragging, setIsDragging] = useState(false)

	const dragStateRef = useRef<{
		startX: number
		startWidth: number
	} | null>(null)

	// Update width when initialWidth changes
	useEffect(() => {
		setWidthState(initialWidth)
	}, [initialWidth])

	const getContainerWidth = useCallback(() => {
		return containerRef?.current?.offsetWidth ?? window.innerWidth
	}, [containerRef])

	const getEffectiveMaxWidth = useCallback(() => {
		const containerWidth = getContainerWidth()
		return Math.min(maxWidth, containerWidth * 0.7)
	}, [maxWidth, getContainerWidth])

	const clampWidth = useCallback(
		(newWidth: number) => {
			const containerWidth = getContainerWidth()
			return clampPanelWidth(newWidth, minWidth, maxWidth, containerWidth)
		},
		[minWidth, maxWidth, getContainerWidth],
	)

	const applySnap = useCallback(
		(newWidth: number) => {
			if (!enableSnap) return newWidth
			const containerWidth = getContainerWidth()
			const snappedWidth = snapToNearestPoint(newWidth, containerWidth, snapPoints, snapThreshold)
			return clampPanelWidth(snappedWidth, minWidth, maxWidth, containerWidth)
		},
		[enableSnap, getContainerWidth, snapPoints, snapThreshold, minWidth, maxWidth],
	)

	const setWidth = useCallback(
		(newWidth: number) => {
			const clampedWidth = clampWidth(newWidth)
			setWidthState(clampedWidth)
			onWidthChangeEnd?.(clampedWidth)
		},
		[clampWidth, onWidthChangeEnd],
	)

	// Pointer event handlers
	const handlePointerMove = useCallback(
		(e: PointerEvent) => {
			if (!dragStateRef.current) return

			const { startX, startWidth } = dragStateRef.current
			const deltaX = e.clientX - startX

			// For right panel, dragging left (negative delta) increases width
			// For left panel, dragging right (positive delta) increases width
			const widthDelta = position === "right" ? -deltaX : deltaX
			const newWidth = clampWidth(startWidth + widthDelta)

			setWidthState(newWidth)
			onWidthChange?.(newWidth)
		},
		[position, clampWidth, onWidthChange],
	)

	const handlePointerUp = useCallback(() => {
		if (!dragStateRef.current) return

		dragStateRef.current = null
		setIsDragging(false)

		// Apply snap on release
		const snappedWidth = applySnap(width)
		setWidthState(snappedWidth)
		onWidthChangeEnd?.(snappedWidth)
	}, [width, applySnap, onWidthChangeEnd])

	// Add global listeners when dragging
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

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault()
			e.stopPropagation()

			dragStateRef.current = {
				startX: e.clientX,
				startWidth: width,
			}
			setIsDragging(true)

			// Capture pointer for smooth tracking outside element
			;(e.target as HTMLElement).setPointerCapture(e.pointerId)
		},
		[width],
	)

	// Keyboard-based resizing
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const step = e.shiftKey ? STEP_LARGE : STEP_SMALL
			let newWidth = width

			switch (e.key) {
				case "ArrowLeft":
					e.preventDefault()
					// Left arrow: increase width for right panel, decrease for left panel
					newWidth = position === "right" ? width + step : width - step
					break
				case "ArrowRight":
					e.preventDefault()
					// Right arrow: decrease width for right panel, increase for left panel
					newWidth = position === "right" ? width - step : width + step
					break
				case "Home":
					e.preventDefault()
					newWidth = minWidth
					break
				case "End":
					e.preventDefault()
					newWidth = getEffectiveMaxWidth()
					break
				default:
					return
			}

			const clampedWidth = clampWidth(newWidth)
			setWidthState(clampedWidth)
			onWidthChangeEnd?.(clampedWidth)
		},
		[width, position, minWidth, getEffectiveMaxWidth, clampWidth, onWidthChangeEnd],
	)

	const handleProps = {
		onPointerDown: handlePointerDown,
		onKeyDown: handleKeyDown,
		tabIndex: 0,
		role: "separator" as const,
		"aria-orientation": "vertical" as const,
		"aria-valuenow": Math.round(width),
		"aria-valuemin": minWidth,
		"aria-valuemax": getEffectiveMaxWidth(),
		"aria-label": "Resize panel",
	}

	return {
		width,
		isDragging,
		handleProps,
		setWidth,
	}
}

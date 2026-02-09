import { useCallback, useEffect, useRef, useState } from "react"

export interface DataTooltipState<T> {
	visible: boolean
	data: T | null
	anchor: { x: number; y: number }
}

/**
 * Generic hook for lightweight hover tooltips on elements
 * matching a CSS selector. Uses event delegation (single listener
 * on the container, capture phase) so there's zero per-element overhead.
 *
 * Returns position + extracted data; the consumer renders the tooltip JSX.
 *
 * @param containerRef - Ref to the container element
 * @param selector     - CSS selector for tooltip-triggering children, e.g. "[data-emoji-tooltip]"
 * @param extractData  - Reads data-* attrs from the matched element
 */
export function useDataTooltip<T>(
	containerRef: React.RefObject<HTMLElement | null>,
	selector: string,
	extractData: (el: HTMLElement) => T | null,
): DataTooltipState<T> {
	const [state, setState] = useState<DataTooltipState<T>>({
		visible: false,
		data: null,
		anchor: { x: 0, y: 0 },
	})

	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearHideTimer = useCallback(() => {
		if (hideTimer.current) {
			clearTimeout(hideTimer.current)
			hideTimer.current = null
		}
	}, [])

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const onPointerEnter = (e: PointerEvent) => {
			const target = (e.target as HTMLElement).closest?.(selector) as HTMLElement | null
			if (!target) return

			clearHideTimer()

			const data = extractData(target)
			if (data === null) return

			const rect = target.getBoundingClientRect()
			setState({
				visible: true,
				data,
				anchor: {
					x: rect.left + rect.width / 2,
					y: rect.top,
				},
			})
		}

		const onPointerLeave = (e: PointerEvent) => {
			const target = (e.target as HTMLElement).closest?.(selector)
			if (!target) return

			clearHideTimer()
			hideTimer.current = setTimeout(() => {
				setState((prev) => ({ ...prev, visible: false }))
			}, 100)
		}

		container.addEventListener("pointerenter", onPointerEnter, true)
		container.addEventListener("pointerleave", onPointerLeave, true)

		return () => {
			container.removeEventListener("pointerenter", onPointerEnter, true)
			container.removeEventListener("pointerleave", onPointerLeave, true)
			clearHideTimer()
		}
	}, [containerRef, selector, extractData, clearHideTimer])

	return state
}

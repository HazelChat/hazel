"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { EmojiPreview } from "~/components/emoji-preview"

interface EmojiTooltipData {
	emoji?: string
	customEmojiUrl?: string
	shortcode: string
}

interface TooltipState {
	visible: boolean
	data: EmojiTooltipData | null
	anchor: { x: number; y: number }
}

interface EmojiTooltipContextValue {
	show: (data: EmojiTooltipData, el: HTMLElement) => void
	hide: () => void
}

const EmojiTooltipContext = createContext<EmojiTooltipContextValue | null>(null)

export function useEmojiTooltip() {
	return useContext(EmojiTooltipContext)
}

export function EmojiTooltipProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<TooltipState>({
		visible: false,
		data: null,
		anchor: { x: 0, y: 0 },
	})
	const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const show = useCallback((data: EmojiTooltipData, el: HTMLElement) => {
		if (hideTimer.current) {
			clearTimeout(hideTimer.current)
			hideTimer.current = null
		}
		if (showTimer.current) {
			clearTimeout(showTimer.current)
		}
		showTimer.current = setTimeout(() => {
			const rect = el.getBoundingClientRect()
			setState({
				visible: true,
				data,
				anchor: { x: rect.left + rect.width / 2, y: rect.top },
			})
		}, 300)
	}, [])

	const hide = useCallback(() => {
		if (showTimer.current) {
			clearTimeout(showTimer.current)
			showTimer.current = null
		}
		if (hideTimer.current) {
			clearTimeout(hideTimer.current)
		}
		hideTimer.current = setTimeout(() => {
			setState((prev) => ({ ...prev, visible: false }))
		}, 100)
	}, [])

	const ctx = useCallback((): EmojiTooltipContextValue => ({ show, hide }), [show, hide])

	return (
		<EmojiTooltipContext value={ctx()}>
			{children}
			{state.visible &&
				state.data &&
				createPortal(
					<div
						className="pointer-events-none fixed z-50 rounded-lg border bg-overlay px-3 py-2 shadow-lg"
						style={{
							left: state.anchor.x,
							top: state.anchor.y,
							transform: "translate(-50%, -100%) translateY(-8px)",
						}}
					>
						<EmojiPreview
							emoji={state.data.emoji}
							customEmojiUrl={state.data.customEmojiUrl}
							shortcode={state.data.shortcode}
							size="sm"
						/>
					</div>,
					document.body,
				)}
		</EmojiTooltipContext>
	)
}

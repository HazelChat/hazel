import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from "react"

interface MessageHoverState {
	hoveredMessageId: string | null
	targetRef: HTMLDivElement | null
}

interface MessageHoverMeta {
	isToolbarMenuOpen: boolean
	isToolbarHovered: boolean
}

interface MessageHoverActions {
	setHovered: (messageId: string | null, ref: HTMLDivElement | null) => void
	setToolbarMenuOpen: (open: boolean) => void
	setToolbarHovered: (hovered: boolean) => void
	clearHover: () => void
}

interface MessageHoverContextValue {
	state: MessageHoverState
	actions: MessageHoverActions
	meta: MessageHoverMeta
}

const MessageHoverContext = createContext<MessageHoverContextValue | null>(null)

export function useMessageHover() {
	const context = React.use(MessageHoverContext)
	if (!context) {
		throw new Error("useMessageHover must be used within a MessageHoverProvider")
	}
	return context
}

// eslint-disable-next-line react-refresh/only-export-components
import React from "react"

interface MessageHoverProviderProps {
	children: ReactNode
	/**
	 * Delay in ms before hiding the toolbar after mouse leaves the message.
	 * This allows users to move to the toolbar without it disappearing.
	 * @default 200
	 */
	hideDelay?: number
}

export function MessageHoverProvider({ children, hideDelay = 200 }: MessageHoverProviderProps) {
	const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
	const [isToolbarMenuOpen, setIsToolbarMenuOpen] = useState(false)
	const targetRef = useRef<HTMLDivElement | null>(null)
	const isToolbarHoveredRef = useRef(false)
	const hideTimeoutRef = useRef<number | null>(null)

	const clearHideTimeout = useCallback(() => {
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current)
			hideTimeoutRef.current = null
		}
	}, [])

	const setHovered = useCallback(
		(messageId: string | null, ref: HTMLDivElement | null) => {
			if (messageId) {
				clearHideTimeout()
				setHoveredMessageId(messageId)
				targetRef.current = ref
			} else if (!isToolbarMenuOpen && !isToolbarHoveredRef.current) {
				hideTimeoutRef.current = window.setTimeout(() => {
					setHoveredMessageId(null)
					targetRef.current = null
					hideTimeoutRef.current = null
				}, hideDelay)
			}
		},
		[isToolbarMenuOpen, hideDelay, clearHideTimeout],
	)

	const setToolbarMenuOpen = useCallback((open: boolean) => {
		setIsToolbarMenuOpen(open)
	}, [])

	const setToolbarHovered = useCallback(
		(hovered: boolean) => {
			isToolbarHoveredRef.current = hovered
			if (hovered) {
				clearHideTimeout()
			}
		},
		[clearHideTimeout],
	)

	const clearHover = useCallback(() => {
		clearHideTimeout()
		setHoveredMessageId(null)
		targetRef.current = null
	}, [clearHideTimeout])

	const contextValue = useMemo<MessageHoverContextValue>(
		() => ({
			state: {
				hoveredMessageId,
				targetRef: targetRef.current,
			},
			actions: {
				setHovered,
				setToolbarMenuOpen,
				setToolbarHovered,
				clearHover,
			},
			meta: {
				isToolbarMenuOpen,
				isToolbarHovered: isToolbarHoveredRef.current,
			},
		}),
		[hoveredMessageId, isToolbarMenuOpen, setHovered, setToolbarMenuOpen, setToolbarHovered, clearHover],
	)

	return <MessageHoverContext value={contextValue}>{children}</MessageHoverContext>
}

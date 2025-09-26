import type { ChannelId, ChannelMemberId } from "@hazel/db/schema"
import { useEffect, useMemo, useRef, useState } from "react"
import { TypingIndicatorService } from "~/services/typing-indicator-service"

interface UseTypingOptions {
	channelId: ChannelId
	memberId: ChannelMemberId | null
	onTypingStart?: () => void
	onTypingStop?: () => void
	debounceDelay?: number
	typingTimeout?: number
}

interface UseTypingResult {
	isTyping: boolean
	startTyping: () => void
	stopTyping: () => void
	handleContentChange: (content: string) => void
}

export function useTyping({
	channelId,
	memberId,
	onTypingStart,
	onTypingStop,
	debounceDelay = 500,
	typingTimeout = 3000,
}: UseTypingOptions): UseTypingResult {
	const [isTyping, setIsTyping] = useState(false)
	const serviceRef = useRef<TypingIndicatorService | null>(null)
	const lastContentRef = useRef("")
	const isInitializedRef = useRef(false)

	// Create or update the service when dependencies change
	useEffect(() => {
		if (!memberId) {
			// Cleanup if no member ID
			if (serviceRef.current) {
				serviceRef.current.cleanup()
				serviceRef.current = null
			}
			return
		}

		// Create new service or update existing
		if (!serviceRef.current || !isInitializedRef.current) {
			// Cleanup old service if it exists
			if (serviceRef.current) {
				serviceRef.current.cleanup()
			}

			serviceRef.current = new TypingIndicatorService({
				channelId,
				memberId,
				debounceDelay,
				typingTimeout,
			})

			isInitializedRef.current = true
		}

		// Cleanup on unmount or dependency change
		return () => {
			if (serviceRef.current) {
				serviceRef.current.cleanup()
				serviceRef.current = null
				isInitializedRef.current = false
			}
			setIsTyping(false)
		}
	}, [channelId, memberId, debounceDelay, typingTimeout])

	const startTyping = useMemo(
		() => async () => {
			if (!serviceRef.current || !memberId) return

			try {
				await serviceRef.current.startTyping()
				if (!isTyping) {
					setIsTyping(true)
					onTypingStart?.()
				}
			} catch (error) {
				console.warn("Failed to start typing:", error)
			}
		},
		[isTyping, memberId, onTypingStart],
	)

	const stopTyping = useMemo(
		() => async () => {
			if (!serviceRef.current) return

			try {
				await serviceRef.current.stopTyping()
				if (isTyping) {
					setIsTyping(false)
					onTypingStop?.()
				}
			} catch (error) {
				console.warn("Failed to stop typing:", error)
			}
		},
		[isTyping, onTypingStop],
	)

	const handleContentChange = useMemo(
		() => (content: string) => {
			const wasEmpty = lastContentRef.current === ""
			const isEmpty = content === ""

			lastContentRef.current = content

			if (isEmpty && !wasEmpty) {
				// Content was cleared
				stopTyping()
			} else if (!isEmpty && wasEmpty) {
				// Started typing from empty
				startTyping()
			} else if (!isEmpty) {
				// Still typing (content changed but not empty)
				startTyping() // This will reset the timeout
			}
		},
		[startTyping, stopTyping],
	)

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (serviceRef.current) {
				serviceRef.current.cleanup()
			}
		}
	}, [])

	return {
		isTyping,
		startTyping,
		stopTyping,
		handleContentChange,
	}
}

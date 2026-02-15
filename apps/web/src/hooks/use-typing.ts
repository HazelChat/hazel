import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/schema"
import { Exit } from "effect"
import { useCallback, useEffect, useRef, useState } from "react"
import { deleteTypingIndicatorMutation, upsertTypingIndicatorMutation } from "~/atoms/typing-indicator-atom"
import { pushTypingDiagnostics } from "~/lib/typing-diagnostics"

interface UseTypingOptions {
	channelId: ChannelId
	memberId: ChannelMemberId | null
	onTypingStart?: () => void
	onTypingStop?: () => void
	heartbeatInterval?: number
	/** @deprecated Use heartbeatInterval instead. */
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
	heartbeatInterval,
	debounceDelay,
	typingTimeout = 6000,
}: UseTypingOptions): UseTypingResult {
	const heartbeatIntervalMs = heartbeatInterval ?? debounceDelay ?? 1500
	const [isTyping, setIsTyping] = useState(false)
	const lastContentRef = useRef("")
	const isTypingRef = useRef(false)
	const lastHeartbeatRef = useRef<number>(0)
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const typingIndicatorIdRef = useRef<TypingIndicatorId | null>(null)
	const sessionIdRef = useRef(0)

	const upsertTypingIndicator = useAtomSet(upsertTypingIndicatorMutation, {
		mode: "promiseExit",
	})

	const deleteTypingIndicator = useAtomSet(deleteTypingIndicatorMutation, {
		mode: "promiseExit",
	})
	const deleteIndicatorById = useCallback(
		async (typingIndicatorId: TypingIndicatorId, details?: Record<string, unknown>) => {
			const result = await deleteTypingIndicator({
				payload: {
					id: typingIndicatorId,
				},
			})

			if (Exit.isSuccess(result)) {
				if (typingIndicatorIdRef.current === typingIndicatorId) {
					typingIndicatorIdRef.current = null
				}
				pushTypingDiagnostics({
					kind: "rpc_delete_success",
					channelId,
					memberId,
					typingIndicatorId,
					details,
				})
				return
			}

			const error = Exit.match(result, {
				onFailure: (cause) => cause,
				onSuccess: () => null,
			})
			pushTypingDiagnostics({
				kind: "rpc_delete_failure",
				channelId,
				memberId,
				typingIndicatorId,
				details: {
					...details,
					error,
				},
			})
			console.error("Failed to delete typing indicator:", error)
		},
		[channelId, memberId, deleteTypingIndicator],
	)

	const stopTyping = useCallback(async () => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
			typingTimeoutRef.current = null
		}

		if (isTypingRef.current) {
			isTypingRef.current = false
			sessionIdRef.current += 1
			lastHeartbeatRef.current = 0
			setIsTyping(false)
			onTypingStop?.()
			pushTypingDiagnostics({
				kind: "stop_requested",
				channelId,
				memberId,
				typingIndicatorId: typingIndicatorIdRef.current,
			})
		}

		const typingIndicatorId = typingIndicatorIdRef.current
		if (typingIndicatorId) {
			typingIndicatorIdRef.current = null
			await deleteIndicatorById(typingIndicatorId, {
				reason: "stop",
			})
		}
	}, [channelId, memberId, onTypingStop, deleteIndicatorById])

	const sendTypingHeartbeat = useCallback(
		async (sessionId: number, now: number) => {
			if (!memberId) return

			const result = await upsertTypingIndicator({
				payload: {
					channelId,
					memberId,
					lastTyped: now,
				},
			})

			if (Exit.isSuccess(result)) {
				const typingIndicatorId = result.value.data.id
				pushTypingDiagnostics({
					kind: "rpc_upsert_success",
					channelId,
					memberId,
					typingIndicatorId,
				})

				if (sessionId !== sessionIdRef.current) {
					await deleteIndicatorById(typingIndicatorId, {
						reason: "stale_session",
					})
					return
				}

				typingIndicatorIdRef.current = typingIndicatorId
				return
			}

			const error = Exit.match(result, {
				onFailure: (cause) => cause,
				onSuccess: () => null,
			})
			pushTypingDiagnostics({
				kind: "rpc_upsert_failure",
				channelId,
				memberId,
				details: {
					error,
				},
			})
			console.error("Failed to create typing indicator:", error)
		},
		[channelId, memberId, upsertTypingIndicator, deleteIndicatorById],
	)

	const startTyping = useCallback(() => {
		if (!memberId) return

		const now = Date.now()

		if (!isTypingRef.current) {
			sessionIdRef.current += 1
			isTypingRef.current = true
			setIsTyping(true)
			onTypingStart?.()
			pushTypingDiagnostics({
				kind: "start_requested",
				channelId,
				memberId,
				typingIndicatorId: typingIndicatorIdRef.current,
			})
		}
		const sessionId = sessionIdRef.current

		if (now - lastHeartbeatRef.current >= heartbeatIntervalMs) {
			lastHeartbeatRef.current = now
			pushTypingDiagnostics({
				kind: "heartbeat_sent",
				channelId,
				memberId,
				typingIndicatorId: typingIndicatorIdRef.current,
				details: {
					heartbeatIntervalMs,
				},
			})
			void sendTypingHeartbeat(sessionId, now)
		}

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
		}
		typingTimeoutRef.current = setTimeout(() => {
			void stopTyping()
		}, typingTimeout)
	}, [
		channelId,
		memberId,
		heartbeatIntervalMs,
		typingTimeout,
		onTypingStart,
		sendTypingHeartbeat,
		stopTyping,
	])

	const handleContentChange = useCallback(
		(content: string) => {
			const wasEmpty = lastContentRef.current === ""
			const isEmpty = content === ""

			lastContentRef.current = content

			if (isEmpty && !wasEmpty) {
				void stopTyping()
			} else if (!isEmpty && wasEmpty) {
				startTyping()
			} else if (!isEmpty) {
				startTyping()
			}
		},
		[startTyping, stopTyping],
	)

	useEffect(() => {
		sessionIdRef.current += 1
		lastHeartbeatRef.current = 0
		lastContentRef.current = ""
		void stopTyping()
	}, [channelId, memberId, stopTyping])

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				void stopTyping()
			}
		}
		const handleBlur = () => {
			void stopTyping()
		}

		window.addEventListener("blur", handleBlur)
		document.addEventListener("visibilitychange", handleVisibilityChange)

		return () => {
			window.removeEventListener("blur", handleBlur)
			document.removeEventListener("visibilitychange", handleVisibilityChange)
		}
	}, [stopTyping])

	useEffect(() => {
		return () => {
			void stopTyping()
		}
	}, [stopTyping])

	return {
		isTyping,
		startTyping,
		stopTyping,
		handleContentChange,
	}
}

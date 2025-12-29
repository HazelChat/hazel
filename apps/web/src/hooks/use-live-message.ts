import { useCallback, useEffect, useRef, useState } from "react"
import type { LiveState } from "@hazel/domain"

const STREAMS_URL = import.meta.env.VITE_STREAMS_URL ?? "http://localhost:8081"

interface UseLiveMessageResult {
	content: string
	isStreaming: boolean
	error: string | null
	reconnect: () => void
}

/**
 * Hook to subscribe to a live message stream
 * Connects to a Durable Stream and receives AI response chunks in real-time
 *
 * Features:
 * - Offset-based resumability (persisted to localStorage)
 * - Automatic reconnection on disconnect
 * - Error state handling
 */
export function useLiveMessage(messageId: string | null): UseLiveMessageResult {
	const [content, setContent] = useState("")
	const [isStreaming, setIsStreaming] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const abortControllerRef = useRef<AbortController | null>(null)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const getStoredOffset = useCallback((id: string): string => {
		return localStorage.getItem(`live-msg-offset-${id}`) ?? "-1"
	}, [])

	const saveOffset = useCallback((id: string, offset: string) => {
		localStorage.setItem(`live-msg-offset-${id}`, offset)
	}, [])

	const subscribe = useCallback(
		async (id: string, startOffset: string, signal: AbortSignal) => {
			const url = new URL(`${STREAMS_URL}/v1/stream/msg-${id}-responses`)
			url.searchParams.set("offset", startOffset)
			url.searchParams.set("live", "long-poll")

			try {
				const response = await fetch(url.toString(), { signal })

				if (!response.ok) {
					if (response.status === 404) {
						// Stream not created yet, retry after delay
						return { shouldRetry: true, offset: startOffset }
					}
					throw new Error(`Stream error: ${response.status}`)
				}

				const nextOffset = response.headers.get("Stream-Next-Offset") ?? startOffset
				const text = await response.text()

				if (text) {
					// Parse newline-delimited JSON chunks
					const lines = text.split("\n").filter((line) => line.trim())
					for (const line of lines) {
						try {
							const chunk = JSON.parse(line) as LiveState.ResponseChunk
							if (chunk.type === "chunk" && chunk.content) {
								setContent((prev) => prev + chunk.content)
								setIsStreaming(true)
							} else if (chunk.type === "complete") {
								setIsStreaming(false)
							} else if (chunk.type === "error") {
								setError(chunk.error ?? "Unknown error")
								setIsStreaming(false)
							}
						} catch {
							// Skip malformed lines
						}
					}
				}

				saveOffset(id, nextOffset)
				return { shouldRetry: true, offset: nextOffset }
			} catch (err) {
				if (signal.aborted) {
					return { shouldRetry: false, offset: startOffset }
				}
				console.error("Stream subscription error:", err)
				setError(err instanceof Error ? err.message : "Connection error")
				return { shouldRetry: true, offset: startOffset }
			}
		},
		[saveOffset],
	)

	const startSubscription = useCallback(
		async (id: string) => {
			// Cancel any existing subscription
			abortControllerRef.current?.abort()
			const controller = new AbortController()
			abortControllerRef.current = controller

			setError(null)
			setIsStreaming(true)

			let offset = getStoredOffset(id)

			// Long-poll loop
			while (!controller.signal.aborted) {
				const result = await subscribe(id, offset, controller.signal)

				if (!result.shouldRetry || controller.signal.aborted) {
					break
				}

				offset = result.offset

				// Small delay between polls to prevent hammering
				await new Promise((resolve) => setTimeout(resolve, 100))
			}
		},
		[getStoredOffset, subscribe],
	)

	const reconnect = useCallback(() => {
		if (messageId) {
			// Clear stored offset to start fresh
			localStorage.removeItem(`live-msg-offset-${messageId}`)
			setContent("")
			setError(null)
			startSubscription(messageId)
		}
	}, [messageId, startSubscription])

	useEffect(() => {
		if (!messageId) {
			return
		}

		startSubscription(messageId)

		return () => {
			abortControllerRef.current?.abort()
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
		}
	}, [messageId, startSubscription])

	return {
		content,
		isStreaming,
		error,
		reconnect,
	}
}

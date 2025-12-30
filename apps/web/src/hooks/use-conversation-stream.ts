import { DurableStream } from "@durable-streams/client"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	type PromptMessage,
	type ResponseChunk,
	getConversationStreamUrls,
	writePrompt,
} from "../lib/durable-streams"

interface UseConversationStreamResult {
	responses: Map<string, string>
	streamingPromptIds: Set<string>
	errors: Map<string, string>
	sendPrompt: (promptId: string, content: string) => Promise<void>
	reconnect: () => void
}

/**
 * Hook to interact with a conversation's durable streams
 *
 * - Subscribes to response stream for AI responses
 * - Provides method to write prompts to prompt stream
 * - Tracks streaming state per prompt
 */
export function useConversationStream(conversationId: string | null): UseConversationStreamResult {
	const [responses, setResponses] = useState<Map<string, string>>(() => new Map())
	const [streamingPromptIds, setStreamingPromptIds] = useState<Set<string>>(() => new Set())
	const [errors, setErrors] = useState<Map<string, string>>(() => new Map())
	const abortControllerRef = useRef<AbortController | null>(null)
	const offsetRef = useRef<string>("-1")

	const getStoredOffset = useCallback((id: string): string => {
		return localStorage.getItem(`conv-stream-offset-${id}`) ?? "-1"
	}, [])

	const saveOffset = useCallback((id: string, offset: string) => {
		localStorage.setItem(`conv-stream-offset-${id}`, offset)
		offsetRef.current = offset
	}, [])

	const subscribe = useCallback(
		async (convId: string, startOffset: string, signal: AbortSignal) => {
			const { responseStreamUrl } = getConversationStreamUrls(convId)
			const url = new URL(responseStreamUrl)
			url.searchParams.set("offset", startOffset)
			url.searchParams.set("live", "long-poll")

			try {
				const response = await fetch(url.toString(), { signal })

				if (!response.ok) {
					if (response.status === 404) {
						return { shouldRetry: true, offset: startOffset }
					}
					throw new Error(`Stream error: ${response.status}`)
				}

				const nextOffset = response.headers.get("Stream-Next-Offset") ?? startOffset
				const text = await response.text()

				if (text) {
					const lines = text.split("\n").filter((line) => line.trim())
					for (const line of lines) {
						try {
							const chunk = JSON.parse(line) as ResponseChunk

							if (chunk.type === "chunk" && chunk.content) {
								setResponses((prev) => {
									const newMap = new Map(prev)
									const existing = newMap.get(chunk.promptId) ?? ""
									newMap.set(chunk.promptId, existing + chunk.content)
									return newMap
								})
								setStreamingPromptIds((prev) => new Set(prev).add(chunk.promptId))
							} else if (chunk.type === "complete") {
								setStreamingPromptIds((prev) => {
									const newSet = new Set(prev)
									newSet.delete(chunk.promptId)
									return newSet
								})
							} else if (chunk.type === "error") {
								setErrors((prev) => {
									const newMap = new Map(prev)
									newMap.set(chunk.promptId, chunk.error ?? "Unknown error")
									return newMap
								})
								setStreamingPromptIds((prev) => {
									const newSet = new Set(prev)
									newSet.delete(chunk.promptId)
									return newSet
								})
							}
						} catch {
							// Skip malformed lines
						}
					}
				}

				saveOffset(convId, nextOffset)
				return { shouldRetry: true, offset: nextOffset }
			} catch (err) {
				if (signal.aborted) {
					return { shouldRetry: false, offset: startOffset }
				}
				console.error("Stream subscription error:", err)
				return { shouldRetry: true, offset: startOffset }
			}
		},
		[saveOffset],
	)

	const startSubscription = useCallback(
		async (convId: string) => {
			abortControllerRef.current?.abort()
			const controller = new AbortController()
			abortControllerRef.current = controller

			// Create the response stream if it doesn't exist
			const { responseStreamUrl } = getConversationStreamUrls(convId)
			try {
				await DurableStream.create({
					url: responseStreamUrl,
					contentType: "application/json",
				})
			} catch {
				// Stream already exists, continue
			}

			let offset = getStoredOffset(convId)

			while (!controller.signal.aborted) {
				const result = await subscribe(convId, offset, controller.signal)

				if (!result.shouldRetry || controller.signal.aborted) {
					break
				}

				offset = result.offset
				await new Promise((resolve) => setTimeout(resolve, 100))
			}
		},
		[getStoredOffset, subscribe],
	)

	const sendPrompt = useCallback(
		async (promptId: string, content: string) => {
			if (!conversationId) return

			const prompt: PromptMessage = {
				id: promptId,
				content,
				timestamp: Date.now(),
			}

			await writePrompt(conversationId, prompt)
		},
		[conversationId],
	)

	const reconnect = useCallback(() => {
		if (conversationId) {
			localStorage.removeItem(`conv-stream-offset-${conversationId}`)
			setResponses(new Map())
			setErrors(new Map())
			startSubscription(conversationId)
		}
	}, [conversationId, startSubscription])

	useEffect(() => {
		if (!conversationId) return

		startSubscription(conversationId)

		return () => {
			abortControllerRef.current?.abort()
		}
	}, [conversationId, startSubscription])

	return {
		responses,
		streamingPromptIds,
		errors,
		sendPrompt,
		reconnect,
	}
}

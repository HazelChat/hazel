import { DurableStream } from "@durable-streams/client"
import { useEffect, useState } from "react"

const STREAMS_URL = import.meta.env.VITE_STREAMS_URL ?? "http://localhost:8081/v1/stream"

interface StreamChunk {
	content: string
	isComplete: boolean
	error?: string
}

interface StreamingMessageContentProps {
	streamId: string
	onComplete?: (fullContent: string) => void
}

export function StreamingMessageContent({ streamId, onComplete }: StreamingMessageContentProps) {
	const [content, setContent] = useState("")
	const [isComplete, setIsComplete] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const abortController = new AbortController()

		async function consumeStream() {
			const streamUrl = `${STREAMS_URL}/${streamId}`
			const stream = new DurableStream({ url: streamUrl })

			const decoder = new TextDecoder()
			let accumulatedContent = ""

			try {
				const session = await stream.stream({
					live: "long-poll",
					signal: abortController.signal,
				})

				session.subscribeBytes(async (chunk) => {
					if (chunk.data.length === 0) return

					const text = decoder.decode(chunk.data)
					const lines = text.split("\n").filter((l) => l.trim())

					for (const line of lines) {
						try {
							const parsed: StreamChunk = JSON.parse(line)

							if (parsed.error) {
								setError(parsed.error)
								setIsComplete(true)
								return
							}

							if (parsed.content) {
								accumulatedContent += parsed.content
								setContent(accumulatedContent)
							}

							if (parsed.isComplete) {
								setIsComplete(true)
								onComplete?.(accumulatedContent)
								return
							}
						} catch {
							// Skip invalid JSON lines
						}
					}
				})

				await session.closed
			} catch (err) {
				if (!abortController.signal.aborted) {
					console.error("Stream error:", err)
					setError("Connection lost")
				}
			}
		}

		consumeStream()

		return () => {
			abortController.abort()
		}
	}, [streamId, onComplete])

	if (error) {
		return <div className="text-destructive">{error}</div>
	}

	return (
		<div className="whitespace-pre-wrap">
			{content}
			{!isComplete && <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-current" />}
		</div>
	)
}

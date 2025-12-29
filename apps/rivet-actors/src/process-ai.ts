/**
 * AI Processing module - handles streaming AI responses to Durable Streams
 * Simplified version without rivetkit actor framework
 */

import { DurableStream } from "@durable-streams/client"
import { streamText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { ResponseChunk } from "./types.ts"

const STREAMS_URL = process.env.STREAMS_SERVER_URL ?? "http://localhost:8081"
const BACKEND_URL = process.env.API_BASE_URL ?? "http://localhost:3003"

// Initialize OpenRouter client
const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

/**
 * Process an AI message - streams response chunks to Durable Streams
 */
export async function processAIMessage(
	messageId: string,
	prompt: string,
): Promise<void> {
	console.log(`[AI] Processing message ${messageId}`)

	const responseStreamUrl = `${STREAMS_URL}/v1/stream/msg-${messageId}-responses`

	// Get or create the response stream
	let responseStream: DurableStream
	try {
		responseStream = await DurableStream.create({
			url: responseStreamUrl,
			contentType: "application/json",
		})
	} catch {
		responseStream = new DurableStream({ url: responseStreamUrl })
	}

	try {
		let streamError: Error | null = null

		const result = streamText({
			model: openrouter("anthropic/claude-sonnet-4"),
			prompt: prompt,
			onError: (error) => {
				console.error(`[AI] streamText error:`, error.error)
				streamError =
					error.error instanceof Error ? error.error : new Error(String(error.error))
			},
		})

		let fullResponse = ""
		let chunkCount = 0

		console.log(`[AI] Starting to stream response for ${messageId}`)

		for await (const textPart of result.textStream) {
			chunkCount++
			fullResponse += textPart

			const responseChunk: ResponseChunk = {
				type: "chunk",
				promptId: messageId,
				content: textPart,
				isComplete: false,
				timestamp: Date.now(),
			}

			await responseStream.append(JSON.stringify(responseChunk) + "\n", {
				contentType: "application/json",
			})
		}

		console.log(`[AI] Finished streaming ${chunkCount} chunks for ${messageId}`)

		if (streamError) {
			const errorChunk: ResponseChunk = {
				type: "error",
				promptId: messageId,
				content: `Error: ${streamError.message}`,
				isComplete: true,
				timestamp: Date.now(),
			}

			await responseStream.append(JSON.stringify(errorChunk) + "\n", {
				contentType: "application/json",
			})
			return
		}

		// Send completion marker
		const completeChunk: ResponseChunk = {
			type: "complete",
			promptId: messageId,
			content: "",
			isComplete: true,
			timestamp: Date.now(),
		}

		await responseStream.append(JSON.stringify(completeChunk) + "\n", {
			contentType: "application/json",
		})

		// Persist final message to database
		await persistMessage(messageId, fullResponse)

		console.log(`[AI] Completed processing ${messageId}`)
	} catch (error) {
		console.error(`[AI] Error processing ${messageId}:`, error)

		// Send error chunk
		const errorChunk: ResponseChunk = {
			type: "error",
			promptId: messageId,
			isComplete: true,
			error: error instanceof Error ? error.message : "Unknown error",
			timestamp: Date.now(),
		}

		await responseStream.append(JSON.stringify(errorChunk) + "\n", {
			contentType: "application/json",
		})
	}
}

async function persistMessage(messageId: string, content: string) {
	try {
		await fetch(`${BACKEND_URL}/api/internal/messages/${messageId}/complete`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		})
	} catch (error) {
		console.error("[AI] Error persisting message:", error)
	}
}

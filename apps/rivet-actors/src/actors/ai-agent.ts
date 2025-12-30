import { actor } from "rivetkit"
import { DurableStream } from "@durable-streams/client"
import { streamText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { ResponseChunk } from "../types.ts"

const STREAMS_URL = process.env.STREAMS_SERVER_URL ?? "http://localhost:8081"
const BACKEND_URL = process.env.API_BASE_URL ?? "http://localhost:3003"

// Initialize OpenRouter client
const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

// State type for documentation
interface AiAgentState {
	messageId: string
	channelId: string
	isComplete: boolean
}

export const aiAgent = actor({
	createState: (c: any, input?: { messageId?: string; channelId?: string }) =>
		({
			messageId: input?.messageId ?? c.key[0] ?? "",
			channelId: input?.channelId ?? "",
			isComplete: false,
		}) as AiAgentState,

	actions: {
		getMessageId: (c: any) => (c.state as AiAgentState).messageId,
		isComplete: (c: any) => (c.state as AiAgentState).isComplete,

		/**
		 * Process a message with AI and stream response to durable stream
		 */
		processMessage: async (c: any, prompt: string) => {
			const state = c.state as AiAgentState
			c.log.info({ msg: "processMessage starting", messageId: state.messageId })

			const responseStream = await getOrCreateResponseStream(state.messageId)

			try {
				const result = streamText({
					model: openrouter("anthropic/claude-sonnet-4"),
					prompt,
				})

				let fullResponse = ""
				let chunkCount = 0

				for await (const textPart of result.textStream) {
					chunkCount++
					fullResponse += textPart

					const responseChunk: ResponseChunk = {
						type: "chunk",
						promptId: state.messageId,
						content: textPart,
						isComplete: false,
						timestamp: Date.now(),
					}

					await responseStream.append(JSON.stringify(responseChunk) + "\n", {
						contentType: "application/json",
					})
				}

				c.log.info({ msg: "finished streaming", chunkCount, responseLength: fullResponse.length })

				// Send completion marker
				const completeChunk: ResponseChunk = {
					type: "complete",
					promptId: state.messageId,
					content: "",
					isComplete: true,
					timestamp: Date.now(),
				}

				await responseStream.append(JSON.stringify(completeChunk) + "\n", {
					contentType: "application/json",
				})

				// Persist final message to database
				await persistMessage(state.messageId, fullResponse)
				state.isComplete = true

				return { success: true, response: fullResponse }
			} catch (error) {
				c.log.error({ msg: "processMessage error", error })

				const errorChunk: ResponseChunk = {
					type: "error",
					promptId: state.messageId,
					isComplete: true,
					error: error instanceof Error ? error.message : "Unknown error",
					timestamp: Date.now(),
				}

				await responseStream.append(JSON.stringify(errorChunk) + "\n", {
					contentType: "application/json",
				})

				return { success: false, error: errorChunk.error }
			}
		},
	},
})

async function getOrCreateResponseStream(messageId: string): Promise<DurableStream> {
	const responseStreamUrl = `${STREAMS_URL}/v1/stream/msg-${messageId}-responses`

	try {
		return await DurableStream.create({
			url: responseStreamUrl,
			contentType: "application/json",
		})
	} catch {
		// Stream already exists, just return a client for it
		return new DurableStream({ url: responseStreamUrl })
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
		console.error("Error persisting message:", error)
	}
}

/**
 * Standalone function for processing AI messages (useful for testing)
 * This is the same logic as the actor action but without actor context
 */
export async function processAIMessage(messageId: string, prompt: string): Promise<void> {
	const responseStream = await getOrCreateResponseStream(messageId)

	try {
		const result = streamText({
			model: openrouter("anthropic/claude-sonnet-4"),
			prompt,
		})

		let fullResponse = ""

		for await (const textPart of result.textStream) {
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

		await persistMessage(messageId, fullResponse)
	} catch (error) {
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

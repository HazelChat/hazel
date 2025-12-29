import { type ActorContextOf, actor } from "rivetkit"
import { DurableStream } from "@durable-streams/client"
import { streamText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { PromptMessage, ResponseChunk } from "../types.ts"

const STREAMS_URL = process.env.STREAMS_SERVER_URL ?? "http://localhost:8081"
const BACKEND_URL = process.env.API_BASE_URL ?? "http://localhost:3003"

// Initialize OpenRouter client
const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

export const aiAgent = actor({
	// Note: input may be undefined when key is used to pass messageId
	createState: (c, input?: { messageId?: string; channelId?: string }) => ({
		// Read messageId from input if provided, otherwise from key (first element)
		messageId: input?.messageId ?? c.key[0] ?? "",
		channelId: input?.channelId ?? "",
		promptStreamOffset: "-1" as string,
		isComplete: false,
	}),

	onWake: (c) => {
		consumePromptStream(c)
	},

	actions: {
		getMessageId: (c) => c.state.messageId,
		getPromptStreamOffset: (c) => c.state.promptStreamOffset,
		isComplete: (c) => c.state.isComplete,
	},

	options: {
		// IMPORTANT: Keep actor alive to continuously consume prompts
		noSleep: true,
	},
})

async function getStreams(messageId: string) {
	const promptStreamUrl = `${STREAMS_URL}/v1/stream/msg-${messageId}-prompts`
	const responseStreamUrl = `${STREAMS_URL}/v1/stream/msg-${messageId}-responses`

	let promptStream: DurableStream
	let responseStream: DurableStream

	try {
		promptStream = await DurableStream.create({
			url: promptStreamUrl,
			contentType: "application/json",
		})
	} catch {
		promptStream = new DurableStream({ url: promptStreamUrl })
	}

	try {
		responseStream = await DurableStream.create({
			url: responseStreamUrl,
			contentType: "application/json",
		})
	} catch {
		responseStream = new DurableStream({ url: responseStreamUrl })
	}

	return { promptStream, responseStream }
}

async function consumePromptStream(c: ActorContextOf<typeof aiAgent>) {
	c.log.info({
		msg: "consumePromptStream started",
		messageId: c.state.messageId,
		offset: c.state.promptStreamOffset,
	})

	const { promptStream, responseStream } = await getStreams(c.state.messageId)

	try {
		c.log.info({
			msg: "starting stream subscription",
			offset: c.state.promptStreamOffset,
		})

		// Use the stream API with subscription for live updates
		const streamResponse = await promptStream.stream<PromptMessage>({
			offset: c.state.promptStreamOffset,
			live: "long-poll",
			signal: c.abortSignal,
		})

		// Subscribe to JSON batches as they arrive
		streamResponse.subscribeJson<PromptMessage>(async (batch) => {
			c.log.info({
				msg: "received batch",
				itemCount: batch.items.length,
				offset: batch.offset,
			})

			for (const prompt of batch.items) {
				if (!prompt.id) {
					c.log.warn({ msg: "skipping prompt with no id" })
					continue
				}

				c.log.info({ msg: "processing prompt", promptId: prompt.id })
				await processPrompt(c, prompt, responseStream)
				c.log.info({ msg: "finished processing prompt", promptId: prompt.id })
			}

			// Update offset after processing batch
			c.state.promptStreamOffset = batch.offset
		})

		// Wait for stream to close
		await streamResponse.closed

		c.log.info({ msg: "stream closed" })
	} catch (error) {
		c.log.error({
			msg: "error in consumePromptStream",
			error,
			aborted: c.abortSignal.aborted,
		})

		if (!c.abortSignal.aborted) {
			// Send error chunk
			const errorChunk: ResponseChunk = {
				type: "error",
				promptId: "",
				isComplete: true,
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: Date.now(),
			}
			await responseStream.append(JSON.stringify(errorChunk) + "\n", {
				contentType: "application/json",
			})
		}
	}
}

async function processPrompt(
	c: ActorContextOf<typeof aiAgent>,
	prompt: PromptMessage,
	responseStream: DurableStream,
) {
	c.log.info({ msg: "processPrompt starting", promptId: prompt.id })

	let streamError: Error | null = null

	const result = streamText({
		model: openrouter("anthropic/claude-sonnet-4"),
		prompt: prompt.content,
		onError: (error) => {
			c.log.error({ msg: "streamText onError", error: error.error })
			streamError = error.error instanceof Error ? error.error : new Error(String(error.error))
		},
	})

	let fullResponse = ""
	let chunkCount = 0

	c.log.info({ msg: "starting to consume textStream" })

	for await (const textPart of result.textStream) {
		chunkCount++
		fullResponse += textPart

		const responseChunk: ResponseChunk = {
			type: "chunk",
			promptId: prompt.id,
			content: textPart,
			isComplete: false,
			timestamp: Date.now(),
		}

		await responseStream.append(JSON.stringify(responseChunk) + "\n", {
			contentType: "application/json",
		})
	}

	c.log.info({
		msg: "finished consuming textStream",
		chunkCount,
		fullResponseLength: fullResponse.length,
	})

	if (streamError) {
		const errorChunk: ResponseChunk = {
			type: "error",
			promptId: prompt.id,
			content: `Error: ${(streamError as Error).message}`,
			isComplete: true,
			timestamp: Date.now(),
		}

		await responseStream.append(JSON.stringify(errorChunk) + "\n", {
			contentType: "application/json",
		})

		c.broadcast("responseError", {
			promptId: prompt.id,
			error: errorChunk.content,
		})
		return
	}

	// Send completion marker
	const completeChunk: ResponseChunk = {
		type: "complete",
		promptId: prompt.id,
		content: "",
		isComplete: true,
		timestamp: Date.now(),
	}

	await responseStream.append(JSON.stringify(completeChunk) + "\n", {
		contentType: "application/json",
	})

	c.broadcast("responseComplete", { promptId: prompt.id, fullResponse })

	// Persist final message to database
	await persistMessage(c.state.messageId, fullResponse)
	c.state.isComplete = true
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

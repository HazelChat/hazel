import { type ActorContextOf, actor } from "rivetkit"
import { DurableStream } from "@durable-streams/client"
import { streamText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { getStreams } from "../shared/streams.ts"
import type { PromptMessage, ResponseChunk } from "../types.ts"

const BACKEND_URL = process.env.API_BASE_URL ?? "http://localhost:3003"

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

interface AiAgentState {
	conversationId: string
	promptStreamOffset: string | undefined
}

export const aiAgent = actor({
	createState: (c, input?: { conversationId: string }) => ({
		conversationId: input?.conversationId ?? c.key[0] ?? "",
		promptStreamOffset: undefined as string | undefined,
	}),

	onWake: (c) => {
		consumeStream(c)
	},

	actions: {
		getConversationId: (c) => (c.state as AiAgentState).conversationId,
		getPromptStreamOffset: (c) => (c.state as AiAgentState).promptStreamOffset,
	},

	options: {
		noSleep: true,
	},
})

async function consumeStream(c: ActorContextOf<typeof aiAgent>) {
	const state = c.state as AiAgentState

	c.log.info({
		msg: "consumeStream started",
		conversationId: state.conversationId,
		offset: state.promptStreamOffset,
	})

	const { promptStream, responseStream } = await getStreams(state.conversationId)

	try {
		const session = await promptStream.stream({
			offset: state.promptStreamOffset ?? "-1",
			live: "long-poll",
			signal: c.abortSignal,
		})

		session.subscribeJson<string>(async (batch) => {
			for (const rawItem of batch.items) {
				if (typeof rawItem !== "string") continue
				const trimmed = rawItem.trim()
				if (!trimmed) continue

				try {
					const parsed = JSON.parse(trimmed)
					const prompts: PromptMessage[] = Array.isArray(parsed) ? parsed : [parsed]

					for (const prompt of prompts) {
						if (!prompt.id) {
							c.log.warn({ msg: "skipping prompt with no id" })
							continue
						}

						c.log.info({ msg: "processing prompt", promptId: prompt.id })
						await processPrompt(c, prompt, responseStream)
						c.log.info({ msg: "finished processing prompt", promptId: prompt.id })
					}
				} catch (e) {
					c.log.error({ msg: "failed to parse json", rawItem, error: e })
				}
			}

			if (batch.offset) {
				state.promptStreamOffset = batch.offset
			}
		})
	} catch (error) {
		c.log.error({
			msg: "error in consumeStream",
			error,
			aborted: c.abortSignal.aborted,
		})

		if (!c.abortSignal.aborted) {
			setTimeout(() => consumeStream(c), 5000)
		}
	}
}

async function processPrompt(
	c: ActorContextOf<typeof aiAgent>,
	prompt: PromptMessage,
	responseStream: DurableStream,
) {
	c.log.info({ msg: "processPrompt starting", promptId: prompt.id })

	let streamErrorMessage: string | null = null

	const result = streamText({
		model: openrouter("anthropic/claude-sonnet-4"),
		prompt: prompt.content,
		onError: (error) => {
			c.log.error({ msg: "streamText onError", error: error.error })
			streamErrorMessage = error.error instanceof Error ? error.error.message : String(error.error)
		},
	})

	let fullResponse = ""
	let chunkCount = 0

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
		msg: "finished streaming",
		chunkCount,
		fullResponseLength: fullResponse.length,
	})

	if (streamErrorMessage !== null) {
		const errorChunk: ResponseChunk = {
			type: "error",
			promptId: prompt.id,
			content: `Error: ${streamErrorMessage}`,
			isComplete: true,
			timestamp: Date.now(),
		}

		await responseStream.append(JSON.stringify(errorChunk) + "\n", {
			contentType: "application/json",
		})

		c.broadcast("responseError", { promptId: prompt.id, error: errorChunk.content })
		return
	}

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

	await persistMessage(prompt.id, fullResponse)

	c.broadcast("responseComplete", { promptId: prompt.id, fullResponse })
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

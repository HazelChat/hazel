import { type ActorContextOf, actor } from "rivetkit"
import { DurableStream } from "@durable-streams/client"

const STREAMS_URL = process.env.STREAMS_URL ?? "http://127.0.0.1:8081/v1/stream"

interface PromptMessage {
	id: string
	content: string
	timestamp: number
}

interface ResponseChunk {
	promptId: string
	content: string
	isComplete: boolean
	timestamp: number
}

export const echo = actor({
	createState: (_c, input?: { conversationId?: string }) => ({
		conversationId: input?.conversationId ?? "default",
		messageCount: 0,
		promptStreamOffset: undefined as string | undefined,
	}),

	onWake: (c) => {
		consumeStream(c)
	},

	actions: {
		// Keep simple echo for testing
		echo: (c, message: string) => {
			c.state.messageCount++
			return `Echo #${c.state.messageCount}: ${message}`
		},
		getCount: (c) => c.state.messageCount,
		getConversationId: (c) => c.state.conversationId,
	},

	options: {
		noSleep: true, // Keep alive to consume streams
	},
})

async function getStreams(conversationId: string) {
	const promptUrl = `${STREAMS_URL}/conversations/${conversationId}/prompts`
	const responseUrl = `${STREAMS_URL}/conversations/${conversationId}/responses`

	let promptStream: DurableStream
	let responseStream: DurableStream

	try {
		promptStream = await DurableStream.create({ url: promptUrl, contentType: "application/json" })
	} catch {
		promptStream = new DurableStream({ url: promptUrl })
	}

	try {
		responseStream = await DurableStream.create({ url: responseUrl, contentType: "application/json" })
	} catch {
		responseStream = new DurableStream({ url: responseUrl })
	}

	return { promptStream, responseStream }
}

async function consumeStream(c: ActorContextOf<typeof echo>) {
	c.log.info({ msg: "consumeStream started", conversationId: c.state.conversationId })

	const { promptStream, responseStream } = await getStreams(c.state.conversationId)
	const decoder = new TextDecoder()

	try {
		// Use stream() API (npm version 0.1.2)
		const session = await promptStream.stream({
			offset: c.state.promptStreamOffset,
			live: "long-poll",
			signal: c.abortSignal,
		})

		session.subscribeBytes(async (chunk) => {
			c.state.promptStreamOffset = chunk.offset
			if (chunk.data.length === 0) return

			const text = decoder.decode(chunk.data)
			const lines = text.split("\n").filter((l) => l.trim())

			for (const line of lines) {
				let prompts: PromptMessage[]
				try {
					prompts = JSON.parse(line)
				} catch {
					continue
				}

				if (!Array.isArray(prompts)) continue

				for (const prompt of prompts) {
					if (!prompt.id) continue

					// Echo the message
					c.state.messageCount++
					const response: ResponseChunk = {
						promptId: prompt.id,
						content: `Echo #${c.state.messageCount}: ${prompt.content}`,
						isComplete: true,
						timestamp: Date.now(),
					}

					c.log.info({ msg: "echoing message", promptId: prompt.id, content: response.content })

					await responseStream.append(JSON.stringify(response) + "\n", {
						contentType: "application/json",
					})

					c.broadcast("response", response)
				}
			}
		})

		await session.closed
	} catch (error) {
		c.log.error({ msg: "consumeStream error", error })
		if (!c.abortSignal.aborted) {
			setTimeout(() => consumeStream(c), 5000)
		}
	}
}

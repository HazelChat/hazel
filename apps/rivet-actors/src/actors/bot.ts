import { anthropic } from "@ai-sdk/anthropic"
import { DurableStream } from "@durable-streams/client"
import { streamText } from "ai"
import { type ActorContextOf, actor } from "rivetkit"

const STREAMS_URL = process.env.STREAMS_URL ?? "http://localhost:8081/v1/stream"
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3003"

interface StreamReplyParams {
	messageId: string
	prompt: string
	streamId: string
}

interface StreamChunk {
	content: string
	isComplete: boolean
}

export const bot = actor({
	createState: () => ({
		messageCount: 0,
	}),

	actions: {
		/**
		 * Start streaming a reply to a prompt.
		 * Returns immediately, streaming happens in background.
		 */
		streamReply: (c, params: StreamReplyParams) => {
			c.state.messageCount++
			c.log.info({ msg: "bot.streamReply started", ...params })

			// Fire and forget - streaming happens async
			processStreamingReply(c, params).catch((error) => {
				c.log.error({ msg: "streamReply failed", error: String(error) })
			})

			return { started: true, streamId: params.streamId }
		},

		/**
		 * Simple non-streaming reply for testing
		 */
		reply: (c, prompt: string) => {
			c.state.messageCount++
			return `Hello! You mentioned me with: "${prompt}"`
		},

		getMessageCount: (c) => c.state.messageCount,
	},
})

async function processStreamingReply(
	c: ActorContextOf<typeof bot>,
	params: StreamReplyParams,
) {
	const streamUrl = `${STREAMS_URL}/${params.streamId}`

	let responseStream: DurableStream
	try {
		responseStream = await DurableStream.create({
			url: streamUrl,
			contentType: "application/json",
		})
	} catch {
		responseStream = new DurableStream({ url: streamUrl })
	}

	let fullContent = ""

	try {
		c.log.info({ msg: "Starting AI stream", prompt: params.prompt.slice(0, 100) })

		const result = streamText({
			model: anthropic("claude-sonnet-4-20250514"),
			prompt: params.prompt,
		})

		for await (const textPart of result.textStream) {
			fullContent += textPart

			const chunk: StreamChunk = {
				content: textPart,
				isComplete: false,
			}

			await responseStream.append(JSON.stringify(chunk) + "\n", {
				contentType: "application/json",
			})
		}

		// Send completion marker
		const completeChunk: StreamChunk = {
			content: "",
			isComplete: true,
		}
		await responseStream.append(JSON.stringify(completeChunk) + "\n", {
			contentType: "application/json",
		})

		c.log.info({ msg: "AI stream complete", contentLength: fullContent.length })

		// Update message in database with final content
		await updateMessageContent(params.messageId, fullContent, "complete")
	} catch (error) {
		c.log.error({ msg: "AI stream error", error: String(error) })

		// Send error to stream
		await responseStream.append(
			JSON.stringify({
				content: "",
				isComplete: true,
				error: String(error),
			}) + "\n",
			{ contentType: "application/json" },
		)

		// Update message with error state
		await updateMessageContent(
			params.messageId,
			fullContent || "Sorry, an error occurred while processing your request.",
			"error",
		)
	}
}

async function updateMessageContent(
	messageId: string,
	content: string,
	status: "complete" | "error",
) {
	const response = await fetch(`${BACKEND_URL}/internal/messages/${messageId}/complete`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content, status }),
	})

	if (!response.ok) {
		console.error(`Failed to update message ${messageId}: ${response.status}`)
	}
}

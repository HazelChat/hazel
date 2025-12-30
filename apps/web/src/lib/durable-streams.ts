import { DurableStream } from "@durable-streams/client"

const STREAMS_URL = import.meta.env.VITE_STREAMS_URL ?? "http://localhost:8081/v1/stream"

export interface PromptMessage {
	id: string
	content: string
	timestamp: number
}

export interface ResponseChunk {
	type: "chunk" | "complete" | "error"
	promptId: string
	content?: string
	isComplete: boolean
	error?: string
	timestamp: number
}

export function getConversationStreamUrls(conversationId: string) {
	return {
		promptStreamUrl: `${STREAMS_URL}/conversations/${conversationId}/prompts`,
		responseStreamUrl: `${STREAMS_URL}/conversations/${conversationId}/responses`,
	}
}

async function createOrConnect(url: string): Promise<DurableStream> {
	try {
		return await DurableStream.create({
			url,
			contentType: "application/json",
		})
	} catch {
		return new DurableStream({ url })
	}
}

export async function writePrompt(conversationId: string, prompt: PromptMessage): Promise<void> {
	const { promptStreamUrl } = getConversationStreamUrls(conversationId)
	const stream = await createOrConnect(promptStreamUrl)
	await stream.append(JSON.stringify([prompt]) + "\n", {
		contentType: "application/json",
	})
}

export async function getResponseStream(conversationId: string): Promise<DurableStream> {
	const { responseStreamUrl } = getConversationStreamUrls(conversationId)
	return createOrConnect(responseStreamUrl)
}

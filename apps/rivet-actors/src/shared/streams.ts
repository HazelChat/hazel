import { DurableStream } from "@durable-streams/client"

export const STREAMS_URL = process.env.STREAMS_SERVER_URL ?? "http://localhost:8081/v1/stream"

export interface ConversationStreams {
	promptStream: DurableStream
	responseStream: DurableStream
}

export async function getStreams(conversationId: string): Promise<ConversationStreams> {
	const promptUrl = `${STREAMS_URL}/conversations/${conversationId}/prompts`
	const responseUrl = `${STREAMS_URL}/conversations/${conversationId}/responses`

	const promptStream = await createOrConnect(promptUrl)
	const responseStream = await createOrConnect(responseUrl)

	return { promptStream, responseStream }
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

export function getStreamUrls(conversationId: string) {
	return {
		promptStreamUrl: `${STREAMS_URL}/conversations/${conversationId}/prompts`,
		responseStreamUrl: `${STREAMS_URL}/conversations/${conversationId}/responses`,
	}
}

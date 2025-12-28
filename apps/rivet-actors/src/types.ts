/**
 * Types for Durable Streams messages
 */

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

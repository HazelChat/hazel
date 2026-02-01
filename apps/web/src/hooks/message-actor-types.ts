import type { AgentStep } from "~/components/chat/agent-steps-view"

/**
 * Event types for the message actor WebSocket connection.
 * Centralizes all event payloads for type safety.
 */
export interface MessageActorEvents {
	started: { data: Record<string, unknown> }
	dataUpdate: { data: Record<string, unknown> }
	progress: { progress: number }
	textChunk: { chunk: string; fullText: string }
	textUpdate: { text: string }
	streamEnd: { text: string }
	completed: { data: Record<string, unknown> }
	failed: { error: string }
	stepAdded: { step: AgentStep; index: number }
	stepStarted: { stepId: string; index: number }
	stepContentUpdate: { stepId: string; content: string }
	stepCompleted: { stepId: string; step: AgentStep }
}

export type MessageActorEventName = keyof MessageActorEvents

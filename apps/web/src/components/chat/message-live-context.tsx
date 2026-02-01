import { createContext, use } from "react"
import type { AgentStep } from "./agent-steps-view"

export interface MessageLiveState {
	status: "idle" | "active" | "completed" | "failed"
	data: Record<string, unknown>
	text: string
	isStreaming: boolean
	progress: number | null
	error: string | null
	steps: AgentStep[]
	currentStepIndex: number | null
	isConnected: boolean
}

interface MessageLiveContextValue {
	state: MessageLiveState
}

export const MessageLiveContext = createContext<MessageLiveContextValue | null>(null)

export function useMessageLive(): MessageLiveContextValue {
	const ctx = use(MessageLiveContext)
	if (!ctx) {
		throw new Error("MessageLive components must be used within MessageLive.Provider")
	}
	return ctx
}

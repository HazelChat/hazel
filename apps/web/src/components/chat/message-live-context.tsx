import { createContext, use } from "react"
import type { OrganizationId } from "@hazel/schema"
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

export interface MessageLiveActions {
	// Future: retry, cancel, etc.
}

export interface MessageLiveMeta {
	organizationId?: OrganizationId
}

interface MessageLiveContextValue {
	state: MessageLiveState
	actions: MessageLiveActions
	meta: MessageLiveMeta
}

export const MessageLiveContext = createContext<MessageLiveContextValue | null>(null)

export function useMessageLive(): MessageLiveContextValue {
	const ctx = use(MessageLiveContext)
	if (!ctx) {
		throw new Error("MessageLive components must be used within MessageLive.Provider")
	}
	return ctx
}

export function useMessageLiveState(): MessageLiveState {
	return useMessageLive().state
}

export function useMessageLiveActions(): MessageLiveActions {
	return useMessageLive().actions
}

export function useMessageLiveMeta(): MessageLiveMeta {
	return useMessageLive().meta
}

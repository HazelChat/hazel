import { useEffect, useRef, useState } from "react"
import type { MessageId } from "@hazel/schema"
import type { AgentStep } from "~/components/chat/agent-steps-view"
import { rivetClient, getAccessToken } from "~/lib/rivet-client"
import type { MessageActorEvents } from "./message-actor-types"

interface MessageActorState {
	status: "idle" | "active" | "completed" | "failed"
	data: Record<string, unknown>
	text: string
	isStreaming: boolean
	progress: number | null
	error: string | null
	startedAt: number | null
	completedAt: number | null
	steps: AgentStep[]
	currentStepIndex: number | null
}

/**
 * Cached state from the database embed - used when actor is already completed/failed
 */
export interface CachedActorState {
	status: "idle" | "active" | "completed" | "failed"
	data: Record<string, unknown>
	text?: string
	progress?: number
	error?: string
	steps?: readonly AgentStep[]
}

interface UseMessageActorOptions {
	/** Whether to enable the actor connection */
	enabled?: boolean
	/** Cached state from the database - if completed/failed, skip actor connection */
	cached?: CachedActorState
}

interface UseMessageActorResult extends MessageActorState {
	isConnected: boolean
}

const initialState: MessageActorState = {
	status: "idle",
	data: {},
	text: "",
	isStreaming: false,
	progress: null,
	error: null,
	startedAt: null,
	completedAt: null,
	steps: [],
	currentStepIndex: null,
}

/**
 * Create initial state from cached data
 */
function stateFromCache(cached: CachedActorState): MessageActorState {
	return {
		status: cached.status,
		data: cached.data,
		text: cached.text ?? "",
		isStreaming: false,
		progress: cached.progress ?? (cached.status === "completed" ? 100 : null),
		error: cached.error ?? null,
		startedAt: null,
		completedAt: cached.status === "completed" || cached.status === "failed" ? Date.now() : null,
		steps: cached.steps ? [...cached.steps] : [],
		currentStepIndex: null,
	}
}

export function useMessageActor(
	messageId: MessageId,
	options: UseMessageActorOptions = {},
): UseMessageActorResult {
	const { enabled = false, cached } = options

	// If cached state is completed/failed, use it directly without connecting
	const shouldUseCached = cached && (cached.status === "completed" || cached.status === "failed")

	const [state, setState] = useState<MessageActorState>(() =>
		shouldUseCached ? stateFromCache(cached) : initialState,
	)
	const [isConnected, setIsConnected] = useState(false)
	const connectionRef = useRef<ReturnType<
		ReturnType<typeof rivetClient.message.getOrCreate>["connect"]
	> | null>(null)

	// Sync state from cache when cached prop changes (e.g., after database update with steps)
	useEffect(() => {
		if (shouldUseCached && cached) {
			setState(stateFromCache(cached))
		}
	}, [shouldUseCached, cached])

	useEffect(() => {
		// Skip connection if disabled, no messageId, or using cached completed/failed state
		if (!enabled || !messageId || shouldUseCached) {
			return
		}

		// Reset state when starting a new connection
		setState(initialState)

		let disposed = false
		let conn: ReturnType<ReturnType<typeof rivetClient.message.getOrCreate>["connect"]> | null = null

		// Get token and connect
		getAccessToken().then((token) => {
			if (disposed) return

			// Connect with auth token
			const actor = rivetClient.message.getOrCreate([messageId], {
				params: { token: token ?? "" },
			})
			conn = actor.connect()
			connectionRef.current = conn

			// Helper to safely update state only if not disposed
			const safeSetState = (updater: (prev: MessageActorState) => MessageActorState) => {
				if (!disposed) setState(updater)
			}

			// Connection lifecycle
			conn.onOpen(() => {
				if (disposed) return
				setIsConnected(true)
				// Fetch initial state
				if (conn?.getState) {
					conn.getState().then((state) => {
						if (!disposed && state) setState(state)
					})
				}
			})

			conn.onClose(() => {
				if (disposed) return
				setIsConnected(false)
			})

			conn.onError((err) => {
				if (disposed) return
				console.error("[useMessageActor] Connection error:", err)
				setIsConnected(false)
			})

			// Actor events - using centralized types
			conn.on("started", (payload: MessageActorEvents["started"]) => {
				safeSetState((prev) => ({
					...prev,
					status: "active",
					data: payload.data,
					startedAt: Date.now(),
				}))
			})

			conn.on("dataUpdate", (payload: MessageActorEvents["dataUpdate"]) => {
				safeSetState((prev) => ({ ...prev, data: payload.data }))
			})

			conn.on("progress", (payload: MessageActorEvents["progress"]) => {
				safeSetState((prev) => ({ ...prev, progress: payload.progress }))
			})

			conn.on("textChunk", (payload: MessageActorEvents["textChunk"]) => {
				safeSetState((prev) => ({
					...prev,
					text: payload.fullText,
					isStreaming: true,
				}))
			})

			conn.on("textUpdate", (payload: MessageActorEvents["textUpdate"]) => {
				safeSetState((prev) => ({ ...prev, text: payload.text }))
			})

			conn.on("streamEnd", (payload: MessageActorEvents["streamEnd"]) => {
				safeSetState((prev) => ({
					...prev,
					text: payload.text,
					isStreaming: false,
				}))
			})

			conn.on("completed", (payload: MessageActorEvents["completed"]) => {
				safeSetState((prev) => ({
					...prev,
					status: "completed",
					data: payload.data,
					completedAt: Date.now(),
					isStreaming: false,
					progress: 100,
				}))
			})

			conn.on("failed", (payload: MessageActorEvents["failed"]) => {
				safeSetState((prev) => ({
					...prev,
					status: "failed",
					error: payload.error,
					completedAt: Date.now(),
					isStreaming: false,
				}))
			})

			// Step events
			conn.on("stepAdded", (payload: MessageActorEvents["stepAdded"]) => {
				safeSetState((prev) => ({
					...prev,
					steps: [...prev.steps, payload.step],
					currentStepIndex: payload.index,
				}))
			})

			conn.on("stepStarted", (payload: MessageActorEvents["stepStarted"]) => {
				safeSetState((prev) => ({
					...prev,
					steps: prev.steps.map((s) =>
						s.id === payload.stepId
							? { ...s, status: "active" as const, startedAt: Date.now() }
							: s,
					),
					currentStepIndex: payload.index,
				}))
			})

			conn.on("stepContentUpdate", (payload: MessageActorEvents["stepContentUpdate"]) => {
				safeSetState((prev) => ({
					...prev,
					steps: prev.steps.map((s) =>
						s.id === payload.stepId ? { ...s, content: payload.content } : s,
					),
				}))
			})

			conn.on("stepCompleted", (payload: MessageActorEvents["stepCompleted"]) => {
				safeSetState((prev) => ({
					...prev,
					steps: prev.steps.map((s) => (s.id === payload.stepId ? payload.step : s)),
				}))
			})
		})

		return () => {
			disposed = true
			if (conn) {
				conn.dispose()
			}
			connectionRef.current = null
			setIsConnected(false)
		}
	}, [messageId, enabled, shouldUseCached])

	return { ...state, isConnected }
}

export function useMessageLiveText(
	messageId: MessageId,
	enabled: boolean,
	staticContent: string,
	cached?: CachedActorState,
): string {
	const { text, isConnected, status } = useMessageActor(messageId, { enabled, cached })

	// If we have text from actor (connected) or from cache, use it
	if ((isConnected || status === "completed" || status === "failed") && text) {
		return text
	}
	return staticContent
}

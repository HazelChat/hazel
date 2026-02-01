import { useCallback, useEffect, useRef, useState } from "react"
import type { MessageId } from "@hazel/schema"
import type { AgentStep } from "~/components/chat/agent-steps-view"
import { rivetClient, getAccessToken } from "~/lib/rivet-client"

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

export function useMessageActor(messageId: MessageId, enabled = false): UseMessageActorResult {
	const [state, setState] = useState<MessageActorState>(initialState)
	const [isConnected, setIsConnected] = useState(false)
	const connectionRef = useRef<ReturnType<
		ReturnType<typeof rivetClient.message.getOrCreate>["connect"]
	> | null>(null)

	useEffect(() => {
		if (!enabled || !messageId) {
			return
		}

		let disposed = false
		let conn: ReturnType<ReturnType<typeof rivetClient.message.getOrCreate>["connect"]> | null =
			null

		// Get token and connect
		getAccessToken().then((token) => {
			if (disposed) return

			// Connect with auth token
			const actor = rivetClient.message.getOrCreate([messageId], {
				params: { token: token ?? "" },
			})
			conn = actor.connect()
			connectionRef.current = conn

			// Connection lifecycle
			conn.onOpen(() => {
				setIsConnected(true)
				// Fetch initial state
				conn?.getState().then((s) => {
					if (s) setState(s as MessageActorState)
				})
			})

			conn.onClose(() => {
				setIsConnected(false)
			})

			conn.onError((err) => {
				console.error("[useMessageActor] Connection error:", err)
				setIsConnected(false)
			})

			// Actor events
			conn.on("started", (payload: { data: Record<string, unknown> }) => {
				setState((prev) => ({
					...prev,
					status: "active",
					data: payload.data,
					startedAt: Date.now(),
				}))
			})

			conn.on("dataUpdate", (payload: { data: Record<string, unknown> }) => {
				setState((prev) => ({ ...prev, data: payload.data }))
			})

			conn.on("progress", (payload: { progress: number }) => {
				setState((prev) => ({ ...prev, progress: payload.progress }))
			})

			conn.on("textChunk", (payload: { chunk: string; fullText: string }) => {
				setState((prev) => ({
					...prev,
					text: payload.fullText,
					isStreaming: true,
				}))
			})

			conn.on("textUpdate", (payload: { text: string }) => {
				setState((prev) => ({ ...prev, text: payload.text }))
			})

			conn.on("streamEnd", (payload: { text: string }) => {
				setState((prev) => ({
					...prev,
					text: payload.text,
					isStreaming: false,
				}))
			})

			conn.on("completed", (payload: { data: Record<string, unknown> }) => {
				setState((prev) => ({
					...prev,
					status: "completed",
					data: payload.data,
					completedAt: Date.now(),
					isStreaming: false,
					progress: 100,
				}))
			})

			conn.on("failed", (payload: { error: string }) => {
				setState((prev) => ({
					...prev,
					status: "failed",
					error: payload.error,
					completedAt: Date.now(),
					isStreaming: false,
				}))
			})

			// Step events
			conn.on("stepAdded", (payload: { step: AgentStep; index: number }) => {
				setState((prev) => ({
					...prev,
					steps: [...prev.steps, payload.step],
					currentStepIndex: payload.index,
				}))
			})

			conn.on("stepStarted", (payload: { stepId: string; index: number }) => {
				setState((prev) => ({
					...prev,
					steps: prev.steps.map((s) =>
						s.id === payload.stepId
							? { ...s, status: "active" as const, startedAt: Date.now() }
							: s,
					),
					currentStepIndex: payload.index,
				}))
			})

			conn.on("stepContentUpdate", (payload: { stepId: string; content: string }) => {
				setState((prev) => ({
					...prev,
					steps: prev.steps.map((s) =>
						s.id === payload.stepId ? { ...s, content: payload.content } : s,
					),
				}))
			})

			conn.on("stepCompleted", (payload: { stepId: string; step: AgentStep }) => {
				setState((prev) => ({
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
			setState(initialState)
		}
	}, [messageId, enabled])

	return { ...state, isConnected }
}

export function useMessageLiveText(messageId: MessageId, enabled: boolean, staticContent: string): string {
	const { text, isConnected } = useMessageActor(messageId, enabled)

	if (isConnected && text) {
		return text
	}
	return staticContent
}

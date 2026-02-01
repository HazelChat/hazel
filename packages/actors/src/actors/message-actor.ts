import { actor, UserError } from "rivetkit"
import { validateToken, type AuthenticatedClient, type ActorConnectParams } from "../auth"

/**
 * Represents a step in an AI agent workflow.
 * Used for multi-step AI agent workflows (tool calls, reasoning, etc.)
 */
export interface AgentStep {
	id: string
	type: "thinking" | "tool_call" | "tool_result" | "text" | "error"
	status: "pending" | "active" | "completed" | "failed"

	// For thinking/text steps
	content?: string

	// For tool_call steps
	toolName?: string
	toolInput?: Record<string, unknown>

	// For tool_result steps
	toolOutput?: unknown
	toolError?: string

	// Timestamps
	startedAt?: number
	completedAt?: number
}

/**
 * Generic state that works for any use case:
 * - Webhook deployment messages showing live build progress
 * - AI streaming responses with real-time text updates
 * - Live polling/voting results
 * - Long-running task progress (imports, exports, processing)
 * - Collaborative editing indicators
 * - Any message requiring real-time state updates
 */
export interface MessageActorState {
	// Core status (generic phases work for any workflow)
	status: "idle" | "active" | "completed" | "failed"

	// Generic key-value data store for any use case
	data: Record<string, unknown>

	// Optional streaming text (for AI, logs, etc.)
	text: string
	isStreaming: boolean

	// Optional progress (0-100, for any progress-based flow)
	progress: number | null

	// Error info
	error: string | null

	// Timestamps
	startedAt: number | null
	completedAt: number | null

	// === AI Agent Support ===
	// Steps for multi-step AI agent workflows (tool calls, reasoning, etc.)
	steps: AgentStep[]
	currentStepIndex: number | null
}

/**
 * Message Actor for live updates on messages.
 *
 * Use cases:
 * - Webhook deployment messages showing live build progress
 * - AI streaming responses with real-time text updates
 * - Live polling/voting results
 * - Long-running task progress (imports, exports, processing)
 * - Collaborative editing indicators
 * - Any message requiring real-time state updates
 *
 * @example
 * ```typescript
 * const actor = client.message.getOrCreate([messageId])
 * await actor.start({ service: "api", environment: "production" })
 * await actor.setProgress(50)
 * await actor.complete({ deploymentUrl: "https://..." })
 * ```
 */
export const messageActor = actor({
	// Dynamic initial state - accepts optional initialData
	createState: (_c, input?: { initialData?: Record<string, unknown> }): MessageActorState => ({
		status: "idle",
		data: input?.initialData ?? {},
		text: "",
		isStreaming: false,
		progress: null,
		error: null,
		startedAt: null,
		completedAt: null,
		steps: [],
		currentStepIndex: null,
	}),

	/**
	 * Validate authentication on connection.
	 * All connections require a valid token (JWT or bot token).
	 * Returns the authenticated client identity stored in c.conn.state.
	 */
	createConnState: async (_c, params: ActorConnectParams): Promise<AuthenticatedClient> => {
		if (!params?.token) {
			console.error("[messageActor] Connection rejected: no token provided")
			throw new UserError("Authentication required", { code: "unauthorized" })
		}
		try {
			return await validateToken(params.token)
		} catch (error) {
			console.error("[messageActor] Token validation failed:", error)
			throw error
		}
	},

	actions: {
		// Read full state
		getState: (c) => c.state,

		// Start the live state (marks as active)
		start: (c, initialData?: Record<string, unknown>) => {
			c.state.status = "active"
			c.state.startedAt = Date.now()
			if (initialData) c.state.data = { ...c.state.data, ...initialData }
			c.broadcast("started", { data: c.state.data })
		},

		// Update arbitrary data fields
		setData: (c, data: Record<string, unknown>) => {
			c.state.data = { ...c.state.data, ...data }
			c.broadcast("dataUpdate", { data: c.state.data })
		},

		// Update progress (0-100)
		setProgress: (c, progress: number) => {
			c.state.progress = Math.min(100, Math.max(0, progress))
			c.broadcast("progress", { progress: c.state.progress })
		},

		// Append streaming text
		appendText: (c, text: string) => {
			c.state.text += text
			c.state.isStreaming = true
			c.broadcast("textChunk", { chunk: text, fullText: c.state.text })
		},

		// Replace all text (for edits/corrections)
		setText: (c, text: string) => {
			c.state.text = text
			c.broadcast("textUpdate", { text })
		},

		// Stop streaming
		stopStreaming: (c) => {
			c.state.isStreaming = false
			c.broadcast("streamEnd", { text: c.state.text })
		},

		// Mark as completed
		complete: (c, finalData?: Record<string, unknown>) => {
			c.state.status = "completed"
			c.state.completedAt = Date.now()
			c.state.progress = 100
			c.state.isStreaming = false
			if (finalData) c.state.data = { ...c.state.data, ...finalData }
			c.broadcast("completed", { data: c.state.data })
		},

		// Mark as failed
		fail: (c, error: string) => {
			c.state.status = "failed"
			c.state.error = error
			c.state.completedAt = Date.now()
			c.state.isStreaming = false

			// Mark any active steps as failed
			for (const step of c.state.steps) {
				if (step.status === "active") {
					step.status = "failed"
					step.completedAt = Date.now()
				}
			}

			c.broadcast("failed", { error })
		},

		// === AI Agent Step Actions ===

		// Add a new step (returns step id)
		addStep: (c, step: Omit<AgentStep, "id" | "status">) => {
			const id = crypto.randomUUID()
			const newStep: AgentStep = {
				...step,
				id,
				status: "pending",
			}
			c.state.steps.push(newStep)
			c.broadcast("stepAdded", { step: newStep, index: c.state.steps.length - 1 })
			return id
		},

		// Start a step (marks it as active)
		startStep: (c, stepId: string) => {
			const index = c.state.steps.findIndex((s) => s.id === stepId)
			if (index === -1) return
			const step = c.state.steps[index]
			if (!step) return
			step.status = "active"
			step.startedAt = Date.now()
			c.state.currentStepIndex = index
			c.broadcast("stepStarted", { stepId, index })
		},

		// Update step content (for streaming thinking/text)
		updateStepContent: (c, stepId: string, content: string, append = false) => {
			const step = c.state.steps.find((s) => s.id === stepId)
			if (!step) return
			step.content = append ? (step.content ?? "") + content : content
			c.broadcast("stepContentUpdate", { stepId, content: step.content, append })
		},

		// Complete a step
		completeStep: (c, stepId: string, result?: { output?: unknown; error?: string }) => {
			const step = c.state.steps.find((s) => s.id === stepId)
			if (!step) return
			step.status = result?.error ? "failed" : "completed"
			step.completedAt = Date.now()
			if (result?.output !== undefined) step.toolOutput = result.output
			if (result?.error) step.toolError = result.error
			c.broadcast("stepCompleted", { stepId, step })
		},

		// Convenience: Add and start a thinking step
		startThinking: (c) => {
			const id = crypto.randomUUID()
			const step: AgentStep = {
				id,
				type: "thinking",
				status: "active",
				content: "",
				startedAt: Date.now(),
			}
			c.state.steps.push(step)
			c.state.currentStepIndex = c.state.steps.length - 1
			c.broadcast("stepAdded", { step, index: c.state.steps.length - 1 })
			return id
		},

		// Convenience: Add a tool call step
		startToolCall: (c, toolName: string, toolInput: Record<string, unknown>) => {
			const id = crypto.randomUUID()
			const step: AgentStep = {
				id,
				type: "tool_call",
				status: "active",
				toolName,
				toolInput,
				startedAt: Date.now(),
			}
			c.state.steps.push(step)
			c.state.currentStepIndex = c.state.steps.length - 1
			c.broadcast("stepAdded", { step, index: c.state.steps.length - 1 })
			return id
		},
	},
})

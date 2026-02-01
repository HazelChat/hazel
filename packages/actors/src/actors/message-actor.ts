import { FetchHttpClient } from "@effect/platform"
import { actor, UserError } from "rivetkit"
import { Action, CreateConnState, Log } from "@rivetkit/effect"
import { Effect } from "effect"
import { TokenValidationService, TokenValidationLive, type ActorConnectParams } from "../auth"

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
	createConnState: CreateConnState.effect(function* (_c, params: ActorConnectParams) {
		if (!params?.token) {
			yield* Log.error("Connection rejected: no token provided")
			return yield* Effect.fail(new UserError("Authentication required", { code: "unauthorized" }))
		}

		return yield* Effect.gen(function* () {
			const service = yield* TokenValidationService
			return yield* service.validateToken(params.token)
		}).pipe(
			Effect.provide(TokenValidationLive),
			Effect.provide(FetchHttpClient.layer),
			Effect.scoped,
			Effect.catchTags({
				InvalidTokenFormatError: (e) =>
					Effect.fail(new UserError(e.message, { code: "invalid_token" })),
				JwtValidationError: (e) => Effect.fail(new UserError(e.message, { code: "invalid_token" })),
				BotTokenValidationError: (e) =>
					Effect.fail(new UserError(e.message, { code: "invalid_token" })),
				ConfigError: (e) => Effect.fail(new UserError(e.message, { code: "server_error" })),
			}),
			Effect.tapError((error) => Log.error("Token validation failed", { error: error.message })),
		)
	}),

	actions: {
		// Read full state
		getState: Action.effect(function* (c) {
			return yield* Action.state(c)
		}),

		// Start the live state (marks as active)
		start: Action.effect(function* (c, initialData?: Record<string, unknown>) {
			let broadcastData: Record<string, unknown> = {}
			yield* Action.updateState(c, (s) => {
				s.status = "active"
				s.startedAt = Date.now()
				if (initialData) s.data = { ...s.data, ...initialData }
				broadcastData = s.data
			})
			yield* Action.broadcast(c, "started", { data: broadcastData })
		}),

		// Update arbitrary data fields
		setData: Action.effect(function* (c, data: Record<string, unknown>) {
			let broadcastData: Record<string, unknown> = {}
			yield* Action.updateState(c, (s) => {
				s.data = { ...s.data, ...data }
				broadcastData = s.data
			})
			yield* Action.broadcast(c, "dataUpdate", { data: broadcastData })
		}),

		// Update progress (0-100)
		setProgress: Action.effect(function* (c, progress: number) {
			const clampedProgress = Math.min(100, Math.max(0, progress))
			yield* Action.updateState(c, (s) => {
				s.progress = clampedProgress
			})
			yield* Action.broadcast(c, "progress", { progress: clampedProgress })
		}),

		// Append streaming text
		appendText: Action.effect(function* (c, text: string) {
			let fullText = ""
			yield* Action.updateState(c, (s) => {
				s.text += text
				s.isStreaming = true
				fullText = s.text
			})
			yield* Action.broadcast(c, "textChunk", { chunk: text, fullText })
		}),

		// Replace all text (for edits/corrections)
		setText: Action.effect(function* (c, text: string) {
			yield* Action.updateState(c, (s) => {
				s.text = text
			})
			yield* Action.broadcast(c, "textUpdate", { text })
		}),

		// Stop streaming
		stopStreaming: Action.effect(function* (c) {
			let finalText = ""
			yield* Action.updateState(c, (s) => {
				s.isStreaming = false
				finalText = s.text
			})
			yield* Action.broadcast(c, "streamEnd", { text: finalText })
		}),

		// Mark as completed
		complete: Action.effect(function* (c, finalData?: Record<string, unknown>) {
			let broadcastData: Record<string, unknown> = {}
			yield* Action.updateState(c, (s) => {
				s.status = "completed"
				s.completedAt = Date.now()
				s.progress = 100
				s.isStreaming = false
				if (finalData) s.data = { ...s.data, ...finalData }
				broadcastData = s.data
			})
			yield* Action.broadcast(c, "completed", { data: broadcastData })
		}),

		// Mark as failed
		fail: Action.effect(function* (c, error: string) {
			yield* Action.updateState(c, (s) => {
				s.status = "failed"
				s.error = error
				s.completedAt = Date.now()
				s.isStreaming = false

				// Mark any active steps as failed
				for (const step of s.steps) {
					if (step.status === "active") {
						step.status = "failed"
						step.completedAt = Date.now()
					}
				}
			})
			yield* Action.broadcast(c, "failed", { error })
		}),

		// === AI Agent Step Actions ===

		// Add a new step (returns step id)
		addStep: Action.effect(function* (c, step: Omit<AgentStep, "id" | "status">) {
			const id = crypto.randomUUID()
			const newStep: AgentStep = {
				...step,
				id,
				status: "pending",
			}
			let index = 0
			yield* Action.updateState(c, (s) => {
				s.steps.push(newStep)
				index = s.steps.length - 1
			})
			yield* Action.broadcast(c, "stepAdded", { step: newStep, index })
			return id
		}),

		// Start a step (marks it as active)
		startStep: Action.effect(function* (c, stepId: string) {
			let found = false
			let capturedIndex = -1
			yield* Action.updateState(c, (s) => {
				const idx = s.steps.findIndex((step) => step.id === stepId)
				if (idx !== -1) {
					const step = s.steps[idx]
					if (step) {
						found = true
						capturedIndex = idx
						step.status = "active"
						step.startedAt = Date.now()
						s.currentStepIndex = idx
					}
				}
			})
			if (found) {
				yield* Action.broadcast(c, "stepStarted", { stepId, index: capturedIndex })
			}
		}),

		// Update step content (for streaming thinking/text)
		updateStepContent: Action.effect(function* (c, stepId: string, content: string, append = false) {
			let found = false
			let newContent = ""
			yield* Action.updateState(c, (s) => {
				const step = s.steps.find((step) => step.id === stepId)
				if (step) {
					found = true
					step.content = append ? (step.content ?? "") + content : content
					newContent = step.content
				}
			})
			if (found) {
				yield* Action.broadcast(c, "stepContentUpdate", { stepId, content: newContent, append })
			}
		}),

		// Complete a step
		completeStep: Action.effect(function* (
			c,
			stepId: string,
			result?: { output?: unknown; error?: string },
		) {
			let completedStep: AgentStep | undefined
			yield* Action.updateState(c, (s) => {
				const step = s.steps.find((step) => step.id === stepId)
				if (step) {
					step.status = result?.error ? "failed" : "completed"
					step.completedAt = Date.now()
					if (result?.output !== undefined) step.toolOutput = result.output
					if (result?.error) step.toolError = result.error
					completedStep = { ...step }
				}
			})
			if (completedStep) {
				yield* Action.broadcast(c, "stepCompleted", { stepId, step: completedStep })
			}
		}),

		// Convenience: Add and start a thinking step
		startThinking: Action.effect(function* (c) {
			const id = crypto.randomUUID()
			const step: AgentStep = {
				id,
				type: "thinking",
				status: "active",
				content: "",
				startedAt: Date.now(),
			}
			let index = 0
			yield* Action.updateState(c, (s) => {
				s.steps.push(step)
				index = s.steps.length - 1
				s.currentStepIndex = index
			})
			yield* Action.broadcast(c, "stepAdded", { step, index })
			return id
		}),

		// Convenience: Add a tool call step
		startToolCall: Action.effect(function* (c, toolName: string, toolInput: Record<string, unknown>) {
			const id = crypto.randomUUID()
			const step: AgentStep = {
				id,
				type: "tool_call",
				status: "active",
				toolName,
				toolInput,
				startedAt: Date.now(),
			}
			let index = 0
			yield* Action.updateState(c, (s) => {
				s.steps.push(step)
				index = s.steps.length - 1
				s.currentStepIndex = index
			})
			yield* Action.broadcast(c, "stepAdded", { step, index })
			return id
		}),
	},
})

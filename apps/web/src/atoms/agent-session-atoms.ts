/**
 * @module Agent Session Atoms
 * @description Atoms for managing agent sessions within sandboxes
 */

import { Atom } from "@effect-atom/atom-react"
import type { AgentSessionId, SandboxId } from "@hazel/schema"
import type { AgentSession } from "@hazel/domain/models"
import type { Schema } from "effect"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Type for session data returned from RPC.
 */
export type AgentSessionData = Schema.Schema.Type<typeof AgentSession.Model.json>

/**
 * Query atom factory for listing all sessions for a sandbox.
 */
export const listSessionsQuery = (sandboxId: SandboxId, status?: AgentSession.AgentSessionStatus) =>
	HazelRpcClient.query("sandbox.listSessions", { sandboxId, status })

/**
 * Query atom factory for getting a specific session by ID.
 */
export const getSessionQuery = (id: AgentSessionId) => HazelRpcClient.query("sandbox.getSession", { id })

/**
 * Mutation atom for creating a new agent session.
 */
export const createSessionMutation = HazelRpcClient.mutation("sandbox.createSession")

/**
 * Mutation atom for sending a message to a session.
 */
export const sendMessageMutation = HazelRpcClient.mutation("sandbox.sendMessage")

/**
 * Mutation atom for responding to a HITL permission request.
 */
export const respondToPermissionMutation = HazelRpcClient.mutation("sandbox.respondToPermission")

/**
 * Mutation atom for responding to a HITL question request.
 */
export const respondToQuestionMutation = HazelRpcClient.mutation("sandbox.respondToQuestion")

/**
 * Mutation atom for ending a session.
 */
export const endSessionMutation = HazelRpcClient.mutation("sandbox.endSession")

/**
 * Agent type display info
 */
export const AGENT_TYPE_INFO = {
	claude: {
		name: "Claude",
		description: "Anthropic's Claude Code agent",
		provider: "anthropic" as const,
	},
	codex: {
		name: "Codex",
		description: "OpenAI's Codex agent",
		provider: "openai" as const,
	},
	opencode: {
		name: "OpenCode",
		description: "Open-source coding agent",
		provider: "openai" as const,
	},
} as const

/**
 * Session status display info
 */
export const SESSION_STATUS_INFO = {
	creating: { label: "Creating", color: "yellow" },
	active: { label: "Active", color: "green" },
	waiting_input: { label: "Waiting for input", color: "blue" },
	completed: { label: "Completed", color: "gray" },
	failed: { label: "Failed", color: "red" },
	cancelled: { label: "Cancelled", color: "gray" },
} as const

// ============================================================================
// Session Event Types (for SSE stream)
// ============================================================================

export type AgentEventType =
	| "text" // Text output from agent
	| "tool_call" // Agent is calling a tool
	| "tool_result" // Result from a tool call
	| "file_ref" // Reference to a file
	| "permission_request" // HITL permission request
	| "question" // HITL question
	| "error" // Error from agent
	| "session_end" // Session ended

export interface AgentEvent {
	id: string
	type: AgentEventType
	timestamp: Date
	data: unknown
}

export interface TextEvent extends AgentEvent {
	type: "text"
	data: { content: string }
}

export interface ToolCallEvent extends AgentEvent {
	type: "tool_call"
	data: { toolName: string; args: Record<string, unknown> }
}

export interface ToolResultEvent extends AgentEvent {
	type: "tool_result"
	data: { toolName: string; result: unknown }
}

export interface FileRefEvent extends AgentEvent {
	type: "file_ref"
	data: { path: string; language?: string }
}

export interface PermissionRequestEvent extends AgentEvent {
	type: "permission_request"
	data: { permissionId: string; description: string; command?: string }
}

export interface QuestionEvent extends AgentEvent {
	type: "question"
	data: { questionId: string; question: string; options?: string[] }
}

export interface ErrorEvent extends AgentEvent {
	type: "error"
	data: { message: string; code?: string }
}

export interface SessionEndEvent extends AgentEvent {
	type: "session_end"
	data: { reason: "completed" | "failed" | "cancelled" }
}

// ============================================================================
// Session State Atoms
// ============================================================================

/**
 * Active session ID atom - tracks which session is currently active
 */
export const activeSessionIdAtom = Atom.make<AgentSessionId | null>(null)

/**
 * Session events atom family - stores events for each session
 */
export const sessionEventsAtomFamily = Atom.family((sessionId: AgentSessionId) => Atom.make<AgentEvent[]>([]))

/**
 * Pending HITL requests atom family - stores pending permission/question requests
 */
export interface PendingHitlRequest {
	type: "permission" | "question"
	id: string
	description: string
	command?: string // For permission requests
	options?: string[] // For questions
	timestamp: Date
}

export const pendingHitlRequestsAtomFamily = Atom.family((sessionId: AgentSessionId) =>
	Atom.make<PendingHitlRequest[]>([]),
)

/**
 * Session connection status atom family
 */
export type SessionConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export const sessionConnectionStatusAtomFamily = Atom.family((sessionId: AgentSessionId) =>
	Atom.make<SessionConnectionStatus>("disconnected"),
)

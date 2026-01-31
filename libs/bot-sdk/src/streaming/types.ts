/**
 * Streaming types for AI and real-time message updates
 */

import type { ChannelId, MessageId } from "@hazel/domain/ids"
import type { Effect } from "effect"
import type { StreamError } from "./errors.ts"

/**
 * Options for creating a new stream session
 */
export interface CreateStreamOptions {
	/** Initial data to store in the actor state */
	readonly initialData?: Record<string, unknown>
	/** Reply to a specific message */
	readonly replyToMessageId?: MessageId | null
	/** Send message in a thread */
	readonly threadChannelId?: ChannelId | null
}

/**
 * A low-level stream session for managing real-time message updates.
 * Provides direct access to actor methods with Effect wrappers.
 */
export interface StreamSession {
	/** The ID of the message being streamed */
	readonly messageId: MessageId

	/** Append text to the current stream */
	appendText(text: string): Effect.Effect<void, StreamError>

	/** Replace all text in the stream */
	setText(text: string): Effect.Effect<void, StreamError>

	/** Set progress (0-100) */
	setProgress(progress: number): Effect.Effect<void, StreamError>

	/** Update arbitrary data fields */
	setData(data: Record<string, unknown>): Effect.Effect<void, StreamError>

	/** Start a thinking step (returns step ID) */
	startThinking(): Effect.Effect<string, StreamError>

	/** Start a tool call step (returns step ID) */
	startToolCall(name: string, input: Record<string, unknown>): Effect.Effect<string, StreamError>

	/** Update step content (for streaming thinking/text) */
	updateStepContent(stepId: string, content: string, append?: boolean): Effect.Effect<void, StreamError>

	/** Complete a step with optional result */
	completeStep(stepId: string, result?: { output?: unknown; error?: string }): Effect.Effect<void, StreamError>

	/** Mark the stream as completed */
	complete(finalData?: Record<string, unknown>): Effect.Effect<void, StreamError>

	/** Mark the stream as failed */
	fail(error: string): Effect.Effect<void, StreamError>
}

/**
 * Options for creating an AI stream session
 */
export interface AIStreamOptions extends CreateStreamOptions {
	/** Model identifier (for display purposes) */
	readonly model?: string
	/** Whether to show thinking steps in the UI */
	readonly showThinking?: boolean
	/** Whether to show tool calls in the UI */
	readonly showToolCalls?: boolean
}

/**
 * AI content chunk types for processing streaming AI responses
 */
export type AIContentChunk =
	| { readonly type: "text"; readonly text: string }
	| { readonly type: "thinking"; readonly text: string; readonly isComplete?: boolean }
	| {
			readonly type: "tool_call"
			readonly id: string
			readonly name: string
			readonly input: Record<string, unknown>
	  }
	| { readonly type: "tool_result"; readonly toolCallId: string; readonly output: unknown; readonly error?: string }

/**
 * An AI stream session extends StreamSession with AI-specific helpers
 * for processing chunks from AI model responses.
 */
export interface AIStreamSession extends StreamSession {
	/** Process a single AI content chunk */
	processChunk(chunk: AIContentChunk): Effect.Effect<void, StreamError>

	/** Process an async iterable of AI content chunks */
	processStream(chunks: AsyncIterable<AIContentChunk>): Effect.Effect<void, StreamError>
}

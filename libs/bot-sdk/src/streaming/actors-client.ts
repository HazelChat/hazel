/**
 * ActorsClient Service
 *
 * Provides an Effect-based wrapper around the RivetKit actors client
 * for interacting with message actors with bot authentication.
 *
 * Uses Effect.Service pattern for proper dependency injection and testability.
 */

import { createActorsClient, type ActorsClient as RivetActorsClient } from "@hazel/actors/client"
import type { MessageActorState } from "@hazel/actors"
import { Effect } from "effect"

/**
 * Raw message actor type from RivetKit client.
 * Note: When using @rivetkit/effect's Action.effect wrapper, the client types
 * may double-wrap return values in Promise. Use MessageActor for the corrected type.
 */
type RawMessageActor = ReturnType<RivetActorsClient["message"]["getOrCreate"]>

/**
 * Type for the message actor instance with corrected method signatures.
 *
 * The @rivetkit/effect package's Action.effect wrapper makes actions return Promise<T>,
 * but the rivetkit client type system also wraps action returns in Promise, resulting
 * in Promise<Promise<T>>. This interface provides the correct types where methods
 * return Promise<T> directly.
 */
export interface MessageActor extends Omit<RawMessageActor, keyof MessageActorActions> {
	// Actions that return string (step IDs)
	startThinking: () => Promise<string>
	startToolCall: (name: string, input: Record<string, unknown>) => Promise<string>
	addStep: (step: {
		type: "thinking" | "tool_call" | "tool_result" | "text" | "error"
		content?: string
		toolName?: string
		toolInput?: Record<string, unknown>
		toolOutput?: unknown
		toolError?: string
		startedAt?: number
		completedAt?: number
	}) => Promise<string>

	// Actions that return void
	appendText: (text: string) => Promise<void>
	setText: (text: string) => Promise<void>
	setProgress: (progress: number) => Promise<void>
	setData: (data: Record<string, unknown>) => Promise<void>
	start: (initialData?: Record<string, unknown>) => Promise<void>
	complete: (finalData?: Record<string, unknown>) => Promise<void>
	fail: (error: string) => Promise<void>
	stopStreaming: () => Promise<void>
	startStep: (stepId: string) => Promise<void>
	updateStepContent: (stepId: string, content: string, append?: boolean) => Promise<void>
	completeStep: (stepId: string, result?: { output?: unknown; error?: string }) => Promise<void>

	// Actions that return state
	getState: () => Promise<MessageActorState>
}

// Helper type for the overridden actions
type MessageActorActions = {
	startThinking: unknown
	startToolCall: unknown
	addStep: unknown
	appendText: unknown
	setText: unknown
	setProgress: unknown
	setData: unknown
	start: unknown
	complete: unknown
	fail: unknown
	stopStreaming: unknown
	startStep: unknown
	updateStepContent: unknown
	completeStep: unknown
	getState: unknown
}

/**
 * ActorsClient service interface
 */
export interface ActorsClientService {
	/**
	 * Get or create a message actor for the given message ID.
	 * Automatically authenticates with the bot token.
	 * @param messageId - The message ID to get the actor for
	 * @returns Effect that yields the message actor
	 */
	readonly getMessageActor: (messageId: string) => Effect.Effect<MessageActor>

	/**
	 * The underlying RivetKit client (for advanced use cases)
	 */
	readonly client: RivetActorsClient

	/**
	 * The bot token used for authentication
	 */
	readonly botToken: string
}

/**
 * Configuration for ActorsClient
 */
export interface ActorsClientConfig {
	/** The actors endpoint URL (defaults to http://localhost:6420) */
	readonly endpoint?: string
	/** The bot token for authentication (hzl_bot_xxxxx) */
	readonly botToken: string
}

/**
 * ActorsClient Effect.Service for managing actor connections.
 * Wraps the RivetKit client with Effect patterns and bot authentication.
 *
 * Uses Effect.Service pattern with:
 * - Effect.fn for automatic tracing
 * - Config parameter for programmatic configuration
 * - Proper accessors for convenient usage
 *
 * @example
 * ```typescript
 * // Create layer with config
 * const layer = ActorsClient.Default({
 *   botToken: "hzl_bot_xxx",
 *   endpoint: "http://localhost:6420"
 * })
 *
 * // Use in effect
 * const program = Effect.gen(function* () {
 *   const actor = yield* ActorsClient.getMessageActor("msg-123")
 *   // ... use actor
 * }).pipe(Effect.provide(layer))
 * ```
 */
export class ActorsClient extends Effect.Service<ActorsClient>()("@hazel/bot-sdk/ActorsClient", {
	accessors: true,
	effect: Effect.fn("ActorsClient.create")(function* (config: ActorsClientConfig) {
		const endpoint = config.endpoint ?? "http://localhost:6420"
		const client = createActorsClient(endpoint)

		yield* Effect.annotateCurrentSpan("endpoint", endpoint)

		// Use Effect.fn for automatic tracing of actor operations
		const getMessageActor = Effect.fn("ActorsClient.getMessageActor")(function* (messageId: string) {
			yield* Effect.annotateCurrentSpan("messageId", messageId)
			return client.message.getOrCreate([messageId], {
				params: { token: config.botToken },
			})
		})

		return {
			getMessageActor,
			client,
			botToken: config.botToken,
		}
	}),
}) {}

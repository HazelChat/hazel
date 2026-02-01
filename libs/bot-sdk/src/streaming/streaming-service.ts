/**
 * Streaming Service
 *
 * Core functions for creating and managing streaming sessions.
 * Provides both low-level StreamSession and high-level AIStreamSession.
 *
 * Following Effect best practices:
 * - Effect.fn for automatic tracing
 * - Stream.fromAsyncIterable instead of Effect.runPromise inside Effect
 * - Specific error types for each failure mode
 */

import type { ChannelId, MessageId } from "@hazel/domain/ids"
import { Effect, Ref, Stream } from "effect"
import type { ActorsClientService, MessageActor } from "./actors-client.ts"
import { ActorOperationError, MessageCreateError, StreamProcessingError } from "./errors.ts"
import type {
	AIContentChunk,
	AIStreamOptions,
	AIStreamSession,
	CreateStreamOptions,
	StreamSession,
} from "./types.ts"

/**
 * Message creation function type - matches bot.message.send signature
 */
export type MessageCreateFn = (
	channelId: ChannelId,
	content: string,
	options?: {
		readonly replyToMessageId?: MessageId | null
		readonly threadChannelId?: ChannelId | null
		readonly embeds?: readonly { readonly liveState?: { readonly enabled: true } }[] | null
	},
) => Effect.Effect<{ id: string }, unknown>

/**
 * Wrap an actor method call with Effect, error handling, and tracing.
 * Uses Effect.fn for automatic span creation.
 */
const wrapActorCall = Effect.fn("StreamSession.actorCall")(function* <T>(
	operation: string,
	fn: () => Promise<T>,
) {
	yield* Effect.annotateCurrentSpan("operation", operation)
	return yield* Effect.tryPromise({
		try: fn,
		catch: (error) =>
			new ActorOperationError({
				operation,
				message: `Actor operation failed: ${operation}`,
				cause: error,
			}),
	})
})

/**
 * Create a StreamSession object from a message actor
 */
const createSessionFromActor = (messageId: MessageId, actor: MessageActor): StreamSession => ({
	messageId,

	appendText: (text: string) => wrapActorCall("appendText", () => actor.appendText(text)),

	setText: (text: string) => wrapActorCall("setText", () => actor.setText(text)),

	setProgress: (progress: number) => wrapActorCall("setProgress", () => actor.setProgress(progress)),

	setData: (data: Record<string, unknown>) => wrapActorCall("setData", () => actor.setData(data)),

	startThinking: () => wrapActorCall("startThinking", () => actor.startThinking()),

	startToolCall: (name: string, input: Record<string, unknown>) =>
		wrapActorCall("startToolCall", () => actor.startToolCall(name, input)),

	updateStepContent: (stepId: string, content: string, append = false) =>
		wrapActorCall("updateStepContent", () => actor.updateStepContent(stepId, content, append)),

	completeStep: (stepId: string, result?: { output?: unknown; error?: string }) =>
		wrapActorCall("completeStep", () => actor.completeStep(stepId, result)),

	complete: (finalData?: Record<string, unknown>) =>
		wrapActorCall("complete", () => actor.complete(finalData)).pipe(
			Effect.andThen(wrapActorCall("stopStreaming", () => actor.stopStreaming())),
		),

	fail: (error: string) => wrapActorCall("fail", () => actor.fail(error)),
})

/**
 * Internal function to create a stream session with injected dependencies.
 * This avoids circular dependencies with HazelBotClient.
 *
 * Uses Effect.fn for tracing the session creation process.
 */
export const createStreamSessionInternal = Effect.fn("StreamSession.create")(function* (
	createMessage: MessageCreateFn,
	actorsClient: ActorsClientService,
	channelId: ChannelId,
	options: CreateStreamOptions = {},
) {
	yield* Effect.annotateCurrentSpan("channelId", channelId)

	// Create message with live state enabled
	const message = yield* createMessage(channelId, "", {
		replyToMessageId: options.replyToMessageId,
		threadChannelId: options.threadChannelId,
		embeds: [{ liveState: { enabled: true } }],
	}).pipe(
		Effect.mapError(
			(e) =>
				new MessageCreateError({
					channelId,
					message: "Failed to create message with live state",
					cause: e,
				}),
		),
	)

	yield* Effect.annotateCurrentSpan("messageId", message.id)

	// Get the actor for this message
	const actor = yield* actorsClient.getMessageActor(message.id)

	// Start the actor with initial data
	yield* wrapActorCall("start", () => actor.start(options.initialData ?? {}))

	// Return the session interface
	return createSessionFromActor(message.id as MessageId, actor)
})

/**
 * Internal function to create an AI stream session with injected dependencies.
 *
 * Uses Effect.fn for tracing and Stream.fromAsyncIterable for proper
 * Effect composition (no Effect.runPromise inside Effect).
 */
export const createAIStreamSessionInternal = Effect.fn("AIStreamSession.create")(function* (
	createMessage: MessageCreateFn,
	actorsClient: ActorsClientService,
	channelId: ChannelId,
	options: AIStreamOptions = {},
) {
	// Add model to initial data if provided
	const initialData = {
		...options.initialData,
		...(options.model ? { model: options.model } : {}),
		...(options.showThinking !== undefined ? { showThinking: options.showThinking } : {}),
		...(options.showToolCalls !== undefined ? { showToolCalls: options.showToolCalls } : {}),
	}

	// Create base session with enriched initial data
	const baseSession = yield* createStreamSessionInternal(createMessage, actorsClient, channelId, {
		...options,
		initialData,
	})

	// Track active thinking/tool steps by their chunk IDs
	const activeStepsRef = yield* Ref.make<Map<string, string>>(new Map())

	/**
	 * Process a single AI content chunk.
	 * Uses Effect.fn for tracing each chunk type.
	 */
	const processChunk = Effect.fn("AIStreamSession.processChunk")(function* (chunk: AIContentChunk) {
		yield* Effect.annotateCurrentSpan("chunkType", chunk.type)
		const activeSteps = yield* Ref.get(activeStepsRef)

		switch (chunk.type) {
			case "text": {
				yield* baseSession.appendText(chunk.text)
				break
			}

			case "thinking": {
				if (options.showThinking === false) {
					// Skip thinking steps if disabled
					break
				}

				// Check if we have an active thinking step
				const existingStepId = activeSteps.get("thinking")

				if (existingStepId) {
					// Append to existing thinking step
					yield* baseSession.updateStepContent(existingStepId, chunk.text, true)

					// If complete, finish the step
					if (chunk.isComplete) {
						yield* baseSession.completeStep(existingStepId)
						yield* Ref.update(activeStepsRef, (map) => {
							const newMap = new Map(map)
							newMap.delete("thinking")
							return newMap
						})
					}
				} else {
					// Start a new thinking step
					const stepId = yield* baseSession.startThinking()
					yield* baseSession.updateStepContent(stepId, chunk.text, true)
					yield* Ref.update(activeStepsRef, (map) => {
						const newMap = new Map(map)
						newMap.set("thinking", stepId)
						return newMap
					})

					// If already complete, finish immediately
					if (chunk.isComplete) {
						yield* baseSession.completeStep(stepId)
						yield* Ref.update(activeStepsRef, (map) => {
							const newMap = new Map(map)
							newMap.delete("thinking")
							return newMap
						})
					}
				}
				break
			}

			case "tool_call": {
				if (options.showToolCalls === false) {
					// Skip tool calls if disabled
					break
				}

				// Start a new tool call step
				const stepId = yield* baseSession.startToolCall(chunk.name, chunk.input)
				// Store mapping from tool call ID to step ID
				yield* Ref.update(activeStepsRef, (map) => {
					const newMap = new Map(map)
					newMap.set(`tool:${chunk.id}`, stepId)
					return newMap
				})
				break
			}

			case "tool_result": {
				if (options.showToolCalls === false) {
					break
				}

				// Find the corresponding step
				const stepId = activeSteps.get(`tool:${chunk.toolCallId}`)
				if (stepId) {
					yield* baseSession.completeStep(stepId, {
						output: chunk.output,
						error: chunk.error,
					})
					yield* Ref.update(activeStepsRef, (map) => {
						const newMap = new Map(map)
						newMap.delete(`tool:${chunk.toolCallId}`)
						return newMap
					})
				}
				break
			}
		}
	})

	/**
	 * Process an async iterable of AI content chunks.
	 *
	 * Uses Stream.fromAsyncIterable for proper Effect composition
	 * instead of the anti-pattern of calling Effect.runPromise inside Effect.
	 */
	const processStream = (
		chunks: AsyncIterable<AIContentChunk>,
	): Effect.Effect<void, ActorOperationError | StreamProcessingError> =>
		Effect.gen(function* () {
			// Convert AsyncIterable to Effect Stream - proper Effect composition
			const stream = Stream.fromAsyncIterable(chunks, (error) =>
				new StreamProcessingError({
					message: "Failed to read from async iterable",
					cause: error,
				}),
			)

			// Process each chunk as an Effect using Stream.runForEach
			yield* Stream.runForEach(stream, (chunk) => processChunk(chunk))
		}).pipe(Effect.withSpan("AIStreamSession.processStream"))

	return {
		...baseSession,
		processChunk,
		processStream,
	}
})

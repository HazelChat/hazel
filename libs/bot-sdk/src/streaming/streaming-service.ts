/**
 * Streaming Service
 *
 * Core functions for creating and managing streaming sessions.
 * Provides both low-level StreamSession and high-level AIStreamSession.
 */

import type { ChannelId, MessageId } from "@hazel/domain/ids"
import { Effect, Ref } from "effect"
import type { ActorsClientService, MessageActor } from "./actors-client.ts"
import { StreamError } from "./errors.ts"
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
 * Wrap an actor method call with Effect and error handling
 */
const wrapActorCall = <T>(operation: string, fn: () => Promise<T>): Effect.Effect<T, StreamError> =>
	Effect.tryPromise({
		try: fn,
		catch: (error) =>
			new StreamError({
				message: `Actor operation failed: ${operation}`,
				operation,
				cause: error,
			}),
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
 */
export const createStreamSessionInternal = (
	createMessage: MessageCreateFn,
	actorsClient: ActorsClientService,
	channelId: ChannelId,
	options: CreateStreamOptions = {},
): Effect.Effect<StreamSession, StreamError> =>
	Effect.gen(function* () {
		// Create message with live state enabled
		const message = yield* createMessage(channelId, "", {
			replyToMessageId: options.replyToMessageId,
			threadChannelId: options.threadChannelId,
			embeds: [{ liveState: { enabled: true } }],
		}).pipe(
			Effect.mapError(
				(e) =>
					new StreamError({
						message: "Failed to create message with live state",
						operation: "createMessage",
						cause: e,
					}),
			),
		)

		// Get the actor for this message
		const actor = yield* actorsClient.getMessageActor(message.id)

		// Start the actor with initial data
		yield* wrapActorCall("start", () => actor.start(options.initialData ?? {}))

		// Return the session interface
		return createSessionFromActor(message.id as MessageId, actor)
	})

/**
 * Internal function to create an AI stream session with injected dependencies.
 */
export const createAIStreamSessionInternal = (
	createMessage: MessageCreateFn,
	actorsClient: ActorsClientService,
	channelId: ChannelId,
	options: AIStreamOptions = {},
): Effect.Effect<AIStreamSession, StreamError> =>
	Effect.gen(function* () {
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
		 * Process a single AI content chunk
		 */
		const processChunk = (chunk: AIContentChunk): Effect.Effect<void, StreamError> =>
			Effect.gen(function* () {
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
		 * Process an async iterable of AI content chunks
		 */
		const processStream = (chunks: AsyncIterable<AIContentChunk>): Effect.Effect<void, StreamError> =>
			Effect.async<void, StreamError>((resume) => {
				;(async () => {
					try {
						for await (const chunk of chunks) {
							const result = await Effect.runPromise(processChunk(chunk))
							// If processChunk fails, Effect.runPromise will throw
							void result
						}
						resume(Effect.void)
					} catch (error) {
						resume(
							Effect.fail(
								error instanceof StreamError
									? error
									: new StreamError({
											message: "Failed to process stream",
											operation: "processStream",
											cause: error,
										}),
							),
						)
					}
				})()
			})

		return {
			...baseSession,
			processChunk,
			processStream,
		}
	})

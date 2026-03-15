import { AiError, LanguageModel, Prompt, type Response, type Toolkit } from "effect/unstable/ai"
import { Duration, Effect, Mailbox, Stream } from "effect"

import { withDegenerationDetection } from "./degeneration-detector.ts"
import { IterationTimeoutError, StreamIdleTimeoutError } from "./errors.ts"

const MAX_ITERATIONS = 10
const IDLE_TIMEOUT = Duration.seconds(15)
const ITERATION_TIMEOUT = Duration.minutes(2)

/**
 * Multi-step streaming agent loop.
 *
 * The Effect AI SDK resolves tool calls in a single pass but does not loop back
 * to the model with results. This function implements the loop: if the model
 * calls tools, the results are appended to the prompt and the model is called
 * again, until it responds without tool calls or MAX_ITERATIONS is reached.
 *
 * All stream parts (text deltas, tool calls, tool results) from every iteration
 * are emitted in real-time via a Mailbox-backed stream.
 *
 * Safeguards per iteration:
 * - Idle timeout: fails if no chunk received for 15s
 * - Degeneration detection: fails if repetitive patterns detected
 * - Iteration timeout: fails if a single LLM call exceeds 2 minutes
 */
export const streamAgentLoop = (options: {
	prompt: Prompt.RawInput
	toolkit: Toolkit.WithHandler<any>
}): Stream.Stream<
	Response.AnyPart,
	AiError.AiError | StreamIdleTimeoutError | IterationTimeoutError,
	LanguageModel.LanguageModel
> =>
	Effect.gen(function* () {
		const mailbox = yield* Mailbox.make<
			Response.AnyPart,
			AiError.AiError | StreamIdleTimeoutError | IterationTimeoutError
		>()

		yield* Effect.gen(function* () {
			let currentPrompt = Prompt.make(options.prompt)

			for (let i = 0; i < MAX_ITERATIONS; i++) {
				const collectedParts: Array<Response.AnyPart> = []

				yield* LanguageModel.streamText({
					prompt: currentPrompt,
					toolkit: options.toolkit,
					toolChoice: "auto" as any,
				}).pipe(
					// Idle timeout: resets on each emitted element
					Stream.timeoutFail(
						() =>
							new StreamIdleTimeoutError({
								message: "No data received from AI model for 15 seconds",
							}),
						IDLE_TIMEOUT,
					),
					// Degeneration detection: fails on repetitive patterns
					withDegenerationDetection,
					Stream.runForEach((part) => {
						collectedParts.push(part as Response.AnyPart)
						return mailbox.offer(part as Response.AnyPart)
					}),
					// Iteration timeout: wall-clock limit per LLM call
					Effect.timeoutFail({
						onTimeout: () =>
							new IterationTimeoutError({
								message: "Single LLM call exceeded 2 minute time limit",
							}),
						duration: ITERATION_TIMEOUT,
					}),
				)

				// If no tool calls were made, the model is done responding
				const hasToolCalls = collectedParts.some((p) => p.type === "tool-call")
				if (!hasToolCalls) break

				// Append assistant response + tool results to prompt for next iteration
				currentPrompt = Prompt.merge(currentPrompt, Prompt.fromResponseParts(collectedParts))
			}
		}).pipe(Mailbox.into(mailbox), Effect.forkScoped)

		return Mailbox.toStream(mailbox)
	}).pipe(Stream.unwrapScoped) as Stream.Stream<
		Response.AnyPart,
		AiError.AiError | StreamIdleTimeoutError | IterationTimeoutError,
		LanguageModel.LanguageModel
	>

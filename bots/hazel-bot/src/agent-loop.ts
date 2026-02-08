import { AiError, LanguageModel, Prompt, type Response, type Toolkit } from "@effect/ai"
import { Effect, Mailbox, Stream } from "effect"

const MAX_ITERATIONS = 10

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
 */
export const streamAgentLoop = (options: {
	prompt: Prompt.RawInput
	toolkit: Toolkit.WithHandler<any>
}): Stream.Stream<Response.AnyPart, AiError.AiError, LanguageModel.LanguageModel> =>
	Effect.gen(function* () {
		const mailbox = yield* Mailbox.make<Response.AnyPart, AiError.AiError>()

		yield* Effect.gen(function* () {
			let currentPrompt = Prompt.make(options.prompt)

			for (let i = 0; i < MAX_ITERATIONS; i++) {
				const collectedParts: Array<Response.AnyPart> = []

				yield* LanguageModel.streamText({
					prompt: currentPrompt,
					toolkit: options.toolkit,
					toolChoice: "auto" as any,
				}).pipe(
					Stream.runForEach((part) => {
						collectedParts.push(part as Response.AnyPart)
						return mailbox.offer(part as Response.AnyPart)
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
		AiError.AiError,
		LanguageModel.LanguageModel
	>

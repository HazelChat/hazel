import { LanguageModel } from "@effect/ai"
import { generateIntegrationInstructions, type AIContentChunk, type HazelBotClient } from "@hazel/bot-sdk"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { Cause, Config, Effect, Exit, Stream } from "effect"

import { streamAgentLoop } from "./agent-loop.ts"
import { makeOpenRouterModel } from "./openrouter.ts"
import { INTEGRATION_INSTRUCTIONS, buildSystemPrompt } from "./prompt.ts"
import { mapEffectPartToChunk } from "./stream.ts"
import { buildToolkit } from "./tools/toolkit.ts"

/**
 * Shared AI pipeline used by both /ask command and @mention handler.
 * Creates a streaming AI session in the given channel and runs the agent loop.
 */
export const handleAIRequest = (params: {
	bot: HazelBotClient
	message: string
	channelId: ChannelId
	orgId: OrganizationId
	history?: Array<{ role: "user" | "assistant"; content: string }>
}) =>
	Effect.gen(function* () {
		const { bot, message, channelId, orgId } = params

		const enabledIntegrations = yield* bot.integration.getEnabled(orgId)

		yield* Effect.log(`Enabled integrations for org ${orgId}:`, {
			integrations: Array.from(enabledIntegrations),
		})

		const modelName = yield* Config.string("AI_MODEL").pipe(Config.withDefault("moonshotai/kimi-k2.5"))

		// Generate dynamic instructions based on enabled integrations
		const integrationInstructions = generateIntegrationInstructions(
			enabledIntegrations,
			INTEGRATION_INSTRUCTIONS,
		)
		const systemInstructions = buildSystemPrompt(integrationInstructions)

		// Build prompt (with optional conversation history)
		const prompt = params.history
			? [
					{ role: "system" as const, content: systemInstructions },
					...params.history.map((m) => ({
						role: m.role as "user" | "assistant",
						content: m.content,
					})),
				]
			: [
					{ role: "system" as const, content: systemInstructions },
					{ role: "user" as const, content: message },
				]

		// Build toolkit with Effect-native handlers (resolved WithHandler)
		const toolkit = yield* buildToolkit({ bot, orgId, enabledIntegrations })

		// Use acquireUseRelease for guaranteed cleanup of the streaming session.
		yield* Effect.acquireUseRelease(
			bot.ai.stream(channelId, {
				model: modelName,
				showThinking: true,
				showToolCalls: true,
				loading: {
					text: "Thinking...",
					icon: "sparkle",
					throbbing: true,
				},
			}),
			(session) =>
				Effect.gen(function* () {
					yield* Effect.log(`Created streaming message ${session.messageId}`)

					yield* streamAgentLoop({ prompt, toolkit }).pipe(
						Stream.map(mapEffectPartToChunk),
						Stream.filter((chunk): chunk is AIContentChunk => chunk !== null),
						Stream.runForEach((chunk) => session.processChunk(chunk)),
					)

					yield* session.complete()
					yield* Effect.log(`Agent response complete: ${session.messageId}`)
				}),
			// Release: on failure/interrupt, persist the error state
			(session, exit) =>
				Exit.isSuccess(exit)
					? Effect.void
					: Effect.gen(function* () {
							const cause = exit.cause
							yield* Effect.logError("Agent streaming failed", { error: cause })

							const userMessage: string = Cause.match(cause, {
								onEmpty: "Request was cancelled.",
								onFail: (error) => `An error occurred: ${String(error)}`,
								onDie: () => "An unexpected error occurred.",
								onInterrupt: () => "Request was cancelled.",
								onSequential: (left: string) => left,
								onParallel: (left: string) => left,
							})

							yield* session.fail(userMessage).pipe(Effect.ignore)
						}),
		)
	}).pipe(
		// Provide the LanguageModel dynamically based on config
		Effect.provideServiceEffect(
			LanguageModel.LanguageModel,
			Config.string("AI_MODEL").pipe(
				Config.withDefault("moonshotai/kimi-k2.5"),
				Effect.flatMap((model) => makeOpenRouterModel(model)),
			),
		),
	)

import { Effect, Schema } from "effect"
import { Command, CommandGroup, runHazelBot, type StreamSession } from "@hazel/bot-sdk"

/**
 * Helper to create a sleep effect
 */
const sleep = (ms: number) => Effect.promise(() => new Promise((resolve) => setTimeout(resolve, ms)))

/**
 * Stream text character by character to a step
 */
const streamTextToStep = (
	stream: StreamSession,
	stepId: string,
	text: string,
	delayMs = 15,
): Effect.Effect<void, unknown> =>
	Effect.forEach(
		text.split(""),
		(char) => stream.updateStepContent(stepId, char, true).pipe(Effect.andThen(sleep(delayMs))),
		{ discard: true },
	)

/**
 * Stream text character by character to the main content
 */
const streamTextContent = (stream: StreamSession, text: string, delayMs = 25): Effect.Effect<void, unknown> =>
	Effect.forEach(text.split(""), (char) => stream.appendText(char).pipe(Effect.andThen(sleep(delayMs))), {
		discard: true,
	})

/**
 * Simulate an AI stream with steps and streaming text using the new SDK API
 */
const simulateAiStream = (
	stream: StreamSession,
	options?: {
		streamDelay?: number
		thinkingDelay?: number
	},
): Effect.Effect<void, unknown> =>
	Effect.gen(function* () {
		const { streamDelay = 25, thinkingDelay = 800 } = options ?? {}

		// Step 1: Initial thinking
		const thinking1 = yield* stream.startThinking()
		yield* streamTextToStep(
			stream,
			thinking1,
			"Analyzing the user's request about implementing a React hook...",
		)
		yield* sleep(thinkingDelay)
		yield* stream.completeStep(thinking1)

		// Step 2: Search for relevant code
		const searchId = yield* stream.startToolCall("search_codebase", {
			query: "useEffect cleanup pattern",
			fileTypes: ["tsx", "ts"],
		})
		yield* sleep(thinkingDelay * 1.5)
		yield* stream.completeStep(searchId, {
			output: {
				matches: 3,
				files: ["src/hooks/use-subscription.ts", "src/hooks/use-websocket.ts"],
			},
		})

		// Step 3: Read a file
		const readId = yield* stream.startToolCall("read_file", {
			path: "src/hooks/use-subscription.ts",
			lines: "1-45",
		})
		yield* sleep(thinkingDelay)
		yield* stream.completeStep(readId, {
			output: "// Found existing cleanup pattern implementation",
		})

		// Step 4: More thinking
		const thinking2 = yield* stream.startThinking()
		yield* streamTextToStep(
			stream,
			thinking2,
			"I found a similar pattern in the codebase. Let me adapt it for your use case...",
		)
		yield* sleep(thinkingDelay / 2)
		yield* stream.completeStep(thinking2)

		// Step 5: Stream the final response
		const response = `Here's how you can implement a React hook with proper cleanup:

\`\`\`typescript
import { useEffect, useRef } from 'react'

export function useSubscription<T>(
  subscribe: (callback: (value: T) => void) => () => void
) {
  const callbackRef = useRef<((value: T) => void) | null>(null)

  useEffect(() => {
    // Subscribe and store the unsubscribe function
    const unsubscribe = subscribe((value) => {
      callbackRef.current?.(value)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      callbackRef.current = null
    }
  }, [subscribe])

  return callbackRef
}
\`\`\`

This pattern ensures:
1. **Proper cleanup** - The unsubscribe function is called on unmount
2. **No memory leaks** - References are cleared
3. **Stable callback** - Using a ref prevents unnecessary re-subscriptions`

		yield* streamTextContent(stream, response, streamDelay)
		yield* stream.complete()
	})

// Define the /simulate-ai command
const SimulateAiCommand = Command.make("simulate-ai", {
	description: "Simulate an AI streaming response with live state updates",
	args: {
		speed: Schema.optional(Schema.String),
	},
	usageExample: "/simulate-ai speed=fast",
})

const commands = CommandGroup.make(SimulateAiCommand)

runHazelBot({
	commands,
	layers: [],
	setup: (bot) =>
		Effect.gen(function* () {
			yield* bot.onCommand(SimulateAiCommand, (ctx) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received /simulate-ai command from ${ctx.userId}`)

					const speed = ctx.args.speed === "fast" ? 10 : ctx.args.speed === "slow" ? 50 : 25

					// Use the new SDK streaming API - creates message with live state automatically
					const stream = yield* bot.stream.create(ctx.channelId, {
						initialData: { model: "claude-3.5-sonnet" },
					})

					yield* Effect.log(`Created streaming message ${stream.messageId}`)

					// Run the simulation using the stream session
					yield* simulateAiStream(stream, {
						streamDelay: speed,
						thinkingDelay: 800,
					})

					yield* Effect.log(`Simulation complete for message ${stream.messageId}`)
				}).pipe(bot.withErrorHandler(ctx)),
			)
		}),
})

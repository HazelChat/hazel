import { Effect, Schema } from "effect"
import { Command, CommandGroup, runHazelBot } from "@hazel/bot-sdk"
import { createActorsClient } from "@hazel/actors/client"
import type { MessageId } from "@hazel/domain/ids"

// Create the actors client
const actorsClient = createActorsClient()

/**
 * Simulate an AI stream with steps and streaming text.
 */
async function simulateAiStream(
	messageId: MessageId,
	options?: {
		streamDelay?: number
		thinkingDelay?: number
	},
) {
	const { streamDelay = 25, thinkingDelay = 800 } = options ?? {}

	const actor = actorsClient.message.getOrCreate([messageId])

	// Start the actor
	await actor.start({ model: "claude-3.5-sonnet" })

	// Step 1: Initial thinking
	const thinking1 = await actor.startThinking()
	await streamText(actor, thinking1, "Analyzing the user's request about implementing a React hook...")
	await sleep(thinkingDelay)
	await actor.completeStep(thinking1)

	// Step 2: Search for relevant code
	const searchId = await actor.startToolCall("search_codebase", {
		query: "useEffect cleanup pattern",
		fileTypes: ["tsx", "ts"],
	})
	await sleep(thinkingDelay * 1.5)
	await actor.completeStep(searchId, {
		output: {
			matches: 3,
			files: ["src/hooks/use-subscription.ts", "src/hooks/use-websocket.ts"],
		},
	})

	// Step 3: Read a file
	const readId = await actor.startToolCall("read_file", {
		path: "src/hooks/use-subscription.ts",
		lines: "1-45",
	})
	await sleep(thinkingDelay)
	await actor.completeStep(readId, {
		output: "// Found existing cleanup pattern implementation",
	})

	// Step 4: More thinking
	const thinking2 = await actor.startThinking()
	await streamText(
		actor,
		thinking2,
		"I found a similar pattern in the codebase. Let me adapt it for your use case...",
	)
	await sleep(thinkingDelay / 2)
	await actor.completeStep(thinking2)

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

	for (const char of response) {
		await actor.appendText(char)
		await sleep(streamDelay)
	}

	await actor.stopStreaming()
	await actor.complete()
}

async function streamText(
	actor: ReturnType<typeof actorsClient.message.getOrCreate>,
	stepId: string,
	text: string,
) {
	for (const char of text) {
		await actor.updateStepContent(stepId, char, true)
		await sleep(15)
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

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

					// Create a message with live state enabled (minimal embed, just the flag)
					const message = yield* bot.message.send(ctx.channelId, "", {
						embeds: [
							{
								liveState: { enabled: true },
							},
						],
					})

					yield* Effect.log(`Created message ${message.id} with live state`)

					// Run the simulation
					yield* Effect.promise(() =>
						simulateAiStream(message.id as MessageId, {
							streamDelay: speed,
							thinkingDelay: 800,
						}),
					)

					yield* Effect.log(`Simulation complete for message ${message.id}`)
				}).pipe(bot.withErrorHandler(ctx)),
			)
		}),
})

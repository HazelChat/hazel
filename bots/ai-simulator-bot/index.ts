import { Effect, Schema } from "effect"
import { Command, CommandGroup, runHazelBot } from "@hazel/bot-sdk"
import { createActorsClient } from "@hazel/actors/client"
import type { MessageId } from "@hazel/domain/ids"

// Sample responses for simulation
const SAMPLE_RESPONSES = [
	"Let me help you with that! I'll need to look up some information first.",
	"Based on my analysis, here's what I found about your question...",
	"I've completed the task. Here's a summary of what I did.",
	"Great question! Let me break this down step by step for you.",
]

const SAMPLE_THINKING = [
	"Analyzing the request...",
	"Determining best approach...",
	"Processing the information...",
	"Formulating a response...",
]

const SAMPLE_TOOLS = [
	{ name: "web_search", input: { query: "latest news" }, output: { results: ["Result 1", "Result 2"] } },
	{ name: "code_interpreter", input: { code: "print('hello')" }, output: { stdout: "hello" } },
	{ name: "file_read", input: { path: "/data/config.json" }, output: { content: '{"version": "1.0"}' } },
]

// Create the actors client
const actorsClient = createActorsClient()

/**
 * Simulate an AI stream with steps and streaming text.
 */
async function simulateAiStream(
	messageId: MessageId,
	options?: {
		includeToolCalls?: boolean
		streamDelay?: number
		thinkingDelay?: number
	},
) {
	const { includeToolCalls = true, streamDelay = 50, thinkingDelay = 1000 } = options ?? {}

	const actor = actorsClient.message.getOrCreate([messageId])

	// Start the actor
	await actor.start({ model: "simulator", simulatedAt: Date.now() })

	// Step 1: Thinking
	const thinkingId = await actor.startThinking()
	await actor.updateStepContent(thinkingId, SAMPLE_THINKING[0])
	await sleep(thinkingDelay)
	await actor.updateStepContent(thinkingId, ` ${SAMPLE_THINKING[1]}`, true)
	await sleep(thinkingDelay / 2)
	await actor.completeStep(thinkingId)

	// Step 2: Optional tool calls
	if (includeToolCalls) {
		const tool = SAMPLE_TOOLS[Math.floor(Math.random() * SAMPLE_TOOLS.length)]
		if (tool) {
			const toolId = await actor.startToolCall(tool.name, tool.input)
			await sleep(thinkingDelay)
			await actor.completeStep(toolId, { output: tool.output })
		}
	}

	// Step 3: Stream response
	const responseId = await actor.startThinking()
	const response =
		SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)] ?? SAMPLE_RESPONSES[0]

	if (response) {
		for (const char of response) {
			await actor.updateStepContent(responseId, char, true)
			await actor.appendText(char)
			await sleep(streamDelay)
		}
	}

	await actor.stopStreaming()
	await actor.completeStep(responseId)
	await actor.complete()
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

// Define the /simulate-ai command
const SimulateAiCommand = Command.make("simulate-ai", {
	description: "Simulate an AI streaming response with live state updates",
	args: {
		includeTools: Schema.optional(Schema.String),
		streamDelay: Schema.optional(Schema.String),
	},
	usageExample: "/simulate-ai includeTools=true streamDelay=30",
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

					const includeToolCalls = ctx.args.includeTools !== "false"
					const streamDelay = ctx.args.streamDelay ? Number.parseInt(ctx.args.streamDelay, 10) : 50

					// Create a message with live state enabled
					const message = yield* bot.message.send(ctx.channelId, "AI Response:", {
						embeds: [
							{
								title: "AI Simulation",
								description: "Simulating AI response with live state...",
								liveState: { enabled: true },
							},
						],
					})

					yield* Effect.log(`Created message ${message.id} with live state`)

					// Run the simulation
					yield* Effect.promise(() =>
						simulateAiStream(message.id as MessageId, {
							includeToolCalls,
							streamDelay,
							thinkingDelay: 1000,
						}),
					)

					yield* Effect.log(`Simulation complete for message ${message.id}`)
				}).pipe(bot.withErrorHandler(ctx)),
			)
		}),
})

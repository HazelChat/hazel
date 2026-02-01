import { Command, CommandGroup, runHazelBot, type AIContentChunk } from "@hazel/bot-sdk"
import { Cause, Config, Effect, JSONSchema, Match, Redacted, Schema, Stream } from "effect"

// Vercel AI SDK imports
import { streamText, tool, jsonSchema } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { TextStreamPart } from "ai"

// ============================================================================
// Effect Schema to Vercel AI SDK Helper
// ============================================================================

function effectSchemaToJsonSchema<A, I>(schema: Schema.Schema<A, I, never>) {
	const jsonSchema7 = JSONSchema.make(schema)

	return jsonSchema<A>(jsonSchema7, {
		validate: (value: unknown) => {
			const result = Schema.decodeUnknownEither(schema)(value)
			if (result._tag === "Right") {
				return { success: true, value: result.right } as const
			}
			return { success: false, error: new Error(String(result.left)) } as const
		},
	})
}

// ============================================================================
// Vercel AI SDK Tools (using Effect Schema)
// ============================================================================

const vercelTools = {
	get_current_time: tool({
		description: "Get the current date and time in ISO format",
		inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
		execute: async () => new Date().toISOString(),
	}),

	search_codebase: tool({
		description: "Search the codebase for files matching a query",
		inputSchema: effectSchemaToJsonSchema(
			Schema.Struct({
				query: Schema.String.annotations({ description: "The search query to find files" }),
				fileTypes: Schema.optional(
					Schema.Array(Schema.String).annotations({
						description: "File extensions to filter by (e.g., ts, tsx)",
					}),
				),
			}),
		),
		execute: async ({ query, fileTypes }) => {
			const slug = query.toLowerCase().replace(/\s+/g, "-")
			const extensions = fileTypes ?? ["ts", "tsx"]
			const ext = extensions[0] ?? "ts"
			return {
				matches: 3,
				files: [
					`src/hooks/use-${slug}.${ext}`,
					`src/utils/${slug}.${ext}`,
					`src/components/${query.split(" ")[0]}.tsx`,
				],
			}
		},
	}),

	read_file: tool({
		description: "Read the contents of a file at the given path",
		inputSchema: effectSchemaToJsonSchema(
			Schema.Struct({
				path: Schema.String.annotations({ description: "The path to the file to read" }),
				lines: Schema.optional(
					Schema.String.annotations({ description: 'Line range to read (e.g., "1-50")' }),
				),
			}),
		),
		execute: async ({ path, lines }) => {
			const lineRange = lines ?? "1-20"
			return (
				`// Contents of ${path} (lines ${lineRange})\n` +
				`// This is simulated file content for demonstration\n` +
				`\n` +
				`import { Effect } from "effect"\n` +
				`\n` +
				`export const example = Effect.gen(function* () {\n` +
				`  yield* Effect.log("Hello from ${path}")\n` +
				`  return "success"\n` +
				`})\n`
			)
		},
	}),

	calculate: tool({
		description: "Perform basic arithmetic calculations",
		inputSchema: effectSchemaToJsonSchema(
			Schema.Struct({
				operation: Schema.Literal("add", "subtract", "multiply", "divide").annotations({
					description: "The arithmetic operation to perform",
				}),
				a: Schema.Number.annotations({ description: "First operand" }),
				b: Schema.Number.annotations({ description: "Second operand" }),
			}),
		),
		execute: async ({ operation, a, b }) => {
			switch (operation) {
				case "add":
					return a + b
				case "subtract":
					return a - b
				case "multiply":
					return a * b
				case "divide":
					return b === 0 ? Number.NaN : a / b
			}
		},
	}),
}

// ============================================================================
// Vercel AI SDK Stream Part Mapper
// ============================================================================

interface VercelStreamState {
	hasActiveReasoning: boolean
}

const mapVercelPartToChunk = (
	part: TextStreamPart<typeof vercelTools>,
	state: VercelStreamState,
): AIContentChunk | null => {
	switch (part.type) {
		case "text-delta":
			return { type: "text", text: part.text }

		case "reasoning-delta":
			state.hasActiveReasoning = true
			return { type: "thinking", text: part.text, isComplete: false }

		case "reasoning-end":
			state.hasActiveReasoning = false
			return { type: "thinking", text: "", isComplete: true }

		case "tool-call":
			return {
				type: "tool_call",
				id: part.toolCallId,
				name: part.toolName,
				input: part.input as Record<string, unknown>,
			}

		case "tool-result":
			return {
				type: "tool_result",
				toolCallId: part.toolCallId,
				output: part.output,
			}

		// Skip non-content stream parts
		case "start":
		case "start-step":
		case "text-start":
		case "text-end":
		case "reasoning-start":
		case "tool-input-start":
		case "tool-input-delta":
		case "tool-input-end":
		case "tool-error":
		case "tool-output-denied":
		case "finish-step":
		case "finish":
		case "abort":
		case "source":
		case "file":
		case "error":
		case "raw":
			return null

		default:
			return null
	}
}

// ============================================================================
// Commands
// ============================================================================
const SimulateAiCommand = Command.make("simulate-ai", {
	description: "Legacy: Simulate an AI streaming response (for comparison)",
	args: {
		speed: Schema.optional(Schema.String),
	},
	usageExample: "/simulate-ai speed=fast",
})

const VercelAskCommand = Command.make("vercel-ask", {
	description: "Ask the AI using Vercel AI SDK (supports tool use and reasoning)",
	args: {
		message: Schema.String,
	},
	usageExample: '/vercel-ask message="Search for patterns in the codebase"',
})

const commands = CommandGroup.make(SimulateAiCommand, VercelAskCommand)

// ============================================================================
// Bot Setup
// ============================================================================

runHazelBot({
	commands,
	layers: [],
	setup: (bot) =>
		Effect.gen(function* () {
			// Handle /simulate-ai command - legacy simulation for comparison
			yield* bot.onCommand(SimulateAiCommand, (ctx) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received /simulate-ai command from ${ctx.userId}`)

					const speed = ctx.args.speed === "fast" ? 10 : ctx.args.speed === "slow" ? 50 : 25

					const stream = yield* bot.stream.create(ctx.channelId, {
						initialData: { model: "moonshotai/kimi-k2.5 (simulated)" },
					})

					yield* Effect.log(`Created streaming message ${stream.messageId}`)

					// Simulate thinking
					const thinkingId = yield* stream.startThinking()
					yield* stream.updateStepContent(thinkingId, "Analyzing the request...", true)
					yield* Effect.sleep(800)
					yield* stream.completeStep(thinkingId)

					// Simulate tool call
					const toolId = yield* stream.startToolCall("search_codebase", {
						query: "example patterns",
						fileTypes: ["ts", "tsx"],
					})
					yield* Effect.sleep(600)
					yield* stream.completeStep(toolId, {
						output: { matches: 2, files: ["src/example.ts", "src/patterns.tsx"] },
					})

					// Stream response
					const response =
						"Here's what I found in the codebase:\n\n" +
						"```typescript\n" +
						"export const example = () => {\n" +
						'  console.log("Hello, world!")\n' +
						"}\n" +
						"```\n\n" +
						"This is a **simulated** response for testing the UI."

					for (const char of response) {
						yield* stream.appendText(char)
						yield* Effect.sleep(speed)
					}

					yield* stream.complete()
					yield* Effect.log(`Simulation complete for message ${stream.messageId}`)
				}).pipe(bot.withErrorHandler(ctx)),
			)

			// Handle /vercel-ask command - Vercel AI SDK with tool support
			yield* bot.onCommand(VercelAskCommand, (ctx) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received /vercel-ask: ${ctx.args.message}`)

					const apiKey = yield* Config.redacted("OPENROUTER_API_KEY")
					const openrouter = createOpenRouter({ apiKey: Redacted.value(apiKey) })

					// Create AI streaming session
					const session = yield* bot.ai.stream(ctx.channelId, {
						model: "moonshotai/kimi-k2.5 (vercel)",
						showThinking: true,
						showToolCalls: true,
						loading: {
							text: "Thinking...",
							icon: "sparkle",
							throbbing: true,
						},
					})

					yield* Effect.log(`Created streaming message ${session.messageId}`)

					const result = streamText({
						model: openrouter("moonshotai/kimi-k2.5"),
						prompt: ctx.args.message,
						tools: vercelTools,
						toolChoice: "auto",
					})

					const streamState: VercelStreamState = { hasActiveReasoning: false }

					yield* Stream.fromAsyncIterable(result.fullStream, (e) => new Error(String(e))).pipe(
						Stream.map((part) => mapVercelPartToChunk(part, streamState)),
						Stream.filter((chunk): chunk is AIContentChunk => chunk !== null),
						Stream.runForEach((chunk) => session.processChunk(chunk)),
						Effect.matchCauseEffect({
							onSuccess: () =>
								Effect.gen(function* () {
									yield* session.complete()
									yield* Effect.log(`Vercel AI response complete: ${session.messageId}`)
								}),
							onFailure: (cause) =>
								Effect.gen(function* () {
									yield* Effect.logError("Vercel AI streaming failed", { error: cause })

									const userMessage = Cause.match(cause, {
										onEmpty: "Request was cancelled.",
										onFail: (error) => `An error occurred: ${String(error)}`,
										onDie: () => "An unexpected error occurred.",
										onInterrupt: () => "Request was cancelled.",
										onSequential: (left) => left,
										onParallel: (left) => left,
									})

									yield* session.fail(userMessage).pipe(Effect.ignore)
								}),
						}),
					)
				}),
			)
		}),
})

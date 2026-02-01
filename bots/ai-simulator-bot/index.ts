import { AiError, LanguageModel, Tool, Toolkit } from "@effect/ai"
import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter"
import { FetchHttpClient } from "@effect/platform"
import { ActorOperationError, Command, CommandGroup, runHazelBot, type AIContentChunk } from "@hazel/bot-sdk"
import { Cause, Config, Effect, Layer, Match, Schema, Stream } from "effect"
import type { Response } from "@effect/ai"

// ============================================================================
// Tool Definitions
// ============================================================================

/**
 * Tool 1: Get current time - simple tool with no parameters
 */
const GetCurrentTime = Tool.make("get_current_time", {
	description: "Get the current date and time in ISO format",
	success: Schema.String,
})

/**
 * Tool 2: Search codebase - simulated search with query parameters
 */
const SearchCodebase = Tool.make("search_codebase", {
	description: "Search the codebase for files matching a query",
	parameters: {
		query: Schema.String.annotations({ description: "The search query to find files" }),
		fileTypes: Schema.optional(
			Schema.Array(Schema.String).annotations({
				description: "File extensions to filter by (e.g., ts, tsx)",
			}),
		),
	},
	success: Schema.Struct({
		matches: Schema.Number,
		files: Schema.Array(Schema.String),
	}),
})

/**
 * Tool 3: Read file - simulated file reading
 */
const ReadFile = Tool.make("read_file", {
	description: "Read the contents of a file at the given path",
	parameters: {
		path: Schema.String.annotations({ description: "The path to the file to read" }),
		lines: Schema.optional(
			Schema.String.annotations({ description: 'Line range to read (e.g., "1-50")' }),
		),
	},
	success: Schema.String,
})

/**
 * Tool 4: Calculate - simple math operations
 */
const Calculate = Tool.make("calculate", {
	description: "Perform basic arithmetic calculations",
	parameters: {
		operation: Schema.Literal("add", "subtract", "multiply", "divide").annotations({
			description: "The arithmetic operation to perform",
		}),
		a: Schema.Number.annotations({ description: "First operand" }),
		b: Schema.Number.annotations({ description: "Second operand" }),
	},
	success: Schema.Number,
})

// ============================================================================
// Toolkit with Handlers
// ============================================================================

const BotToolkit = Toolkit.make(GetCurrentTime, SearchCodebase, ReadFile, Calculate)

const ToolkitLayer = BotToolkit.toLayer({
	get_current_time: () => Effect.succeed(new Date().toISOString()),

	search_codebase: ({ query, fileTypes }) => {
		const slug = query.toLowerCase().replace(/\s+/g, "-")
		const extensions = fileTypes ?? ["ts", "tsx"]
		const ext = extensions[0] ?? "ts"
		return Effect.succeed({
			matches: 3,
			files: [
				`src/hooks/use-${slug}.${ext}`,
				`src/utils/${slug}.${ext}`,
				`src/components/${query.split(" ")[0]}.tsx`,
			],
		})
	},

	read_file: ({ path, lines }) => {
		const lineRange = lines ?? "1-20"
		return Effect.succeed(
			`// Contents of ${path} (lines ${lineRange})\n` +
				`// This is simulated file content for demonstration\n` +
				`\n` +
				`import { Effect } from "effect"\n` +
				`\n` +
				`export const example = Effect.gen(function* () {\n` +
				`  yield* Effect.log("Hello from ${path}")\n` +
				`  return "success"\n` +
				`})\n`,
		)
	},

	calculate: ({ operation, a, b }) => {
		switch (operation) {
			case "add":
				return Effect.succeed(a + b)
			case "subtract":
				return Effect.succeed(a - b)
			case "multiply":
				return Effect.succeed(a * b)
			case "divide":
				return b === 0 ? Effect.succeed(Number.NaN) : Effect.succeed(a / b)
		}
	},
})

// ============================================================================
// AI Service Layer
// ============================================================================

const OpenRouterClientLayer = OpenRouterClient.layerConfig({
	apiKey: Config.redacted("OPENROUTER_API_KEY"),
}).pipe(Layer.provide(FetchHttpClient.layer))

const LanguageModelLayer = OpenRouterLanguageModel.layer({
	model: "moonshotai/kimi-k2.5",
	config: { max_tokens: 4096 },
}).pipe(Layer.provide(OpenRouterClientLayer))

// ============================================================================
// Stream Part to AIContentChunk Mapper
// ============================================================================

type BotTools = Toolkit.Tools<typeof BotToolkit>
type BotStreamPart = Response.StreamPart<BotTools>

const mapPartToChunk = (part: BotStreamPart): AIContentChunk | null => {
	switch (part.type) {
		case "text-delta":
			return { type: "text", text: part.delta }

		case "reasoning-delta":
			return { type: "thinking", text: part.delta, isComplete: false }

		case "reasoning-end":
			return { type: "thinking", text: "", isComplete: true }

		case "tool-call":
			return {
				type: "tool_call",
				id: part.id,
				name: part.name,
				input: part.params as Record<string, unknown>,
			}

		case "tool-result":
			return {
				type: "tool_result",
				toolCallId: part.id,
				output: part.result,
				error: part.isFailure ? String(part.result) : undefined,
			}

		// Skip non-content stream parts
		case "text-start":
		case "text-end":
		case "reasoning-start":
		case "response-metadata":
		case "finish":
		case "tool-params-start":
		case "tool-params-delta":
		case "tool-params-end":
		case "file":
		case "source":
		case "error":
			return null

		default:
			return null
	}
}

// ============================================================================
// Commands
// ============================================================================

const AskCommand = Command.make("ask", {
	description: "Ask the AI assistant a question (supports tool use)",
	args: {
		message: Schema.String,
	},
	usageExample: '/ask message="Search for useEffect patterns in the codebase"',
})

const SimulateAiCommand = Command.make("simulate-ai", {
	description: "Legacy: Simulate an AI streaming response (for comparison)",
	args: {
		speed: Schema.optional(Schema.String),
	},
	usageExample: "/simulate-ai speed=fast",
})

const commands = CommandGroup.make(AskCommand, SimulateAiCommand)

// ============================================================================
// Bot Setup
// ============================================================================

runHazelBot({
	commands,
	layers: [LanguageModelLayer, ToolkitLayer],
	setup: (bot) =>
		Effect.gen(function* () {
			// Handle /ask command - real AI with tool support
			yield* bot.onCommand(
				AskCommand,
				(ctx) =>
					Effect.gen(function* () {
						yield* Effect.log(`Received /ask: ${ctx.args.message}`)

						const model = yield* LanguageModel.LanguageModel
						const toolkit = yield* BotToolkit

						// Create AI streaming session
						const session = yield* bot.ai.stream(ctx.channelId, {
							model: "moonshotai/kimi-k2.5",
							showThinking: true,
							showToolCalls: true,
							loading: {
								text: "Thinking...",
								icon: "sparkle",
								throbbing: true,
							},
						})

						yield* Effect.log(`Created streaming message ${session.messageId}`)

						// Stream with tool support - use matchCauseEffect for AI-aware error handling
						yield* model
							.streamText({
								prompt: ctx.args.message,
								toolkit,
								toolChoice: "auto",
							})
							.pipe(
								Stream.runForEach((part) => {
									const chunk = mapPartToChunk(part)
									return chunk ? session.processChunk(chunk) : Effect.void
								}),
								Effect.matchCauseEffect({
									onSuccess: () =>
										Effect.gen(function* () {
											yield* session.complete()
											yield* Effect.log(`Response complete: ${session.messageId}`)
										}),
									onFailure: (cause) =>
										Effect.gen(function* () {
											yield* Effect.logError("AI streaming failed", { error: cause })

											const userMessage = Cause.match(cause, {
												onEmpty: "Request was cancelled.",
												onFail: (error) =>
													Match.value(error).pipe(
														Match.tagsExhaustive({
															HttpResponseError: (err) => {
																return `AI service returned an error: ${err.reason}`
															},
															HttpRequestError: () =>
																"Network connection failed.",
															ActorOperationError: (err) => {
																return `Actor operation failed: ${err.operation}`
															},
															MalformedInput: (err) => {
																return `Invalid input: ${err.message}`
															},
															MalformedOutput: (err) => {
																return `Invalid output: ${err.message}`
															},
															UnknownError: (err) => {
																return `An error occurred: ${err.message}`
															},
														}),
													),
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
				// NO withErrorHandler - handled by matchCauseEffect to avoid duplicate messages
			)

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
		}),
})

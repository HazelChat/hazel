import { LanguageModel } from "effect/unstable/ai"
import { OpenRouterClient, OpenRouterLanguageModel } from "@hazel/ai-openrouter"
import { FetchHttpClient } from "effect/unstable/http"
import { Config, Effect, Layer, Schema } from "effect"
import { runHazelBot } from "@hazel-chat/bot-sdk"
import { LinearApiClient } from "@hazel/integrations/linear"
import { commands, IssueCommand, IssueifyCommand, GeneratedIssueSchema } from "./commands.ts"

// ============================================================================
// OpenRouter AI Layer
// ============================================================================

const OpenRouterClientLayer = OpenRouterClient.layerConfig({
	apiKey: Config.redacted("OPENROUTER_API_KEY"),
}).pipe(Layer.provide(FetchHttpClient.layer))

const OpenRouterModelLayer = OpenRouterLanguageModel.layer({
	model: "google/gemini-3-flash-preview",
}).pipe(Layer.provide(OpenRouterClientLayer))

// ============================================================================
// Bot Setup
// ============================================================================

runHazelBot({
	serviceName: "linear-bot",
	commands,
	layers: [LinearApiClient.layer],
	setup: (bot) =>
		Effect.gen(function* () {
			yield* bot.onCommand(IssueCommand, (ctx) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received /issue command from ${ctx.userId}`)

					const { title, description } = ctx.args

					yield* Effect.log(`Creating Linear issue: ${title}`)

					const { accessToken } = yield* bot.integration.getToken(ctx.orgId, "linear")

					const issue = yield* LinearApiClient.createIssue(accessToken, {
						title,
						description,
					})

					yield* Effect.log(`Created Linear issue: ${issue.identifier}`)

					yield* bot.message.send(
						ctx.channelId,
						`@[userId:${ctx.userId}] created an issue: ${issue.url}`,
					)
				}).pipe(bot.withErrorHandler(ctx)),
			)

			yield* bot.onCommand(IssueifyCommand, (ctx) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received /issueify command from ${ctx.userId}`)

					// Fetch messages from the channel
					const { data: messages } = yield* bot.message.list(ctx.channelId, {
						limit: 20,
					})

					if (messages.length === 0) {
						yield* bot.message.send(ctx.channelId, "No messages found in this channel.")
						return
					}

					const stream = yield* bot.ai.stream(ctx.channelId, {
						model: "moonshotai/kimi-k2.5 (agent)",
						loading: {
							text: "Thinking...",
							icon: "sparkle",
							throbbing: true,
						},
					})

					// Set loading text
					yield* stream.setText("🔍 Analyzing conversation...")

					// Reverse to chronological order (oldest first)
					const chronologicalMessages = [...messages].reverse()

					// Format messages for AI analysis
					const conversationText = chronologicalMessages
						.map((msg) => {
							const timestamp = new Date(msg.createdAt).toLocaleString()
							const content = msg.content.replace(/@\[userId:[^\]]+\]/g, "@user")
							return `[${timestamp}] User: ${content}`
						})
						.join("\n")

					yield* stream.setText("✨ Generating issue with AI...")

					// Use AI to generate issue title and description
					const response = yield* LanguageModel.generateText({
						prompt: [
							{
								role: "system",
								content: `You are an expert at converting chat conversations into well-structured Linear issues.
You MUST respond with ONLY a valid JSON object, no other text.

The JSON object must have exactly these fields:
- "title": A concise, actionable issue title (max 80 chars) that captures the main topic/problem
- "description": A well-structured description in markdown that includes a brief summary, key points, and any action items

Keep the description focused and professional. Don't include raw timestamps or user IDs.`,
							},
							{
								role: "user",
								content: `Convert this conversation into a Linear issue. Respond with ONLY a JSON object:

${conversationText}`,
							},
						],
					})
					const text = response.text

					// Parse the JSON response
					const generatedIssue = yield* Schema.decodeUnknown(GeneratedIssueSchema)(JSON.parse(text))

					yield* Effect.log(`Generated issue: ${generatedIssue.title}`)

					yield* stream.setText("📝 Creating Linear issue...")

					const { accessToken } = yield* bot.integration.getToken(ctx.orgId, "linear")

					const issue = yield* LinearApiClient.createIssue(accessToken, {
						title: generatedIssue.title,
						description: generatedIssue.description,
					})

					yield* Effect.log(`Created Linear issue: ${issue.identifier}`)

					// Complete the stream with success message
					yield* stream.setText(
						`@[userId:${ctx.userId}] created an issue from this conversation: ${issue.url}`,
					)
					yield* stream.complete()
				}).pipe(bot.withErrorHandler(ctx), Effect.provide(OpenRouterModelLayer)),
			)
		}),
})

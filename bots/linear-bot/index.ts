import { Config, Effect, Redacted, Schema } from "effect"
import { Command, CommandGroup, runHazelBot } from "@hazel/bot-sdk"
import { LinearApiClient } from "@hazel/integrations/linear"
import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

// ============================================================================
// Schema for AI-generated issue
// ============================================================================

const GeneratedIssueSchema = Schema.Struct({
	title: Schema.String,
	description: Schema.String,
})

// ============================================================================
// Commands
// ============================================================================

const IssueCommand = Command.make("issue", {
	description: "Create a Linear issue",
	args: {
		title: Schema.String,
		description: Schema.optional(Schema.String),
	},
	usageExample: "/issue Fix the login bug",
})

const IssueifyCommand = Command.make("issueify", {
	description: "Create a Linear issue from the conversation in this channel",
	args: {},
	usageExample: "/issueify 20",
})

const commands = CommandGroup.make(IssueCommand, IssueifyCommand)

// ============================================================================
// Bot Setup
// ============================================================================

runHazelBot({
	commands,
	layers: [LinearApiClient.Default],
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

					// Get OpenRouter API key from config
					const apiKey = yield* Config.redacted("OPENROUTER_API_KEY")
					const openrouter = createOpenRouter({ apiKey: Redacted.value(apiKey) })

					// Use AI to generate issue title and description
					const { text } = yield* Effect.promise(() =>
						generateText({
							model: openrouter("anthropic/claude-3.5-haiku"),
							system: `You are an expert at converting chat conversations into well-structured Linear issues.
You MUST respond with ONLY a valid JSON object, no other text.

The JSON object must have exactly these fields:
- "title": A concise, actionable issue title (max 80 chars) that captures the main topic/problem
- "description": A well-structured description in markdown that includes a brief summary, key points, and any action items

Keep the description focused and professional. Don't include raw timestamps or user IDs.`,
							prompt: `Convert this conversation into a Linear issue. Respond with ONLY a JSON object:

${conversationText}`,
						}),
					)

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
				}).pipe(bot.withErrorHandler(ctx)),
			)
		}),
})

import { Effect, Layer, Schema } from "effect"
import { Command, CommandGroup, runHazelBot } from "@hazel/bot-sdk"
import { LinearApiClient } from "@hazel/integrations/linear"
import { getLinearAccessToken, IntegrationLayerLive } from "./src/db.ts"

const IssueCommand = Command.make("issue", {
	description: "Create a Linear issue",
	args: {
		title: Schema.String,
		description: Schema.optional(Schema.String),
	},
	usageExample: "/issue Fix the login bug",
})

const commands = CommandGroup.make(IssueCommand)

runHazelBot({
	commands,
	layers: [Layer.mergeAll(IntegrationLayerLive, LinearApiClient.Default)],
	setup: (bot) =>
		Effect.gen(function* () {
			yield* bot.onCommand(IssueCommand, (ctx) =>
				Effect.gen(function* () {
					yield* Effect.log(`Received /issue command from ${ctx.userId}`)

					const { title, description } = ctx.args

					yield* Effect.log(`Creating Linear issue: ${title}`)

					const accessToken = yield* getLinearAccessToken(ctx.orgId)

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
		}),
})

console.log("Linear bot is running...")

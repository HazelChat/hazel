#!/usr/bin/env bun

/**
 * Linear Bot
 *
 * A bot that integrates Linear with Hazel chat using the bot SDK.
 *
 * Features:
 * - /issue create <title> - Create a new Linear issue
 * - URL unfurling - Detect Linear URLs in messages and show issue details
 */

import { Effect, Layer, Schema } from "effect"
import { Command, CommandGroup, createHazelBot, HazelBotClient } from "@hazel/bot-sdk"
import {
	LinearApiClient,
} from "@hazel/integrations/linear"
import {
	getLinearAccessToken,
	IntegrationLayerLive,
} from "./src/db.ts"

/**
 * Validate that required environment variables are present
 */
const botToken = process.env.BOT_TOKEN
if (!botToken) {
	console.error("Error: BOT_TOKEN environment variable is required")
	console.error("Please copy .env.example to .env and fill in your bot token")
	process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	console.error("Error: DATABASE_URL environment variable is required")
	console.error("Please copy .env.example to .env and configure your database connection")
	process.exit(1)
}

const encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY
if (!encryptionKey) {
	console.error("Error: INTEGRATION_ENCRYPTION_KEY environment variable is required")
	console.error("Please copy .env.example to .env and configure the encryption key")
	process.exit(1)
}

/**
 * Define typesafe slash commands
 */
const IssueCommand = Command.make("issue", {
	description: "Create a Linear issue",
	args: {
		title: Schema.String,
		description: Schema.optional(Schema.String),
	},
	usageExample: "/issue Fix the login bug",
})

const commands = CommandGroup.make(IssueCommand)

/**
 * Create the Hazel bot runtime
 */
const runtime = createHazelBot({
	botToken,
	electricUrl: process.env.ELECTRIC_URL ?? "http://localhost:8787/v1/shape",
	backendUrl: process.env.BACKEND_URL ?? "http://localhost:3003",
	redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
	commands,
})

/**
 * Compose all required layers
 */
const BotLayers = Layer.mergeAll(
	IntegrationLayerLive,
	LinearApiClient.Default,
)

/**
 * Main bot program
 */
const program = Effect.gen(function* () {
	const bot = yield* HazelBotClient

	yield* Effect.log("Starting Linear Bot...")

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

			// Send success message
			yield* bot.message.send(
				ctx.channelId,
				`@[userId:${ctx.userId}] created an issue: ${issue.url}`,
			)
		}).pipe(
			Effect.catchAll((error) =>
				Effect.gen(function* () {
					yield* Effect.logError(`Unexpected error in /issue command: ${error}`)
					yield* bot.message.send(ctx.channelId, "An unexpected error occurred. Please try again.")
				}),
			),
		),
	)
	// Start the bot
	yield* bot.start

	yield* Effect.log("Linear Bot is now running!")
	yield* Effect.log("Commands: /issue <title>")
	yield* Effect.log("Press Ctrl+C to stop")

	// Keep running
	return yield* Effect.never
})

/**
 * Graceful shutdown handler
 */
const shutdown = Effect.gen(function* () {
	yield* Effect.log("\nShutting down Linear Bot...")
	yield* Effect.log("Shutdown complete")
	process.exit(0)
})

process.on("SIGINT", () => {
	runtime.runFork(shutdown)
})

process.on("SIGTERM", () => {
	runtime.runFork(shutdown)
})

// Run the bot with all layers provided
runtime.runPromise(
	program.pipe(
		Effect.scoped,
		Effect.provide(BotLayers),
	),
)

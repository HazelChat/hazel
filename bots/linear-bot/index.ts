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

import type { OrganizationId } from "@hazel/domain/ids"
import { Effect } from "effect"
import { createHazelBot, HazelBotClient } from "@hazel/bot-sdk"
import {
	createIssue,
	extractLinearUrls,
	fetchLinearIssue,
	parseLinearIssueUrl,
	type LinearIssue,
} from "./src/linear-api.ts"
import {
	getLinearAccessToken,
	IntegrationLayerLive,
	IntegrationNotConnectedError,
	IntegrationEncryptionError,
} from "./src/db.ts"
import { LinearCommandError } from "./src/linear-api.ts"

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
 * Format a Linear issue for display in chat
 */
const formatIssue = (issue: LinearIssue) => {
	const status = issue.state ? `[${issue.state.name}]` : ""
	const assignee = issue.assignee ? `→ ${issue.assignee.name}` : ""
	const priority = issue.priorityLabel !== "No priority" ? `(${issue.priorityLabel})` : ""

	return `**${issue.teamName} ${issue.identifier}**: ${issue.title}\n${status} ${priority} ${assignee}\n${issue.url}`
}

/**
 * Create the Hazel bot runtime
 */
const runtime = createHazelBot({
	botToken,
	electricUrl: process.env.ELECTRIC_URL ?? "http://localhost:8787/v1/shape",
	backendUrl: process.env.BACKEND_URL ?? "http://localhost:3003",
	redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
	commands: [
		{
			name: "issue",
			description: "Create a Linear issue",
			arguments: [
				{
					name: "title",
					description: "The title of the issue to create",
					required: true,
					type: "string" as const,
				},
				{
					name: "description",
					description: "The description of the issue to create",
					required: false,
					type: "string" as const,
				}
			],
			usageExample: "/issue Fix the login bug",
		},
	],
})

/**
 * Helper to run database effects with the integration layer
 */
const withDb = <A, E>(effect: Effect.Effect<A, E, any>) =>
	effect.pipe(Effect.provide(IntegrationLayerLive))

/**
 * Main bot program
 */
const program = Effect.gen(function* () {
	const bot = yield* HazelBotClient

	// Channel cache for URL unfurling (maps channelId -> organizationId)
	const channelOrgMap = new Map<string, string>()

	yield* Effect.log("Starting Linear Bot...")

	// Cache channel org IDs from channel events
	yield* bot.onChannelCreated((channel) =>
		Effect.sync(() => {
			channelOrgMap.set(channel.id, channel.organizationId)
		}),
	)

	yield* bot.onChannelUpdated((channel) =>
		Effect.sync(() => {
			channelOrgMap.set(channel.id, channel.organizationId)
		}),
	)

	// Handle /issue command
	yield* bot.onCommand("issue", (ctx) =>
		Effect.gen(function* () {
			yield* Effect.log(`Received /issue command from ${ctx.userId}`)

			const title = ctx.args.title
			if (!title) {
				yield* bot.message.send(ctx.channelId, "Please provide a title for the issue. Usage: `/issue Fix the login bug`")
				return
			}

			yield* Effect.log(`Creating Linear issue: ${title}`)

			// Get the org's Linear access token from the database
			const accessToken = yield* withDb(getLinearAccessToken(ctx.orgId))

			// Create the issue directly via Linear API
			const issue = yield* createIssue(accessToken, {
				title,
			})

			yield* Effect.log(`Created Linear issue: ${issue.identifier}`)

			// Send success message
			yield* bot.message.send(
				ctx.channelId,
				`Created Linear issue: **${issue.identifier}** - ${issue.title}\n${issue.url}`,
			)
		}).pipe(
			Effect.catchAll((error) =>
				Effect.gen(function* () {
					if (error instanceof IntegrationNotConnectedError) {
						yield* bot.message.send(
							ctx.channelId,
							"Linear is not connected to this organization. Please connect Linear in the settings.",
						)
					} else if (error instanceof IntegrationEncryptionError) {
						yield* Effect.logError(`Token decryption failed: ${(error as IntegrationEncryptionError).cause}`)
						yield* bot.message.send(ctx.channelId, "Failed to access Linear integration. Please try reconnecting.")
					} else if (error instanceof LinearCommandError) {
						yield* bot.message.send(ctx.channelId, `Failed to create issue: ${error.message}`)
					} else {
						yield* Effect.logError(`Unexpected error in /issue command: ${error}`)
						yield* bot.message.send(ctx.channelId, "An unexpected error occurred. Please try again.")
					}
				}),
			),
		),
	)

	// Handle URL unfurling for Linear links
	yield* bot.onMessage((message) =>
		Effect.gen(function* () {
			// Don't process our own messages
			const auth = yield* bot.getAuthContext
			if (message.authorId === auth.userId) {
				return
			}

			// Extract Linear URLs from the message
			const linearUrls = extractLinearUrls(message.content)
			if (linearUrls.length === 0) {
				return
			}

			yield* Effect.log(`Found ${linearUrls.length} Linear URL(s) in message`)

			// Get org ID from cache or skip
			const orgId = channelOrgMap.get(message.channelId)
			if (!orgId) {
				yield* Effect.log("Channel not in cache, skipping URL unfurling")
				return
			}

			// Get the org's Linear access token
			const accessToken = yield* withDb(getLinearAccessToken(orgId as OrganizationId)).pipe(
				Effect.catchAll((error) =>
					Effect.gen(function* () {
						if (error instanceof IntegrationNotConnectedError) {
							yield* Effect.log("Linear not connected, skipping URL unfurling")
						} else if (error instanceof IntegrationEncryptionError) {
							yield* Effect.logWarning("Token decryption failed, skipping URL unfurling")
						} else {
							yield* Effect.logWarning(`Error getting Linear token: ${error}`)
						}
						return null as string | null
					}),
				),
			)

			if (!accessToken) {
				return
			}

			// Fetch and display each issue (limit to first 3 to avoid spam)
			const urlsToProcess = linearUrls.slice(0, 3)

			for (const url of urlsToProcess) {
				const parsed = parseLinearIssueUrl(url)
				if (!parsed) {
					continue
				}

				yield* fetchLinearIssue(parsed.issueKey, accessToken).pipe(
					Effect.flatMap((issue) => bot.message.reply(message, formatIssue(issue))),
					Effect.catchAll((error) => {
						if (error instanceof Error && error.message.includes("not found")) {
							return Effect.log("Linear issue not found")
						}
						return Effect.logError(`Error fetching Linear issue: ${error}`)
					}),
				)
			}
		}),
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

// Run the bot
runtime.runPromise(program.pipe(Effect.scoped))

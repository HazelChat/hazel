import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { CurrentUser, InternalServerError, UnauthorizedError, withSystemActor } from "@hazel/domain"
import {
	BotCommandExecutionAccepted,
	BotCommandExecutionError,
	BotCommandNotFoundError,
	BotMeResponse,
	BotNotFoundError,
	BotNotInstalledError,
	SyncBotCommandsResponse,
} from "@hazel/domain/http"
import { Redis } from "@hazel/effect-bun"
import { Effect, Option, Schema } from "effect"
import { HazelApi } from "../api"
import { BotCommandRepo } from "../repositories/bot-command-repo"
import { BotInstallationRepo } from "../repositories/bot-installation-repo"
import { BotRepo } from "../repositories/bot-repo"

/**
 * Hash a token using SHA-256 (Web Crypto API)
 */
async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(token)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}



export const HttpBotCommandsLive = HttpApiBuilder.group(HazelApi, "bot-commands", (handlers) =>
	handlers
		// Get bot info from token (for SDK authentication)
		.handle("getBotMe", () =>
			Effect.gen(function* () {
				// Get the Authorization header for bot token auth
				const request = yield* HttpServerRequest.HttpServerRequest
				const authHeader = request.headers.authorization

				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					return yield* Effect.fail(
						new UnauthorizedError({ message: "Missing or invalid bot token", detail: "Authorization header must be 'Bearer <token>'" }),
					)
				}

				const token = authHeader.slice(7)
				const tokenHash = yield* Effect.promise(() => hashToken(token))

				// Find bot by token hash
				const botRepo = yield* BotRepo
				const botOption = yield* botRepo.findByTokenHash(tokenHash).pipe(withSystemActor)

				if (Option.isNone(botOption)) {
					return yield* Effect.fail(
						new UnauthorizedError({ message: "Invalid bot token", detail: "No bot found with this token" }),
					)
				}

				const bot = botOption.value
				return new BotMeResponse({
					botId: bot.id,
					userId: bot.userId,
					name: bot.name,
				})
			}).pipe(
				Effect.catchTag("DatabaseError", () =>
					Effect.fail(
						new UnauthorizedError({ message: "Failed to validate bot token", detail: "Database error" }),
					),
				),
			),
		)
		// Sync commands from bot SDK (bot token auth)
		.handle("syncCommands", ({ payload }) =>
			Effect.gen(function* () {
				// Get the Authorization header for bot token auth
				const request = yield* HttpServerRequest.HttpServerRequest
				const authHeader = request.headers.authorization

				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					return yield* Effect.fail(
						new UnauthorizedError({ message: "Missing or invalid bot token", detail: "Authorization header must be 'Bearer <token>'" }),
					)
				}

				const token = authHeader.slice(7)
				const tokenHash = yield* Effect.promise(() => hashToken(token))

				// Find bot by token hash
				const botRepo = yield* BotRepo
				const botOption = yield* botRepo.findByTokenHash(tokenHash).pipe(withSystemActor)

				if (Option.isNone(botOption)) {
					return yield* Effect.fail(
						new UnauthorizedError({ message: "Invalid bot token", detail: "No bot found with this token" }),
					)
				}

				const bot = botOption.value
				const commandRepo = yield* BotCommandRepo

				// Record sync start time for stale command detection
				const syncStartTime = new Date()

				// Upsert each command (updates updatedAt to now)
				let syncedCount = 0
				for (const cmd of payload.commands) {
					yield* commandRepo
						.upsert({
							botId: bot.id,
							name: cmd.name,
							description: cmd.description,
							arguments: cmd.arguments.map((arg) => ({
								name: arg.name,
								description: arg.description ?? null,
								required: arg.required,
								placeholder: arg.placeholder ?? null,
								type: arg.type,
							})),
							usageExample: cmd.usageExample ?? null,
						})
						.pipe(withSystemActor)
					syncedCount++
				}

				// Delete commands not touched by this sync (stale commands)
				yield* commandRepo.deleteStaleCommands(bot.id, syncStartTime).pipe(withSystemActor)

				return new SyncBotCommandsResponse({ syncedCount })
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while syncing commands",
							detail: String(error),
						}),
					),
				),
			),
		)
		// Execute a bot command (user auth)
		.handle("executeBotCommand", ({ path, payload }) =>
			Effect.gen(function* () {
				const currentUser = yield* CurrentUser.Context
				const { orgId, botId, commandName } = path
				const { channelId, arguments: args } = payload

				const botRepo = yield* BotRepo
				const commandRepo = yield* BotCommandRepo
				const installationRepo = yield* BotInstallationRepo
				const redis = yield* Redis

				// Verify bot exists
				const botOption = yield* botRepo.findById(botId).pipe(withSystemActor)
				if (Option.isNone(botOption)) {
					return yield* Effect.fail(new BotNotFoundError({ botId }))
				}

				const bot = botOption.value

				// Verify bot is installed in this org
				const isInstalled = yield* installationRepo.isInstalled(botId, orgId).pipe(withSystemActor)
				if (!isInstalled) {
					return yield* Effect.fail(new BotNotInstalledError({ botId, orgId }))
				}

				// Find the command
				const commandOption = yield* commandRepo.findByBotAndName(botId, commandName).pipe(withSystemActor)
				if (Option.isNone(commandOption)) {
					return yield* Effect.fail(new BotCommandNotFoundError({ botId, commandName }))
				}

				const command = commandOption.value

				// Verify command is enabled
				if (!command.isEnabled) {
					return yield* Effect.fail(new BotCommandNotFoundError({ botId, commandName }))
				}

				// Build arguments map
				const argsMap: Record<string, string> = {}
				for (const arg of args) {
					argsMap[arg.name] = arg.value
				}

				// Publish command event to Redis
				const commandEvent = {
					type: "command" as const,
					commandName,
					channelId,
					userId: currentUser.id,
					orgId,
					arguments: argsMap,
					timestamp: Date.now(),
				}

				const channel = `bot:${botId}:commands`
				yield* redis.publish(channel, JSON.stringify(commandEvent))

				yield* Effect.log(`Published command ${commandName} to ${channel}`)

				return new BotCommandExecutionAccepted({
					message: "Command sent to bot",
				})
			}).pipe(
				Effect.catchTags({
					DatabaseError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while executing command",
								detail: String(error),
							}),
						),
					RedisError: (error) =>
						Effect.fail(
							new BotCommandExecutionError({
								commandName: path.commandName,
								message: "Failed to publish command to bot",
								details: String(error),
							}),
						),
					RedisConnectionClosedError: (error) =>
						Effect.fail(
							new BotCommandExecutionError({
								commandName: path.commandName,
								message: "Redis connection closed",
								details: String(error),
							}),
						),
					RedisAuthenticationError: (error) =>
						Effect.fail(
							new BotCommandExecutionError({
								commandName: path.commandName,
								message: "Redis authentication failed",
								details: String(error),
							}),
						),
					RedisInvalidResponseError: (error) =>
						Effect.fail(
							new BotCommandExecutionError({
								commandName: path.commandName,
								message: "Invalid Redis response",
								details: String(error),
							}),
						),
				}),
			),
		),
)

import { HttpApiBuilder } from "@effect/platform"
import { CurrentUser, InternalServerError, withSystemActor } from "@hazel/domain"
import {
	AvailableCommandsResponse,
	CommandExecutionError,
	CommandNotFoundError,
	IntegrationNotConnectedForCommandError,
	LinearIssueCreatedResponse,
	MissingRequiredArgumentError,
} from "@hazel/domain/http"
import { Effect, Option } from "effect"
import { HazelApi } from "../api"
import { BotCommandRepo } from "../repositories/bot-command-repo"
import { BotInstallationRepo } from "../repositories/bot-installation-repo"
import { BotRepo } from "../repositories/bot-repo"
import { IntegrationConnectionRepo } from "../repositories/integration-connection-repo"
import { MessageRepo } from "../repositories/message-repo"
import { IntegrationTokenService } from "../services/integration-token-service"
import { CommandRegistry } from "../services/integrations/command-registry"
import { IntegrationBotService } from "../services/integrations/integration-bot-service"
import { createIssue, type LinearCommandError } from "../services/integrations/linear-command-executor"

export const HttpIntegrationCommandLive = HttpApiBuilder.group(HazelApi, "integration-commands", (handlers) =>
	handlers
		// Get all available commands for the current organization's connected integrations
		.handle("getAvailableCommands", ({ path }) =>
			Effect.gen(function* () {
				const { orgId } = path

				const connectionRepo = yield* IntegrationConnectionRepo
				const registry = yield* CommandRegistry
				const botInstallationRepo = yield* BotInstallationRepo
				const botCommandRepo = yield* BotCommandRepo
				const botRepo = yield* BotRepo

				// Get all connections for this org
				const connections = yield* connectionRepo.findAllForOrg(orgId).pipe(withSystemActor)

				// Filter to only active connections
				const activeProviders = connections
					.filter((c) => c.status === "active")
					.map((c) => c.provider)

				// Get integration commands for connected providers
				const integrationCommands = registry.getCommandsForProviders(activeProviders)

				// Get bot commands for installed bots
				const installedBotIds = yield* botInstallationRepo.getBotIdsForOrg(orgId).pipe(withSystemActor)
				const botCommands = yield* botCommandRepo.findByBots(installedBotIds).pipe(withSystemActor)

				// Get bot info for each command
				const botCommandsWithInfo = yield* Effect.all(
					botCommands.map((cmd) =>
						Effect.gen(function* () {
							const botOption = yield* botRepo.findById(cmd.botId).pipe(withSystemActor)
							if (Option.isNone(botOption)) return null
							const bot = botOption.value
							return {
								id: cmd.id,
								name: cmd.name,
								description: cmd.description,
								provider: "bot" as const,
								arguments: (cmd.arguments ?? []).map((arg) => ({
									name: arg.name,
									description: arg.description ?? null,
									required: arg.required,
									placeholder: arg.placeholder ?? null,
									type: arg.type,
								})),
								usageExample: cmd.usageExample ?? null,
								bot: {
									id: bot.id,
									name: bot.name,
									avatarUrl: null, // TODO: Add avatar URL to bot
								},
							}
						}),
					),
					{ concurrency: "unbounded" },
				).pipe(Effect.map((results) => results.filter((r) => r !== null)))

				// Map integration commands to response format
				const mappedIntegrationCommands = integrationCommands.map((cmd) => ({
					id: cmd.id,
					name: cmd.name,
					description: cmd.description,
					provider: cmd.provider,
					arguments: cmd.arguments.map((arg) => ({
						name: arg.name,
						description: arg.description ?? null,
						required: arg.required,
						placeholder: arg.placeholder ?? null,
						type: arg.type,
					})),
					usageExample: cmd.usageExample ?? null,
					bot: {
						id: cmd.bot.id,
						name: cmd.bot.name,
						avatarUrl: cmd.bot.avatarUrl ?? null,
					},
				}))

				// Combine integration and bot commands
				return new AvailableCommandsResponse({
					commands: [...mappedIntegrationCommands, ...botCommandsWithInfo],
				})
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while fetching commands",
							detail: String(error),
						}),
					),
				),
			),
		)
		// Execute a command
		.handle("executeCommand", ({ path, payload }) =>
			Effect.gen(function* () {
				const currentUser = yield* CurrentUser.Context
				const { orgId, provider, commandId } = path
				const { channelId, arguments: args } = payload

				const registry = yield* CommandRegistry
				const connectionRepo = yield* IntegrationConnectionRepo
				const tokenService = yield* IntegrationTokenService
				const botService = yield* IntegrationBotService
				const messageRepo = yield* MessageRepo

				// Find the command definition
				const commandOption = registry.getCommand(provider, commandId)
				if (Option.isNone(commandOption)) {
					return yield* Effect.fail(new CommandNotFoundError({ provider, commandId }))
				}
				const command = commandOption.value

				// Check if organization has this provider connected
				const connectionOption = yield* connectionRepo
					.findByOrgAndProvider(orgId, provider)
					.pipe(withSystemActor)

				if (Option.isNone(connectionOption)) {
					return yield* Effect.fail(new IntegrationNotConnectedForCommandError({ provider }))
				}

				const connection = connectionOption.value

				// Check if connection is active
				if (connection.status !== "active") {
					return yield* Effect.fail(new IntegrationNotConnectedForCommandError({ provider }))
				}

				// Build arguments map
				const argsMap = new Map(args.map((a) => [a.name, a.value]))

				// Validate required arguments
				for (const argDef of command.arguments) {
					if (argDef.required && !argsMap.get(argDef.name)) {
						return yield* Effect.fail(
							new MissingRequiredArgumentError({
								argumentName: argDef.name,
								commandId,
							}),
						)
					}
				}

				// Get valid access token
				const accessToken = yield* tokenService.getValidAccessToken(connection.id)

				// Route to appropriate executor based on provider and command
				if (provider === "linear" && commandId === "linear-issue") {
					// Title is guaranteed by the required arguments validation above
					const title = argsMap.get("title") ?? ""
					const result = yield* createIssue(accessToken, {
						title,
						description: argsMap.get("description"),
					})

					// Get or create the Linear bot user (with org membership for Electric sync)
					const botUser = yield* botService.getOrCreateBotUser("linear", orgId)

					// Build message content with @mention attribution
					const messageContent = `@[userId:${currentUser.id}] created an issue:\n${result.url}`

					// Create message from bot with the issue URL
					yield* messageRepo
						.insert({
							channelId,
							authorId: botUser.id,
							content: messageContent,
							embeds: null,
							replyToMessageId: null,
							threadChannelId: null,
							deletedAt: null,
						})
						.pipe(withSystemActor)

					return new LinearIssueCreatedResponse({
						id: result.id,
						identifier: result.identifier,
						title: result.title,
						url: result.url,
						teamName: result.teamName,
					})
				}

				// Command not implemented
				return yield* Effect.fail(new CommandNotFoundError({ provider, commandId }))
			}).pipe(
				Effect.catchTags({
					TokenNotFoundError: () =>
						Effect.fail(new IntegrationNotConnectedForCommandError({ provider: path.provider })),
					LinearCommandError: (error: LinearCommandError) =>
						Effect.fail(
							new CommandExecutionError({
								commandId: path.commandId,
								message: error.message,
								details: null,
							}),
						),
					DatabaseError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while executing command",
								detail: String(error),
							}),
						),
					IntegrationEncryptionError: () =>
						Effect.fail(new IntegrationNotConnectedForCommandError({ provider: path.provider })),
					KeyVersionNotFoundError: () =>
						Effect.fail(new IntegrationNotConnectedForCommandError({ provider: path.provider })),
					TokenRefreshError: () =>
						Effect.fail(new IntegrationNotConnectedForCommandError({ provider: path.provider })),
					ConnectionNotFoundError: () =>
						Effect.fail(new IntegrationNotConnectedForCommandError({ provider: path.provider })),
					ParseError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Invalid request data",
								detail: String(error),
							}),
						),
				}),
			),
		),
)

/**
 * Bots HTTP Handler
 *
 * Handles bot SDK endpoints for command execution and bot management.
 */

import { HttpApiBuilder } from "@effect/platform"
import { ALL_BOTS, getBotById, getBotCommand } from "@hazel/bots/commands"
import { CurrentUser, InternalServerError, withSystemActor } from "@hazel/domain"
import {
	AvailableBotCommandsResponse,
	AvailableBotsResponse,
	BotAlreadyInstalledError,
	BotCommandNotFoundError,
	BotExecutionError,
	BotNotFoundError,
	BotNotInstalledError,
	ExecuteBotCommandResponse,
	InstalledBotsResponse,
	PostBotMessageResponse,
} from "@hazel/domain/http"
import { Effect, Option } from "effect"
import { HazelApi } from "../api.ts"
import { BotInstallationRepo } from "../repositories/bot-installation-repo.ts"
import { MessageRepo } from "../repositories/message-repo.ts"
import { IntegrationBotService } from "../services/integrations/integration-bot-service.ts"

// Rivet bot server URL
const BOTS_SERVER_URL = process.env.BOTS_SERVER_URL ?? "http://localhost:3030"

export const HttpBotsLive = HttpApiBuilder.group(HazelApi, "bots", (handlers) =>
	handlers
		// Get available commands for installed bots
		.handle("getAvailableCommands", ({ path }) =>
			Effect.gen(function* () {
				const { orgId } = path
				const installationRepo = yield* BotInstallationRepo

				// Get installed bots
				const installations = yield* installationRepo.findAllForOrg(orgId).pipe(withSystemActor)
				const installedBotIds = new Set(installations.map((i) => i.botId))

				// Get commands for installed bots
				const commands = ALL_BOTS.filter((bot) => installedBotIds.has(bot.id)).flatMap((bot) =>
					bot.commands.map((cmd) => ({
						id: `${bot.id}-${cmd.name}`,
						name: cmd.name,
						description: cmd.description,
						botId: bot.id,
						arguments: cmd.arguments.map((arg) => ({
							name: arg.name,
							type: arg.type,
							required: arg.required,
							placeholder: arg.placeholder ?? null,
							description: arg.description ?? null,
						})),
						usageExample: cmd.usageExample ?? null,
						bot: {
							id: bot.id,
							name: bot.name,
							avatarUrl: bot.avatar ?? null,
						},
					})),
				)

				return new AvailableBotCommandsResponse({ commands })
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
		// Execute a bot command
		.handle("executeCommand", ({ path, payload }) =>
			Effect.gen(function* () {
				const currentUser = yield* CurrentUser.Context
				const { orgId, botId, commandName } = path
				const { channelId, arguments: args } = payload

				const installationRepo = yield* BotInstallationRepo
				const messageRepo = yield* MessageRepo
				const botService = yield* IntegrationBotService

				// Check if bot is installed
				const installation = yield* installationRepo.findByOrgAndBot(orgId, botId).pipe(withSystemActor)
				if (Option.isNone(installation)) {
					return yield* Effect.fail(new BotNotInstalledError({ botId }))
				}

				// Find bot and command definition
				const botDef = getBotById(botId)
				if (!botDef) {
					return yield* Effect.fail(new BotNotInstalledError({ botId }))
				}

				const commandDef = getBotCommand(botId, commandName)
				if (!commandDef) {
					return yield* Effect.fail(new BotCommandNotFoundError({ botId, commandName }))
				}

				// Build arguments map
				const argsMap = new Map(args.map((a) => [a.name, a.value]))

				// Build actor action arguments
				const actorArgs: Record<string, unknown> = {
					orgId,
					userId: currentUser.id,
					channelId,
				}

				// Add command-specific arguments
				for (const argDef of commandDef.arguments) {
					const value = argsMap.get(argDef.name)
					if (value !== undefined) {
						actorArgs[argDef.name] = value
					}
				}

				// Call bot actor via HTTP
				// Format: POST /actors/{botId}/actions/{actionName}
				const actionUrl = `${BOTS_SERVER_URL}/actors/${botId}/actions/${commandName}`

				const response = yield* Effect.tryPromise({
					try: async () => {
						const res = await fetch(actionUrl, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(actorArgs),
						})
						if (!res.ok) {
							const error = await res.text()
							throw new Error(`Actor call failed: ${error}`)
						}
						return res.json() as Promise<{
							success?: boolean
							responseMessage?: string
							error?: string
							[key: string]: unknown
						}>
					},
					catch: (error) =>
						new BotExecutionError({
							botId,
							commandName,
							message: String(error),
						}),
				})

				// If command returned a response message, create bot message
				if (response.responseMessage) {
					// Get or create the bot user for SDK bots
					const botUser = yield* botService.getOrCreateSdkBotUser(botId, orgId)

					yield* messageRepo
						.insert({
							channelId,
							authorId: botUser.id,
							content: response.responseMessage,
							embeds: null,
							replyToMessageId: null,
							threadChannelId: null,
							deletedAt: null,
						})
						.pipe(withSystemActor)
				}

				return new ExecuteBotCommandResponse({
					success: response.success ?? true,
					responseMessage: response.responseMessage ?? null,
					error: response.error ?? null,
					data: response,
				})
			}).pipe(
				Effect.catchTags({
					DatabaseError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error during command execution",
								detail: String(error),
							}),
						),
					ParseError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Invalid request data",
								detail: String(error),
							}),
						),
				}),
			),
		)
		// Get installed bots
		.handle("getInstalledBots", ({ path }) =>
			Effect.gen(function* () {
				const { orgId } = path
				const installationRepo = yield* BotInstallationRepo

				const installations = yield* installationRepo.findAllForOrg(orgId).pipe(withSystemActor)

				const bots = installations
					.map((installation) => {
						const botDef = getBotById(installation.botId)
						if (!botDef) return null
						return {
							id: installation.id,
							botId: installation.botId,
							name: botDef.name,
							displayName: botDef.displayName,
							description: botDef.description,
							avatar: botDef.avatar ?? null,
							installedAt: installation.installedAt,
							installedBy: installation.installedBy ?? null,
						}
					})
					.filter((b): b is NonNullable<typeof b> => b !== null)

				return new InstalledBotsResponse({ bots })
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while fetching installed bots",
							detail: String(error),
						}),
					),
				),
			),
		)
		// Get available bots
		.handle("getAvailableBots", ({ path }) =>
			Effect.gen(function* () {
				const { orgId } = path
				const installationRepo = yield* BotInstallationRepo

				const installations = yield* installationRepo.findAllForOrg(orgId).pipe(withSystemActor)
				const installedBotIds = new Set(installations.map((i) => i.botId))

				const bots = ALL_BOTS.map((bot) => ({
					id: bot.id,
					name: bot.name,
					displayName: bot.displayName,
					description: bot.description,
					avatar: bot.avatar ?? null,
					installed: installedBotIds.has(bot.id),
				}))

				return new AvailableBotsResponse({ bots })
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while fetching available bots",
							detail: String(error),
						}),
					),
				),
			),
		)
		// Install a bot
		.handle("installBot", ({ path }) =>
			Effect.gen(function* () {
				const currentUser = yield* CurrentUser.Context
				const { orgId, botId } = path
				const installationRepo = yield* BotInstallationRepo

				// Check if bot exists
				const botDef = getBotById(botId)
				if (!botDef) {
					return yield* Effect.fail(new BotNotFoundError({ botId }))
				}

				// Check if already installed
				const existing = yield* installationRepo.findByOrgAndBot(orgId, botId).pipe(withSystemActor)
				if (Option.isSome(existing)) {
					return yield* Effect.fail(new BotAlreadyInstalledError({ botId }))
				}

				// Create installation
				const installation = yield* installationRepo
					.insert({
						organizationId: orgId,
						botId,
						installedBy: currentUser.id,
					})
					.pipe(withSystemActor)

				return {
					id: installation.id,
					botId: installation.botId,
					name: botDef.name,
					displayName: botDef.displayName,
					description: botDef.description,
					avatar: botDef.avatar ?? null,
					installedAt: installation.installedAt,
					installedBy: installation.installedBy ?? null,
				}
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while installing bot",
							detail: String(error),
						}),
					),
				),
			),
		)
		// Uninstall a bot
		.handle("uninstallBot", ({ path }) =>
			Effect.gen(function* () {
				const { orgId, botId } = path
				const installationRepo = yield* BotInstallationRepo

				// Check if installed
				const existing = yield* installationRepo.findByOrgAndBot(orgId, botId).pipe(withSystemActor)
				if (Option.isNone(existing)) {
					return yield* Effect.fail(new BotNotInstalledError({ botId }))
				}

				// Delete installation
				yield* installationRepo.deleteByOrgAndBot(orgId, botId).pipe(withSystemActor)
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while uninstalling bot",
							detail: String(error),
						}),
					),
				),
			),
		)
		// Post a message as a bot (internal endpoint for bot actors)
		.handle("postBotMessage", ({ path, payload }) =>
			Effect.gen(function* () {
				const { botId } = path
				const { orgId, channelId, content } = payload

				const messageRepo = yield* MessageRepo
				const botService = yield* IntegrationBotService

				// Get or create the bot user
				const botUser = yield* botService.getOrCreateSdkBotUser(botId, orgId)

				// Insert the message
				yield* messageRepo
					.insert({
						channelId,
						authorId: botUser.id,
						content,
						embeds: null,
						replyToMessageId: null,
						threadChannelId: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				return new PostBotMessageResponse({ success: true })
			}).pipe(
				Effect.catchTags({
					DatabaseError: (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while posting bot message",
								detail: String(error),
							}),
						),
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

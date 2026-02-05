import { HttpApiBuilder, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Sse } from "@effect/experimental"
import { BotCommandRepo, BotInstallationRepo, BotRepo, IntegrationConnectionRepo } from "@hazel/backend-core"
import { CurrentUser, InternalServerError, UnauthorizedError, withSystemActor } from "@hazel/domain"
import {
	BotCommandExecutionAccepted,
	BotCommandExecutionError,
	BotCommandNotFoundError,
	BotMeResponse,
	BotNotFoundError,
	BotNotInstalledError,
	EnabledIntegrationsResponse,
	IntegrationNotAllowedError,
	IntegrationNotConnectedError,
	IntegrationTokenResponse,
	SyncBotCommandsResponse,
	UpdateBotSettingsResponse,
} from "@hazel/domain/http"
import { Redis } from "@hazel/effect-bun"
import { Effect, Option, Stream } from "effect"
import { HazelApi } from "../api.ts"
import { IntegrationTokenService } from "../services/integration-token-service.ts"

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

/**
 * Validate bot token from Authorization header and return the bot
 */
const validateBotToken = Effect.gen(function* () {
	const request = yield* HttpServerRequest.HttpServerRequest
	const authHeader = request.headers.authorization

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return yield* Effect.fail(
			new UnauthorizedError({
				message: "Missing or invalid bot token",
				detail: "Authorization header must be 'Bearer <token>'",
			}),
		)
	}

	const token = authHeader.slice(7)
	const tokenHash = yield* Effect.promise(() => hashToken(token))

	const botRepo = yield* BotRepo
	const botOption = yield* botRepo.findByTokenHash(tokenHash).pipe(withSystemActor)

	if (Option.isNone(botOption)) {
		return yield* Effect.fail(
			new UnauthorizedError({
				message: "Invalid bot token",
				detail: "No bot found with this token",
			}),
		)
	}

	return botOption.value
})

export const HttpBotCommandsLive = HttpApiBuilder.group(HazelApi, "bot-commands", (handlers) =>
	handlers
		// SSE stream for bot commands (bot token auth)
		.handle("streamCommands", () =>
			Effect.gen(function* () {
				// Validate bot token
				const bot = yield* validateBotToken

				const redis = yield* Redis
				const channel = `bot:${bot.id}:commands`

				yield* Effect.logInfo(`Bot ${bot.id} (${bot.name}) connecting to SSE stream`)

				// Create SSE stream from Redis subscription
				// The stream will never error - Redis errors are logged but the stream continues
				const sseStream = Stream.async<string>((emit) => {
					Effect.gen(function* () {
						const { unsubscribe } = yield* redis.subscribe(channel, (message) => {
							// Encode the message as an SSE event
							const sseEvent = Sse.encoder.write({
								_tag: "Event",
								event: "command",
								id: undefined,
								data: message, // Already JSON string from publisher
							})
							emit.single(sseEvent)
						})

						// Add finalizer to unsubscribe when stream closes
						yield* Effect.addFinalizer(() =>
							unsubscribe.pipe(
								Effect.tap(() =>
									Effect.logDebug(`Bot ${bot.id} disconnected from SSE stream`),
								),
								Effect.catchAll(() => Effect.void),
							),
						)

						// Keep the subscription alive until the stream is closed
						yield* Effect.never
					}).pipe(
						Effect.scoped,
						Effect.catchAll((error) => {
							// Log the error but don't fail the stream - end it gracefully
							Effect.runFork(Effect.logError("Redis subscription error", { error }))
							emit.end()
							return Effect.void
						}),
						Effect.runFork,
					)
				}).pipe(
					Stream.tap(() => Effect.logDebug("Sending SSE event")),
					Stream.encodeText,
				)

				// Return SSE response
				return HttpServerResponse.stream(sseStream, {
					contentType: "text/event-stream",
					headers: {
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					},
				})
			}).pipe(
				Effect.catchTag("DatabaseError", () =>
					Effect.fail(
						new UnauthorizedError({
							message: "Failed to validate bot token",
							detail: "Database error",
						}),
					),
				),
			),
		)
		// Get bot info from token (for SDK authentication)
		.handle("getBotMe", () =>
			Effect.gen(function* () {
				const bot = yield* validateBotToken
				return new BotMeResponse({
					botId: bot.id,
					userId: bot.userId,
					name: bot.name,
				})
			}).pipe(
				Effect.catchTag("DatabaseError", () =>
					Effect.fail(
						new UnauthorizedError({
							message: "Failed to validate bot token",
							detail: "Database error",
						}),
					),
				),
			),
		)
		// Sync commands from bot SDK (bot token auth)
		.handle("syncCommands", ({ payload }) =>
			Effect.gen(function* () {
				const bot = yield* validateBotToken
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
				const commandOption = yield* commandRepo
					.findByBotAndName(botId, commandName)
					.pipe(withSystemActor)
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

				// Publish command event to Redis pub/sub
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

				yield* Effect.logDebug(`Published command ${commandName} to Redis for bot ${botId}`)

				return new BotCommandExecutionAccepted({
					message: "Command sent to bot",
				})
			}).pipe(
				Effect.catchTag("DatabaseError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while executing command",
							detail: String(error),
						}),
					),
				),
				Effect.catchTag("RedisError", (error) =>
					Effect.fail(
						new BotCommandExecutionError({
							commandName: path.commandName,
							message: "Failed to publish command to bot",
							details: String(error.message),
						}),
					),
				),
				Effect.catchTag("RedisConnectionClosedError", (error) =>
					Effect.fail(
						new BotCommandExecutionError({
							commandName: path.commandName,
							message: "Failed to publish command to bot",
							details: String(error.message),
						}),
					),
				),
				Effect.catchTag("RedisAuthenticationError", (error) =>
					Effect.fail(
						new BotCommandExecutionError({
							commandName: path.commandName,
							message: "Failed to publish command to bot",
							details: String(error.message),
						}),
					),
				),
				Effect.catchTag("RedisInvalidResponseError", (error) =>
					Effect.fail(
						new BotCommandExecutionError({
							commandName: path.commandName,
							message: "Failed to publish command to bot",
							details: String(error.message),
						}),
					),
				),
			),
		)
		// Get integration token (bot token auth)
		.handle("getIntegrationToken", ({ path }) =>
			Effect.gen(function* () {
				const bot = yield* validateBotToken
				const { orgId, provider } = path

				// Check provider is in bot's allowedIntegrations
				const allowed = bot.allowedIntegrations ?? []
				if (!allowed.includes(provider)) {
					return yield* Effect.fail(new IntegrationNotAllowedError({ botId: bot.id, provider }))
				}

				// Verify bot is installed in this org
				const installationRepo = yield* BotInstallationRepo
				const isInstalled = yield* installationRepo.isInstalled(bot.id, orgId).pipe(withSystemActor)
				if (!isInstalled) {
					return yield* Effect.fail(new BotNotInstalledError({ botId: bot.id, orgId }))
				}

				// Find active integration connection for the org
				const connectionRepo = yield* IntegrationConnectionRepo
				const connectionOption = yield* connectionRepo
					.findOrgConnection(orgId, provider)
					.pipe(withSystemActor)

				if (Option.isNone(connectionOption)) {
					return yield* Effect.fail(new IntegrationNotConnectedError({ provider }))
				}

				const connection = connectionOption.value

				// Verify connection is active
				if (connection.status !== "active") {
					return yield* Effect.fail(new IntegrationNotConnectedError({ provider }))
				}

				// Get valid (auto-refreshed) access token
				const tokenService = yield* IntegrationTokenService
				const accessToken = yield* tokenService.getValidAccessToken(connection.id)

				yield* Effect.logInfo("AUDIT: Bot accessed integration token", {
					event: "bot_integration_token_access",
					botId: bot.id,
					orgId,
					provider,
				})

				return new IntegrationTokenResponse({
					accessToken,
					provider,
					expiresAt: connection.lastUsedAt?.toISOString() ?? null,
				})
			}).pipe(
				Effect.catchTag("DatabaseError", () =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while fetching integration token",
							detail: "Database error",
						}),
					),
				),
				Effect.catchTag("TokenNotFoundError", () =>
					Effect.fail(new IntegrationNotConnectedError({ provider: path.provider })),
				),
				Effect.catchTag("TokenRefreshError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: `Failed to refresh ${path.provider} token`,
							detail: String(error.cause),
						}),
					),
				),
				Effect.catchTag("ConnectionNotFoundError", () =>
					Effect.fail(new IntegrationNotConnectedError({ provider: path.provider })),
				),
				Effect.catchTag("IntegrationEncryptionError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: `Failed to decrypt ${path.provider} token`,
							detail: String(error),
						}),
					),
				),
				Effect.catchTag("KeyVersionNotFoundError", (error) =>
					Effect.fail(
						new InternalServerError({
							message: `Encryption key version not found for ${path.provider} token`,
							detail: String(error),
						}),
					),
				),
			),
		)
		// Get enabled integrations (bot token auth)
		.handle("getEnabledIntegrations", ({ path }) =>
			Effect.gen(function* () {
				const bot = yield* validateBotToken
				const { orgId } = path

				// Verify bot is installed in this org
				const installationRepo = yield* BotInstallationRepo
				const isInstalled = yield* installationRepo.isInstalled(bot.id, orgId).pipe(withSystemActor)
				if (!isInstalled) {
					return yield* Effect.fail(new BotNotInstalledError({ botId: bot.id, orgId }))
				}

				// Get bot's allowed integrations
				const allowedIntegrations = bot.allowedIntegrations ?? []
				if (allowedIntegrations.length === 0) {
					return new EnabledIntegrationsResponse({ providers: [] })
				}

				// Find active integration connections for the org
				const connectionRepo = yield* IntegrationConnectionRepo
				const activeConnections = yield* connectionRepo
					.findActiveOrgConnections(orgId)
					.pipe(withSystemActor)

				// Compute intersection: providers that are both allowed AND connected
				const activeProviders = new Set(activeConnections.map((c) => c.provider))
				const enabledProviders = allowedIntegrations.filter((provider) =>
					activeProviders.has(provider),
				)

				return new EnabledIntegrationsResponse({ providers: enabledProviders })
			}).pipe(
				Effect.catchTag("DatabaseError", () =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while fetching enabled integrations",
							detail: "Database error",
						}),
					),
				),
			),
		)
		// Update bot settings (bot token auth)
		.handle("updateBotSettings", ({ payload }) =>
			Effect.gen(function* () {
				const bot = yield* validateBotToken
				const botRepo = yield* BotRepo

				// Build update object with only provided fields
				const updates: { id: typeof bot.id; mentionable?: boolean } = { id: bot.id }

				if (payload.mentionable !== undefined) {
					updates.mentionable = payload.mentionable
				}

				// Only update if there are fields to update
				if (Object.keys(updates).length > 1) {
					yield* botRepo.update(updates).pipe(withSystemActor)
					yield* Effect.logDebug(`Updated bot ${bot.id} settings`, { updates })
				}

				return new UpdateBotSettingsResponse({ success: true })
			}).pipe(
				Effect.catchTag("DatabaseError", () =>
					Effect.fail(
						new InternalServerError({
							message: "Database error while updating bot settings",
							detail: "Database error",
						}),
					),
				),
			),
		),
)

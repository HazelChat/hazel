/**
 * Hazel Bot SDK - Convenience layer for Hazel chat app integrations
 *
 * This module provides a simplified, Hazel-specific API on top of the generic bot-sdk.
 * All Hazel domain schemas are pre-configured, making it trivial to build integrations.
 */

import { FetchHttpClient, HttpApiClient } from "@effect/platform"
import type {
	AttachmentId,
	ChannelId,
	ChannelMemberId,
	MessageId,
	OrganizationId,
	TypingIndicatorId,
	UserId,
} from "@hazel/domain/ids"
import type { IntegrationConnection } from "@hazel/domain/models"
import { HazelApi } from "@hazel/domain/http"
import { Channel, ChannelMember, Message } from "@hazel/domain/models"
import { createTracingLayer } from "@hazel/effect-bun/Telemetry"
import {
	Config,
	Context,
	Duration,
	Effect,
	Layer,
	LogLevel,
	ManagedRuntime,
	Option,
	RateLimiter,
	Redacted,
	Schema,
} from "effect"
import { BotAuth, createAuthContextFromToken } from "./auth.ts"
import { createLoggerLayer, type BotLogConfig, type LogFormat } from "./log-config.ts"
import { createCommandLogContext, withLogContext, type BotIdentity } from "./log-context.ts"
import { createBotClientTag } from "./bot-client.ts"
import {
	CommandGroup,
	EmptyCommandGroup,
	type CommandDef,
	type EmptyCommands,
	type TypedCommandContext,
} from "./command.ts"
import type { HandlerError } from "./errors.ts"
import { BotRpcClient, BotRpcClientConfigTag, BotRpcClientLive } from "./rpc/client.ts"
import type { EventQueueConfig } from "./services/index.ts"
import {
	SseCommandListener,
	SseCommandListenerLive,
	ElectricEventQueue,
	EventDispatcher,
	ShapeStreamSubscriber,
} from "./services/index.ts"
import { extractTablesFromEventTypes } from "./types/events.ts"

/**
 * Internal configuration context for HazelBotClient
 * Contains commands to sync and backend URL for HTTP calls
 */
export interface HazelBotRuntimeConfig<Commands extends CommandGroup<any> = CommandGroup<any>> {
	readonly backendUrl: string
	readonly botToken: string
	readonly commands: Commands
}

export class HazelBotRuntimeConfigTag extends Context.Tag("@hazel/bot-sdk/HazelBotRuntimeConfig")<
	HazelBotRuntimeConfigTag,
	HazelBotRuntimeConfig
>() {}

/**
 * Pre-configured Hazel domain subscriptions
 * Includes: messages, channels, channel_members with their schemas
 */
export const HAZEL_SUBSCRIPTIONS = [
	{
		table: "messages",
		schema: Message.Model.json,
		startFromNow: true,
	},
	{
		table: "channels",
		schema: Channel.Model.json,
		startFromNow: true,
	},
	{
		table: "channel_members",
		schema: ChannelMember.Model.json,
		startFromNow: true,
	},
] as const

/**
 * Hazel-specific type aliases for convenience
 */
export type MessageType = Schema.Schema.Type<typeof Message.Model.json>
export type ChannelType = Schema.Schema.Type<typeof Channel.Model.json>
export type ChannelMemberType = Schema.Schema.Type<typeof ChannelMember.Model.json>

/**
 * Hazel-specific event handlers
 */
export type MessageHandler<E = HandlerError, R = never> = (message: MessageType) => Effect.Effect<void, E, R>
export type ChannelHandler<E = HandlerError, R = never> = (channel: ChannelType) => Effect.Effect<void, E, R>
export type ChannelMemberHandler<E = HandlerError, R = never> = (
	member: ChannelMemberType,
) => Effect.Effect<void, E, R>

/**
 * Typed command handler - receives CommandContext with typed args
 */
export type CommandHandler<Args, E = HandlerError, R = never> = (
	ctx: TypedCommandContext<Args>,
) => Effect.Effect<void, E, R>

// Re-export command types for convenience
export {
	Command,
	CommandGroup,
	type CommandDef,
	type CommandNames,
	type TypedCommandContext,
} from "./command.ts"

/**
 * Options for sending a message
 */
export interface SendMessageOptions {
	/** Reply to a specific message */
	readonly replyToMessageId?: MessageId | null
	/** Send message in a thread */
	readonly threadChannelId?: ChannelId | null
	/** Attachment IDs to include */
	readonly attachmentIds?: readonly AttachmentId[]
}

/**
 * Hazel Bot Client - Effect Service with typed convenience methods
 * Uses scoped: since it manages scoped resources (RateLimiter)
 */
export class HazelBotClient extends Effect.Service<HazelBotClient>()("HazelBotClient", {
	accessors: true,
	scoped: Effect.gen(function* () {
		// Get the typed BotClient for Hazel subscriptions
		const bot = yield* createBotClientTag<typeof HAZEL_SUBSCRIPTIONS>()
		// Get the RPC client from context
		const rpc = yield* BotRpcClient
		// Get the RPC client config (for HTTP API calls)
		const rpcClientConfig = yield* BotRpcClientConfigTag
		// Create typed HTTP API client for public API endpoints
		const httpApiClient = yield* HttpApiClient.make(HazelApi, {
			baseUrl: rpcClientConfig.backendUrl,
		}).pipe(
			Effect.provide(
				FetchHttpClient.layer.pipe(
					Layer.provide(
						Layer.succeed(FetchHttpClient.RequestInit, {
							headers: { Authorization: `Bearer ${rpcClientConfig.botToken}` },
						}),
					),
				),
			),
		)
		// Get auth context (contains botId, botName, userId for message authoring)
		const authContext = yield* bot.getAuthContext

		// Create bot identity for log context
		const botIdentity: BotIdentity = {
			botId: authContext.botId,
			botName: authContext.botName,
		}

		// Create rate limiter for outbound message operations
		// Default: 10 messages per second to prevent API rate limiting
		const messageLimiter = yield* RateLimiter.make({
			limit: 10,
			interval: Duration.seconds(1),
		})

		// Get the runtime config (optional - contains commands to sync)
		const runtimeConfigOption = yield* Effect.serviceOption(HazelBotRuntimeConfigTag)
		// Try to get the command listener (optional - only available if commands are configured)
		const commandListenerOption = yield* Effect.serviceOption(SseCommandListener)

		// Command handler registry - stores handlers keyed by command name
		// biome-ignore lint/suspicious/noExplicitAny: handlers are typed at registration, stored loosely
		const commandHandlers = new Map<
			string,
			(ctx: TypedCommandContext<any>) => Effect.Effect<void, any, any>
		>()

		// Get command group from runtime config for schema decoding
		const commandGroup = Option.map(runtimeConfigOption, (c) => c.commands)

		/**
		 * Convert Schema.Struct fields to backend argument format
		 */
		const schemaFieldsToArgs = (fields: Schema.Struct.Fields) => {
			return Object.entries(fields).map(([name, fieldSchema]) => {
				// Check if the field is optional by looking at the schema's AST
				// PropertySignature with isOptional or Schema with optional wrapper
				const isOptional =
					"isOptional" in fieldSchema && typeof fieldSchema.isOptional === "boolean"
						? fieldSchema.isOptional
						: false
				return {
					name,
					required: !isOptional,
					type: "string" as const, // For now, all args are strings from the frontend
					description: undefined,
					placeholder: undefined,
				}
			})
		}

		/**
		 * Sync commands with the backend via HTTP (type-safe HttpApiClient)
		 * Uses Option.match for cleaner handling
		 */
		const syncCommands = Option.match(runtimeConfigOption, {
			onNone: () => Effect.void,
			onSome: (config) =>
				Effect.gen(function* () {
					const cmds = config.commands.commands
					if (cmds.length === 0) {
						return
					}

					yield* Effect.logDebug(`Syncing ${cmds.length} commands with backend...`)

					// Call the sync endpoint using type-safe HttpApiClient
					const response = yield* httpApiClient["bot-commands"].syncCommands({
						payload: {
							commands: cmds.map((cmd: CommandDef) => ({
								name: cmd.name,
								description: cmd.description,
								arguments: schemaFieldsToArgs(cmd.args),
								usageExample: cmd.usageExample ?? null,
							})),
						},
					})

					yield* Effect.logDebug(`Synced ${response.syncedCount} commands successfully`)
				}),
		})

		return {
			/**
			 * Register a handler for new messages
			 */
			onMessage: <E = HandlerError, R = never>(handler: MessageHandler<E, R>) =>
				bot.on("messages.insert", handler),

			/**
			 * Register a handler for message updates
			 */
			onMessageUpdate: <E = HandlerError, R = never>(handler: MessageHandler<E, R>) =>
				bot.on("messages.update", handler),

			/**
			 * Register a handler for message deletes
			 */
			onMessageDelete: <E = HandlerError, R = never>(handler: MessageHandler<E, R>) =>
				bot.on("messages.delete", handler),

			/**
			 * Register a handler for new channels
			 */
			onChannelCreated: <E = HandlerError, R = never>(handler: ChannelHandler<E, R>) =>
				bot.on("channels.insert", handler),

			/**
			 * Register a handler for channel updates
			 */
			onChannelUpdated: <E = HandlerError, R = never>(handler: ChannelHandler<E, R>) =>
				bot.on("channels.update", handler),

			/**
			 * Register a handler for channel deletes
			 */
			onChannelDeleted: <E = HandlerError, R = never>(handler: ChannelHandler<E, R>) =>
				bot.on("channels.delete", handler),

			/**
			 * Register a handler for new channel members
			 */
			onChannelMemberAdded: <E = HandlerError, R = never>(handler: ChannelMemberHandler<E, R>) =>
				bot.on("channel_members.insert", handler),

			/**
			 * Register a handler for removed channel members
			 */
			onChannelMemberRemoved: <E = HandlerError, R = never>(handler: ChannelMemberHandler<E, R>) =>
				bot.on("channel_members.delete", handler),

			/**
			 * Message operations - send, reply, update, delete, react
			 * Uses the public HTTP API at /api/v1/messages with type-safe HttpApiClient
			 * All operations are rate-limited to prevent API throttling
			 */
			message: {
				/**
				 * Send a message to a channel
				 * @param channelId - The channel to send the message to
				 * @param content - Message content
				 * @param options - Optional settings (reply, thread, attachments)
				 */
				send: (channelId: ChannelId, content: string, options?: SendMessageOptions) =>
					messageLimiter(
						httpApiClient["api-v1-messages"]
							.createMessage({
								payload: {
									channelId,
									content,
									replyToMessageId: options?.replyToMessageId ?? null,
									threadChannelId: options?.threadChannelId ?? null,
									attachmentIds: options?.attachmentIds
										? [...options.attachmentIds]
										: undefined,
									embeds: null,
								},
							})
							.pipe(
								Effect.map((r) => r.data),
								Effect.withSpan("bot.message.send", { attributes: { channelId } }),
							),
					),

				/**
				 * Reply to a message
				 * @param message - The message to reply to
				 * @param content - Reply content
				 * @param options - Optional settings (thread, attachments)
				 */
				reply: (
					message: MessageType,
					content: string,
					options?: Omit<SendMessageOptions, "replyToMessageId">,
				) =>
					messageLimiter(
						httpApiClient["api-v1-messages"]
							.createMessage({
								payload: {
									channelId: message.channelId,
									content,
									replyToMessageId: message.id,
									threadChannelId: options?.threadChannelId ?? null,
									attachmentIds: options?.attachmentIds
										? [...options.attachmentIds]
										: undefined,
									embeds: null,
								},
							})
							.pipe(
								Effect.map((r) => r.data),
								Effect.withSpan("bot.message.reply", {
									attributes: {
										channelId: message.channelId,
										replyToMessageId: message.id,
									},
								}),
							),
					),

				/**
				 * Update a message
				 * @param message - The message to update (requires id)
				 * @param content - New content
				 */
				update: (message: MessageType, content: string) =>
					messageLimiter(
						httpApiClient["api-v1-messages"]
							.updateMessage({
								path: { id: message.id },
								payload: { content },
							})
							.pipe(
								Effect.map((r) => r.data),
								Effect.withSpan("bot.message.update", {
									attributes: { messageId: message.id },
								}),
							),
					),

				/**
				 * Delete a message
				 * @param id - Message ID to delete
				 */
				delete: (id: MessageId) =>
					messageLimiter(
						httpApiClient["api-v1-messages"]
							.deleteMessage({
								path: { id },
							})
							.pipe(Effect.withSpan("bot.message.delete", { attributes: { messageId: id } })),
					),

				/**
				 * Toggle a reaction on a message
				 * @param message - The message to react to
				 * @param emoji - Emoji to toggle
				 */
				react: (message: MessageType, emoji: string) =>
					messageLimiter(
						httpApiClient["api-v1-messages"]
							.toggleReaction({
								path: { id: message.id },
								payload: {
									emoji,
									channelId: message.channelId,
								},
							})
							.pipe(
								Effect.withSpan("bot.message.react", {
									attributes: { messageId: message.id, emoji },
								}),
							),
					),
			},

			/**
			 * Channel operations - update
			 */
			channel: {
				/**
				 * Update a channel
				 * @param channel - The channel to update (requires full channel object)
				 * @param updates - Fields to update
				 */
				update: (
					channel: ChannelType,
					updates: {
						name?: string
						description?: string | null
					},
				) =>
					rpc.channel
						.update({
							id: channel.id,
							type: channel.type,
							organizationId: channel.organizationId,
							parentChannelId: channel.parentChannelId,
							name: updates.name ?? channel.name,
							...updates,
						})
						.pipe(
							Effect.map((r) => r.data),
							Effect.withSpan("bot.channel.update", { attributes: { channelId: channel.id } }),
						),
			},

			/**
			 * Typing indicator operations
			 */
			typing: {
				/**
				 * Start showing typing indicator
				 * @param channelId - Channel ID
				 * @param memberId - Channel member ID
				 */
				start: (channelId: ChannelId, memberId: ChannelMemberId) =>
					rpc.typingIndicator
						.create({
							channelId,
							memberId,
							lastTyped: Date.now(),
						})
						.pipe(
							Effect.map((r) => r.data),
							Effect.withSpan("bot.typing.start", { attributes: { channelId, memberId } }),
						),

				/**
				 * Stop showing typing indicator
				 * @param id - Typing indicator ID
				 */
				stop: (id: TypingIndicatorId) =>
					rpc.typingIndicator
						.delete({
							id,
						})
						.pipe(
							Effect.map((r) => r.data),
							Effect.withSpan("bot.typing.stop", { attributes: { typingIndicatorId: id } }),
						),
			},

			/**
			 * Integration operations - get OAuth tokens for connected integrations
			 * Requires the provider to be listed in the bot's `allowedIntegrations`
			 */
			integration: {
				/**
				 * Get a valid OAuth access token for an integration provider.
				 * The token is auto-refreshed if expired.
				 *
				 * @param orgId - The organization ID to get the token for
				 * @param provider - The integration provider ("linear" | "github" | "figma" | "notion")
				 * @returns The access token, provider, and expiry info
				 *
				 * @example
				 * ```typescript
				 * const { accessToken } = yield* bot.integration.getToken(orgId, "linear")
				 * // Use accessToken to call Linear API directly
				 * ```
				 */
				getToken: (orgId: OrganizationId, provider: IntegrationConnection.IntegrationProvider) =>
					httpApiClient["bot-commands"].getIntegrationToken({ path: { orgId, provider } }).pipe(
						Effect.withSpan("bot.integration.getToken", {
							attributes: { orgId, provider },
						}),
					),
			},

			/**
			 * Register a handler for a slash command (typesafe version)
			 * @param command - The command definition created with Command.make
			 * @param handler - Handler function that receives typed CommandContext
			 *
			 * @example
			 * ```typescript
			 * const EchoCommand = Command.make("echo", {
			 *   description: "Echo text back",
			 *   args: { text: Schema.String },
			 * })
			 *
			 * yield* bot.onCommand(EchoCommand, (ctx) =>
			 *   Effect.gen(function* () {
			 *     yield* bot.message.send(ctx.channelId, `Echo: ${ctx.args.text}`)
			 *   })
			 * )
			 * ```
			 */
			onCommand: <Name extends string, Args extends Schema.Struct.Fields, E = HandlerError, R = never>(
				command: CommandDef<Name, Args>,
				handler: CommandHandler<Schema.Schema.Type<Schema.Struct<Args>>, E, R>,
			) =>
				Effect.sync(() => {
					commandHandlers.set(
						command.name,
						handler as (ctx: TypedCommandContext<any>) => Effect.Effect<void, any, any>,
					)
				}),

			/**
			 * Create an error handler wrapper for command handlers.
			 * Logs errors and sends a user-friendly message to the channel.
			 *
			 * @param ctx - The command context (for channelId and commandName)
			 * @returns A function that wraps an effect with error handling
			 *
			 * @example
			 * ```typescript
			 * yield* bot.onCommand(MyCommand, (ctx) =>
			 *   Effect.gen(function* () {
			 *     // ... command logic
			 *   }).pipe(bot.withErrorHandler(ctx))
			 * )
			 * ```
			 */
			withErrorHandler:
				<Args>(ctx: TypedCommandContext<Args>) =>
				<A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A | void, never, R> =>
					effect.pipe(
						Effect.catchAll((error) =>
							Effect.gen(function* () {
								yield* Effect.logError(`Error in /${ctx.commandName} command`, { error })
								yield* messageLimiter(
									httpApiClient["api-v1-messages"]
										.createMessage({
											payload: {
												channelId: ctx.channelId,
												content: "An unexpected error occurred. Please try again.",
												replyToMessageId: null,
												threadChannelId: null,
												embeds: null,
											},
										})
										.pipe(Effect.ignore),
								)
							}),
						),
					),

			/**
			 * Start the bot client
			 * Syncs commands with backend and begins listening to events (Electric + Redis commands)
			 */
			start: Effect.gen(function* () {
				yield* Effect.logDebug("Starting bot client...")

				// Sync commands with backend (if configured)
				yield* syncCommands

				// Start Electric event listener
				yield* bot.start

				// Start Redis command dispatcher (if listener is available)
				// Note: RedisCommandListener now auto-starts on construction
				yield* Option.match(commandListenerOption, {
					onNone: () => Effect.void,
					onSome: (commandListener) =>
						Effect.gen(function* () {
							// Start command dispatcher fiber
							yield* Effect.forkScoped(
								Effect.forever(
									Effect.gen(function* () {
										const event = yield* commandListener.take

										const handler = commandHandlers.get(event.commandName)
										if (!handler) {
											yield* Effect.logWarning(
												`No handler for command: ${event.commandName}`,
											)
											return
										}

										// Find the command definition to decode args
										const cmdDef = Option.flatMap(commandGroup, (group) =>
											Option.fromNullable(
												group.commands.find(
													(c: CommandDef) => c.name === event.commandName,
												),
											),
										)

										// Decode args using the command's schema if available
										// Uses Option.match for cleaner handling
										const decodedArgs = yield* Option.match(cmdDef, {
											onNone: () => Effect.succeed(event.arguments),
											onSome: (def) =>
												Schema.decodeUnknown(def.argsSchema)(event.arguments).pipe(
													Effect.catchAll(() => Effect.succeed(event.arguments)),
												),
										})

										const ctx: TypedCommandContext<unknown> = {
											commandName: event.commandName,
											channelId: event.channelId as ChannelId,
											userId: event.userId as UserId,
											orgId: event.orgId as OrganizationId,
											args: decodedArgs,
											timestamp: event.timestamp,
										}

										// Create log context for this command invocation
										const logCtx = createCommandLogContext({
											...botIdentity,
											commandName: event.commandName,
											channelId: event.channelId as ChannelId,
											userId: event.userId as UserId,
											orgId: event.orgId as OrganizationId,
										})

										yield* withLogContext(
											logCtx,
											"bot.command.handle",
											handler(ctx).pipe(
												Effect.catchAllCause((cause) =>
													Effect.logError(
														`Command handler failed for ${event.commandName}`,
														{ cause },
													),
												),
											),
										)
									}),
								),
							)

							yield* Effect.logDebug("Command dispatcher started")
						}),
				})

				yield* Effect.logDebug("Bot client started successfully")
			}),

			/**
			 * Get bot authentication context
			 */
			getAuthContext: bot.getAuthContext,
		}
	}),
}) {}

/**
 * Configuration for creating a Hazel bot
 */
export interface HazelBotConfig<Commands extends CommandGroup<any> = EmptyCommands> {
	/**
	 * Electric proxy URL
	 * @default "https://electric.hazel.sh/v1/shape"
	 * @example "http://localhost:8787/v1/shape" // For local development
	 */
	readonly electricUrl?: string

	/**
	 * Backend URL for RPC API calls and SSE command streaming
	 * @default "https://api.hazel.sh"
	 * @example "http://localhost:3003" // For local development
	 */
	readonly backendUrl?: string

	/**
	 * Bot authentication token (required)
	 */
	readonly botToken: string

	/**
	 * Slash commands this bot supports (optional)
	 * Commands are synced to the backend on start and appear in the / autocomplete
	 *
	 * @example
	 * ```typescript
	 * const EchoCommand = Command.make("echo", {
	 *   description: "Echo text back",
	 *   args: { text: Schema.String },
	 * })
	 *
	 * const commands = CommandGroup.make(EchoCommand)
	 * ```
	 */
	readonly commands?: Commands

	/**
	 * Event queue configuration (optional)
	 */
	readonly queueConfig?: EventQueueConfig

	/**
	 * Event dispatcher configuration (optional)
	 */
	readonly dispatcherConfig?: import("./services/event-dispatcher.ts").EventDispatcherConfig

	/**
	 * Service name for tracing (optional)
	 * @default "hazel-bot"
	 */
	readonly serviceName?: string

	/**
	 * Logging configuration (optional)
	 *
	 * @example
	 * ```typescript
	 * const runtime = createHazelBot({
	 *   botToken: process.env.BOT_TOKEN!,
	 *   logging: {
	 *     level: LogLevel.Debug,  // Enable DEBUG logs
	 *     format: "pretty",       // Human-readable output
	 *   },
	 * })
	 * ```
	 */
	readonly logging?: {
		/**
		 * Minimum log level to output
		 * @default LogLevel.Info
		 */
		readonly level?: LogLevel.LogLevel
		/**
		 * Output format: "pretty" for development, "structured" for production
		 * @default Automatic based on NODE_ENV
		 */
		readonly format?: LogFormat
	}
}

/**
 * Create a Hazel bot runtime with pre-configured subscriptions
 *
 * This is the simplest way to create a bot for Hazel integrations.
 * All Hazel domain schemas (messages, channels, channel_members) are pre-configured.
 *
 * @example
 * ```typescript
 * import { createHazelBot, HazelBotClient, Command, CommandGroup } from "@hazel/bot-sdk"
 * import { Schema } from "effect"
 *
 * // Define typesafe commands
 * const EchoCommand = Command.make("echo", {
 *   description: "Echo text back",
 *   args: { text: Schema.String },
 * })
 *
 * const commands = CommandGroup.make(EchoCommand)
 *
 * const runtime = createHazelBot({
 *   botToken: process.env.BOT_TOKEN!,
 *   commands,
 * })
 *
 * const program = Effect.gen(function* () {
 *   const bot = yield* HazelBotClient
 *
 *   // Typesafe command handler - ctx.args.text is typed as string
 *   yield* bot.onCommand(EchoCommand, (ctx) =>
 *     Effect.gen(function* () {
 *       yield* bot.message.send(ctx.channelId, `Echo: ${ctx.args.text}`)
 *     })
 *   )
 *
 *   yield* bot.start
 * })
 *
 * runtime.runPromise(program.pipe(Effect.scoped))
 * ```
 */
export const createHazelBot = <Commands extends CommandGroup<any> = EmptyCommands>(
	config: HazelBotConfig<Commands>,
): ManagedRuntime.ManagedRuntime<HazelBotClient, unknown> => {
	// Apply defaults for URLs
	const electricUrl = config.electricUrl ?? "https://electric.hazel.sh/v1/shape"
	const backendUrl = config.backendUrl ?? "https://api.hazel.sh"

	// Create all the required layers using layerConfig pattern
	const EventQueueLayer = ElectricEventQueue.layerConfig(
		Config.succeed(
			config.queueConfig ?? {
				capacity: 1000,
				backpressureStrategy: "sliding" as const,
			},
		),
	)

	const ShapeSubscriberLayer = ShapeStreamSubscriber.layerConfig(
		Config.succeed({
			electricUrl,
			botToken: config.botToken,
			subscriptions: HAZEL_SUBSCRIPTIONS,
		}),
	)

	const EventDispatcherLayer = EventDispatcher.layerConfig(
		Config.succeed(
			config.dispatcherConfig ?? {
				maxRetries: 3,
				retryBaseDelay: 100,
			},
		),
	)

	const AuthLayer = Layer.unwrapEffect(
		createAuthContextFromToken(config.botToken, backendUrl).pipe(
			Effect.map((context) => BotAuth.Default(context)),
		),
	)

	// Create the RPC client config layer
	const RpcClientConfigLayer = Layer.succeed(BotRpcClientConfigTag, {
		backendUrl,
		botToken: config.botToken,
	})

	// Create the scoped RPC client layer
	const RpcClientLayer = BotRpcClientLive.pipe(Layer.provide(RpcClientConfigLayer))

	// Create SSE command listener layer if commands are configured
	const hasCommands = config.commands && config.commands.commands.length > 0
	const CommandListenerLayer = hasCommands
		? Layer.provide(
				SseCommandListenerLive({
					backendUrl,
					botToken: Redacted.make(config.botToken),
				}),
				AuthLayer,
			)
		: Layer.empty

	// Create runtime config layer for command syncing
	const RuntimeConfigLayer = hasCommands
		? Layer.succeed(HazelBotRuntimeConfigTag, {
				backendUrl,
				botToken: config.botToken,
				commands: config.commands ?? EmptyCommandGroup,
			})
		: Layer.empty

	// Create the typed BotClient layer for Hazel subscriptions
	const BotClientTag = createBotClientTag<typeof HAZEL_SUBSCRIPTIONS>()
	const BotClientLayer = Layer.effect(
		BotClientTag,
		Effect.gen(function* () {
			const dispatcher = yield* EventDispatcher
			const subscriber = yield* ShapeStreamSubscriber
			const auth = yield* BotAuth

			return {
				on: (eventType, handler) => dispatcher.on(eventType, handler),
				start: Effect.gen(function* () {
					yield* Effect.logDebug("Starting bot client...")

					// Derive required tables from registered event handlers
					const eventTypes = yield* dispatcher.registeredEventTypes
					const requiredTables = extractTablesFromEventTypes(eventTypes)

					// Start shape stream subscriptions (only for tables with handlers)
					yield* subscriber.start(requiredTables)
					yield* dispatcher.start
					yield* Effect.logDebug("Bot client started successfully")
				}),
				getAuthContext: auth.getContext.pipe(Effect.orDie),
			}
		}),
	)

	// Create logger layer with configurable level and format
	// Defaults: INFO level, format based on NODE_ENV
	const LoggerLayer = Layer.unwrapEffect(
		Effect.gen(function* () {
			const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("development"))
			const defaultFormat: LogFormat = nodeEnv === "production" ? "structured" : "pretty"

			const logConfig: BotLogConfig = {
				level: config.logging?.level ?? LogLevel.Info,
				format: config.logging?.format ?? defaultFormat,
			}

			return createLoggerLayer(logConfig)
		}),
	)

	// Create tracing layer with configurable service name
	const TracingLayer = createTracingLayer(config.serviceName ?? "hazel-bot")

	// Compose all layers with proper dependency order
	const AllLayers = HazelBotClient.Default.pipe(
		Layer.provide(BotClientLayer),
		Layer.provide(RpcClientLayer),
		Layer.provide(RpcClientConfigLayer),
		Layer.provide(CommandListenerLayer),
		Layer.provide(RuntimeConfigLayer),
		Layer.provide(
			Layer.mergeAll(
				Layer.provide(EventDispatcherLayer, EventQueueLayer),
				Layer.provide(ShapeSubscriberLayer, EventQueueLayer),
				AuthLayer,
			),
		),
		Layer.provide(LoggerLayer),
		Layer.provide(TracingLayer),
	)

	// Create runtime
	return ManagedRuntime.make(AllLayers)
}

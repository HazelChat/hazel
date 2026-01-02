/**
 * Hazel Bot SDK - Convenience layer for Hazel chat app integrations
 *
 * This module provides a simplified, Hazel-specific API on top of the generic bot-sdk.
 * All Hazel domain schemas are pre-configured, making it trivial to build integrations.
 */

import type {
	AttachmentId,
	ChannelId,
	ChannelMemberId,
	MessageId,
	OrganizationId,
	TypingIndicatorId,
	UserId,
} from "@hazel/domain/ids"
import { Channel, ChannelMember, Message } from "@hazel/domain/models"
import { createTracingLayer } from "@hazel/effect-bun/Telemetry"
import { Config, Context, Effect, Layer, Logger, ManagedRuntime, Option, type Schema, type Scope } from "effect"
import { BotAuth, createAuthContextFromToken } from "./auth.ts"
import { createBotClientTag } from "./bot-client.ts"
import type { HandlerError } from "./errors.ts"
import { BotRpcClient, BotRpcClientConfigTag, BotRpcClientLive } from "./rpc/client.ts"
import type { EventQueueConfig } from "./services/index.ts"
import {
	ElectricEventQueue,
	EventDispatcher,
	RedisCommandListener,
	RedisCommandListenerConfigTag,
	ShapeStreamSubscriber,
	type CommandContext,
	type CommandEvent,
} from "./services/index.ts"

/**
 * Internal configuration context for HazelBotClient
 * Contains commands to sync and backend URL for HTTP calls
 */
export interface HazelBotRuntimeConfig {
	readonly backendUrl: string
	readonly botToken: string
	readonly commands: readonly BotCommandDef[]
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
 * Command handler type
 */
export type CommandHandler<E = HandlerError, R = never> = (ctx: CommandContext) => Effect.Effect<void, E, R>

/**
 * Command definition for bot configuration
 */
export interface BotCommandDef {
	readonly name: string
	readonly description: string
	readonly arguments?: readonly BotCommandArgument[]
	readonly usageExample?: string
}

export interface BotCommandArgument {
	readonly name: string
	readonly description?: string
	readonly required: boolean
	readonly placeholder?: string
	readonly type: "string" | "number" | "user" | "channel"
}

// Re-export CommandContext for convenience
export type { CommandContext } from "./services/index.ts"

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
 */
export class HazelBotClient extends Effect.Service<HazelBotClient>()("HazelBotClient", {
	accessors: true,
	effect: Effect.gen(function* () {
		// Get the typed BotClient for Hazel subscriptions
		const bot = yield* createBotClientTag<typeof HAZEL_SUBSCRIPTIONS>()
		// Get the RPC client from context
		const rpc = yield* BotRpcClient
		// Get auth context (contains botId and userId for message authoring)
		const authContext = yield* bot.getAuthContext
		// Get the runtime config (optional - contains commands to sync)
		const runtimeConfigOption = yield* Effect.serviceOption(HazelBotRuntimeConfigTag)
		// Try to get the command listener (optional - only available if commands are configured)
		const commandListenerOption = yield* Effect.serviceOption(RedisCommandListener)

		// Command handler registry
		const commandHandlers = new Map<string, CommandHandler<any, any>>()

		/**
		 * Sync commands with the backend via HTTP
		 */
		const syncCommands = Effect.gen(function* () {
			if (Option.isNone(runtimeConfigOption)) {
				return
			}

			const config = runtimeConfigOption.value
			if (config.commands.length === 0) {
				return
			}

			yield* Effect.log(`Syncing ${config.commands.length} commands with backend...`)

			// Call the sync endpoint
			const response = yield* Effect.tryPromise({
				try: async () => {
					const res = await fetch(`${config.backendUrl}/bot-commands/sync`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${config.botToken}`,
						},
						body: JSON.stringify({
							commands: config.commands.map((cmd) => ({
								name: cmd.name,
								description: cmd.description,
								arguments: cmd.arguments ?? [],
								usageExample: cmd.usageExample ?? null,
							})),
						}),
					})

					if (!res.ok) {
						throw new Error(`Failed to sync commands: ${res.status} ${res.statusText}`)
					}

					return (await res.json()) as { syncedCount: number }
				},
				catch: (error) => new Error(`Command sync failed: ${error}`),
			})

			yield* Effect.log(`Synced ${response.syncedCount} commands successfully`)
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
			 */
			message: {
				/**
				 * Send a message to a channel
				 * @param channelId - The channel to send the message to
				 * @param content - Message content
				 * @param options - Optional settings (reply, thread, attachments)
				 */
				send: (channelId: ChannelId, content: string, options?: SendMessageOptions) =>
					rpc.message
						.create({
							channelId,
							content,
							replyToMessageId: options?.replyToMessageId ?? null,
							threadChannelId: options?.threadChannelId ?? null,
							attachmentIds: options?.attachmentIds ?? [],
							embeds: null,
							deletedAt: null,
							authorId: authContext.userId as UserId,
						})
						.pipe(
							Effect.map((r) => r.data),
							Effect.withSpan("bot.message.send", { attributes: { channelId } }),
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
					rpc.message
						.create({
							channelId: message.channelId,
							content,
							replyToMessageId: message.id,
							threadChannelId: options?.threadChannelId ?? null,
							attachmentIds: options?.attachmentIds ?? [],
							embeds: null,
							deletedAt: null,
							authorId: authContext.userId as UserId,
						})
						.pipe(
							Effect.map((r) => r.data),
							Effect.withSpan("bot.message.reply", {
								attributes: { channelId: message.channelId, replyToMessageId: message.id },
							}),
						),

				/**
				 * Update a message
				 * @param message - The message to update (requires id)
				 * @param content - New content
				 */
				update: (message: MessageType, content: string) =>
					rpc.message
						.update({
							id: message.id,
							content,
						})
						.pipe(
							Effect.map((r) => r.data),
							Effect.withSpan("bot.message.update", { attributes: { messageId: message.id } }),
						),

				/**
				 * Delete a message
				 * @param id - Message ID to delete
				 */
				delete: (id: MessageId) =>
					rpc.message.delete({ id }).pipe(Effect.withSpan("bot.message.delete", { attributes: { messageId: id } })),

				/**
				 * Toggle a reaction on a message
				 * @param message - The message to react to
				 * @param emoji - Emoji to toggle
				 */
				react: (message: MessageType, emoji: string) =>
					rpc.messageReaction
						.toggle({
							messageId: message.id,
							channelId: message.channelId,
							emoji,
						})
						.pipe(Effect.withSpan("bot.message.react", { attributes: { messageId: message.id, emoji } })),
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
			 * Register a handler for a slash command
			 * @param commandName - The name of the command (without the leading /)
			 * @param handler - Handler function that receives CommandContext
			 *
			 * @example
			 * ```typescript
			 * yield* bot.onCommand("echo", (ctx) =>
			 *   Effect.gen(function* () {
			 *     yield* bot.message.send(ctx.channelId, `Echo: ${ctx.args.text}`)
			 *   })
			 * )
			 * ```
			 */
			onCommand: <E = HandlerError, R = never>(commandName: string, handler: CommandHandler<E, R>) =>
				Effect.sync(() => {
					commandHandlers.set(commandName, handler as CommandHandler<any, any>)
				}),

			/**
			 * Start the bot client
			 * Syncs commands with backend and begins listening to events (Electric + Redis commands)
			 */
			start: Effect.gen(function* () {
				yield* Effect.log("Starting bot client...")

				// Sync commands with backend (if configured)
				yield* syncCommands

				// Start Electric event listener
				yield* bot.start

				// Start Redis command listener (if available)
				if (Option.isSome(commandListenerOption)) {
					const commandListener = commandListenerOption.value
					yield* commandListener.start

					// Start command dispatcher fiber
					yield* Effect.forkScoped(
						Effect.forever(
							Effect.gen(function* () {
								const event = yield* commandListener.take

								const handler = commandHandlers.get(event.commandName)
								if (!handler) {
									yield* Effect.logWarning(`No handler for command: ${event.commandName}`)
									return
								}

								const ctx: CommandContext = {
									commandName: event.commandName,
									channelId: event.channelId as ChannelId,
									userId: event.userId as UserId,
									orgId: event.orgId as OrganizationId,
									args: event.arguments,
									timestamp: event.timestamp,
								}

								yield* handler(ctx).pipe(
									Effect.withSpan("bot.command.handle", {
										attributes: {
											commandName: event.commandName,
											channelId: event.channelId,
											userId: event.userId,
										},
									}),
									Effect.catchAllCause((cause) =>
										Effect.logError(`Command handler failed for ${event.commandName}`, { cause }),
									),
								)
							}),
						),
					)

					yield* Effect.log("Command listener started")
				}

				yield* Effect.log("Bot client started successfully")
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
export interface HazelBotConfig {
	/**
	 * Electric proxy URL
	 * @default "https://electric.hazel.sh/v1/shape"
	 * @example "http://localhost:8787/v1/shape" // For local development
	 */
	readonly electricUrl?: string

	/**
	 * Backend URL for RPC API calls
	 * @default "https://api.hazel.sh"
	 * @example "http://localhost:3003" // For local development
	 */
	readonly backendUrl?: string

	/**
	 * Redis URL for command delivery
	 * Required if commands are defined
	 * @default "redis://localhost:6379"
	 * @example "redis://localhost:6379" // For local development
	 */
	readonly redisUrl?: string

	/**
	 * Bot authentication token (required)
	 */
	readonly botToken: string

	/**
	 * Slash commands this bot supports (optional)
	 * Commands are synced to the backend on start and appear in the / autocomplete
	 */
	readonly commands?: readonly BotCommandDef[]

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
}

/**
 * Create a Hazel bot runtime with pre-configured subscriptions
 *
 * This is the simplest way to create a bot for Hazel integrations.
 * All Hazel domain schemas (messages, channels, channel_members) are pre-configured.
 *
 * @example
 * ```typescript
 * import { createHazelBot, HazelBotClient } from "@hazel/bot-sdk"
 *
 * // Minimal config - just botToken! electricUrl defaults to https://electric.hazel.sh/v1/shape
 * const runtime = createHazelBot({
 *   botToken: process.env.BOT_TOKEN!,
 * })
 *
 * // Or override electricUrl for local development
 * const devRuntime = createHazelBot({
 *   electricUrl: "http://localhost:8787/v1/shape",
 *   botToken: process.env.BOT_TOKEN!,
 * })
 *
 * const program = Effect.gen(function* () {
 *   const bot = yield* HazelBotClient
 *
 *   yield* bot.onMessage((message) => {
 *     console.log("New message:", message.content)
 *   })
 *
 *   yield* bot.start
 * })
 *
 * runtime.runPromise(program.pipe(Effect.scoped))
 * ```
 */
export const createHazelBot = (
	config: HazelBotConfig,
): ManagedRuntime.ManagedRuntime<HazelBotClient, unknown> => {
	// Apply defaults for URLs
	const electricUrl = config.electricUrl ?? "https://electric.hazel.sh/v1/shape"
	const backendUrl = config.backendUrl ?? "https://api.hazel.sh"
	const redisUrl = config.redisUrl ?? "redis://localhost:6379"

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
		createAuthContextFromToken(config.botToken, backendUrl).pipe(Effect.map((context) => BotAuth.Default(context))),
	)

	// Create the RPC client config layer
	const RpcClientConfigLayer = Layer.succeed(BotRpcClientConfigTag, {
		backendUrl,
		botToken: config.botToken,
	})

	// Create the scoped RPC client layer
	const RpcClientLayer = BotRpcClientLive.pipe(Layer.provide(RpcClientConfigLayer))

	// Create Redis command listener layer if commands are configured
	const hasCommands = config.commands && config.commands.length > 0
	const RedisCommandListenerLayer = hasCommands
		? Layer.provide(
				RedisCommandListener.Default,
				Layer.merge(
					Layer.succeed(RedisCommandListenerConfigTag, {
						redisUrl,
						botToken: config.botToken,
					}),
					AuthLayer,
				),
			)
		: Layer.empty

	// Create runtime config layer for command syncing
	const RuntimeConfigLayer = hasCommands
		? Layer.succeed(HazelBotRuntimeConfigTag, {
				backendUrl,
				botToken: config.botToken,
				commands: config.commands ?? [],
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
					yield* Effect.log("Starting bot client...")
					yield* subscriber.start
					yield* dispatcher.start
					yield* Effect.log("Bot client started successfully")
				}),
				getAuthContext: auth.getContext.pipe(Effect.orDie),
			}
		}),
	)

	// Use pretty logger in non-production, structured logger in production
	const LoggerLayer = Layer.unwrapEffect(
		Effect.gen(function* () {
			const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("development"))
			return nodeEnv === "production" ? Logger.structured : Logger.pretty
		}),
	)

	// Create tracing layer with configurable service name
	const TracingLayer = createTracingLayer(config.serviceName ?? "hazel-bot")

	// Compose all layers with proper dependency order
	const AllLayers = HazelBotClient.Default.pipe(
		Layer.provide(BotClientLayer),
		Layer.provide(RpcClientLayer),
		Layer.provide(RedisCommandListenerLayer),
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

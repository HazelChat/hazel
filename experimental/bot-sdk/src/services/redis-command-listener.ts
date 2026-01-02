/**
 * Redis Command Listener Service
 *
 * Subscribes to a Redis channel to receive command events from the backend.
 * Commands are published when users execute slash commands in the chat UI.
 */

import type { ChannelId, OrganizationId, UserId } from "@hazel/domain/ids"
import { Context, Effect, Layer, Queue, Schema } from "effect"
import { BotAuth } from "../auth.ts"

// ============ Command Event Schema ============

/**
 * Command event received from Redis
 */
export const CommandEventSchema = Schema.Struct({
	type: Schema.Literal("command"),
	commandName: Schema.String,
	channelId: Schema.String,
	userId: Schema.String,
	orgId: Schema.String,
	arguments: Schema.Record({ key: Schema.String, value: Schema.String }),
	timestamp: Schema.Number,
})

export type CommandEvent = typeof CommandEventSchema.Type

/**
 * Typed command context passed to handlers
 */
export interface CommandContext {
	readonly commandName: string
	readonly channelId: ChannelId
	readonly userId: UserId
	readonly orgId: OrganizationId
	readonly args: Record<string, string>
	readonly timestamp: number
}

// ============ Errors ============

export class RedisSubscriptionError extends Schema.TaggedError<RedisSubscriptionError>()(
	"RedisSubscriptionError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

// ============ Config ============

export interface RedisCommandListenerConfig {
	readonly redisUrl: string
	readonly botToken: string
}

export const RedisCommandListenerConfigTag = Context.GenericTag<RedisCommandListenerConfig>(
	"@hazel/bot-sdk/RedisCommandListenerConfig",
)

// ============ Service ============

/**
 * Redis Command Listener Service
 *
 * Subscribes to the bot's command channel and queues incoming command events
 * for processing by the command dispatcher.
 */
export class RedisCommandListener extends Effect.Service<RedisCommandListener>()("RedisCommandListener", {
	accessors: true,
	effect: Effect.gen(function* () {
		const auth = yield* BotAuth
		const context = yield* auth.getContext.pipe(Effect.orDie)
		// Capture config during service construction (not in start)
		const config = yield* RedisCommandListenerConfigTag

		// Create an unbounded queue for command events
		const commandQueue = yield* Queue.unbounded<CommandEvent>()

		// Track subscription state
		let isStarted = false
		let unsubscribeFn: (() => void) | null = null

		return {
			/**
			 * Start listening for command events on the bot's Redis channel.
			 * Must be called before take/takeAll.
			 */
			start: Effect.gen(function* () {
				if (isStarted) {
					yield* Effect.log("Redis command listener already started")
					return
				}

				const channel = `bot:${context.botId}:commands`
				yield* Effect.log(`Starting Redis command listener on channel: ${channel}`)

				// Dynamic import of Bun's Redis client
				const { RedisClient } = yield* Effect.promise(() => import("bun"))
				const client = new RedisClient(config.redisUrl)

				yield* Effect.tryPromise({
					try: () => client.connect(),
					catch: (error) =>
						new RedisSubscriptionError({
							message: "Failed to connect to Redis for command subscription",
							cause: error,
						}),
				})

				yield* Effect.tryPromise({
					try: () =>
						client.subscribe(channel, (message, chan) => {
							try {
								const parsed = JSON.parse(message)
								const decoded = Schema.decodeUnknownSync(CommandEventSchema)(parsed)
								// Queue the event (fire-and-forget from callback)
								Effect.runSync(Queue.offer(commandQueue, decoded))
							} catch (e) {
								console.error(`Invalid command message on ${chan}:`, e)
							}
						}),
					catch: (error) =>
						new RedisSubscriptionError({
							message: "Failed to subscribe to Redis channel",
							cause: error,
						}),
				})

				// Store unsubscribe function for cleanup
				unsubscribeFn = () => {
					client.unsubscribe(channel)
					client.close()
				}

				isStarted = true
				yield* Effect.log(`Listening for commands on ${channel}`)

				// Register cleanup on scope finalization
				yield* Effect.addFinalizer(() =>
					Effect.sync(() => {
						if (unsubscribeFn) {
							unsubscribeFn()
							unsubscribeFn = null
						}
						isStarted = false
					}),
				)
			}),

			/**
			 * Take the next command event from the queue (blocks until available)
			 */
			take: Queue.take(commandQueue),

			/**
			 * Take all available command events from the queue (non-blocking)
			 */
			takeAll: Queue.takeAll(commandQueue),

			/**
			 * Check if the listener is currently running
			 */
			isRunning: Effect.succeed(isStarted),
		}
	}),
}) {}

/**
 * Create a RedisCommandListener layer with the provided config
 */
export const RedisCommandListenerLive = (config: RedisCommandListenerConfig) =>
	Layer.provide(
		RedisCommandListener.Default,
		Layer.succeed(RedisCommandListenerConfigTag, config),
	)

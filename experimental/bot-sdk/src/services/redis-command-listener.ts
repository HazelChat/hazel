/**
 * Redis Command Listener Service
 *
 * Subscribes to a Redis channel to receive command events from the backend.
 * Commands are published when users execute slash commands in the chat UI.
 *
 * The service auto-starts on construction and properly cleans up resources
 * when the scope is closed.
 */

import type { ChannelId, OrganizationId, UserId } from "@hazel/domain/ids"
import { Context, Effect, Layer, Queue, Ref, Schema } from "effect"
import { BotAuth } from "../auth.ts"
import { RedisSubscriptionError } from "../errors.ts"
import { RetryStrategy } from "../retry.ts"

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
 *
 * Auto-starts on construction - no need to call start() manually.
 */
export class RedisCommandListener extends Effect.Service<RedisCommandListener>()("RedisCommandListener", {
	accessors: true,
	scoped: Effect.gen(function* () {
		const auth = yield* BotAuth
		const context = yield* auth.getContext.pipe(Effect.orDie)
		const config = yield* RedisCommandListenerConfigTag
		const channel = `bot:${context.botId}:commands`

		// Track running state with Ref (immutable)
		const isRunningRef = yield* Ref.make(false)

		// Create command queue with proper scoped acquisition
		const commandQueue = yield* Effect.acquireRelease(Queue.unbounded<CommandEvent>(), (queue) =>
			Effect.gen(function* () {
				yield* Effect.logInfo("Shutting down command queue").pipe(
					Effect.annotateLogs("service", "RedisCommandListener"),
				)
				yield* Queue.shutdown(queue)
			}),
		)

		// Acquire Redis client and subscription with proper cleanup
		yield* Effect.acquireRelease(
			Effect.gen(function* () {
				yield* Effect.logInfo(`Starting Redis command listener`, { channel }).pipe(
					Effect.annotateLogs("service", "RedisCommandListener"),
				)

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
				}).pipe(Effect.retry(RetryStrategy.connectionErrors))

				yield* Effect.tryPromise({
					try: () =>
						client.subscribe(channel, (message, _chan) => {
							try {
								const parsed = JSON.parse(message)
								const decoded = Schema.decodeUnknownSync(CommandEventSchema)(parsed)
								Effect.runSync(Queue.offer(commandQueue, decoded))
							} catch (e) {
								console.error(`Invalid command message:`, e)
							}
						}),
					catch: (error) =>
						new RedisSubscriptionError({
							message: "Failed to subscribe to Redis channel",
							cause: error,
						}),
				})

				yield* Ref.set(isRunningRef, true)
				yield* Effect.logInfo(`Listening for commands`, { channel }).pipe(
					Effect.annotateLogs("service", "RedisCommandListener"),
				)

				return { client, channel }
			}),
			({ client, channel }) =>
				Effect.gen(function* () {
					yield* Effect.logInfo(`Stopping Redis command listener`, { channel }).pipe(
						Effect.annotateLogs("service", "RedisCommandListener"),
					)
					yield* Ref.set(isRunningRef, false)
					yield* Effect.sync(() => {
						client.unsubscribe(channel)
						client.close()
					})
				}),
		)

		return {
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
			isRunning: Ref.get(isRunningRef),

			/**
			 * Get the channel this listener is subscribed to
			 */
			channel: Effect.succeed(channel),
		}
	}),
}) {}

/**
 * Create a RedisCommandListener layer with the provided config
 */
export const RedisCommandListenerLive = (config: RedisCommandListenerConfig) =>
	Layer.provide(RedisCommandListener.Default, Layer.succeed(RedisCommandListenerConfigTag, config))

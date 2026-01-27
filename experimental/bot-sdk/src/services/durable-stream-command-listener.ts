/**
 * Durable Stream Command Listener Service
 *
 * Subscribes to a durable stream via SSE to receive command events from the backend.
 * Commands are published when users execute slash commands in the chat UI.
 *
 * Uses @durable-streams/client-effect for SSE streaming with proper parsing and retry.
 */

import type { ChannelId, OrganizationId, UserId } from "@hazel/domain/ids"
import {
	DurableStreamClient,
	DurableStreamClientLiveNode,
	type ParseError,
} from "@durable-streams/client-effect"
import { Context, Effect, Layer, Queue, Ref, Redacted, Schedule, Schema, Stream } from "effect"
import { BotAuth } from "../auth.ts"

// ============ Command Event Schema ============

/**
 * Command event received from the durable stream
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

export interface DurableStreamCommandListenerConfig {
	readonly durableStreamUrl: string
	readonly botToken: Redacted.Redacted<string>
}

export const DurableStreamCommandListenerConfigTag = Context.GenericTag<DurableStreamCommandListenerConfig>(
	"@hazel/bot-sdk/DurableStreamCommandListenerConfig",
)

// ============ Error ============

export class DurableStreamConnectionError extends Schema.TaggedError<DurableStreamConnectionError>()(
	"DurableStreamConnectionError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

// ============ Service ============

/**
 * Durable Stream Command Listener Service
 *
 * Subscribes to the bot's command stream via SSE and queues incoming command events
 * for processing by the command dispatcher.
 *
 * Auto-starts on construction - no need to call start() manually.
 * Uses StreamSession from @durable-streams/client-effect for proper SSE handling.
 */
export class DurableStreamCommandListener extends Effect.Service<DurableStreamCommandListener>()(
	"DurableStreamCommandListener",
	{
		accessors: true,
		scoped: Effect.gen(function* () {
			const auth = yield* BotAuth
			const context = yield* auth.getContext.pipe(Effect.orDie)
			const dsClient = yield* DurableStreamClient

			// Build the stream URL for this bot
			const streamPath = `/bots/${context.botId}/commands`

			// Track running state with Ref (immutable)
			const isRunningRef = yield* Ref.make(false)

			// Create command queue with proper scoped acquisition
			const commandQueue = yield* Effect.acquireRelease(Queue.unbounded<CommandEvent>(), (queue) =>
				Effect.gen(function* () {
					yield* Effect.logDebug("Shutting down command queue").pipe(
						Effect.annotateLogs("service", "DurableStreamCommandListener"),
					)
					yield* Queue.shutdown(queue)
				}),
			)

			/**
			 * Connect to SSE stream and process events using the new client
			 */
			const connectAndProcess = Effect.gen(function* () {
				yield* Effect.logDebug(`Connecting to durable stream`, { path: streamPath }).pipe(
					Effect.annotateLogs("service", "DurableStreamCommandListener"),
				)

				// Use the new client's stream() method with SSE mode
				const session = yield* dsClient.stream<unknown>(streamPath, {
					offset: "now",
					live: "sse",
				})

				yield* Ref.set(isRunningRef, true)

				// Process JSON stream - each item is a raw event
				yield* session.jsonStream().pipe(
					Stream.mapEffect((rawEvent) =>
						Schema.decodeUnknown(CommandEventSchema)(rawEvent).pipe(
							Effect.flatMap((cmd) => Queue.offer(commandQueue, cmd)),
							Effect.catchAll((e) =>
								Effect.logWarning("Failed to parse command event", {
									error: e,
									rawEvent,
								}).pipe(Effect.annotateLogs("service", "DurableStreamCommandListener")),
							),
						),
					),
					Stream.runDrain,
				)
			}).pipe(
				Effect.catchTags({
					StreamNotFoundError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({ message: `Stream not found: ${e.url}` }),
						),
					StreamConflictError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({
								message: `Stream conflict: ${e.message}`,
								cause: e,
							}),
						),
					HttpError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({
								message: `HTTP ${e.status}: ${e.statusText}`,
								cause: e,
							}),
						),
					NetworkError: (e) =>
						Effect.fail(new DurableStreamConnectionError({ message: e.message, cause: e })),
					ParseError: (e: ParseError) =>
						Effect.fail(
							new DurableStreamConnectionError({ message: `Parse error: ${e.message}` }),
						),
					SSEParseError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({ message: `SSE parse error: ${e.message}` }),
						),
					ContentTypeMismatchError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({
								message: `Content type mismatch: expected ${e.expected}, got ${e.received}`,
							}),
						),
					InvalidOffsetError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({ message: `Invalid offset: ${e.offset}` }),
						),
					SequenceConflictError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({
								message: `Sequence conflict: current=${e.currentSeq}, received=${e.receivedSeq}`,
							}),
						),
					StaleEpochError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({
								message: `Stale epoch: current=${e.currentEpoch}`,
							}),
						),
					SequenceGapError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({
								message: `Sequence gap: expected=${e.expectedSeq}, received=${e.receivedSeq}`,
							}),
						),
					TimeoutError: (e) =>
						Effect.fail(new DurableStreamConnectionError({ message: `Timeout: ${e.message}` })),
					ProducerClosedError: () =>
						Effect.fail(new DurableStreamConnectionError({ message: "Producer closed" })),
					InvalidProducerOptionsError: (e) =>
						Effect.fail(
							new DurableStreamConnectionError({
								message: `Invalid producer options: ${e.message}`,
							}),
						),
				}),
			)

			// Start the connection loop with retry using Effect's built-in retry
			yield* connectAndProcess.pipe(
				Effect.retry(
					Schedule.exponential("1 second", 2).pipe(
						Schedule.jittered,
						Schedule.intersect(Schedule.recurs(10)),
					),
				),
				Effect.catchAll((error) =>
					Effect.logError("Durable stream connection failed permanently", { error }).pipe(
						Effect.annotateLogs("service", "DurableStreamCommandListener"),
					),
				),
				Effect.forkScoped,
			)

			yield* Effect.logDebug(`Listening for commands on durable stream`, {
				path: streamPath,
			}).pipe(Effect.annotateLogs("service", "DurableStreamCommandListener"))

			// Cleanup on scope close
			yield* Effect.addFinalizer(() =>
				Effect.gen(function* () {
					yield* Ref.set(isRunningRef, false)
					yield* Effect.logDebug("Durable stream listener stopped").pipe(
						Effect.annotateLogs("service", "DurableStreamCommandListener"),
					)
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
				 * Get the stream path this listener is subscribed to
				 */
				streamPath: Effect.succeed(streamPath),
			}
		}),
	},
) {}

/**
 * Create a DurableStreamCommandListener layer with the provided config
 */
export const DurableStreamCommandListenerLive = (config: DurableStreamCommandListenerConfig) =>
	Layer.provide(
		DurableStreamCommandListener.Default,
		Layer.mergeAll(
			Layer.succeed(DurableStreamCommandListenerConfigTag, config),
			DurableStreamClientLiveNode({
				baseUrl: config.durableStreamUrl,
				headers: {
					Authorization: () => `Bearer ${Redacted.value(config.botToken)}`,
				},
			}),
		),
	)

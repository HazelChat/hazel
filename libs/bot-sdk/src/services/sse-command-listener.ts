/**
 * SSE Command Listener Service
 *
 * Connects to the backend's SSE endpoint to receive command events.
 * Commands are published when users execute slash commands in the chat UI.
 *
 * Uses @effect/experimental Sse module for proper SSE parsing.
 */

import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { Sse } from "@effect/experimental"
import type { ChannelId, OrganizationId, UserId } from "@hazel/domain/ids"
import { Context, Effect, Layer, Queue, Redacted, Ref, Schedule, Schema, Stream } from "effect"
import { BotAuth } from "../auth.ts"
import { generateCorrelationId } from "../log-context.ts"

// ============ Command Event Schema ============

/**
 * Command event received from the SSE stream
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

export interface SseCommandListenerConfig {
	readonly backendUrl: string
	readonly botToken: Redacted.Redacted<string>
}

export const SseCommandListenerConfigTag = Context.GenericTag<SseCommandListenerConfig>(
	"@hazel/bot-sdk/SseCommandListenerConfig",
)

// ============ Error ============

export class SseConnectionError extends Schema.TaggedError<SseConnectionError>()("SseConnectionError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

// ============ Service ============

/**
 * SSE Command Listener Service
 *
 * Connects to the backend's SSE endpoint and queues incoming command events
 * for processing by the command dispatcher.
 *
 * Auto-starts on construction - no need to call start() manually.
 * Uses @effect/experimental Sse module for proper SSE parsing.
 */
export class SseCommandListener extends Effect.Service<SseCommandListener>()("SseCommandListener", {
	accessors: true,
	scoped: Effect.gen(function* () {
		const auth = yield* BotAuth
		const authContext = yield* auth.getContext.pipe(Effect.orDie)
		const config = yield* SseCommandListenerConfigTag
		const httpClient = yield* HttpClient.HttpClient

		// Extract bot identity for logging
		const botId = authContext.botId
		const botName = authContext.botName

		// Build the SSE URL
		const sseUrl = `${config.backendUrl}/bot-commands/stream`

		// Track running state with Ref (immutable)
		const isRunningRef = yield* Ref.make(false)

		// Create command queue with proper scoped acquisition
		const commandQueue = yield* Effect.acquireRelease(Queue.unbounded<CommandEvent>(), (queue) =>
			Effect.gen(function* () {
				yield* Effect.logDebug("Shutting down command queue").pipe(
					Effect.annotateLogs("service", "SseCommandListener"),
				)
				yield* Queue.shutdown(queue)
			}),
		)

		/**
		 * Connect to SSE stream and process events
		 */
		const connectAndProcess = Effect.gen(function* () {
			yield* Effect.logDebug(`Connecting to SSE stream`, { url: sseUrl, botId, botName }).pipe(
				Effect.annotateLogs("service", "SseCommandListener"),
			)

			// Create HTTP request with bot token authorization
			const request = HttpClientRequest.get(sseUrl).pipe(
				HttpClientRequest.setHeader("Authorization", `Bearer ${Redacted.value(config.botToken)}`),
				HttpClientRequest.setHeader("Accept", "text/event-stream"),
			)

			// Make the request and get the streaming response
			const response = yield* httpClient.execute(request)

			if (response.status !== 200) {
				return yield* Effect.fail(
					new SseConnectionError({
						message: `SSE connection failed with status ${response.status}`,
					}),
				)
			}

			yield* Ref.set(isRunningRef, true)
			yield* Effect.logInfo(`SSE stream connected`, { url: sseUrl, botId, botName }).pipe(
				Effect.annotateLogs("service", "SseCommandListener"),
			)

			// Create SSE parser that emits events to a queue
			const eventQueue = yield* Queue.unbounded<Sse.Event>()

			const parser = Sse.makeParser((sseEvent) => {
				if (sseEvent._tag === "Event") {
					// Fire and forget - offer to queue
					Effect.runFork(Queue.offer(eventQueue, sseEvent))
				}
				// Ignore Retry events for now
			})

			// Process the response stream
			yield* response.stream.pipe(
				Stream.decodeText(),
				Stream.tap((text) => Effect.sync(() => parser.feed(text))),
				Stream.runDrain,
				Effect.fork,
			)

			// Process events from the queue
			yield* Stream.fromQueue(eventQueue).pipe(
				Stream.tap((event) =>
					Effect.logDebug("Received SSE event", { eventType: event.event, botId }).pipe(
						Effect.annotateLogs("service", "SseCommandListener"),
					),
				),
				// Only process "command" events
				Stream.filter((event) => event.event === "command"),
				Stream.mapEffect((event) => {
					// Generate correlation ID for this command
					const correlationId = generateCorrelationId()

					return Schema.decodeUnknown(CommandEventSchema)(JSON.parse(event.data)).pipe(
						Effect.tap((cmd) =>
							Effect.logInfo("Command received", {
								commandName: cmd.commandName,
								channelId: cmd.channelId,
								correlationId,
							}).pipe(Effect.annotateLogs("service", "SseCommandListener")),
						),
						Effect.tap((cmd) =>
							Effect.logDebug("Command details", {
								commandName: cmd.commandName,
								channelId: cmd.channelId,
								userId: cmd.userId,
								argCount: Object.keys(cmd.arguments).length,
								correlationId,
							}).pipe(Effect.annotateLogs("service", "SseCommandListener")),
						),
						Effect.flatMap((cmd) => Queue.offer(commandQueue, cmd)),
						Effect.withSpan("bot.command.receive", {
							attributes: { correlationId, botId },
						}),
						Effect.catchAll((parseError) =>
							Effect.logWarning("Failed to parse command event", {
								error: parseError,
								data: event.data,
								correlationId,
							}).pipe(Effect.annotateLogs("service", "SseCommandListener")),
						),
					)
				}),
				Stream.runDrain,
			)
		}).pipe(
			Effect.catchTags({
				RequestError: (e) =>
					Effect.fail(
						new SseConnectionError({
							message: `Request error: ${e.message}`,
							cause: e,
						}),
					),
				ResponseError: (e) =>
					Effect.fail(
						new SseConnectionError({
							message: `Response error: ${e.reason}`,
							cause: e,
						}),
					),
			}),
			Effect.catchAll((e) =>
				Effect.fail(
					new SseConnectionError({
						message:
							e instanceof SseConnectionError ? e.message : `Connection error: ${String(e)}`,
						cause: e,
					}),
				),
			),
		)

		// Start the connection loop with retry using Effect's built-in retry
		yield* connectAndProcess.pipe(
			Effect.retry(
				Schedule.exponential("1 second", 2).pipe(
					Schedule.jittered,
					Schedule.intersect(Schedule.recurs(10)),
				),
			),
			Effect.tapError((error) =>
				Effect.logError("SSE connection failed permanently", { error, botId, botName }).pipe(
					Effect.annotateLogs("service", "SseCommandListener"),
				),
			),
			Effect.catchAll(() => Effect.void),
			Effect.forkScoped,
		)

		yield* Effect.logInfo(`Listening for commands via SSE`, { url: sseUrl, botId, botName }).pipe(
			Effect.annotateLogs("service", "SseCommandListener"),
		)

		// Cleanup on scope close
		yield* Effect.addFinalizer(() =>
			Effect.gen(function* () {
				yield* Ref.set(isRunningRef, false)
				yield* Effect.logDebug("SSE listener stopped").pipe(
					Effect.annotateLogs("service", "SseCommandListener"),
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
			 * Get the SSE URL this listener is connected to
			 */
			sseUrl: Effect.succeed(sseUrl),
		}
	}),
}) {}

/**
 * Create a SseCommandListener layer with the provided config
 */
export const SseCommandListenerLive = (config: SseCommandListenerConfig) =>
	Layer.provide(
		SseCommandListener.Default,
		Layer.mergeAll(Layer.succeed(SseCommandListenerConfigTag, config), FetchHttpClient.layer),
	)

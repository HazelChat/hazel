/**
 * Durable Stream Command Listener Service
 *
 * Subscribes to a durable stream via SSE to receive command events from the backend.
 * Commands are published when users execute slash commands in the chat UI.
 *
 * The service auto-starts on construction and properly cleans up resources
 * when the scope is closed.
 */

import type { ChannelId, OrganizationId, UserId } from "@hazel/domain/ids"
import { Context, Effect, Layer, Option, Queue, Ref, Redacted, Schema, Stream } from "effect"
import { BotAuth } from "../auth.ts"
import { RetryStrategy } from "../retry.ts"

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

// ============ SSE Event Schema ============

/**
 * SSE control event from durable stream
 */
const SSEControlEventSchema = Schema.Struct({
	streamNextOffset: Schema.String,
	streamCursor: Schema.optional(Schema.String),
	upToDate: Schema.optional(Schema.Boolean),
})

// ============ Config ============

export interface DurableStreamCommandListenerConfig {
	readonly durableStreamUrl: string
	readonly botToken: Redacted.Redacted<string>
}

export const DurableStreamCommandListenerConfigTag =
	Context.GenericTag<DurableStreamCommandListenerConfig>(
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
 * Uses Stream.async pattern for proper Effect integration.
 */
export class DurableStreamCommandListener extends Effect.Service<DurableStreamCommandListener>()(
	"DurableStreamCommandListener",
	{
		accessors: true,
		scoped: Effect.gen(function* () {
			const auth = yield* BotAuth
			const context = yield* auth.getContext.pipe(Effect.orDie)
			const config = yield* DurableStreamCommandListenerConfigTag

			// Build the stream URL for this bot
			const streamPath = `/bots/${context.botId}/commands`
			const baseUrl = config.durableStreamUrl.replace(/\/$/, "")

			// Track running state with Ref (immutable)
			const isRunningRef = yield* Ref.make(false)

			// Track the current offset for resumption
			const offsetRef = yield* Ref.make<string>("now")

			// Create command queue with proper scoped acquisition
			const commandQueue = yield* Effect.acquireRelease(Queue.unbounded<CommandEvent>(), (queue) =>
				Effect.gen(function* () {
					yield* Effect.logDebug("Shutting down command queue").pipe(
						Effect.annotateLogs("service", "DurableStreamCommandListener"),
					)
					yield* Queue.shutdown(queue)
				}),
			)

			// AbortController for cleanup
			const abortControllerRef = yield* Ref.make<AbortController | null>(null)

			/**
			 * Connect to SSE stream and process events
			 */
			const connectAndProcess = Effect.gen(function* () {
				const currentOffset = yield* Ref.get(offsetRef)
				const sseUrl = `${baseUrl}${streamPath}?live=sse&offset=${currentOffset}`

				yield* Effect.logDebug(`Connecting to durable stream`, { url: sseUrl }).pipe(
					Effect.annotateLogs("service", "DurableStreamCommandListener"),
				)

				const abortController = new AbortController()
				yield* Ref.set(abortControllerRef, abortController)

				const token = Redacted.value(config.botToken)

				// Fetch with SSE headers
				const response = yield* Effect.tryPromise({
					try: () =>
						fetch(sseUrl, {
							headers: {
								Accept: "text/event-stream",
								Authorization: `Bearer ${token}`,
								"Cache-Control": "no-cache",
							},
							signal: abortController.signal,
						}),
					catch: (error) =>
						new DurableStreamConnectionError({
							message: "Failed to connect to durable stream",
							cause: error,
						}),
				})

				if (!response.ok) {
					const body = yield* Effect.promise(() => response.text())
					return yield* Effect.fail(
						new DurableStreamConnectionError({
							message: `HTTP ${response.status}: ${body}`,
						}),
					)
				}

				if (!response.body) {
					return yield* Effect.fail(
						new DurableStreamConnectionError({
							message: "Response body is null",
						}),
					)
				}

				yield* Ref.set(isRunningRef, true)

				// Create a stream from the SSE response
				const reader = response.body.getReader()
				const decoder = new TextDecoder()
				let buffer = ""

				// Process SSE events
				yield* Stream.repeatEffect(
					Effect.tryPromise({
						try: () => reader.read(),
						catch: (error) =>
							new DurableStreamConnectionError({
								message: "Failed to read from stream",
								cause: error,
							}),
					}),
				).pipe(
					Stream.takeWhile((result) => !result.done),
					Stream.map((result) => decoder.decode(result.value, { stream: true })),
					Stream.mapEffect((chunk) =>
						Effect.gen(function* () {
							buffer += chunk
							const events: Array<{ event: string; data: string }> = []

							// Parse SSE format: event: <type>\ndata: <json>\n\n
							const lines = buffer.split("\n")
							let currentEvent: { event?: string; data: string[] } = { data: [] }

							for (let i = 0; i < lines.length; i++) {
								const line = lines[i]!

								if (line.startsWith("event:")) {
									currentEvent.event = line.slice(6).trim()
								} else if (line.startsWith("data:")) {
									currentEvent.data.push(line.slice(5))
								} else if (line === "") {
									// Empty line means end of event
									if (currentEvent.event && currentEvent.data.length > 0) {
										events.push({
											event: currentEvent.event,
											data: currentEvent.data.join("\n"),
										})
									}
									currentEvent = { data: [] }
								}
							}

							// Keep incomplete event in buffer
							const lastEmptyLineIndex = buffer.lastIndexOf("\n\n")
							if (lastEmptyLineIndex !== -1) {
								buffer = buffer.slice(lastEmptyLineIndex + 2)
							}

							return events
						}),
					),
					Stream.flatMap((events) => Stream.fromIterable(events)),
					Stream.mapEffect((event) =>
						Effect.gen(function* () {
							if (event.event === "control") {
								// Parse control event to update offset
								const controlResult = yield* Schema.decodeUnknown(SSEControlEventSchema)(
									JSON.parse(event.data),
								).pipe(Effect.catchAll(() => Effect.succeed(null)))

								if (controlResult) {
									yield* Ref.set(offsetRef, controlResult.streamNextOffset)
								}
								return Option.none<CommandEvent>()
							}

							if (event.event === "data") {
								// Parse command event
								const parsed = yield* Effect.try({
									try: () => JSON.parse(event.data),
									catch: () => null,
								})

								if (!parsed) {
									return Option.none<CommandEvent>()
								}

								const commandResult = yield* Schema.decodeUnknown(CommandEventSchema)(
									parsed,
								).pipe(Effect.map(Option.some), Effect.catchAll(() => Effect.succeed(Option.none())))

								return commandResult
							}

							return Option.none<CommandEvent>()
						}).pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Error processing SSE event", { error }).pipe(
									Effect.annotateLogs("service", "DurableStreamCommandListener"),
									Effect.as(Option.none<CommandEvent>()),
								),
							),
						),
					),
					Stream.filterMap((opt) => opt),
					Stream.runForEach((event) => Queue.offer(commandQueue, event)),
				)
			})

			// Start the connection loop with retry
			yield* connectAndProcess.pipe(
				Effect.retry(RetryStrategy.connectionErrors),
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
					const controller = yield* Ref.get(abortControllerRef)
					if (controller) {
						controller.abort()
					}
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
		Layer.succeed(DurableStreamCommandListenerConfigTag, config),
	)

/**
 * Durable Stream Client Service
 *
 * HTTP client for publishing events to the durable stream server.
 * Uses @durable-streams/client-effect for the underlying implementation.
 */
import {
	DurableStreamClient as DSClient,
	DurableStreamClientLiveNode,
	type HttpError,
	type NetworkError,
	type StreamConflictError,
	type StreamNotFoundError,
} from "@durable-streams/client-effect"
import { Config, Effect, Layer, Redacted, Schema } from "effect"

/**
 * Error thrown when durable stream operations fail
 */
export class DurableStreamError extends Schema.TaggedError<DurableStreamError>()("DurableStreamError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Map client errors to DurableStreamError for backward compatibility
 */
const mapClientError = (
	error: StreamNotFoundError | StreamConflictError | HttpError | NetworkError,
): DurableStreamError => {
	switch (error._tag) {
		case "StreamNotFoundError":
			return new DurableStreamError({ message: `Stream not found: ${error.url}`, cause: error })
		case "StreamConflictError":
			return new DurableStreamError({ message: `Stream conflict: ${error.message}`, cause: error })
		case "HttpError":
			return new DurableStreamError({
				message: `HTTP ${error.status}: ${error.statusText}`,
				cause: error,
			})
		case "NetworkError":
			return new DurableStreamError({ message: error.message, cause: error })
	}
}

/**
 * Durable Stream Client Service
 *
 * Provides methods for publishing events to durable streams.
 */
export class DurableStreamClient extends Effect.Service<DurableStreamClient>()("DurableStreamClient", {
	accessors: true,
	effect: Effect.gen(function* () {
		const dsClient = yield* DSClient

		/**
		 * Create a stream if it doesn't exist
		 */
		const ensureStream = (path: string) =>
			dsClient.create(path, { contentType: "application/json" }).pipe(
				Effect.asVoid,
				Effect.catchTags({
					StreamConflictError: () => Effect.void, // Already exists, that's fine
					HttpError: (e) => Effect.fail(mapClientError(e)),
					NetworkError: (e) => Effect.fail(mapClientError(e)),
				}),
			)

		/**
		 * Publish an event to a stream
		 */
		const publish = (path: string, event: unknown) =>
			Effect.gen(function* () {
				// First ensure the stream exists
				yield* ensureStream(path)

				// Then append the event (must pass contentType for POST)
				yield* dsClient.append(path, JSON.stringify(event), {
					contentType: "application/json",
				})
			}).pipe(
				Effect.catchTags({
					StreamNotFoundError: (e) => Effect.fail(mapClientError(e)),
					StreamConflictError: (e) => Effect.fail(mapClientError(e)),
					HttpError: (e) => Effect.fail(mapClientError(e)),
					NetworkError: (e) => Effect.fail(mapClientError(e)),
					ContentTypeMismatchError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Content type mismatch: expected ${e.expected}, got ${e.received}`,
								cause: e,
							}),
						),
					InvalidOffsetError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Invalid offset: ${e.offset}`,
								cause: e,
							}),
						),
					SequenceConflictError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Sequence conflict: current=${e.currentSeq}, received=${e.receivedSeq}`,
								cause: e,
							}),
						),
					StaleEpochError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Stale epoch: current=${e.currentEpoch}`,
								cause: e,
							}),
						),
					SequenceGapError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Sequence gap: expected=${e.expectedSeq}, received=${e.receivedSeq}`,
								cause: e,
							}),
						),
					ParseError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Parse error: ${e.message}`,
								cause: e,
							}),
						),
					SSEParseError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `SSE parse error: ${e.message}`,
								cause: e,
							}),
						),
					TimeoutError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Timeout: ${e.message}`,
								cause: e,
							}),
						),
					ProducerClosedError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: "Producer closed",
								cause: e,
							}),
						),
					InvalidProducerOptionsError: (e) =>
						Effect.fail(
							new DurableStreamError({
								message: `Invalid producer options: ${e.message}`,
								cause: e,
							}),
						),
				}),
				Effect.withSpan("durable-stream.publish", { attributes: { path } }),
			)

		/**
		 * Publish a bot command event
		 */
		const publishBotCommand = (botId: string, event: unknown) =>
			publish(`/bots/${botId}/commands`, event).pipe(
				Effect.withSpan("durable-stream.publishBotCommand", { attributes: { botId } }),
			)

		return {
			publish,
			publishBotCommand,
			ensureStream,
		}
	}),
}) {}

/**
 * Default layer that reads config from environment
 */
export const DurableStreamClientLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const baseUrl = yield* Config.string("DURABLE_STREAM_URL").pipe(
			Config.withDefault("http://localhost:4437"),
		)
		const serviceToken = yield* Config.redacted("STREAM_SERVICE_TOKEN")

		return DurableStreamClient.Default.pipe(
			Layer.provide(
				DurableStreamClientLiveNode({
					baseUrl,
					headers: {
						Authorization: () => `Bearer ${Redacted.value(serviceToken)}`,
					},
					defaultContentType: "application/json",
				}),
			),
		)
	}),
)

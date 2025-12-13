import { HttpApiBuilder, HttpServerResponse } from "@effect/platform"
import { Duration, Effect, Option, Queue, Stream } from "effect"
import { StreamNotFoundError } from "../api/errors"
import { DurableStreamsApi } from "../api/group"
import { AppendResponse, initialOffset, parseOffset, StreamNotification, type StreamPath } from "../api/schemas"
import { StreamPubSub } from "../services/stream-pubsub"
import { StreamStore } from "../services/stream-store"

const REGISTRY_PATH = "__registry__" as StreamPath

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format JSON response - wrap data in array brackets.
 * Messages are stored as `{...},\n` so we strip trailing comma and wrap in [].
 */
function formatJsonResponse(data: Uint8Array): Uint8Array {
	if (data.length === 0) {
		return new TextEncoder().encode("[]")
	}

	// Strip trailing comma + newline if present
	let endIndex = data.length
	while (endIndex > 0) {
		const byte = data[endIndex - 1]
		if (byte === 44 /* comma */ || byte === 10 /* newline */ || byte === 13 /* CR */) {
			endIndex--
		} else {
			break
		}
	}

	const trimmed = data.slice(0, endIndex)
	const result = new Uint8Array(trimmed.length + 2)
	result[0] = 91 // [
	result.set(trimmed, 1)
	result[result.length - 1] = 93 // ]
	return result
}

// =============================================================================
// HTTP Handlers
// =============================================================================

export const HttpDurableStreamsLive = HttpApiBuilder.group(DurableStreamsApi, "durable-streams", (handlers) =>
	handlers
		// PUT /v1/stream/:path - Create stream
		.handle("create", ({ path: pathParam, payload }) =>
			Effect.gen(function* () {
				const store = yield* StreamStore
				const path = pathParam.path

				const metadata = yield* store.create(
					path,
					payload.contentType ?? "application/octet-stream",
					payload.ttlSeconds,
				)

				// Append lifecycle event to __registry__ (unless we're creating __registry__ itself)
				if (path !== REGISTRY_PATH) {
					const registryEvent = JSON.stringify({
						type: "created",
						path,
						contentType: metadata.contentType,
						timestamp: Date.now(),
					})
					yield* store.append(REGISTRY_PATH, new TextEncoder().encode(registryEvent)).pipe(
						Effect.catchAll(() => Effect.void), // Ignore if registry doesn't exist yet
					)
				}

				yield* Effect.logInfo("Created stream", {
					path,
					contentType: metadata.contentType,
					ttlSeconds: metadata.ttlSeconds,
				})

				return metadata
			}),
		)

		// POST /v1/stream/:path - Append data
		.handle("append", ({ path: pathParam, payload, headers }) =>
			Effect.gen(function* () {
				const store = yield* StreamStore
				const pubsub = yield* StreamPubSub
				const path = pathParam.path

				const expectedSeq = headers["stream-seq"]

				const result = yield* store.append(path, payload, expectedSeq)

				// Get metadata to publish notification
				const metadata = yield* store.getMetadata(path)

				if (Option.isSome(metadata)) {
					yield* pubsub.publish(
						new StreamNotification({
							streamId: metadata.value.id,
							path,
							newOffset: result.offset,
							seq: result.seq,
						}),
					)
				}

				yield* Effect.logDebug("Appended to stream", {
					path,
					offset: result.offset,
					seq: result.seq,
					size: payload.length,
				})

				return new AppendResponse(result)
			}),
		)

		// GET /v1/stream/:path - Read data
		.handle("read", ({ path: pathParam, urlParams }) =>
			Effect.gen(function* () {
				const store = yield* StreamStore
				const pubsub = yield* StreamPubSub
				const path = pathParam.path

				const liveMode = urlParams.live ?? "catch-up"
				const timeout = urlParams.timeout ?? 30000

				// Get metadata first to verify stream exists and get content type
				const metadata = yield* store.getMetadata(path)
				if (Option.isNone(metadata)) {
					return yield* Effect.fail(
						new StreamNotFoundError({
							path,
							message: `Stream not found at path: ${path}`,
						}),
					)
				}
				const streamMeta = metadata.value

				// For SSE mode, we return a streaming response
				if (liveMode === "sse") {
					// Get initial stream to verify it exists
					const messageStream = yield* store.readStream(path, urlParams.offset)

					// Format as SSE events
					const sseStream = messageStream.pipe(
						Stream.map((msg) => {
							const data = new TextDecoder().decode(msg.data)
							return `event: data\ndata: ${data}\n\nevent: control\ndata: ${JSON.stringify({ streamNextOffset: msg.offset })}\n\n`
						}),
						Stream.encodeText,
					)

					return HttpServerResponse.stream(sseStream, {
						contentType: "text/event-stream",
						headers: {
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
						},
					})
				}

				// For long-poll mode, wait for new data if at end
				if (liveMode === "long-poll") {
					const currentOffset = urlParams.offset ?? initialOffset()
					const parsed = parseOffset(currentOffset)

					// Check if we're at the end of the stream
					if (parsed.byteOffset >= streamMeta.totalBytes) {
						// Wait for new data
						yield* Effect.scoped(
							Effect.gen(function* () {
								const queue = yield* pubsub.subscribeById(streamMeta.id)

								// Wait for notification or timeout
								yield* Queue.take(queue).pipe(
									Effect.timeout(Duration.millis(timeout)),
									Effect.option,
									Effect.asVoid,
								)
							}),
						)
					}
				}

				// Catch-up mode (or after long-poll wait) - read available data
				const result = yield* store.read(path, urlParams.offset)

				yield* Effect.logDebug("Read from stream", {
					path,
					offset: result.offset,
					hasMore: result.hasMore,
					size: result.data.length,
				})

				// Build response headers
				const headers: Record<string, string> = {
					"stream-next-offset": result.offset,
					"content-type": streamMeta.contentType,
				}

				// Set up-to-date header if no more data
				if (!result.hasMore) {
					headers["stream-up-to-date"] = "true"
				}

				// For JSON streams, wrap data in [] brackets
				let responseData = result.data
				if (streamMeta.contentType === "application/json") {
					responseData = formatJsonResponse(result.data)
				}

				return HttpServerResponse.uint8Array(responseData, {
					status: 200,
					headers,
				})
			}),
		)

		// HEAD /v1/stream/:path - Get metadata
		.handle("metadata", ({ path: pathParam }) =>
			Effect.gen(function* () {
				const store = yield* StreamStore
				const path = pathParam.path
				const metadata = yield* store.getMetadata(path)

				if (Option.isNone(metadata)) {
					return yield* Effect.fail(
						new StreamNotFoundError({
							path,
							message: `Stream not found at path: ${path}`,
						}),
					)
				}

				const meta = metadata.value

				// Return metadata via headers
				return HttpServerResponse.empty({
					status: 200,
					headers: {
						"stream-next-offset": meta.currentOffset,
						"stream-seq": String(meta.writeSeq),
						"content-type": meta.contentType,
						"stream-total-bytes": String(meta.totalBytes),
					},
				})
			}),
		)

		// DELETE /v1/stream/:path - Delete stream
		.handle("delete", ({ path: pathParam }) =>
			Effect.gen(function* () {
				const store = yield* StreamStore
				const path = pathParam.path

				yield* store.delete(path)

				// Append lifecycle event to __registry__ (unless we're deleting __registry__ itself)
				if (path !== REGISTRY_PATH) {
					const registryEvent = JSON.stringify({
						type: "deleted",
						path,
						timestamp: Date.now(),
					})
					yield* store.append(REGISTRY_PATH, new TextEncoder().encode(registryEvent)).pipe(
						Effect.catchAll(() => Effect.void), // Ignore if registry doesn't exist
					)
				}

				yield* Effect.logInfo("Deleted stream", { path })
			}),
		),
)

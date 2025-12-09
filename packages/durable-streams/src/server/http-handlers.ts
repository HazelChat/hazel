/**
 * HTTP Handlers for Durable Streams Protocol
 *
 * Implements the HTTP API following the Electric Durable Stream Protocol.
 */

import {
	HttpRouter,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform"
import { Effect, Stream, Duration, Option, Schedule } from "effect"
import { DurableStreamStorage } from "./storage.ts"
import type { StreamId } from "../message.ts"
import { OffsetUtils, type OffsetParam } from "../offset.ts"
import {
	STREAM_OFFSET_HEADER,
	STREAM_UP_TO_DATE_HEADER,
	STREAM_CURSOR_HEADER,
	STREAM_SEQ_HEADER,
	STREAM_TTL_HEADER,
	STREAM_EXPIRES_AT_HEADER,
	OFFSET_QUERY_PARAM,
	LIVE_QUERY_PARAM,
	CURSOR_QUERY_PARAM,
	DEFAULT_LONG_POLL_TIMEOUT_MS,
	START_OFFSET,
	SSE_COMPATIBLE_CONTENT_TYPES,
} from "../constants.ts"
import { StreamNotFoundError, WriteConflictError, SSENotSupportedError, OffsetOutOfRangeError } from "../errors.ts"

/**
 * Extract stream ID from route params.
 * Supports both /:streamId and nested paths like /conversation/:id/response/:responseId
 */
const getStreamId = Effect.gen(function* () {
	const request = yield* HttpServerRequest.HttpServerRequest
	// Get the path after the mount point
	const url = new URL(request.url, "http://localhost")
	// Remove leading slash
	const streamId = url.pathname.slice(1)
	return streamId as StreamId
})

/**
 * Get query parameter from request.
 */
const getQueryParam = (name: string) =>
	Effect.gen(function* () {
		const request = yield* HttpServerRequest.HttpServerRequest
		const url = new URL(request.url, "http://localhost")
		return url.searchParams.get(name)
	})

/**
 * Get header from request.
 */
const getHeader = (name: string) =>
	Effect.gen(function* () {
		const request = yield* HttpServerRequest.HttpServerRequest
		return request.headers[name.toLowerCase()] ?? null
	})

/**
 * Handle long-poll: wait for new data with timeout.
 */
const handleLongPoll = (streamId: StreamId, fromOffset: OffsetParam, timeout: number) =>
	Effect.gen(function* () {
		const storage = yield* DurableStreamStorage

		// Subscribe to the stream and take the first message
		const result = yield* storage
			.subscribe(streamId, fromOffset)
			.pipe(
				Stream.take(1),
				Stream.runCollect,
				Effect.timeout(Duration.millis(timeout)),
				Effect.option,
			)

		if (Option.isNone(result) || result.value.length === 0) {
			// Timeout - return 204 No Content
			const metadata = yield* storage.head(streamId)
			return HttpServerResponse.empty({ status: 204 }).pipe(
				HttpServerResponse.setHeader(STREAM_OFFSET_HEADER, metadata.tailOffset),
			)
		}

		const messages = Array.from(result.value)
		const lastMessage = messages[messages.length - 1]
		const data = concatUint8Arrays(messages.map((m) => m.data))

		return HttpServerResponse.uint8Array(data, { status: 200 }).pipe(
			HttpServerResponse.setHeader(STREAM_OFFSET_HEADER, lastMessage?.offset ?? ""),
			HttpServerResponse.setHeader(STREAM_UP_TO_DATE_HEADER, "true"),
		)
	})

/**
 * Handle SSE: return Server-Sent Events stream.
 */
const handleSSE = (streamId: StreamId, fromOffset: OffsetParam, contentType: string | undefined) =>
	Effect.gen(function* () {
		// Check if content type is SSE-compatible
		const isCompatible =
			contentType === undefined ||
			SSE_COMPATIBLE_CONTENT_TYPES.some((prefix) => contentType.startsWith(prefix))

		if (!isCompatible) {
			return yield* Effect.fail(
				new SSENotSupportedError({
					streamId,
					contentType: contentType ?? "unknown",
					message: `SSE is not supported for content-type: ${contentType}`,
				}),
			)
		}

		const storage = yield* DurableStreamStorage

		// Create SSE stream
		const sseStream = storage.subscribe(streamId, fromOffset).pipe(
			Stream.map((message) => {
				// Format as SSE event
				const dataLines = formatSSEData(message.data, contentType)
				const controlEvent = JSON.stringify({
					[STREAM_OFFSET_HEADER]: message.offset,
				})
				return `event: data\n${dataLines}\n\nevent: control\ndata: ${controlEvent}\n\n`
			}),
			Stream.encodeText,
		)

		return HttpServerResponse.stream(sseStream, {
			status: 200,
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		})
	})

/**
 * Format data for SSE.
 */
const formatSSEData = (data: Uint8Array, contentType: string | undefined): string => {
	const text = new TextDecoder().decode(data)

	if (contentType?.includes("application/json")) {
		// Wrap in array format for JSON
		return `data: [\ndata: ${text},\ndata: ]`
	}

	// For text, prefix each line with "data: "
	return text
		.split("\n")
		.map((line) => `data: ${line}`)
		.join("\n")
}

/**
 * Concatenate multiple Uint8Arrays into one.
 */
const concatUint8Arrays = (arrays: Uint8Array[]): Uint8Array => {
	const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
	const result = new Uint8Array(totalLength)
	let offset = 0
	for (const arr of arrays) {
		result.set(arr, offset)
		offset += arr.length
	}
	return result
}

/**
 * Create a JSON error response without using Effect.
 */
const jsonErrorResponse = (body: Record<string, unknown>, status: number): HttpServerResponse.HttpServerResponse =>
	HttpServerResponse.text(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	})

/**
 * Handle errors and convert to appropriate HTTP responses.
 */
const handleStreamError = <A, R>(
	effect: Effect.Effect<A, unknown, R>,
): Effect.Effect<A | HttpServerResponse.HttpServerResponse, never, R> =>
	effect.pipe(
		Effect.catchAll((error) => {
			// Handle tagged errors
			if (typeof error === "object" && error !== null && "_tag" in error) {
				const taggedError = error as { _tag: string; streamId?: string; reason?: string; message?: string; requestedOffset?: string; contentType?: string }
				switch (taggedError._tag) {
					case "StreamNotFoundError":
						return Effect.succeed(jsonErrorResponse({ error: "StreamNotFoundError", streamId: taggedError.streamId }, 404))
					case "WriteConflictError":
						return Effect.succeed(jsonErrorResponse({ error: "WriteConflictError", reason: taggedError.reason, message: taggedError.message }, 409))
					case "OffsetOutOfRangeError":
						return Effect.succeed(jsonErrorResponse({ error: "OffsetOutOfRangeError", streamId: taggedError.streamId, offset: taggedError.requestedOffset }, 416))
					case "SSENotSupportedError":
						return Effect.succeed(jsonErrorResponse({ error: "SSENotSupportedError", streamId: taggedError.streamId, contentType: taggedError.contentType }, 400))
				}
			}
			// Default error handling
			return Effect.succeed(jsonErrorResponse({ error: "InternalError", message: String(error) }, 500))
		}),
	)

/**
 * PUT handler - Create stream.
 */
const createHandler = Effect.gen(function* () {
	const storage = yield* DurableStreamStorage
	const streamId = yield* getStreamId
	const contentType = yield* getHeader("content-type")
	const ttl = yield* getHeader(STREAM_TTL_HEADER)
	const expiresAt = yield* getHeader(STREAM_EXPIRES_AT_HEADER)

	const metadata = yield* storage.create(streamId, {
		contentType: contentType ?? undefined,
		ttlSeconds: ttl ? parseInt(ttl, 10) : undefined,
		expiresAt: expiresAt ?? undefined,
	})

	return HttpServerResponse.empty({ status: 201 }).pipe(
		HttpServerResponse.setHeader(STREAM_OFFSET_HEADER, metadata.tailOffset),
		HttpServerResponse.setHeader("Location", `/${streamId}`),
	)
}).pipe(handleStreamError)

/**
 * POST handler - Append to stream.
 */
const appendHandler = Effect.gen(function* () {
	const storage = yield* DurableStreamStorage
	const streamId = yield* getStreamId
	const request = yield* HttpServerRequest.HttpServerRequest
	const body = yield* request.arrayBuffer
	const seq = yield* getHeader(STREAM_SEQ_HEADER)

	if (body.byteLength === 0) {
		return jsonErrorResponse({ error: "BadRequest", message: "Empty body not allowed" }, 400)
	}

	const data = new Uint8Array(body)
	const result = yield* storage.append(streamId, data, {
		seq: seq ?? undefined,
	})

	return HttpServerResponse.empty({ status: 204 }).pipe(HttpServerResponse.setHeader(STREAM_OFFSET_HEADER, result.offset))
}).pipe(handleStreamError)

/**
 * GET handler - Read from stream (supports long-poll and SSE).
 */
const readHandler = Effect.gen(function* () {
	const storage = yield* DurableStreamStorage
	const streamId = yield* getStreamId
	const offsetParam = yield* getQueryParam(OFFSET_QUERY_PARAM)
	const liveMode = yield* getQueryParam(LIVE_QUERY_PARAM)
	const cursor = yield* getQueryParam(CURSOR_QUERY_PARAM)

	const fromOffset: OffsetParam = (offsetParam ?? START_OFFSET) as OffsetParam

	// Get stream metadata to check content type for SSE
	const metadata = yield* storage.head(streamId)

	// Handle SSE mode
	if (liveMode === "sse") {
		return yield* handleSSE(streamId, fromOffset, metadata.contentType)
	}

	// Handle long-poll mode
	if (liveMode === "long-poll") {
		return yield* handleLongPoll(streamId, fromOffset, DEFAULT_LONG_POLL_TIMEOUT_MS)
	}

	// Regular catch-up read
	const result = yield* storage.read(streamId, fromOffset)

	const data = concatUint8Arrays(result.messages.map((m) => m.data))

	let response = HttpServerResponse.uint8Array(data, { status: 200 }).pipe(
		HttpServerResponse.setHeader(STREAM_OFFSET_HEADER, result.nextOffset),
	)

	if (result.upToDate) {
		response = HttpServerResponse.setHeader(response, STREAM_UP_TO_DATE_HEADER, "true")
	}

	if (result.cursor) {
		response = HttpServerResponse.setHeader(response, STREAM_CURSOR_HEADER, result.cursor)
	}

	if (metadata.contentType) {
		response = HttpServerResponse.setHeader(response, "Content-Type", metadata.contentType)
	}

	return response
}).pipe(handleStreamError)

/**
 * HEAD handler - Get stream metadata.
 */
const headHandler = Effect.gen(function* () {
	const storage = yield* DurableStreamStorage
	const streamId = yield* getStreamId

	const metadata = yield* storage.head(streamId)

	let response = HttpServerResponse.empty({ status: 200 }).pipe(
		HttpServerResponse.setHeader(STREAM_OFFSET_HEADER, metadata.tailOffset),
		HttpServerResponse.setHeader("Cache-Control", "no-store"),
	)

	if (metadata.contentType) {
		response = HttpServerResponse.setHeader(response, "Content-Type", metadata.contentType)
	}

	return response
}).pipe(handleStreamError)

/**
 * DELETE handler - Delete stream.
 */
const deleteHandler = Effect.gen(function* () {
	const storage = yield* DurableStreamStorage
	const streamId = yield* getStreamId

	yield* storage.delete(streamId)

	return HttpServerResponse.empty({ status: 204 })
}).pipe(handleStreamError)

/**
 * Durable Streams HTTP Router.
 *
 * Mount this router at your desired path, e.g., "/streams".
 *
 * @example
 * ```typescript
 * const app = HttpRouter.empty.pipe(
 *   HttpRouter.mount("/streams", DurableStreamRouter)
 * )
 * ```
 */
export const DurableStreamRouter = HttpRouter.empty.pipe(
	// We use a catch-all pattern since stream IDs can be paths
	HttpRouter.put("/*", createHandler),
	HttpRouter.post("/*", appendHandler),
	HttpRouter.get("/*", readHandler),
	HttpRouter.head("/*", headHandler),
	HttpRouter.del("/*", deleteHandler),
)

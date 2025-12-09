/**
 * DurableStream Client
 *
 * Effect-based client for durable streams following the Electric protocol.
 * Provides automatic resumption, reconnection, and Effect Stream integration.
 */

import { Effect, Stream, Schedule, Duration, Ref, Option } from "effect"
import {
	STREAM_OFFSET_HEADER,
	STREAM_UP_TO_DATE_HEADER,
	STREAM_CURSOR_HEADER,
	STREAM_SEQ_HEADER,
	STREAM_TTL_HEADER,
	STREAM_EXPIRES_AT_HEADER,
	OFFSET_QUERY_PARAM,
	LIVE_QUERY_PARAM,
	START_OFFSET,
} from "../constants.ts"
import type { Offset, OffsetParam } from "../offset.ts"
import type { StreamChunk, HeadResult, CreateStreamOptions } from "../message.ts"
import { FetchError, StreamNotFoundError, WriteConflictError } from "../errors.ts"
import { type ResumeState, noOpResumeState } from "./resume-state.ts"

/**
 * Authentication options.
 */
export type Auth =
	| { token: string; headerName?: string }
	| { headers: Record<string, string> }
	| { getHeaders: () => Promise<Record<string, string>> }

/**
 * Configuration for DurableStream client.
 */
export interface DurableStreamConfig {
	/** The full URL to the durable stream */
	readonly url: string

	/** Authentication configuration */
	readonly auth?: Auth

	/** Additional headers to include in requests */
	readonly headers?: Record<string, string>

	/** Custom fetch implementation (defaults to globalThis.fetch) */
	readonly fetch?: typeof fetch

	/** Default AbortSignal for operations */
	readonly signal?: AbortSignal

	/** Backoff schedule for reconnection (defaults to exponential backoff) */
	readonly backoff?: Schedule.Schedule<unknown, unknown>

	/** Resume state for offset persistence */
	readonly resumeState?: ResumeState

	/** Long-poll timeout in milliseconds (defaults to 30000) */
	readonly longPollTimeout?: number
}

/**
 * Options for read operations.
 */
export interface ReadOptions {
	/** Starting offset (defaults to resume state or "-1") */
	readonly offset?: OffsetParam

	/** Live mode behavior:
	 * - false: Only catch-up, stop at up-to-date
	 * - true/undefined: Catch-up then long-poll for live updates
	 * - "long-poll": Explicit long-poll mode
	 */
	readonly live?: boolean | "long-poll"

	/** Transform function to convert raw bytes to typed data */
	readonly transform?: <A>(data: Uint8Array) => A

	/** Abort signal for this read operation */
	readonly signal?: AbortSignal
}

/**
 * Result from a single read operation.
 */
export interface ReadResult {
	readonly data: Uint8Array
	readonly offset: Offset
	readonly upToDate: boolean
	readonly cursor?: string
	readonly contentType?: string
}

/**
 * DurableStream - Effect-based client for durable streams.
 *
 * Provides automatic resumption from saved offsets, reconnection with
 * exponential backoff, and seamless Effect Stream integration.
 *
 * @example
 * ```typescript
 * const stream = new DurableStream({
 *   url: "https://api.example.com/streams/my-stream",
 *   auth: { token: "my-token" },
 *   resumeState: makeLocalStorageResumeState(),
 * })
 *
 * // Read with automatic resume
 * yield* stream.read().pipe(
 *   Stream.tap((chunk) => Effect.log(`Got: ${chunk.offset}`)),
 *   Stream.runDrain
 * )
 * ```
 */
export class DurableStream {
	readonly url: string
	private readonly _config: DurableStreamConfig
	private readonly _fetchClient: typeof fetch
	private readonly _resumeState: ResumeState
	private readonly _defaultBackoff: Schedule.Schedule<unknown, unknown>

	/** Content type of the stream (populated after HEAD/read) */
	contentType?: string

	constructor(config: DurableStreamConfig) {
		this.url = config.url
		this._config = config
		this._fetchClient = config.fetch ?? globalThis.fetch.bind(globalThis)
		this._resumeState = config.resumeState ?? noOpResumeState

		// Default backoff: exponential with max 60s
		this._defaultBackoff =
			config.backoff ?? Schedule.exponential(Duration.millis(100), 2).pipe(Schedule.either(Schedule.spaced(Duration.seconds(60))))
	}

	/**
	 * Create this stream.
	 *
	 * @param options - Creation options (contentType, TTL)
	 */
	create(options?: CreateStreamOptions): Effect.Effect<void, FetchError | WriteConflictError> {
		const self = this
		return Effect.gen(function* () {
			const headers = yield* self._buildHeaders()

			if (options?.contentType) {
				headers["content-type"] = options.contentType
			}
			if (options?.ttlSeconds !== undefined) {
				headers[STREAM_TTL_HEADER] = String(options.ttlSeconds)
			}
			if (options?.expiresAt) {
				headers[STREAM_EXPIRES_AT_HEADER] = options.expiresAt
			}

			const response = yield* Effect.tryPromise({
				try: () =>
					self._fetchClient(self.url, {
						method: "PUT",
						headers,
						signal: self._config.signal,
					}),
				catch: (e) => new FetchError({ message: String(e) }),
			})

			if (!response.ok) {
				if (response.status === 409) {
					return yield* Effect.fail(
						new WriteConflictError({
							streamId: self.url,
							reason: "stream_exists",
							message: "Stream already exists with different configuration",
						}),
					)
				}
				return yield* Effect.fail(
					new FetchError({
						status: response.status,
						statusText: response.statusText,
						message: `Failed to create stream: ${response.status}`,
					}),
				)
			}

			const ct = response.headers.get("content-type")
			if (ct) {
				self.contentType = ct
			}
		})
	}

	/**
	 * Append data to the stream.
	 *
	 * @param data - Data to append (Uint8Array or string)
	 * @param options - Append options (seq for writer coordination)
	 */
	append(
		data: Uint8Array | string,
		options?: { seq?: string },
	): Effect.Effect<{ offset: Offset }, FetchError | StreamNotFoundError | WriteConflictError> {
		const self = this
		return Effect.gen(function* () {
			const headers = yield* self._buildHeaders()

			if (self.contentType) {
				headers["content-type"] = self.contentType
			}
			if (options?.seq) {
				headers[STREAM_SEQ_HEADER] = options.seq
			}

			const bodyBytes = typeof data === "string" ? new TextEncoder().encode(data) : data
			// Convert to ArrayBuffer for fetch compatibility
			const bodyBuffer = new ArrayBuffer(bodyBytes.byteLength)
			new Uint8Array(bodyBuffer).set(bodyBytes)

			const response = yield* Effect.tryPromise({
				try: () =>
					self._fetchClient(self.url, {
						method: "POST",
						headers,
						body: bodyBuffer,
						signal: self._config.signal,
					}),
				catch: (e) => new FetchError({ message: String(e) }),
			})

			if (!response.ok) {
				if (response.status === 404) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId: self.url }))
				}
				if (response.status === 409) {
					return yield* Effect.fail(
						new WriteConflictError({
							streamId: self.url,
							reason: "seq_regression",
							message: "Sequence conflict",
						}),
					)
				}
				return yield* Effect.fail(
					new FetchError({
						status: response.status,
						statusText: response.statusText,
						message: `Failed to append: ${response.status}`,
					}),
				)
			}

			const offset = response.headers.get(STREAM_OFFSET_HEADER) as Offset
			return { offset }
		})
	}

	/**
	 * Read from the stream as an Effect Stream.
	 *
	 * This is the primary method for consuming durable streams.
	 * It automatically:
	 * - Resumes from the last saved offset (if resumeState is configured)
	 * - Performs catch-up reads until up-to-date
	 * - Switches to long-poll mode for live updates (if live !== false)
	 * - Reconnects with exponential backoff on failures
	 * - Saves offsets after each chunk
	 *
	 * @param options - Read options
	 * @returns Effect Stream of stream chunks
	 */
	read(options?: ReadOptions): Stream.Stream<StreamChunk, FetchError | StreamNotFoundError> {
		const self = this
		const liveMode = options?.live

		return Stream.unwrap(
			Effect.gen(function* () {
				// Get starting offset from options, resume state, or start
				let startOffset: OffsetParam = options?.offset ?? (START_OFFSET as OffsetParam)

				if (options?.offset === undefined) {
					const resumedOffset = yield* self._resumeState.getOffset(self.url)
					if (resumedOffset !== undefined) {
						startOffset = resumedOffset
					}
				}

				// Track current offset
				const offsetRef = yield* Ref.make<OffsetParam>(startOffset)
				const upToDateRef = yield* Ref.make(false)

				// Create the stream with retry logic
				const baseStream = Stream.repeatEffectOption(
					Effect.gen(function* () {
						const currentOffset = yield* Ref.get(offsetRef)
						const isUpToDate = yield* Ref.get(upToDateRef)

						// If live mode is disabled and we're up-to-date, stop
						if (liveMode === false && isUpToDate) {
							return yield* Effect.fail(Option.none())
						}

						// Determine which mode to use for this fetch
						const shouldLongPoll = isUpToDate && liveMode !== false

						const chunk = yield* self._fetchOnce({
							offset: currentOffset,
							live: shouldLongPoll ? "long-poll" : undefined,
							signal: options?.signal,
						}).pipe(Effect.mapError(Option.some))

						// Update state
						yield* Ref.set(offsetRef, chunk.offset)
						yield* Ref.set(upToDateRef, chunk.upToDate)

						// Save offset to resume state
						yield* self._resumeState.setOffset(self.url, chunk.offset)

						// Update content type if returned
						if (chunk.contentType && !self.contentType) {
							self.contentType = chunk.contentType
						}

						return chunk
					}),
				)

				// Add retry with backoff
				return baseStream.pipe(
					Stream.retry(
						Schedule.whileInput(self._defaultBackoff, (error: FetchError | StreamNotFoundError) => {
							// Don't retry on 404 (stream not found)
							if (error._tag === "StreamNotFoundError") {
								return false
							}
							// Retry on network errors and 5xx
							if (error._tag === "FetchError") {
								const status = error.status
								return status === undefined || status >= 500
							}
							return false
						}),
					),
				)
			}),
		)
	}

	/**
	 * Perform a single read operation.
	 *
	 * @param options - Read options
	 * @returns Read result
	 */
	readOnce(options?: { offset?: OffsetParam; signal?: AbortSignal }): Effect.Effect<ReadResult, FetchError | StreamNotFoundError> {
		return this._fetchOnce({
			offset: options?.offset ?? (START_OFFSET as OffsetParam),
			signal: options?.signal,
		})
	}

	/**
	 * Get stream metadata via HEAD request.
	 */
	head(): Effect.Effect<HeadResult, FetchError | StreamNotFoundError> {
		const self = this
		return Effect.gen(function* () {
			const headers = yield* self._buildHeaders()

			const response = yield* Effect.tryPromise({
				try: () =>
					self._fetchClient(self.url, {
						method: "HEAD",
						headers,
						signal: self._config.signal,
					}),
				catch: (e) => new FetchError({ message: String(e) }),
			})

			if (!response.ok) {
				if (response.status === 404) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId: self.url }))
				}
				return yield* Effect.fail(
					new FetchError({
						status: response.status,
						statusText: response.statusText,
						message: `HEAD failed: ${response.status}`,
					}),
				)
			}

			const contentType = response.headers.get("content-type") ?? undefined
			const offset = (response.headers.get(STREAM_OFFSET_HEADER) as Offset) ?? undefined

			if (contentType) {
				self.contentType = contentType
			}

			return {
				exists: true as const,
				contentType,
				offset,
				etag: response.headers.get("etag") ?? undefined,
				cacheControl: response.headers.get("cache-control") ?? undefined,
			}
		})
	}

	/**
	 * Delete the stream.
	 */
	delete(): Effect.Effect<void, FetchError | StreamNotFoundError> {
		const self = this
		return Effect.gen(function* () {
			const headers = yield* self._buildHeaders()

			const response = yield* Effect.tryPromise({
				try: () =>
					self._fetchClient(self.url, {
						method: "DELETE",
						headers,
						signal: self._config.signal,
					}),
				catch: (e) => new FetchError({ message: String(e) }),
			})

			if (!response.ok) {
				if (response.status === 404) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId: self.url }))
				}
				return yield* Effect.fail(
					new FetchError({
						status: response.status,
						statusText: response.statusText,
						message: `DELETE failed: ${response.status}`,
					}),
				)
			}

			// Clear resume state
			yield* self._resumeState.clearOffset(self.url)
		})
	}

	/**
	 * Get the last saved offset for this stream.
	 */
	getLastOffset(): Effect.Effect<Offset | undefined> {
		return this._resumeState.getOffset(this.url)
	}

	/**
	 * Manually save an offset for this stream.
	 */
	saveOffset(offset: Offset): Effect.Effect<void> {
		return this._resumeState.setOffset(this.url, offset)
	}

	// Private methods

	private _fetchOnce(options: {
		offset: OffsetParam
		live?: "long-poll"
		signal?: AbortSignal
	}): Effect.Effect<StreamChunk, FetchError | StreamNotFoundError> {
		const self = this
		return Effect.gen(function* () {
			const headers = yield* self._buildHeaders()

			const url = new URL(self.url)
			url.searchParams.set(OFFSET_QUERY_PARAM, options.offset)
			if (options.live) {
				url.searchParams.set(LIVE_QUERY_PARAM, options.live)
			}

			const response = yield* Effect.tryPromise({
				try: () =>
					self._fetchClient(url.toString(), {
						method: "GET",
						headers,
						signal: options.signal ?? self._config.signal,
					}),
				catch: (e) => new FetchError({ message: String(e) }),
			})

			if (!response.ok) {
				if (response.status === 404) {
					return yield* Effect.fail(new StreamNotFoundError({ streamId: self.url }))
				}
				// 204 means long-poll timeout (no new data)
				if (response.status === 204) {
					const offset = (response.headers.get(STREAM_OFFSET_HEADER) as Offset) ?? (options.offset as Offset)
					return {
						data: new Uint8Array(0),
						offset,
						upToDate: true,
						contentType: self.contentType,
					}
				}
				return yield* Effect.fail(
					new FetchError({
						status: response.status,
						statusText: response.statusText,
						message: `GET failed: ${response.status}`,
					}),
				)
			}

			const data = new Uint8Array(yield* Effect.promise(() => response.arrayBuffer()))
			const offset = response.headers.get(STREAM_OFFSET_HEADER) as Offset
			const upToDate = response.headers.has(STREAM_UP_TO_DATE_HEADER)
			const cursor = response.headers.get(STREAM_CURSOR_HEADER) ?? undefined
			const contentType = response.headers.get("content-type") ?? undefined

			return {
				data,
				offset,
				upToDate,
				cursor,
				contentType,
			}
		})
	}

	private _buildHeaders(): Effect.Effect<Record<string, string>> {
		const self = this
		return Effect.gen(function* () {
			const headers: Record<string, string> = { ...self._config.headers }

			const auth = self._config.auth
			if (auth) {
				if ("token" in auth) {
					const headerName = auth.headerName ?? "authorization"
					headers[headerName] = `Bearer ${auth.token}`
				} else if ("headers" in auth) {
					Object.assign(headers, auth.headers)
				} else if ("getHeaders" in auth) {
					const authHeaders = yield* Effect.promise(() => auth.getHeaders())
					Object.assign(headers, authHeaders)
				}
			}

			return headers
		})
	}
}

/**
 * Convenience function to create a DurableStream.
 */
export const makeDurableStream = (config: DurableStreamConfig): DurableStream => new DurableStream(config)

/**
 * JSON helper: read stream as parsed JSON objects.
 *
 * @example
 * ```typescript
 * yield* readJson(stream).pipe(
 *   Stream.tap((obj) => Effect.log(obj.token)),
 *   Stream.runDrain
 * )
 * ```
 */
export const readJson = <A>(
	stream: DurableStream,
	options?: ReadOptions,
): Stream.Stream<A, FetchError | StreamNotFoundError> =>
	stream.read(options).pipe(
		Stream.flatMap((chunk) => {
			if (chunk.data.length === 0) {
				return Stream.empty
			}
			const text = new TextDecoder().decode(chunk.data)
			// Handle newline-delimited JSON
			const lines = text.split("\n").filter((l) => l.trim())
			return Stream.fromIterable(lines.map((line) => JSON.parse(line) as A))
		}),
	)

/**
 * Text helper: read stream as text strings.
 */
export const readText = (
	stream: DurableStream,
	options?: ReadOptions,
): Stream.Stream<string, FetchError | StreamNotFoundError> =>
	stream.read(options).pipe(
		Stream.map((chunk) => new TextDecoder().decode(chunk.data)),
		Stream.filter((text) => text.length > 0),
	)

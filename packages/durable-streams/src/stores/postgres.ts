import { PgClient } from "@effect/sql-pg"
import { DateTime, Effect, Layer, Option, Stream } from "effect"
import {
	InternalStreamError,
	SequenceConflictError,
	StreamAlreadyExistsError,
	StreamExpiredError,
	StreamNotFoundError,
} from "../api/errors"
import {
	createOffset,
	initialOffset,
	parseOffset,
	type StreamId,
	StreamMessage,
	StreamMetadata,
	type StreamOffset,
	type StreamPath,
} from "../api/schemas"
import type { DurableStream, DurableStreamChunk } from "../schema/streams"
import { StreamStore, type StreamStoreService } from "../services/stream-store"

// =============================================================================
// Helper Functions
// =============================================================================

const toStreamMetadata = (row: DurableStream): StreamMetadata =>
	new StreamMetadata({
		id: row.id as StreamId,
		path: row.path as StreamPath,
		contentType: row.contentType,
		writeSeq: row.writeSeq,
		totalBytes: row.totalBytes,
		currentOffset: createOffset(row.writeSeq, row.totalBytes),
		ttlSeconds: row.ttlSeconds ?? undefined,
		expiresAt: row.expiresAt ? DateTime.unsafeFromDate(row.expiresAt) : undefined,
		createdAt: DateTime.unsafeFromDate(row.createdAt),
		updatedAt: DateTime.unsafeFromDate(row.updatedAt),
	})

const toStreamMessage = (row: DurableStreamChunk): StreamMessage =>
	new StreamMessage({
		streamId: row.streamId as StreamId,
		sequence: row.sequence,
		offset: createOffset(row.sequence, row.byteOffset + row.size),
		data: row.data as Uint8Array,
		size: row.size,
		isJsonBoundary: row.isJsonBoundary ?? undefined,
		createdAt: DateTime.unsafeFromDate(row.createdAt),
	})

// Helper to get first row from result
const firstRow = <T>(rows: ReadonlyArray<T>): T | undefined => rows[0]

// =============================================================================
// PostgreSQL Store Implementation
// =============================================================================

/**
 * PostgreSQL implementation of StreamStore using @effect/sql-pg
 */
export const PostgresStreamStoreLive = Layer.effect(
	StreamStore,
	Effect.gen(function* () {
		const sql = yield* PgClient.PgClient

		const service: StreamStoreService = {
			create: (path, contentType, ttlSeconds) =>
				Effect.gen(function* () {
					// Check if stream already exists
					const existingRows = yield* sql<DurableStream>`
						SELECT * FROM durable_streams
						WHERE path = ${path} AND deleted_at IS NULL
					`.pipe(Effect.orDie)

					if (existingRows.length > 0) {
						return yield* Effect.fail(
							new StreamAlreadyExistsError({
								path,
								message: `Stream already exists at path: ${path}`,
							}),
						)
					}

					const now = new Date()
					const expiresAt = ttlSeconds ? new Date(now.getTime() + ttlSeconds * 1000) : null

					const resultRows = yield* sql<DurableStream>`
						INSERT INTO durable_streams (path, content_type, ttl_seconds, expires_at, created_at, updated_at)
						VALUES (${path}, ${contentType}, ${ttlSeconds ?? null}, ${expiresAt}, ${now}, ${now})
						RETURNING *
					`.pipe(
						Effect.catchAll((e) =>
							Effect.fail(
								new InternalStreamError({
									message: "Failed to create stream",
									detail: String(e),
								}),
							),
						),
					)

					const result = firstRow(resultRows)
					if (!result) {
						return yield* Effect.fail(
							new InternalStreamError({
								message: "Failed to create stream - no result returned",
							}),
						)
					}

					return toStreamMetadata(result)
				}),

			delete: (path) =>
				Effect.gen(function* () {
					const resultRows = yield* sql`
						UPDATE durable_streams
						SET deleted_at = ${new Date()}
						WHERE path = ${path} AND deleted_at IS NULL
						RETURNING id
					`.pipe(Effect.orDie)

					if (resultRows.length === 0) {
						return yield* Effect.fail(
							new StreamNotFoundError({
								path,
								message: `Stream not found at path: ${path}`,
							}),
						)
					}
				}),

			getMetadata: (path) =>
				Effect.gen(function* () {
					const now = new Date()
					const resultRows = yield* sql<DurableStream>`
						SELECT * FROM durable_streams
						WHERE path = ${path}
						AND deleted_at IS NULL
						AND (expires_at IS NULL OR expires_at > ${now})
					`.pipe(Effect.orDie)

					const result = firstRow(resultRows)
					if (!result) {
						return Option.none<StreamMetadata>()
					}

					return Option.some(toStreamMetadata(result))
				}),

			getMetadataById: (id) =>
				Effect.gen(function* () {
					const now = new Date()
					const resultRows = yield* sql<DurableStream>`
						SELECT * FROM durable_streams
						WHERE id = ${id}
						AND deleted_at IS NULL
						AND (expires_at IS NULL OR expires_at > ${now})
					`.pipe(Effect.orDie)

					const result = firstRow(resultRows)
					if (!result) {
						return Option.none<StreamMetadata>()
					}

					return Option.some(toStreamMetadata(result))
				}),

			append: (path, data, expectedSeq) =>
				Effect.gen(function* () {
					const now = new Date()

					// Get stream with lock
					const streamRows = yield* sql<DurableStream>`
						SELECT * FROM durable_streams
						WHERE path = ${path} AND deleted_at IS NULL
						FOR UPDATE
					`.pipe(Effect.orDie)

					const stream = firstRow(streamRows)
					if (!stream) {
						return yield* Effect.fail(
							new StreamNotFoundError({
								path,
								message: `Stream not found at path: ${path}`,
							}),
						)
					}

					// Check expiration
					if (stream.expiresAt && stream.expiresAt < now) {
						return yield* Effect.fail(
							new StreamExpiredError({
								path,
								expiredAt: stream.expiresAt.toISOString(),
								message: `Stream at path ${path} has expired`,
							}),
						)
					}

					// Check sequence if provided
					if (expectedSeq !== undefined && expectedSeq !== stream.writeSeq) {
						return yield* Effect.fail(
							new SequenceConflictError({
								expectedSeq,
								actualSeq: stream.writeSeq,
								message: `Sequence conflict: expected ${expectedSeq}, got ${stream.writeSeq}`,
							}),
						)
					}

					const newSeq = stream.writeSeq + 1
					const newByteOffset = stream.totalBytes + data.length
					const newOffset = createOffset(newSeq, newByteOffset)

					// Insert chunk
					yield* sql`
						INSERT INTO durable_stream_chunks
						(stream_id, sequence, byte_offset, data, size, created_at)
						VALUES (${stream.id}, ${newSeq}, ${stream.totalBytes}, ${data}, ${data.length}, ${now})
					`.pipe(Effect.orDie)

					// Update stream metadata
					yield* sql`
						UPDATE durable_streams
						SET write_seq = ${newSeq},
							total_bytes = ${newByteOffset},
							updated_at = ${now}
						WHERE id = ${stream.id}
					`.pipe(Effect.orDie)

					return {
						offset: newOffset,
						seq: newSeq,
					}
				}),

			read: (path, fromOffset, limit = 1024 * 1024) =>
				Effect.gen(function* () {
					const now = new Date()

					// Get stream
					const streamRows = yield* sql<DurableStream>`
						SELECT * FROM durable_streams
						WHERE path = ${path} AND deleted_at IS NULL
					`.pipe(Effect.orDie)

					const stream = firstRow(streamRows)
					if (!stream) {
						return yield* Effect.fail(
							new StreamNotFoundError({
								path,
								message: `Stream not found at path: ${path}`,
							}),
						)
					}

					// Check expiration
					if (stream.expiresAt && stream.expiresAt < now) {
						return yield* Effect.fail(
							new StreamExpiredError({
								path,
								expiredAt: stream.expiresAt.toISOString(),
								message: `Stream at path ${path} has expired`,
							}),
						)
					}

					const startOffset = fromOffset ?? initialOffset()
					const parsed = parseOffset(startOffset)

					// Get chunks after offset
					const chunks = yield* sql<DurableStreamChunk>`
						SELECT * FROM durable_stream_chunks
						WHERE stream_id = ${stream.id}
						AND byte_offset >= ${parsed.byteOffset}
						ORDER BY sequence ASC
					`.pipe(Effect.orDie)

					if (chunks.length === 0) {
						return {
							data: new Uint8Array(0),
							offset: createOffset(stream.writeSeq, stream.totalBytes),
							hasMore: false,
						}
					}

					// Concatenate chunks up to limit
					const dataArrays: Uint8Array[] = []
					let totalSize = 0
					let lastChunk = chunks[0]

					for (const chunk of chunks) {
						const chunkData = chunk.data as Uint8Array
						if (totalSize + chunkData.length > limit) {
							break
						}
						dataArrays.push(chunkData)
						totalSize += chunkData.length
						lastChunk = chunk
					}

					// Concatenate all data
					const result = new Uint8Array(totalSize)
					let offset = 0
					for (const chunkData of dataArrays) {
						result.set(chunkData, offset)
						offset += chunkData.length
					}

					const newOffset = createOffset(lastChunk.sequence, lastChunk.byteOffset + lastChunk.size)
					const hasMore = lastChunk.sequence < stream.writeSeq

					return {
						data: result,
						offset: newOffset,
						hasMore,
					}
				}),

			readStream: (path, fromOffset) =>
				Effect.gen(function* () {
					const now = new Date()

					// Get stream
					const streamRows = yield* sql<DurableStream>`
						SELECT * FROM durable_streams
						WHERE path = ${path} AND deleted_at IS NULL
					`.pipe(Effect.orDie)

					const stream = firstRow(streamRows)
					if (!stream) {
						return yield* Effect.fail(
							new StreamNotFoundError({
								path,
								message: `Stream not found at path: ${path}`,
							}),
						)
					}

					// Check expiration
					if (stream.expiresAt && stream.expiresAt < now) {
						return yield* Effect.fail(
							new StreamExpiredError({
								path,
								expiredAt: stream.expiresAt.toISOString(),
								message: `Stream at path ${path} has expired`,
							}),
						)
					}

					const startOffset = fromOffset ?? initialOffset()
					const parsed = parseOffset(startOffset)

					// Return a stream that reads chunks
					return Stream.fromEffect(
						sql<DurableStreamChunk>`
							SELECT * FROM durable_stream_chunks
							WHERE stream_id = ${stream.id}
							AND byte_offset >= ${parsed.byteOffset}
							ORDER BY sequence ASC
						`.pipe(Effect.orDie),
					).pipe(
						Stream.flatMap((chunks) => Stream.fromIterable(chunks)),
						Stream.map(toStreamMessage),
					)
				}),

			cleanupExpired: () =>
				Effect.gen(function* () {
					const now = new Date()

					// Soft delete expired streams
					const result = yield* sql`
						UPDATE durable_streams
						SET deleted_at = ${now}
						WHERE expires_at IS NOT NULL
						AND expires_at <= ${now}
						AND deleted_at IS NULL
						RETURNING id
					`.pipe(Effect.orDie)

					return result.length
				}),

			listStreams: () =>
				Effect.gen(function* () {
					const now = new Date()

					const rows = yield* sql<{ path: string }>`
						SELECT path FROM durable_streams
						WHERE deleted_at IS NULL
						AND (expires_at IS NULL OR expires_at > ${now})
						ORDER BY created_at DESC
					`.pipe(Effect.orDie)

					return rows.map((row) => row.path as StreamPath)
				}),
		}

		return service
	}),
)

import { DateTime, Effect, Layer, Option, Stream } from "effect"
import {
	OffsetOutOfRangeError,
	SequenceConflictError,
	StreamAlreadyExistsError,
	StreamExpiredError,
	StreamNotFoundError,
} from "../api/errors"
import {
	compareOffsets,
	createOffset,
	initialOffset,
	parseOffset,
	type StreamId,
	StreamMessage,
	StreamMetadata,
	type StreamOffset,
	type StreamPath,
} from "../api/schemas"
import { StreamStore, type StreamStoreService } from "../services/stream-store"

// =============================================================================
// In-Memory Data Structures
// =============================================================================

interface MemoryStream {
	metadata: StreamMetadata
	chunks: Array<{
		sequence: number
		byteOffset: number
		data: Uint8Array
		createdAt: DateTime.Utc
	}>
}

// =============================================================================
// In-Memory Store Implementation
// =============================================================================

/**
 * In-memory implementation of StreamStore for development and testing
 */
export const MemoryStreamStoreLive = Layer.sync(StreamStore, () => {
	const streams = new Map<StreamPath, MemoryStream>()
	const streamsById = new Map<StreamId, StreamPath>()

	const isExpired = (metadata: StreamMetadata): boolean => {
		if (metadata.expiresAt === undefined) {
			return false
		}
		const now = DateTime.unsafeNow()
		return DateTime.lessThan(metadata.expiresAt, now)
	}

	const service: StreamStoreService = {
		create: (path, contentType, ttlSeconds) =>
			Effect.gen(function* () {
				if (streams.has(path)) {
					return yield* Effect.fail(
						new StreamAlreadyExistsError({
							path,
							message: `Stream already exists at path: ${path}`,
						}),
					)
				}

				const now = DateTime.unsafeNow()
				const id = crypto.randomUUID() as StreamId
				const expiresAt = ttlSeconds ? DateTime.add(now, { seconds: ttlSeconds }) : undefined

				const metadata = new StreamMetadata({
					id,
					path,
					contentType,
					writeSeq: 0,
					totalBytes: 0,
					currentOffset: initialOffset(),
					ttlSeconds,
					expiresAt,
					createdAt: now,
					updatedAt: now,
				})

				const memoryStream: MemoryStream = {
					metadata,
					chunks: [],
				}

				streams.set(path, memoryStream)
				streamsById.set(id, path)

				return metadata
			}),

		delete: (path) =>
			Effect.gen(function* () {
				const stream = streams.get(path)
				if (!stream) {
					return yield* Effect.fail(
						new StreamNotFoundError({
							path,
							message: `Stream not found at path: ${path}`,
						}),
					)
				}

				streamsById.delete(stream.metadata.id)
				streams.delete(path)
			}),

		getMetadata: (path) =>
			Effect.sync(() => {
				const stream = streams.get(path)
				if (!stream) {
					return Option.none<StreamMetadata>()
				}
				if (isExpired(stream.metadata)) {
					// Clean up expired stream
					streamsById.delete(stream.metadata.id)
					streams.delete(path)
					return Option.none<StreamMetadata>()
				}
				return Option.some(stream.metadata)
			}),

		getMetadataById: (id) =>
			Effect.sync(() => {
				const path = streamsById.get(id)
				if (!path) {
					return Option.none<StreamMetadata>()
				}
				const stream = streams.get(path)
				if (!stream) {
					return Option.none<StreamMetadata>()
				}
				if (isExpired(stream.metadata)) {
					streamsById.delete(id)
					streams.delete(path)
					return Option.none<StreamMetadata>()
				}
				return Option.some(stream.metadata)
			}),

		append: (path, data, expectedSeq) =>
			Effect.gen(function* () {
				const stream = streams.get(path)
				if (!stream) {
					return yield* Effect.fail(
						new StreamNotFoundError({
							path,
							message: `Stream not found at path: ${path}`,
						}),
					)
				}

				if (isExpired(stream.metadata)) {
					streamsById.delete(stream.metadata.id)
					streams.delete(path)
					return yield* Effect.fail(
						new StreamExpiredError({
							path,
							expiredAt: stream.metadata.expiresAt?.toString() ?? "",
							message: `Stream at path ${path} has expired`,
						}),
					)
				}

				// Check sequence if provided
				if (expectedSeq !== undefined && expectedSeq !== stream.metadata.writeSeq) {
					return yield* Effect.fail(
						new SequenceConflictError({
							expectedSeq,
							actualSeq: stream.metadata.writeSeq,
							message: `Sequence conflict: expected ${expectedSeq}, got ${stream.metadata.writeSeq}`,
						}),
					)
				}

				const now = DateTime.unsafeNow()
				const newSeq = stream.metadata.writeSeq + 1
				const newByteOffset = stream.metadata.totalBytes + data.length
				const newOffset = createOffset(newSeq, newByteOffset)

				// Add chunk
				stream.chunks.push({
					sequence: newSeq,
					byteOffset: stream.metadata.totalBytes,
					data,
					createdAt: now,
				})

				// Update metadata
				stream.metadata = new StreamMetadata({
					...stream.metadata,
					writeSeq: newSeq,
					totalBytes: newByteOffset,
					currentOffset: newOffset,
					updatedAt: now,
				})

				return {
					offset: newOffset,
					seq: newSeq,
				}
			}),

		read: (path, fromOffset, limit = 1024 * 1024) =>
			Effect.gen(function* () {
				const stream = streams.get(path)
				if (!stream) {
					return yield* Effect.fail(
						new StreamNotFoundError({
							path,
							message: `Stream not found at path: ${path}`,
						}),
					)
				}

				if (isExpired(stream.metadata)) {
					streamsById.delete(stream.metadata.id)
					streams.delete(path)
					return yield* Effect.fail(
						new StreamExpiredError({
							path,
							expiredAt: stream.metadata.expiresAt?.toString() ?? "",
							message: `Stream at path ${path} has expired`,
						}),
					)
				}

				const startOffset = fromOffset ?? initialOffset()
				const parsed = parseOffset(startOffset)

				// Find chunks after the given offset
				const relevantChunks = stream.chunks.filter((chunk) => chunk.byteOffset >= parsed.byteOffset)

				if (relevantChunks.length === 0) {
					// No data after offset
					return {
						data: new Uint8Array(0),
						offset: stream.metadata.currentOffset,
						hasMore: false,
					}
				}

				// Concatenate chunks up to limit
				const chunkData: Uint8Array[] = []
				let totalSize = 0
				let lastChunk = relevantChunks[0]

				for (const chunk of relevantChunks) {
					if (totalSize + chunk.data.length > limit) {
						break
					}
					chunkData.push(chunk.data)
					totalSize += chunk.data.length
					lastChunk = chunk
				}

				// Concatenate all chunks
				const result = new Uint8Array(totalSize)
				let offset = 0
				for (const chunk of chunkData) {
					result.set(chunk, offset)
					offset += chunk.length
				}

				const newOffset = createOffset(
					lastChunk.sequence,
					lastChunk.byteOffset + lastChunk.data.length,
				)
				const hasMore = compareOffsets(newOffset, stream.metadata.currentOffset) < 0

				return {
					data: result,
					offset: newOffset,
					hasMore,
				}
			}),

		readStream: (path, fromOffset) =>
			Effect.gen(function* () {
				const stream = streams.get(path)
				if (!stream) {
					return yield* Effect.fail(
						new StreamNotFoundError({
							path,
							message: `Stream not found at path: ${path}`,
						}),
					)
				}

				if (isExpired(stream.metadata)) {
					streamsById.delete(stream.metadata.id)
					streams.delete(path)
					return yield* Effect.fail(
						new StreamExpiredError({
							path,
							expiredAt: stream.metadata.expiresAt?.toString() ?? "",
							message: `Stream at path ${path} has expired`,
						}),
					)
				}

				const startOffset = fromOffset ?? initialOffset()
				const parsed = parseOffset(startOffset)
				const metadata = stream.metadata

				// Create a stream from the chunks
				const messageStream = Stream.fromIterable(
					stream.chunks
						.filter((chunk) => chunk.byteOffset >= parsed.byteOffset)
						.map(
							(chunk) =>
								new StreamMessage({
									streamId: metadata.id,
									sequence: chunk.sequence,
									offset: createOffset(
										chunk.sequence,
										chunk.byteOffset + chunk.data.length,
									),
									data: chunk.data,
									size: chunk.data.length,
									createdAt: chunk.createdAt,
								}),
						),
				)

				return messageStream
			}),

		cleanupExpired: () =>
			Effect.sync(() => {
				let count = 0
				const now = DateTime.unsafeNow()

				for (const [path, stream] of streams) {
					if (stream.metadata.expiresAt && DateTime.lessThan(stream.metadata.expiresAt, now)) {
						streamsById.delete(stream.metadata.id)
						streams.delete(path)
						count++
					}
				}

				return count
			}),

		listStreams: () =>
			Effect.sync(() => {
				const paths: StreamPath[] = []
				for (const [path, stream] of streams) {
					if (!isExpired(stream.metadata)) {
						paths.push(path)
					}
				}
				return paths
			}),
	}

	return service
})

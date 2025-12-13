import {
	bigint,
	boolean,
	customType,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core"
import type { StreamId } from "../api/schemas"

// =============================================================================
// Custom Types
// =============================================================================

/**
 * Custom bytea type for binary data storage
 */
const bytea = customType<{ data: Uint8Array }>({
	dataType() {
		return "bytea"
	},
	toDriver(value: Uint8Array) {
		return Buffer.from(value)
	},
	fromDriver(value: unknown) {
		if (value instanceof Buffer) {
			return new Uint8Array(value)
		}
		if (value instanceof Uint8Array) {
			return value
		}
		return new Uint8Array(value as ArrayBuffer)
	},
})

// =============================================================================
// Streams Metadata Table
// =============================================================================

export const durableStreamsTable = pgTable(
	"durable_streams",
	{
		id: uuid().primaryKey().defaultRandom().$type<StreamId>(),
		path: text().notNull().unique(),
		contentType: text().notNull().default("application/octet-stream"),
		/** Current write sequence number (incremented on each append) */
		writeSeq: bigint({ mode: "number" }).notNull().default(0),
		/** Total byte size of the stream */
		totalBytes: bigint({ mode: "number" }).notNull().default(0),
		/** TTL in seconds (optional) */
		ttlSeconds: integer(),
		/** Absolute expiration time (optional) */
		expiresAt: timestamp({ mode: "date", withTimezone: true }),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		/** Soft delete timestamp */
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("durable_streams_path_idx").on(table.path),
		index("durable_streams_expires_at_idx").on(table.expiresAt),
		index("durable_streams_deleted_at_idx").on(table.deletedAt),
	],
)

// =============================================================================
// Stream Chunks Table (Append-Only Log)
// =============================================================================

export const durableStreamChunksTable = pgTable(
	"durable_stream_chunks",
	{
		id: uuid().primaryKey().defaultRandom(),
		streamId: uuid()
			.notNull()
			.references(() => durableStreamsTable.id, { onDelete: "cascade" })
			.$type<StreamId>(),
		/** Sequence number for ordering */
		sequence: bigint({ mode: "number" }).notNull(),
		/** Byte offset within the stream */
		byteOffset: bigint({ mode: "number" }).notNull(),
		/** Raw chunk data */
		data: bytea().notNull(),
		/** Size of this chunk in bytes */
		size: integer().notNull(),
		/** For JSON mode - marks message boundaries */
		isJsonBoundary: boolean().default(false),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("durable_stream_chunks_stream_id_idx").on(table.streamId),
		index("durable_stream_chunks_stream_seq_idx").on(table.streamId, table.sequence),
		index("durable_stream_chunks_stream_offset_idx").on(table.streamId, table.byteOffset),
	],
)

// =============================================================================
// Type Exports
// =============================================================================

export type DurableStream = typeof durableStreamsTable.$inferSelect
export type NewDurableStream = typeof durableStreamsTable.$inferInsert
export type DurableStreamChunk = typeof durableStreamChunksTable.$inferSelect
export type NewDurableStreamChunk = typeof durableStreamChunksTable.$inferInsert

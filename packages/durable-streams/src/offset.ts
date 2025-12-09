/**
 * Offset Schema and Utilities
 *
 * Offsets are opaque, lexicographically-sortable strings that identify
 * positions within a durable stream. Format: "{timestamp_hex}-{sequence_hex}"
 *
 * Following the Electric Durable Stream Protocol specification.
 */

import { Schema } from "effect"
import { START_OFFSET } from "./constants.ts"

/**
 * Offset type - an opaque lexicographically-sortable string.
 * Format: 12 hex digits (timestamp) + "-" + 10 hex digits (sequence)
 * Example: "018c5b2a3f00-0000000001"
 */
export const Offset = Schema.String.pipe(Schema.brand("@DurableStreams/Offset"))
export type Offset = typeof Offset.Type

/**
 * Special offset literal "-1" representing start of stream.
 */
export const StartOffset = Schema.Literal(START_OFFSET)
export type StartOffset = typeof StartOffset.Type

/**
 * Union of Offset or StartOffset for read operations.
 */
export const OffsetParam = Schema.Union(Offset, StartOffset)
export type OffsetParam = typeof OffsetParam.Type

/**
 * Offset utility functions.
 *
 * Note: Clients should treat offsets as opaque - these utilities
 * are primarily for server-side offset generation.
 */
export const OffsetUtils = {
	/**
	 * Create an offset from a timestamp (bigint) and sequence number.
	 * Timestamp is typically Date.now() as bigint.
	 */
	make: (timestamp: bigint, sequence: number): Offset => {
		const ts = timestamp.toString(16).padStart(12, "0")
		const seq = sequence.toString(16).padStart(10, "0")
		return `${ts}-${seq}` as Offset
	},

	/**
	 * Compare two offsets lexicographically.
	 * Returns -1 if a < b, 0 if a === b, 1 if a > b.
	 */
	compare: (a: Offset, b: Offset): -1 | 0 | 1 => {
		if (a < b) return -1
		if (a > b) return 1
		return 0
	},

	/**
	 * Check if offset a is before offset b.
	 */
	isBefore: (a: Offset, b: Offset): boolean => OffsetUtils.compare(a, b) < 0,

	/**
	 * Check if offset a is after offset b.
	 */
	isAfter: (a: Offset, b: Offset): boolean => OffsetUtils.compare(a, b) > 0,

	/**
	 * Check if the offset is the special start offset ("-1").
	 */
	isStart: (offset: OffsetParam): offset is StartOffset => offset === START_OFFSET,

	/**
	 * Get the initial offset for a new stream (all zeros).
	 */
	initial: (): Offset => OffsetUtils.make(0n, 0),

	/**
	 * Generate a new offset for the current time with given sequence.
	 */
	now: (sequence: number): Offset => OffsetUtils.make(BigInt(Date.now()), sequence),

	/**
	 * Extract timestamp from an offset (server-side utility).
	 */
	timestamp: (offset: Offset): bigint => {
		const [ts] = offset.split("-")
		return BigInt(`0x${ts}`)
	},

	/**
	 * Extract sequence from an offset (server-side utility).
	 */
	sequence: (offset: Offset): number => {
		const parts = offset.split("-")
		return parseInt(parts[1] ?? "0", 16)
	},
} as const

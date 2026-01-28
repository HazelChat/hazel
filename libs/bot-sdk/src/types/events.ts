/**
 * Event types for Electric SQL shape stream events
 */

import { Data } from "effect"

/**
 * Event type discriminator (table.operation format)
 */
export type EventType = `${string}.${"insert" | "update" | "delete"}`

/**
 * Operation types for Electric events
 */
export type EventOperation = "insert" | "update" | "delete"

/**
 * Immutable Electric event using Effect Data.Class
 * Provides structural equality and hash for efficient comparisons
 */
export class ElectricEvent<A = unknown> extends Data.Class<{
	readonly operation: EventOperation
	readonly table: string
	readonly value: A
	readonly timestamp: Date
}> {
	/**
	 * Get the event type discriminator (table.operation)
	 */
	get eventType(): EventType {
		return `${this.table}.${this.operation}` as EventType
	}
}

/**
 * Factory function for creating ElectricEvent instances
 */
export const createElectricEvent = <A>(params: {
	readonly operation: EventOperation
	readonly table: string
	readonly value: A
	readonly timestamp?: Date
}): ElectricEvent<A> =>
	new ElectricEvent({
		operation: params.operation,
		table: params.table,
		value: params.value,
		timestamp: params.timestamp ?? new Date(),
	})

/**
 * Helper to create event type from table and operation
 */
export const getEventType = (table: string, operation: EventOperation): EventType =>
	`${table}.${operation}` as EventType

/**
 * Type guard to check if value is an ElectricEvent
 */
export const isElectricEvent = (value: unknown): value is ElectricEvent => value instanceof ElectricEvent

/**
 * Extract unique table names from event types (e.g. "messages.insert" → "messages")
 */
export const extractTablesFromEventTypes = (eventTypes: readonly EventType[]): ReadonlySet<string> =>
	new Set(eventTypes.map((et) => et.split(".")[0]))

/**
 * Generic event structure from Electric SQL shape stream
 */
export interface ElectricEvent<A = any> {
	readonly operation: "insert" | "update" | "delete"
	readonly table: string
	readonly value: A
	readonly timestamp: Date
}

/**
 * Event type discriminator (table.operation format)
 */
export type EventType = `${string}.${"insert" | "update" | "delete"}`

/**
 * Helper to create event type from table and operation
 */
export function getEventType(table: string, operation: string): EventType {
	return `${table}.${operation}` as EventType
}

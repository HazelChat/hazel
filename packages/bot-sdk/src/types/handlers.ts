import type { Effect } from "effect"
import type { HandlerError } from "../errors.ts"
import type { EventType } from "./events.ts"

/**
 * Generic event handler that processes validated data of type A
 */
export type EventHandler<A = any, R = never> = (
	value: A,
) => Effect.Effect<void, HandlerError, R>

/**
 * Registry of all event handlers
 * Maps event types (e.g., "messages.insert") to sets of handlers
 */
export type EventHandlerRegistry = Map<EventType, Set<EventHandler<any, any>>>

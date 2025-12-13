import { Layer } from "effect"
import { HttpDurableStreamsLive } from "./handlers/streams.http"
import { StreamPubSub, StreamPubSubLive } from "./services/stream-pubsub"
import { StreamStore } from "./services/stream-store"
import { MemoryStreamStoreLive } from "./stores/memory"
import { PostgresStreamStoreLive } from "./stores/postgres"

// =============================================================================
// Re-exports
// =============================================================================

// API exports
export * from "./api"
// Handler exports
export { HttpDurableStreamsLive } from "./handlers/streams.http"
// Schema exports
export * from "./schema"
// Service exports
export * from "./services"
// Store exports
export * from "./stores"

// =============================================================================
// Layer Compositions
// =============================================================================

/**
 * In-memory storage layer for development and testing
 * Does not persist data across restarts
 */
export const MemoryStoreLive = Layer.mergeAll(MemoryStreamStoreLive, StreamPubSubLive)

/**
 * PostgreSQL storage layer for production
 * Requires PgClient to be provided
 */
export const PostgresStoreLive = Layer.mergeAll(PostgresStreamStoreLive, StreamPubSubLive)

/**
 * Complete development layer with in-memory storage and HTTP handlers
 */
export const DevelopmentLive = Layer.mergeAll(MemoryStoreLive, HttpDurableStreamsLive).pipe(
	Layer.provide(MemoryStoreLive),
)

/**
 * HTTP handlers layer - requires StreamStore and StreamPubSub
 */
export const HttpHandlersLive = HttpDurableStreamsLive

// =============================================================================
// Service Tags (for consumers)
// =============================================================================

export { StreamStore, StreamPubSub }

/**
 * Auth Metrics
 *
 * Provides counters and histograms for monitoring auth performance.
 */
import { Metric } from "effect"

// ============================================================================
// Counters
// ============================================================================

/** Count of user lookup cache hits */
export const userLookupCacheHits = Metric.counter("user_lookup.cache.hits")

/** Count of user lookup cache misses */
export const userLookupCacheMisses = Metric.counter("user_lookup.cache.misses")

// ============================================================================
// Histograms (latency in milliseconds)
// ============================================================================

/** User lookup cache operation latency (get/set) */
export const userLookupCacheOperationLatency = Metric.histogram("user_lookup.cache.operation.latency_ms", {
	boundaries: [1, 2, 5, 10, 25, 50],
})

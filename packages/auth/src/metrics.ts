/**
 * Session Validation Metrics
 *
 * Provides counters and histograms for monitoring session validation performance.
 * These metrics help identify bottlenecks in the authentication flow.
 */
import { Metric, MetricBoundaries } from "effect"

// ============================================================================
// Counters
// ============================================================================

/** Count of session cache hits */
export const sessionCacheHits = Metric.counter("session.cache.hits")

/** Count of session cache misses */
export const sessionCacheMisses = Metric.counter("session.cache.misses")

/** Count of successful session authentications */
export const sessionAuthSuccess = Metric.counter("session.auth.success")

/** Count of failed session authentications */
export const sessionAuthFailure = Metric.counter("session.auth.failure")

/** Count of session refresh attempts */
export const sessionRefreshAttempts = Metric.counter("session.refresh.attempts")

/** Count of successful session refreshes */
export const sessionRefreshSuccess = Metric.counter("session.refresh.success")

/** Count of failed session refreshes */
export const sessionRefreshFailure = Metric.counter("session.refresh.failure")

// ============================================================================
// Histograms (latency in milliseconds)
// ============================================================================

/** Overall session validation latency (cache hit or miss path) */
export const sessionValidationLatency = Metric.histogram(
	"session.validation.latency_ms",
	MetricBoundaries.fromIterable([5, 10, 25, 50, 100, 250, 500, 1000]),
)

/** WorkOS authenticate() API call latency */
export const workosAuthLatency = Metric.histogram(
	"session.workos.auth.latency_ms",
	MetricBoundaries.fromIterable([10, 25, 50, 100, 250, 500, 1000, 2000]),
)

/** WorkOS refresh() API call latency */
export const workosRefreshLatency = Metric.histogram(
	"session.workos.refresh.latency_ms",
	MetricBoundaries.fromIterable([10, 25, 50, 100, 250, 500, 1000, 2000]),
)

/** Session cache operation latency (get/set) */
export const cacheOperationLatency = Metric.histogram(
	"session.cache.operation.latency_ms",
	MetricBoundaries.fromIterable([1, 2, 5, 10, 25, 50]),
)

/** WorkOS organization lookup latency */
export const orgLookupLatency = Metric.histogram(
	"session.org.lookup.latency_ms",
	MetricBoundaries.fromIterable([5, 10, 25, 50, 100, 250, 500]),
)

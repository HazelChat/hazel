/**
 * Electric Proxy Metrics
 *
 * Provides counters and histograms for monitoring proxy performance.
 */
import { Metric } from "effect"

const latencyBoundaries = [5, 10, 25, 50, 100, 250, 500, 1000, 2500] as const

// ============================================================================
// Counters
// ============================================================================

/** Total proxy requests (tag at call site: route, table, status_code, auth_type) */
export const proxyRequestsTotal = Metric.counter("proxy.requests.total")

/** Auth failures (tag at call site: auth_type, error_tag) */
export const proxyAuthFailures = Metric.counter("proxy.auth.failures")

/** Upstream Electric non-2xx responses */
export const proxyElectricErrors = Metric.counter("proxy.electric.errors")

// ============================================================================
// Histograms (latency in milliseconds)
// ============================================================================

/** End-to-end proxy request duration */
export const proxyRequestDuration = Metric.histogram("proxy.request.duration_ms", {
	boundaries: latencyBoundaries,
})

/** Upstream Electric fetch latency */
export const proxyElectricDuration = Metric.histogram("proxy.electric.duration_ms", {
	boundaries: latencyBoundaries,
})

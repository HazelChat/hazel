import { createTracingLayer } from "@hazel/effect-bun/Telemetry"

/**
 * OpenTelemetry tracing layer for electric-proxy.
 *
 * Uses Effect DevTools in local environment, OTLP in production.
 */
export const TracerLive = createTracingLayer("electric-proxy")

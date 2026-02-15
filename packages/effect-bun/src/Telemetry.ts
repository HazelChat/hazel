import * as DevTools from "@effect/experimental/DevTools"
import * as Otlp from "@effect/opentelemetry/Otlp"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { BunSocket } from "@effect/platform-bun"
import { Config, Effect, Layer } from "effect"

/**
 * Create an OpenTelemetry tracing layer with a specific service name.
 *
 * Environment variables:
 * - OTEL_ENVIRONMENT (default: "local"): Environment (local/staging/production)
 * - RAILWAY_GIT_COMMIT_SHA / COMMIT_SHA (default: "unknown"): Git commit SHA for service version
 * - OTEL_BASE_URL: OTLP collector endpoint (e.g. "http://otel-collector.railway.internal:4318")
 *
 * Behavior:
 * - local environment: Uses Effect DevTools WebSocket (ws://localhost:34437)
 * - other environments: Uses OTLP HTTP to the configured collector
 *
 * @param otelServiceName - The service name to use for telemetry
 * @returns A Layer that provides tracing, metrics, and logging
 *
 * @example
 * ```typescript
 * import { createTracingLayer } from "@hazel/effect-bun/Telemetry"
 *
 * const TracerLive = createTracingLayer("hazel-backend")
 *
 * Layer.launch(ServerLayer.pipe(Layer.provide(TracerLive)))
 * ```
 */
export const createTracingLayer = (otelServiceName: string) =>
	Layer.unwrapEffect(
		Effect.gen(function* () {
			const environment = yield* Config.string("OTEL_ENVIRONMENT").pipe(Config.withDefault("local"))
			const commitSha = yield* Config.string("RAILWAY_GIT_COMMIT_SHA").pipe(
				Config.orElse(() => Config.string("COMMIT_SHA")),
				Config.withDefault("unknown"),
			)

			const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("development"))

			const otelBaseUrl = yield* Config.string("OTEL_BASE_URL")

			if (environment === "local") {
				if (nodeEnv === "production") {
					return yield* Effect.die(
						"NODE_ENV is set to production, but OTEL_ENVIRONMENT is set to local",
					)
				}

				return DevTools.layerWebSocket().pipe(Layer.provide(BunSocket.layerWebSocketConstructor))
			}

			return Otlp.layerJson({
				baseUrl: otelBaseUrl,
				resource: {
					serviceName: otelServiceName,
					serviceVersion: commitSha,
					attributes: {
						"deployment.environment": environment,
						"deployment.commit_sha": commitSha,
					},
				},
			}).pipe(Layer.provide(FetchHttpClient.layer))
		}),
	)

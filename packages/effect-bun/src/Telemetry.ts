import * as DevTools from "@effect/experimental/DevTools"
import * as Otlp from "@effect/opentelemetry/Otlp"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { BunSocket } from "@effect/platform-bun"
import { Config, Effect, Layer } from "effect"

/**
 * OpenTelemetry tracing layer that reads service name from environment.
 *
 * Environment variables:
 * - OTEL_SERVICE_NAME (required): Service name for telemetry
 * - OTEL_ENVIRONMENT (default: "local"): Environment (local/staging/production)
 * - COMMIT_SHA (default: "unknown"): Git commit SHA for service version
 *
 * Behavior:
 * - local environment: Uses Effect DevTools WebSocket (ws://localhost:34437)
 * - other environments: Uses OTLP to SignOZ (https://signoz.superwall.dev)
 *
 * @example
 * ```typescript
 * import { TracingLive } from "@hazel/effect-bun/Telemetry"
 *
 * // Set OTEL_SERVICE_NAME=my-service
 * Layer.launch(ServerLayer.pipe(Layer.provide(TracingLive)))
 * ```
 */
export const TracingLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const environment = yield* Config.string("OTEL_ENVIRONMENT").pipe(Config.withDefault("local"))
		const commitSha = yield* Config.string("RAILWAY_GIT_COMMIT_SHA").pipe(Config.withDefault("unknown"))

		const otelBaseUrl = yield* Config.string("OTEL_BASE_URL").pipe(
			Config.withDefault("https://ingest.eu.signoz.cloud"),
		)

		if (environment === "local") {
			return DevTools.layerWebSocket().pipe(Layer.provide(BunSocket.layerWebSocketConstructor))
		}

		const otelServiceName = yield* Config.string("OTEL_SERVICE_NAME")
		const ingestionKey = yield* Config.string("SIGNOZ_INGESTION_KEY").pipe(Config.withDefault(""))

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
			headers: {
				"signoz-ingestion-key": ingestionKey,
			},
		}).pipe(Layer.provide(FetchHttpClient.layer))
	}),
)

/**
 * Create an OpenTelemetry tracing layer with a specific service name.
 *
 * Environment variables:
 * - OTEL_ENVIRONMENT (default: "local"): Environment (local/staging/production)
 * - COMMIT_SHA (default: "unknown"): Git commit SHA for service version
 *
 * Behavior:
 * - local environment: Uses Effect DevTools WebSocket (ws://localhost:34437)
 * - other environments: Uses OTLP to SignOZ (https://signoz.superwall.dev)
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
			const commitSha = yield* Config.string("COMMIT_SHA").pipe(Config.withDefault("unknown"))

			const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("development"))

			const otelBaseUrl = yield* Config.string("OTEL_BASE_URL").pipe(
				Config.withDefault("https://ingest.eu.signoz.cloud"),
			)

			if (environment === "local") {
				if (nodeEnv === "production") {
					return yield* Effect.die(
						"NODE_ENV is set to production, but OTEL_ENVIRONMENT is set to local",
					)
				}

				return DevTools.layerWebSocket().pipe(Layer.provide(BunSocket.layerWebSocketConstructor))
			}

			const ingestionKey = yield* Config.string("SIGNOZ_INGESTION_KEY").pipe(Config.withDefault(""))

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
				headers: {
					"signoz-ingestion-key": ingestionKey,
				},
			}).pipe(Layer.provide(FetchHttpClient.layer))
		}),
	)

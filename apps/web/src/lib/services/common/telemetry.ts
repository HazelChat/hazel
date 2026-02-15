import * as DevTools from "@effect/experimental/DevTools"
import * as Otlp from "@effect/opentelemetry/Otlp"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { BrowserSocket } from "@effect/platform-browser"
import { Effect, Layer } from "effect"

/**
 * Browser-compatible OpenTelemetry tracing layer.
 *
 * Behavior:
 * - Development (import.meta.env.DEV): Uses Effect DevTools WebSocket
 * - Production: Uses OTLP HTTP to Maple ingest
 *
 * Required env vars in production (set in Vite):
 * - VITE_MAPLE_PUBLIC_KEY: Maple public ingest key
 * - VITE_OTEL_ENVIRONMENT (optional, defaults based on MODE)
 */
export const TracerLive = Layer.unwrapEffect(
	// oxlint-disable-next-line require-yield
	Effect.gen(function* () {
		const isDev = import.meta.env.DEV
		const environment = import.meta.env.VITE_OTEL_ENVIRONMENT ?? (isDev ? "local" : "production")
		const commitSha = import.meta.env.VITE_COMMIT_SHA ?? "unknown"

		if (environment === "local" || isDev) {
			// return DevTools.layerWebSocket().pipe(Layer.provide(BrowserSocket.layerWebSocketConstructor))
			return Layer.empty
		}

		const maplePublicKey = import.meta.env.VITE_MAPLE_PUBLIC_KEY
		if (!maplePublicKey) {
			console.error("VITE_MAPLE_PUBLIC_KEY is required in production")
			return Layer.empty
		}

		return Otlp.layerJson({
			baseUrl: "https://ingest.maple.dev",
			resource: {
				serviceName: "hazel-web",
				serviceVersion: commitSha,
				attributes: {
					"deployment.environment": environment,
					"deployment.commit_sha": commitSha,
				},
			},
			headers: {
				Authorization: `Bearer ${maplePublicKey}`,
			},
		}).pipe(Layer.provide(FetchHttpClient.layer))
	}),
)

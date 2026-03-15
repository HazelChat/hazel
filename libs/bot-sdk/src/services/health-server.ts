/**
 * Bot Health Server
 *
 * Lightweight HTTP health endpoint for bot process monitoring.
 * Reports process liveness and uptime for the websocket-based bot runtime.
 *
 * Enabled by default on port 9090. Set `healthPort: false` in config to disable.
 */

import { Effect, Layer, Runtime, ServiceMap } from "effect"

export interface BotHealthServerConfig {
	readonly port: number
}

export class BotHealthServerConfigTag extends ServiceMap.Service<BotHealthServerConfigTag,
	BotHealthServerConfig
>()("@hazel/bot-sdk/BotHealthServerConfig") {}

interface HealthResponse {
	readonly status: "healthy"
	readonly timestamp: string
	readonly uptime_ms: number
}

export class BotHealthServer extends ServiceMap.Service<BotHealthServer>()("BotHealthServer", {
	make: Effect.gen(function* () {
		const config = yield* BotHealthServerConfigTag
		const startTime = Date.now()
		const runtime = yield* Effect.runtime<never>()

		const collectHealth = Effect.sync(
			(): HealthResponse => ({
				status: "healthy",
				timestamp: new Date().toISOString(),
				uptime_ms: Date.now() - startTime,
			}),
		)

		const server = yield* Effect.acquireRelease(
			Effect.sync(() =>
				Bun.serve({
					port: config.port,
					fetch(req) {
						const url = new URL(req.url)
						if (req.method === "GET" && url.pathname === "/health") {
							return Runtime.runPromise(runtime)(collectHealth).then(
								(health) =>
									new Response(JSON.stringify(health), {
										status: 200,
										headers: { "Content-Type": "application/json" },
									}),
							)
						}

						return new Response("Not Found", { status: 404 })
					},
				}),
			),
			(server) =>
				Effect.gen(function* () {
					yield* Effect.logDebug("Stopping health server", { port: config.port }).pipe(
						Effect.annotateLogs("service", "BotHealthServer"),
					)
					yield* Effect.sync(() => server.stop(true))
				}),
		)

		yield* Effect.logDebug("Health server listening", { port: server.port, path: "/health" }).pipe(
			Effect.annotateLogs("service", "BotHealthServer"),
		)

		return { port: server.port }
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}

export const BotHealthServerLive = (port: number) =>
	Layer.provide(BotHealthServer.layer, Layer.succeed(BotHealthServerConfigTag, { port }))

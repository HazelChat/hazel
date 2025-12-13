/**
 * Durable Streams HTTP Server
 *
 * Run with: bun run start
 * Or: PORT=4437 bun run start
 */

import { createServer } from "node:http"
import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Option } from "effect"
import { DurableStreamsApi, HttpDurableStreamsLive, MemoryStoreLive } from "./index"
import type { StreamPath } from "./api/schemas"
import { StreamStore } from "./services/stream-store"

const PORT = Number(process.env.PORT ?? 4437)

const REGISTRY_PATH = "__registry__" as StreamPath

/**
 * Initialize the __registry__ stream on startup if it doesn't exist.
 * This stream records lifecycle events (created/deleted) for all other streams.
 */
const initializeRegistry = Effect.gen(function* () {
	const store = yield* StreamStore
	const metadata = yield* store.getMetadata(REGISTRY_PATH)

	if (Option.isNone(metadata)) {
		yield* store.create(REGISTRY_PATH, "application/json")
		yield* Effect.logInfo("Created __registry__ stream")
	}
})

const ApiLive = HttpApiBuilder.api(DurableStreamsApi)

// Create the full server layer with all dependencies
const ServerLive = HttpApiBuilder.serve(HttpMiddleware.cors()).pipe(
	Layer.provide(ApiLive),
	Layer.provide(HttpDurableStreamsLive),
	HttpServer.withLogAddress,
	Layer.provide(NodeHttpServer.layer(createServer, { port: PORT })),
)

// Combine registry initialization with server launch
// Both share the same MemoryStoreLive instance
const program = Effect.gen(function* () {
	yield* initializeRegistry
	yield* Layer.launch(ServerLive)
})

NodeRuntime.runMain(program.pipe(Effect.provide(MemoryStoreLive)))

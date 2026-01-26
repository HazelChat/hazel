/**
 * Entry point to start the Effect-based Durable Streams server.
 */
import { BunRuntime } from "@effect/platform-bun"
import { PgClient } from "@effect/sql-pg"
import { Effect, Layer, Redacted } from "effect"
import { AuthConfigService, ServerConfigService } from "./Config.ts"
import { runServer } from "./server.ts"
import { StreamAuth, StreamAuthConfigTag } from "./services/StreamAuth.ts"
import { StreamStoreLive } from "./StreamStore.ts"

const port = parseInt(process.env.PORT || `4437`, 10)
const host = process.env.HOST || `127.0.0.1`

// Create layers based on auth configuration
const ConfigLayers = Layer.mergeAll(ServerConfigService.Default, AuthConfigService.Default)

// Create StreamAuth layer (always needed, even when auth is disabled)
const StreamAuthLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const authConfig = yield* AuthConfigService

		return StreamAuth.Default.pipe(
			Layer.provide(
				Layer.succeed(StreamAuthConfigTag, {
					serviceToken: authConfig.serviceToken,
				}),
			),
		)
	}),
).pipe(Layer.provide(AuthConfigService.Default))

// Create PgClient layer based on config
const PgClientLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const authConfig = yield* AuthConfigService

		if (authConfig.authEnabled) {
			return PgClient.layer({
				url: authConfig.databaseUrl,
			})
		}

		// When auth is disabled, provide a dummy PgClient that will never be used
		// The server routes will skip auth checks when authEnabled is false
		return Layer.empty as unknown as Layer.Layer<PgClient.PgClient>
	}),
).pipe(Layer.provide(AuthConfigService.Default))

// Combine all layers
const AllLayers = Layer.mergeAll(StreamStoreLive, ConfigLayers, StreamAuthLive, PgClientLive)

const main = Effect.gen(function* () {
	const config = yield* ServerConfigService
	const authConfig = yield* AuthConfigService
	yield* runServer(port, host, config, authConfig)
}).pipe(Effect.provide(AllLayers))

BunRuntime.runMain(main)

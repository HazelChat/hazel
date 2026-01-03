import { Persistence } from "@effect/experimental"
import { Redis, RedisResultPersistenceLive } from "@hazel/effect-bun"
import { Effect, Layer, Redacted } from "effect"
import { ProxyConfigService } from "../config"

/**
 * Redis persistence layer configured with proxy config.
 * Provides: Persistence.ResultPersistence
 */
export const RedisPersistenceLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		yield* Effect.log("Connecting to Redis via @hazel/effect-bun", { url: config.redisUrl })
		return RedisResultPersistenceLive.pipe(Layer.provide(Redis.layer(Redacted.value(config.redisUrl))))
	}),
).pipe(Layer.provide(ProxyConfigService.Default))

/**
 * In-memory persistence layer for testing or fallback.
 */
export const MemoryPersistenceLive = Persistence.layerResultMemory

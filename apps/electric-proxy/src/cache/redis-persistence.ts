import { Persistence } from "@effect/experimental"
import { RedisClient } from "bun"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { identity } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import { ProxyConfigLive, ProxyConfigService } from "../config"

/**
 * Create a BackingPersistence using Bun's native Redis client
 */
const makeBunRedis = (url: string) =>
	Effect.gen(function* () {
		const redis = new RedisClient(url)

		// Ensure connection is established
		yield* Effect.tryPromise({
			try: () => redis.connect(),
			catch: (error) => Persistence.PersistenceBackingError.make("connect", error),
		})

		return Persistence.BackingPersistence.of({
			[Persistence.BackingPersistenceTypeId]: Persistence.BackingPersistenceTypeId,
			make: (prefix) =>
				Effect.sync(() => {
					const prefixed = (key: string) => `${prefix}:${key}`

					const parse = (method: string) => (str: string | null) => {
						if (str === null) return Effect.succeedNone
						return Effect.try({
							try: () => Option.some(JSON.parse(str)),
							catch: (error) => Persistence.PersistenceBackingError.make(method, error),
						})
					}

					return identity<Persistence.BackingPersistenceStore>({
						get: (key) =>
							Effect.flatMap(
								Effect.tryPromise({
									try: () => redis.get(prefixed(key)),
									catch: (error) => Persistence.PersistenceBackingError.make("get", error),
								}),
								parse("get"),
							),

						getMany: (keys) =>
							Effect.flatMap(
								Effect.tryPromise({
									try: () =>
										redis.send("MGET", keys.map(prefixed)) as Promise<(string | null)[]>,
									catch: (error) =>
										Persistence.PersistenceBackingError.make("getMany", error),
								}),
								Effect.forEach(parse("getMany")),
							),

						set: (key, value, ttl) =>
							Effect.gen(function* () {
								const serialized = yield* Effect.try({
									try: () => JSON.stringify(value),
									catch: (error) => Persistence.PersistenceBackingError.make("set", error),
								})

								yield* Effect.tryPromise({
									try: async () => {
										const pkey = prefixed(key)
										await redis.set(pkey, serialized)
										if (Option.isSome(ttl)) {
											// Use PEXPIRE for millisecond precision
											await redis.send("PEXPIRE", [
												pkey,
												String(Duration.toMillis(ttl.value)),
											])
										}
									},
									catch: (error) => Persistence.PersistenceBackingError.make("set", error),
								})
							}),

						setMany: (entries) =>
							Effect.tryPromise({
								try: async () => {
									// Bun requires raw commands for MULTI/EXEC, so we loop
									for (const [key, value, ttl] of entries) {
										const pkey = prefixed(key)
										const serialized = JSON.stringify(value)
										await redis.set(pkey, serialized)
										if (Option.isSome(ttl)) {
											await redis.send("PEXPIRE", [
												pkey,
												String(Duration.toMillis(ttl.value)),
											])
										}
									}
								},
								catch: (error) => Persistence.PersistenceBackingError.make("setMany", error),
							}),

						remove: (key) =>
							Effect.tryPromise({
								try: () => redis.del(prefixed(key)),
								catch: (error) => Persistence.PersistenceBackingError.make("remove", error),
							}),

						clear: Effect.tryPromise({
							try: async () => {
								const keys = (await redis.send("KEYS", [`${prefix}:*`])) as string[]
								if (keys.length > 0) {
									await redis.send("DEL", keys)
								}
							},
							catch: (error) => Persistence.PersistenceBackingError.make("clear", error),
						}),
					})
				}),
		})
	})

/**
 * Layer providing BackingPersistence using Bun's native Redis
 */
const BunRedisBackingLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		yield* Effect.log("Connecting to Redis (Bun native client)", { url: config.redisUrl })
		return Layer.scoped(Persistence.BackingPersistence, makeBunRedis(config.redisUrl))
	}),
).pipe(Layer.provide(ProxyConfigLive))

/**
 * Redis persistence layer using Bun's native Redis client.
 * Provides: Persistence.ResultPersistence
 */
export const RedisPersistenceLive = Persistence.layerResult.pipe(Layer.provide(BunRedisBackingLive))

/**
 * In-memory persistence layer for testing or fallback.
 */
export const MemoryPersistenceLive = Persistence.layerResultMemory

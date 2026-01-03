import { Persistence } from "@effect/experimental"
import { Duration, Effect, Layer, Option } from "effect"
import { identity } from "effect/Function"
import { Redis } from "../Redis.js"

/**
 * Create a BackingPersistence using @hazel/effect-bun Redis service.
 * This is the core implementation that bridges Redis to Effect's Persistence system.
 */
export const makeRedisBackingPersistence = Effect.gen(function* () {
	const redis = yield* Redis

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
							redis.get(prefixed(key)).pipe(
								Effect.mapError((error) => Persistence.PersistenceBackingError.make("get", error)),
							),
							parse("get"),
						),

					getMany: (keys) =>
						Effect.flatMap(
							redis.send<(string | null)[]>("MGET", keys.map(prefixed)).pipe(
								Effect.mapError((error) => Persistence.PersistenceBackingError.make("getMany", error)),
							),
							Effect.forEach(parse("getMany")),
						),

					set: (key, value, ttl) =>
						Effect.gen(function* () {
							const serialized = yield* Effect.try({
								try: () => JSON.stringify(value),
								catch: (error) => Persistence.PersistenceBackingError.make("set", error),
							})

							const pkey = prefixed(key)
							if (Option.isSome(ttl)) {
								// Atomic SET with PX (milliseconds) - sets value and TTL in single command
								yield* redis
									.send("SET", [pkey, serialized, "PX", String(Duration.toMillis(ttl.value))])
									.pipe(Effect.mapError((error) => Persistence.PersistenceBackingError.make("set", error)))
							} else {
								yield* redis
									.set(pkey, serialized)
									.pipe(Effect.mapError((error) => Persistence.PersistenceBackingError.make("set", error)))
							}
						}),

					setMany: (entries) =>
						Effect.gen(function* () {
							for (const [key, value, ttl] of entries) {
								const pkey = prefixed(key)
								const serialized = JSON.stringify(value)
								if (Option.isSome(ttl)) {
									yield* redis
										.send("SET", [pkey, serialized, "PX", String(Duration.toMillis(ttl.value))])
										.pipe(
											Effect.mapError((error) => Persistence.PersistenceBackingError.make("setMany", error)),
										)
								} else {
									yield* redis
										.set(pkey, serialized)
										.pipe(
											Effect.mapError((error) => Persistence.PersistenceBackingError.make("setMany", error)),
										)
								}
							}
						}),

					remove: (key) =>
						redis
							.del(prefixed(key))
							.pipe(Effect.mapError((error) => Persistence.PersistenceBackingError.make("remove", error))),

					clear: Effect.gen(function* () {
						const keys = yield* redis
							.send<string[]>("KEYS", [`${prefix}:*`])
							.pipe(Effect.mapError((error) => Persistence.PersistenceBackingError.make("clear", error)))
						if (keys.length > 0) {
							yield* redis
								.send("DEL", keys)
								.pipe(Effect.mapError((error) => Persistence.PersistenceBackingError.make("clear", error)))
						}
					}),
				})
			}),
	})
})

/**
 * Layer providing BackingPersistence using Redis.
 * Requires: Redis
 * Provides: Persistence.BackingPersistence
 */
export const RedisBackingPersistenceLive = Layer.effect(Persistence.BackingPersistence, makeRedisBackingPersistence)

/**
 * Layer providing ResultPersistence using Redis backing.
 * Requires: Redis
 * Provides: Persistence.ResultPersistence
 */
export const RedisResultPersistenceLive = Persistence.layerResult.pipe(Layer.provide(RedisBackingPersistenceLive))

/**
 * In-memory persistence layer for testing or fallback.
 * Provides: Persistence.ResultPersistence
 */
export const MemoryResultPersistenceLive = Persistence.layerResultMemory

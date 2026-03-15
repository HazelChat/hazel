import { Persistence } from "effect/unstable/persistence"
import type { UserId, WorkOSUserId } from "@hazel/schema"
import { ServiceMap, Duration, Effect, Exit, Layer, Metric, Option } from "effect"
import { UserLookupCacheError } from "../errors.ts"
import { userLookupCacheHits, userLookupCacheMisses, userLookupCacheOperationLatency } from "../metrics.ts"
import { UserLookupCacheRequest, type UserLookupResult } from "./user-lookup-request.ts"

/**
 * Prefix for user lookup cache keys in Redis
 */
export const USER_LOOKUP_CACHE_PREFIX = "auth:user-lookup"

/**
 * TTL for cached user lookups (5 minutes)
 * User mappings are very stable - they only change if a user is deleted/recreated
 */
export const USER_LOOKUP_CACHE_TTL = Duration.minutes(5)

/**
 * User lookup cache service using @effect/experimental Persistence.
 * Caches the mapping from workosUserId (external ID) to internalUserId.
 *
 * Uses ResultPersistence for schema-based serialization and Redis backing.
 * Requires: Persistence.ResultPersistence (provided by RedisResultPersistenceLive or MemoryResultPersistenceLive)
 */
export class UserLookupCache extends ServiceMap.Service<UserLookupCache>()("@hazel/auth/UserLookupCache", {
	make: Effect.gen(function* () {
		const persistence = yield* Persistence.ResultPersistence

		const store = yield* persistence.make({
			storeId: USER_LOOKUP_CACHE_PREFIX,
			timeToLive: () => USER_LOOKUP_CACHE_TTL,
		})

		const get = (
			workosUserId: WorkOSUserId,
		): Effect.Effect<Option.Option<UserLookupResult>, UserLookupCacheError> =>
			Effect.gen(function* () {
				const startTime = Date.now()

				// Add cache context attributes
				yield* Effect.annotateCurrentSpan("cache.system", "redis")
				yield* Effect.annotateCurrentSpan("cache.name", USER_LOOKUP_CACHE_PREFIX)
				yield* Effect.annotateCurrentSpan("cache.operation", "get")

				const request = new UserLookupCacheRequest({ workosUserId })

				const cached = yield* store.get(request).pipe(
					Effect.mapError(
						(e) =>
							new UserLookupCacheError({
								message: "Failed to get user lookup from cache",
								cause: e,
							}),
					),
				)

				// Record latency
				yield* Metric.update(userLookupCacheOperationLatency, Date.now() - startTime)

				if (Option.isNone(cached)) {
					yield* Metric.increment(userLookupCacheMisses)
					yield* Effect.annotateCurrentSpan("cache.result", "miss")
					return Option.none<UserLookupResult>()
				}

				// Exit contains Success or Failure
				if (cached.value._tag === "Success") {
					yield* Metric.increment(userLookupCacheHits)
					yield* Effect.annotateCurrentSpan("cache.result", "hit")
					return Option.some(cached.value.value)
				}

				// Cached a failure - treat as cache miss
				yield* Metric.increment(userLookupCacheMisses)
				yield* Effect.annotateCurrentSpan("cache.result", "miss")
				yield* Effect.annotateCurrentSpan("cache.skip_reason", "failure_cached")
				return Option.none<UserLookupResult>()
			}).pipe(Effect.withSpan("UserLookupCache.get"))

		const set = (
			workosUserId: WorkOSUserId,
			internalUserId: UserId,
		): Effect.Effect<void, UserLookupCacheError> =>
			Effect.gen(function* () {
				const startTime = Date.now()

				// Add cache context attributes
				yield* Effect.annotateCurrentSpan("cache.system", "redis")
				yield* Effect.annotateCurrentSpan("cache.name", USER_LOOKUP_CACHE_PREFIX)
				yield* Effect.annotateCurrentSpan("cache.operation", "set")

				const request = new UserLookupCacheRequest({ workosUserId })
				const result: UserLookupResult = { internalUserId }

				yield* store.set(request, Exit.succeed(result)).pipe(
					Effect.mapError(
						(e) =>
							new UserLookupCacheError({
								message: "Failed to set user lookup in cache",
								cause: e,
							}),
					),
				)

				// Record latency
				yield* Metric.update(userLookupCacheOperationLatency, Date.now() - startTime)
				yield* Effect.annotateCurrentSpan(
					"cache.item.ttl_ms",
					Duration.toMillis(USER_LOOKUP_CACHE_TTL),
				)

				yield* Effect.logDebug(`Cached user lookup: ${workosUserId} -> ${internalUserId}`)
			}).pipe(Effect.withSpan("UserLookupCache.set"))

		const invalidate = (workosUserId: WorkOSUserId): Effect.Effect<void, UserLookupCacheError> =>
			Effect.gen(function* () {
				// Add cache context attributes
				yield* Effect.annotateCurrentSpan("cache.system", "redis")
				yield* Effect.annotateCurrentSpan("cache.name", USER_LOOKUP_CACHE_PREFIX)
				yield* Effect.annotateCurrentSpan("cache.operation", "invalidate")

				const request = new UserLookupCacheRequest({ workosUserId })

				yield* store.remove(request).pipe(
					Effect.mapError(
						(e) =>
							new UserLookupCacheError({
								message: "Failed to invalidate user lookup in cache",
								cause: e,
							}),
					),
				)

				yield* Effect.logDebug(`Invalidated cached user lookup: ${workosUserId}`)
			}).pipe(Effect.withSpan("UserLookupCache.invalidate"))

		return {
			get,
			set,
			invalidate,
		}
	}),
}) {
	/** Test layer that always returns cache miss */
	static Test = Layer.mock(this, {
		_tag: "@hazel/auth/UserLookupCache",
		get: (_workosUserId: WorkOSUserId) => Effect.succeed(Option.none<UserLookupResult>()),
		set: (_workosUserId: WorkOSUserId, _internalUserId: UserId) => Effect.void,
		invalidate: (_workosUserId: WorkOSUserId) => Effect.void,
	})

	/** Test layer factory for configurable cache behavior */
	static TestWith = (options: { cachedResult?: UserLookupResult }) =>
		Layer.mock(UserLookupCache, {
			_tag: "@hazel/auth/UserLookupCache",
			get: (_workosUserId: WorkOSUserId) =>
				Effect.succeed(options.cachedResult ? Option.some(options.cachedResult) : Option.none()),
			set: (_workosUserId: WorkOSUserId, _internalUserId: UserId) => Effect.void,
			invalidate: (_workosUserId: WorkOSUserId) => Effect.void,
		})
}

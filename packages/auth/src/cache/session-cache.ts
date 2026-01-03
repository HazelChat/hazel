import { Persistence } from "@effect/experimental"
import { Duration, Effect, Exit, Layer, Metric, Option } from "effect"
import { SessionCacheError } from "../errors.ts"
import { cacheOperationLatency, sessionCacheHits, sessionCacheMisses } from "../metrics.ts"
import { ValidatedSession } from "../types.ts"
import { calculateCacheTtl, DEFAULT_CACHE_TTL, SESSION_CACHE_PREFIX } from "./cache-keys.ts"
import { SessionCacheRequest } from "./session-request.ts"

/**
 * Generate a SHA-256 hash of the session cookie.
 */
const hashSessionCookie = (sessionCookie: string): Effect.Effect<string> =>
	Effect.promise(async () => {
		const encoder = new TextEncoder()
		const data = encoder.encode(sessionCookie)
		const hashBuffer = await crypto.subtle.digest("SHA-256", data)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
	}).pipe(Effect.withSpan("SessionCache.hash"))

/**
 * Session cache service using @effect/experimental Persistence.
 * Provides a caching layer to avoid repeated WorkOS API calls.
 *
 * Uses ResultPersistence for schema-based serialization and Redis backing.
 * Requires: Persistence.ResultPersistence (provided by RedisResultPersistenceLive or MemoryResultPersistenceLive)
 */
export class SessionCache extends Effect.Service<SessionCache>()("@hazel/auth/SessionCache", {
	accessors: true,
	scoped: Effect.gen(function* () {
		const persistence = yield* Persistence.ResultPersistence

		// Create a store with default TTL - actual TTL is managed by pre-filtering in set()
		const store = yield* persistence.make({
			storeId: SESSION_CACHE_PREFIX,
			timeToLive: () => DEFAULT_CACHE_TTL,
		})

		const get = (sessionCookie: string): Effect.Effect<Option.Option<ValidatedSession>, SessionCacheError> =>
			Effect.gen(function* () {
				const startTime = Date.now()

				const hash = yield* hashSessionCookie(sessionCookie)
				const request = new SessionCacheRequest({ sessionHash: hash })

				const cached = yield* store.get(request).pipe(
					Effect.mapError(
						(e) =>
							new SessionCacheError({
								message: "Failed to get session from cache",
								cause: e,
							}),
					),
				)

				// Record latency
				yield* Metric.update(cacheOperationLatency, Date.now() - startTime)

				if (Option.isNone(cached)) {
					yield* Metric.increment(sessionCacheMisses)
					yield* Effect.annotateCurrentSpan("cache.hit", false)
					return Option.none<ValidatedSession>()
				}

				// Exit contains Success or Failure
				if (cached.value._tag === "Success") {
					yield* Metric.increment(sessionCacheHits)
					yield* Effect.annotateCurrentSpan("cache.hit", true)
					return Option.some(cached.value.value)
				}

				// Cached a failure - treat as cache miss
				yield* Metric.increment(sessionCacheMisses)
				yield* Effect.annotateCurrentSpan("cache.hit", false)
				yield* Effect.annotateCurrentSpan("cache.failure_cached", true)
				return Option.none<ValidatedSession>()
			}).pipe(Effect.withSpan("SessionCache.get"))

		const set = (sessionCookie: string, session: ValidatedSession): Effect.Effect<void, SessionCacheError> =>
			Effect.gen(function* () {
				const startTime = Date.now()
				const ttlMs = Duration.toMillis(calculateCacheTtl(session.expiresAt))

				// Don't cache if TTL is zero
				if (ttlMs <= 0) {
					yield* Effect.logDebug("Skipping cache - session expires too soon")
					yield* Effect.annotateCurrentSpan("cache.skipped", true)
					yield* Effect.annotateCurrentSpan("cache.skip_reason", "expires_too_soon")
					return
				}

				const hash = yield* hashSessionCookie(sessionCookie)
				const request = new SessionCacheRequest({ sessionHash: hash })

				yield* store.set(request, Exit.succeed(session)).pipe(
					Effect.mapError(
						(e) =>
							new SessionCacheError({
								message: "Failed to set session in cache",
								cause: e,
							}),
					),
				)

				// Record latency and attributes
				yield* Metric.update(cacheOperationLatency, Date.now() - startTime)
				yield* Effect.annotateCurrentSpan("cache.ttl_ms", ttlMs)

				yield* Effect.logDebug(`Cached session with TTL ${ttlMs}ms`)
			}).pipe(Effect.withSpan("SessionCache.set"))

		const invalidate = (sessionCookie: string): Effect.Effect<void, SessionCacheError> =>
			Effect.gen(function* () {
				const hash = yield* hashSessionCookie(sessionCookie)
				const request = new SessionCacheRequest({ sessionHash: hash })

				yield* store.remove(request).pipe(
					Effect.mapError(
						(e) =>
							new SessionCacheError({
								message: "Failed to invalidate session in cache",
								cause: e,
							}),
					),
				)

				yield* Effect.logDebug("Invalidated cached session")
			}).pipe(Effect.withSpan("SessionCache.invalidate"))

		return {
			get,
			set,
			invalidate,
		}
	}),
}) {
	/** Test layer that always returns cache miss */
	static Test = Layer.mock(this, {
		_tag: "@hazel/auth/SessionCache",
		get: (_sessionCookie: string) => Effect.succeed(Option.none<ValidatedSession>()),
		set: (_sessionCookie: string, _session: ValidatedSession) => Effect.void,
		invalidate: (_sessionCookie: string) => Effect.void,
	})

	/** Test layer factory for configurable cache behavior */
	static TestWith = (options: { cachedSession?: ValidatedSession }) =>
		Layer.mock(SessionCache, {
			_tag: "@hazel/auth/SessionCache",
			get: (_sessionCookie: string) =>
				Effect.succeed(options.cachedSession ? Option.some(options.cachedSession) : Option.none()),
			set: (_sessionCookie: string, _session: ValidatedSession) => Effect.void,
			invalidate: (_sessionCookie: string) => Effect.void,
		})
}

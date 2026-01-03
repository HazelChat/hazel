import { Persistence } from "@effect/experimental"
import { Duration, Effect, Exit, Option } from "effect"
import { SessionCacheError } from "../errors.ts"
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
	})

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

				if (Option.isNone(cached)) {
					return Option.none<ValidatedSession>()
				}

				// Exit contains Success or Failure
				if (cached.value._tag === "Success") {
					return Option.some(cached.value.value)
				}

				// Cached a failure - treat as cache miss
				return Option.none<ValidatedSession>()
			})

		const set = (sessionCookie: string, session: ValidatedSession): Effect.Effect<void, SessionCacheError> =>
			Effect.gen(function* () {
				const ttl = calculateCacheTtl(session.expiresAt)

				// Don't cache if TTL is zero
				if (Duration.toMillis(ttl) <= 0) {
					yield* Effect.logDebug("Skipping cache - session expires too soon")
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

				yield* Effect.logDebug(`Cached session with TTL ${Duration.toMillis(ttl)}ms`)
			})

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
			})

		return {
			get,
			set,
			invalidate,
		}
	}),
}) {}

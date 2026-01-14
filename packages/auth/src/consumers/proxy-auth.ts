import { Database, eq, schema } from "@hazel/db"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Config, Effect, Option, Schema } from "effect"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { UserLookupCache } from "../cache/user-lookup-cache.ts"
import { SessionValidator } from "../session/session-validator.ts"
import type { AuthenticatedUserContext } from "../types.ts"

/**
 * Authentication error for proxy auth.
 */
export class ProxyAuthenticationError extends Schema.TaggedError<ProxyAuthenticationError>()(
	"ProxyAuthenticationError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}

/**
 * Electric-proxy authentication service.
 * Provides fast session validation without user sync.
 *
 * Key differences from BackendAuth:
 * - Does NOT upsert users to database (validates only)
 * - Handles session refresh and returns new cookie if refreshed
 * - Rejects if user doesn't exist in database
 *
 * Note: Database.Database is intentionally NOT included in dependencies
 * as it's a global infrastructure layer provided at the application root.
 */
export class ProxyAuth extends Effect.Service<ProxyAuth>()("@hazel/auth/ProxyAuth", {
	accessors: true,
	dependencies: [SessionValidator.Default, UserLookupCache.Default],
	effect: Effect.gen(function* () {
		const validator = yield* SessionValidator
		const userLookupCache = yield* UserLookupCache
		const db = yield* Database.Database

		/**
		 * Lookup user by WorkOS ID, using cache first then database.
		 * Caches successful lookups for 5 minutes.
		 */
		const lookupUser = Effect.fn("ProxyAuth.lookupUser")(function* (workosUserId: string) {
			// Check cache first
			const cached = yield* userLookupCache.get(workosUserId).pipe(
				Effect.catchAll((error) => {
					// Log cache error but continue with database lookup
					return Effect.logWarning("User lookup cache error", error).pipe(
						Effect.map(() => Option.none<{ internalUserId: string }>()),
					)
				}),
			)

			if (Option.isSome(cached)) {
				yield* Effect.annotateCurrentSpan("cache.hit", true)
				return Option.some(cached.value.internalUserId)
			}

			// Cache miss - lookup in database
			const userResult = yield* db
				.execute((client) =>
					client
						.select({ id: schema.usersTable.id })
						.from(schema.usersTable)
						.where(eq(schema.usersTable.externalId, workosUserId))
						.limit(1),
				)
				.pipe(
					Effect.catchTag(
						"DatabaseError",
						(error) =>
							new ProxyAuthenticationError({
								message: "Failed to lookup user in database",
								detail: error.message,
							}),
					),
				)
			const userOption = Option.fromNullable(userResult[0])

			// Cache successful lookup
			if (Option.isSome(userOption)) {
				yield* userLookupCache.set(workosUserId, userOption.value.id).pipe(
					Effect.catchAll((error) =>
						// Log cache error but don't fail the request
						Effect.logWarning("Failed to cache user lookup", error),
					),
				)
			}

			return Option.map(userOption, (user) => user.id)
		})

		/**
		 * Validate a session cookie and return user context.
		 * Uses cached session validation with automatic refresh.
		 * Rejects if user is not found in database.
		 * Returns refreshedSession if the session was refreshed (caller should set cookie).
		 */
		const validateSession = Effect.fn("ProxyAuth.validateSession")(function* (sessionCookie: string) {
			// Validate session with automatic refresh (uses Redis cache)
			const { session, newSealedSession } = yield* validator.validateAndRefresh(sessionCookie)

			// Lookup user (uses cache, falls back to database)
			const userIdOption = yield* lookupUser(session.workosUserId).pipe(
				Effect.withSpan("ProxyAuth.lookupUser", {
					attributes: { "workos.user_id": session.workosUserId },
				}),
			)

			if (Option.isNone(userIdOption)) {
				yield* Effect.annotateCurrentSpan("user.found", false)
				return yield* new ProxyAuthenticationError({
					message: "User not found in database",
					detail: `User must be created via backend first. WorkOS ID: ${session.workosUserId}`,
				})
			}

			yield* Effect.annotateCurrentSpan("user.found", true)
			yield* Effect.annotateCurrentSpan("user.id", userIdOption.value)

			if (newSealedSession) {
				yield* Effect.annotateCurrentSpan("session.refreshed", true)
				yield* Effect.logDebug("Session was refreshed, returning new sealed session")
			}

			return {
				workosUserId: session.workosUserId,
				internalUserId: userIdOption.value as UserId,
				email: session.email,
				organizationId: session.internalOrganizationId as OrganizationId | undefined,
				role: session.role ?? undefined,
				refreshedSession: newSealedSession,
			} satisfies AuthenticatedUserContext
		})

		/**
		 * Validate a Bearer token (JWT) and return user context.
		 * Used by Tauri desktop apps that authenticate via JWT instead of cookies.
		 * Rejects if user is not found in database.
		 */
		const validateBearerToken = Effect.fn("ProxyAuth.validateBearerToken")(function* (
			bearerToken: string,
		) {
			const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)

			// Verify JWT signature using WorkOS JWKS
			const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))

			const { payload } = yield* Effect.tryPromise({
				try: () =>
					jwtVerify(bearerToken, jwks, {
						issuer: "https://api.workos.com",
					}),
				catch: (error) =>
					new ProxyAuthenticationError({
						message: `Invalid token: ${error}`,
						detail: "JWT verification failed",
					}),
			})

			const workOsUserId = payload.sub
			if (!workOsUserId) {
				return yield* new ProxyAuthenticationError({
					message: "Token missing user ID",
					detail: "The JWT does not contain a subject claim",
				})
			}

			// Lookup user (uses cache, falls back to database)
			const userIdOption = yield* lookupUser(workOsUserId).pipe(
				Effect.withSpan("ProxyAuth.lookupUser", {
					attributes: { "workos.user_id": workOsUserId },
				}),
			)

			if (Option.isNone(userIdOption)) {
				yield* Effect.annotateCurrentSpan("user.found", false)
				return yield* new ProxyAuthenticationError({
					message: "User not found in database",
					detail: `User must be created via backend first. WorkOS ID: ${workOsUserId}`,
				})
			}

			yield* Effect.annotateCurrentSpan("user.found", true)
			yield* Effect.annotateCurrentSpan("user.id", userIdOption.value)

			return {
				workosUserId: workOsUserId,
				internalUserId: userIdOption.value as UserId,
				email: (payload.email as string) ?? "",
				organizationId: (payload.org_id as OrganizationId) ?? undefined,
				role: (payload.role as string) ?? undefined,
				refreshedSession: undefined, // No session refresh for JWT auth
			} satisfies AuthenticatedUserContext
		})

		return {
			validateSession,
			validateBearerToken,
		}
	}),
}) {}

/**
 * Layer that provides ProxyAuth with all its dependencies via Effect.Service dependencies.
 *
 * ProxyAuth.Default automatically includes:
 * - SessionValidator.Default (which includes WorkOSClient.Default + SessionCache.Default)
 *
 * External dependencies that must be provided:
 * - Redis (for SessionCache)
 * - Database.Database (for user lookup)
 */
export const ProxyAuthLive = ProxyAuth.Default

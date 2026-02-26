import { Database, eq, schema } from "@hazel/db"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Option, Schema } from "effect"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { UserLookupCache } from "../cache/user-lookup-cache.ts"
import { WorkOSClient } from "../session/workos-client.ts"
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
 * - Rejects if user doesn't exist in database
 *
 * Note: Database.Database is intentionally NOT included in dependencies
 * as it's a global infrastructure layer provided at the application root.
 */
export class ProxyAuth extends Effect.Service<ProxyAuth>()("@hazel/auth/ProxyAuth", {
	accessors: true,
	dependencies: [UserLookupCache.Default, WorkOSClient.Default],
	effect: Effect.gen(function* () {
		const userLookupCache = yield* UserLookupCache
		const workos = yield* WorkOSClient
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
				yield* Effect.annotateCurrentSpan("cache.result", "hit")
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
			 * Validate a Bearer token (JWT) and return user context.
			 * Used by web and desktop runtime apps that authenticate via JWT.
			 * Rejects if user is not found in database.
			 */
		const validateBearerToken = Effect.fn("ProxyAuth.validateBearerToken")(function* (
			bearerToken: string,
		) {
			const clientId = workos.clientId
			const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))

			// WorkOS can issue tokens with either issuer format:
			// - SSO/OIDC flow: https://api.workos.com
			// - User Management flow: https://api.workos.com/user_management/${clientId}
			const verifyWithIssuer = (issuer: string) =>
				Effect.tryPromise({
					try: () => jwtVerify(bearerToken, jwks, { issuer }),
					catch: (error) =>
						new ProxyAuthenticationError({
							message: `JWT verification failed: ${error}`,
							detail: `Issuer: ${issuer}`,
						}),
				})

			const { payload } = yield* verifyWithIssuer("https://api.workos.com").pipe(
				Effect.orElse(() => verifyWithIssuer(`https://api.workos.com/user_management/${clientId}`)),
			)

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

			// Resolve WorkOS org ID to internal UUID
			// The JWT contains org_id (WorkOS org ID like "org_01ABC123...")
			// We need to convert to internal UUID for frontend comparison
			const workosOrgId = payload.org_id as string | undefined
			let internalOrgId: OrganizationId | undefined = undefined

			if (workosOrgId) {
				internalOrgId = yield* workos.getOrganization(workosOrgId).pipe(
					Effect.map((org) => org.externalId as OrganizationId | undefined),
					Effect.catchTag("OrganizationFetchError", (error) =>
						// Log warning but don't fail - org is optional context
						Effect.logWarning("Failed to resolve org ID from JWT", {
							workosOrgId,
							error: error.message,
						}).pipe(Effect.as(undefined)),
					),
				)
			}

			return {
				workosUserId: workOsUserId,
				internalUserId: userIdOption.value as UserId,
				email: (payload.email as string) ?? "",
				organizationId: internalOrgId,
				role: (payload.role as string) ?? undefined,
			} satisfies AuthenticatedUserContext
		})

		return {
			validateBearerToken,
		}
	}),
}) {}

/**
 * Layer that provides ProxyAuth with all its dependencies via Effect.Service dependencies.
 *
 * External dependencies that must be provided:
 * - Database.Database (for user lookup)
 */
export const ProxyAuthLive = ProxyAuth.Default

import { verifyToken } from "@clerk/backend"
import { Database, eq, schema } from "@hazel/db"
import {
	ClerkJwtClaims,
	OrganizationId,
	WorkOSJwtClaims,
	type UserId,
	type WorkOSOrganizationId,
	type WorkOSUserId,
} from "@hazel/schema"
import { ServiceMap, Config, Effect, Layer, Option, Redacted, Schema } from "effect"
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose"
import { UserLookupCache } from "../cache/user-lookup-cache.ts"
import { WorkOSClient } from "../session/workos-client.ts"
import type { AuthenticatedUserContext } from "../types.ts"

/**
 * Authentication error for proxy auth.
 */
export class ProxyAuthenticationError extends Schema.TaggedErrorClass<ProxyAuthenticationError>()(
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
export class ProxyAuth extends ServiceMap.Service<ProxyAuth>()("@hazel/auth/ProxyAuth", {
	make: Effect.gen(function* () {
		const userLookupCache = yield* UserLookupCache
		const workos = yield* WorkOSClient
		const db = yield* Database.Database
		const decodeClaims = Schema.decodeUnknownEffect(WorkOSJwtClaims)
		const decodeClerkClaims = Schema.decodeUnknownEffect(ClerkJwtClaims)
		// Optional so proxy can still boot on environments that haven't set the key.
		const clerkSecretKey = yield* Config.redacted("CLERK_SECRET_KEY").pipe(
			Config.withDefault(Redacted.make("")),
		)

		const classifyIssuer = (token: string): "clerk" | "workos" | "unknown" => {
			try {
				const iss = decodeJwt(token).iss ?? ""
				if (iss.includes("workos.com")) return "workos"
				if (iss.includes("clerk.") || iss.includes("accounts.")) return "clerk"
			} catch {
				// fall through
			}
			return "unknown"
		}

		const resolveInternalOrganizationId = (
			workosOrgId: WorkOSOrganizationId,
		): Effect.Effect<OrganizationId | undefined, never> =>
			workos.getOrganization(workosOrgId).pipe(
				Effect.flatMap((org) =>
					Option.fromNullishOr(org.externalId).pipe(
						Option.match({
							onNone: () =>
								Effect.logWarning("WorkOS organization is missing externalId", {
									workosOrgId,
								}).pipe(Effect.as(undefined)),
							onSome: (externalId) =>
								Schema.decodeUnknownEffect(OrganizationId)(externalId).pipe(
									Effect.catch((error) =>
										Effect.logWarning(
											"Failed to decode WorkOS external organization ID",
											{
												workosOrgId,
												externalId,
												error: String(error),
											},
										).pipe(Effect.as(undefined)),
									),
								),
						}),
					),
				),
				Effect.catchTag("OrganizationFetchError", (error) =>
					Effect.logWarning("Failed to resolve org ID from JWT", {
						workosOrgId,
						error: error.message,
					}).pipe(Effect.as(undefined)),
				),
			)

		/**
		 * Lookup user by WorkOS ID, using cache first then database.
		 * Caches successful lookups for 5 minutes.
		 */
		const lookupUser = Effect.fn("ProxyAuth.lookupUser")(function* (workosUserId: WorkOSUserId) {
			// Check cache first
			const cached = yield* userLookupCache.get(workosUserId).pipe(
				Effect.catch((error) => {
					// Log cache error but continue with database lookup
					return Effect.logWarning("User lookup cache error", error).pipe(
						Effect.map(() => Option.none<{ internalUserId: UserId }>()),
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
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							new ProxyAuthenticationError({
								message: "Failed to lookup user in database",
								detail: error.message,
							}),
						),
					),
				)
			const userOption = Option.fromNullishOr(userResult[0])

			// Cache successful lookup
			if (Option.isSome(userOption)) {
				yield* userLookupCache.set(workosUserId, userOption.value.id).pipe(
					Effect.catch((error) =>
						// Log cache error but don't fail the request
						Effect.logWarning("Failed to cache user lookup", error),
					),
				)
			}

			return Option.map(userOption, (user) => user.id)
		})

		const validateWorkOSBearer = Effect.fn("ProxyAuth.validateWorkOSBearer")(function* (
			bearerToken: string,
		) {
			const clientId = workos.clientId
			const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))

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
				Effect.catch(() => verifyWithIssuer(`https://api.workos.com/user_management/${clientId}`)),
			)

			const claims = yield* decodeClaims(payload).pipe(
				Effect.mapError(
					(error) =>
						new ProxyAuthenticationError({
							message: "Invalid JWT claims",
							detail: String(error),
						}),
				),
			)

			const userIdOption = yield* lookupUser(claims.sub).pipe(
				Effect.withSpan("ProxyAuth.lookupUser", {
					attributes: { "workos.user_id": claims.sub },
				}),
			)

			if (Option.isNone(userIdOption)) {
				yield* Effect.annotateCurrentSpan("user.found", false)
				return yield* new ProxyAuthenticationError({
					message: "User not found in database",
					detail: `User must be created via backend first. WorkOS ID: ${claims.sub}`,
				})
			}

			yield* Effect.annotateCurrentSpan("user.found", true)
			yield* Effect.annotateCurrentSpan("user.id", userIdOption.value)

			const internalOrgId = claims.org_id
				? yield* resolveInternalOrganizationId(claims.org_id)
				: undefined

			return {
				workosUserId: claims.sub,
				internalUserId: userIdOption.value,
				email: claims.email ?? "",
				organizationId: internalOrgId,
				role: claims.role,
			} satisfies AuthenticatedUserContext
		})

		const validateClerkBearer = Effect.fn("ProxyAuth.validateClerkBearer")(function* (
			bearerToken: string,
		) {
			const key = Redacted.value(clerkSecretKey)
			if (!key) {
				return yield* new ProxyAuthenticationError({
					message: "Clerk token received but CLERK_SECRET_KEY is not configured on the proxy",
				})
			}
			const payload = yield* Effect.tryPromise({
				try: () => verifyToken(bearerToken, { secretKey: key }),
				catch: (error) =>
					new ProxyAuthenticationError({
						message: `Clerk JWT verification failed: ${error}`,
						detail: String(error),
					}),
			})

			const claims = yield* decodeClerkClaims(payload).pipe(
				Effect.mapError(
					(error) =>
						new ProxyAuthenticationError({
							message: "Invalid Clerk JWT claims",
							detail: String(error),
						}),
				),
			)

			// lookupUser's param is typed as WorkOSUserId but actually just selects by
			// usersTable.externalId — which post-cutover holds Clerk IDs. Cast to
			// satisfy the signature without rebranding.
			const userIdOption = yield* lookupUser(claims.sub as unknown as WorkOSUserId).pipe(
				Effect.withSpan("ProxyAuth.lookupUser", {
					attributes: { "clerk.user_id": claims.sub },
				}),
			)

			if (Option.isNone(userIdOption)) {
				yield* Effect.annotateCurrentSpan("user.found", false)
				return yield* new ProxyAuthenticationError({
					message: "User not found in database",
					detail: `User must be created via backend first. Clerk ID: ${claims.sub}`,
				})
			}

			return {
				workosUserId: claims.sub as unknown as WorkOSUserId,
				internalUserId: userIdOption.value,
				email: claims.email ?? "",
				organizationId: undefined,
				role: claims.org_role === "org:admin" ? "admin" : "member",
			} satisfies AuthenticatedUserContext
		})

		/**
		 * Validate a Bearer token (JWT) and return user context.
		 * Routes to Clerk or WorkOS based on the JWT issuer.
		 */
		const validateBearerToken = (bearerToken: string) =>
			Effect.gen(function* () {
				const issuer = classifyIssuer(bearerToken)
				yield* Effect.logDebug(`[proxy-auth] classified token as ${issuer}`)
				if (issuer === "clerk") return yield* validateClerkBearer(bearerToken)
				return yield* validateWorkOSBearer(bearerToken)
			})

		return {
			validateBearerToken,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(UserLookupCache.layer),
		Layer.provide(WorkOSClient.layer),
	)
}

/**
 * Layer that provides ProxyAuth with all its dependencies via Effect.Service dependencies.
 *
 * External dependencies that must be provided:
 * - Database.Database (for user lookup)
 */
export const ProxyAuthLive = ProxyAuth.layer

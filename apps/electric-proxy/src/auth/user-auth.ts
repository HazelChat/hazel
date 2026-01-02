import { Database, eq, schema } from "@hazel/db"
import type { UserId } from "@hazel/schema"
import { AuthenticateWithSessionCookieFailureReason, WorkOS } from "@workos-inc/node"
import { Effect, Option, Redacted, Schema } from "effect"
import { decodeJwt } from "jose"
import { AccessContextCacheService, type UserAccessContext } from "../cache"
import { ProxyConfigService } from "../config"

/**
 * JWT Payload schema from WorkOS
 */
const JwtPayload = Schema.Struct({
	sub: Schema.String,
	email: Schema.String,
	sid: Schema.String,
	org_id: Schema.optional(Schema.String),
	role: Schema.optional(Schema.String),
})

// Re-export UserAccessContext from cache module
export type { UserAccessContext } from "../cache"

/**
 * Authenticated user context extracted from session
 */
export interface AuthenticatedUser {
	userId: string // WorkOS external ID (e.g., user_01KAA...)
	internalUserId: UserId // Internal database UUID
	email: string
	organizationId?: string
	role?: string
}

/**
 * Authenticated user with pre-queried access context
 */
export interface AuthenticatedUserWithContext extends AuthenticatedUser {
	accessContext: UserAccessContext
}

/**
 * Authentication error
 */
export class AuthenticationError extends Schema.TaggedError<AuthenticationError>("AuthenticationError")(
	"AuthenticationError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}

/**
 * Parse cookie header and extract a specific cookie by name
 */
function parseCookie(cookieHeader: string, cookieName: string): string | null {
	const cookies = cookieHeader.split(";").map((c) => c.trim())
	for (const cookie of cookies) {
		const [name, ...valueParts] = cookie.split("=")
		if (name === cookieName) {
			return valueParts.join("=")
		}
	}
	return null
}

/**
 * Validate a WorkOS sealed session cookie and return authenticated user
 * Uses Effect Config to read environment variables
 */
export const validateSession = Effect.fn("ElectricProxy.validateSession")(function* (request: Request) {
	const config = yield* ProxyConfigService

	// Step 1: Extract cookie from request
	const cookieHeader = request.headers.get("Cookie")
	if (!cookieHeader) {
		yield* Effect.logDebug("Auth failed: No cookie header")
		return yield* Effect.fail(
			new AuthenticationError({
				message: "No cookie header found",
				detail: "Authentication required",
			}),
		)
	}

	const sessionCookie = parseCookie(cookieHeader, "workos-session")
	if (!sessionCookie) {
		yield* Effect.logDebug("Auth failed: No workos-session cookie")
		return yield* Effect.fail(
			new AuthenticationError({
				message: "No workos-session cookie found",
				detail: "Authentication required",
			}),
		)
	}

	// Step 2: Initialize WorkOS client and load sealed session
	const workos = new WorkOS(config.workosApiKey, {
		clientId: config.workosClientId,
	})

	const sealedSession = yield* Effect.tryPromise({
		try: async () =>
			workos.userManagement.loadSealedSession({
				sessionData: sessionCookie,
				cookiePassword: Redacted.value(config.workosPasswordCookie),
			}),
		catch: (error) => {
			console.error("loadSealedSession failed:", error)
			return new AuthenticationError({
				message: "Failed to load sealed session",
				detail: String(error),
			})
		},
	})

	// Step 3: Authenticate the session
	const session = yield* Effect.tryPromise({
		try: async () => sealedSession.authenticate(),
		catch: (error) => {
			console.error("authenticate() threw:", error)
			return new AuthenticationError({
				message: "Failed to authenticate session",
				detail: String(error),
			})
		},
	})

	if(!session.authenticated) {
		if (session.reason === "no_session_cookie_provided") {
			return yield* Effect.fail(
				new AuthenticationError({
					message: "No session cookie provided",
					detail: "Please log in",
				}),
			)
		}

		if(session.reason === AuthenticateWithSessionCookieFailureReason.INVALID_JWT) {
			return yield* Effect.fail(
				new AuthenticationError({
					message: "Invalid JWT payload",
					detail: "Please log in again",
				}),
			)
		}


		if(session.reason === AuthenticateWithSessionCookieFailureReason.INVALID_SESSION_COOKIE) {
			return yield* Effect.fail(
				new AuthenticationError({
					message: "Session expired",
					detail: "Please log in again",
				}),
			)
		}

		return yield* Effect.fail(
			new AuthenticationError({
				message: "Session expired",
				detail: "Please log in again",
			}),
		)
	}

	// Step 4: Handle not authenticated - try refresh
	let accessToken = session.accessToken
	if (!session.authenticated || !accessToken) {
		

		// Attempt to refresh the session
		const refreshedSession: any = yield* Effect.tryPromise({
			try: async () => sealedSession.refresh(),
			catch: (error) => {
				console.error("refresh() failed:", error)
				return new AuthenticationError({
					message: "Failed to refresh session",
					detail: String(error),
				})
			},
		})

		if (!refreshedSession.authenticated || !refreshedSession.accessToken) {
			return yield* Effect.fail(
				new AuthenticationError({
					message: "Session expired",
					detail: "Please log in again",
				}),
			)
		}

		accessToken = refreshedSession.accessToken
	}

	// Step 5: Decode JWT payload
	const rawPayload = decodeJwt(accessToken)
	const jwtPayload = yield* Schema.decodeUnknown(JwtPayload)(rawPayload).pipe(
		Effect.mapError(
			(error) =>
				new AuthenticationError({
					message: "Invalid JWT payload",
					detail: String(error),
				}),
		),
	)

	// Lookup internal user ID from database
	const db = yield* Database.Database
	const userOption = yield* db
		.execute((client) =>
			client
				.select({ id: schema.usersTable.id })
				.from(schema.usersTable)
				.where(eq(schema.usersTable.externalId, jwtPayload.sub))
				.limit(1),
		)
		.pipe(
			Effect.map((results) => Option.fromNullable(results[0])),
			Effect.mapError(
				(error) =>
					new AuthenticationError({
						message: "Failed to lookup user in database",
						detail: String(error),
					}),
			),
		)

	if (Option.isNone(userOption)) {
		return yield* Effect.fail(
			new AuthenticationError({
				message: "User not found in database",
				detail: `No user found with externalId: ${jwtPayload.sub}`,
			}),
		)
	}

	const internalUserId = userOption.value.id

	// Get cached access context from Redis-backed cache
	const cache = yield* AccessContextCacheService
	const accessContext = yield* cache.getUserContext(internalUserId).pipe(
		Effect.mapError(
			(error) =>
				new AuthenticationError({
					message: "Failed to get user access context",
					detail: String(error),
				}),
		),
	)

	return {
		userId: jwtPayload.sub,
		internalUserId,
		email: jwtPayload.email,
		organizationId: jwtPayload.org_id,
		role: jwtPayload.role,
		accessContext,
	} satisfies AuthenticatedUserWithContext
})

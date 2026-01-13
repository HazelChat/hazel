import { ProxyAuth, ProxyAuthenticationError } from "@hazel/auth/proxy"
import type { UserId } from "@hazel/schema"
import { Effect, Schema } from "effect"
import { AccessContextCacheService, type UserAccessContext } from "../cache"

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
	/** New sealed session cookie if the session was refreshed */
	refreshedSession?: string
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
 * Validate authentication and return authenticated user.
 * Supports both Bearer token (Tauri desktop) and cookie (web) authentication.
 * Uses @hazel/auth for session validation with Redis caching.
 */
export const validateSession = Effect.fn("ElectricProxy.validateSession")(function* (request: Request) {
	const proxyAuth = yield* ProxyAuth
	const cache = yield* AccessContextCacheService

	// Check for Bearer token first (Tauri desktop apps)
	const authHeader = request.headers.get("Authorization")
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice(7)
		yield* Effect.logDebug("Auth: Using Bearer token authentication")

		const authContext = yield* proxyAuth.validateBearerToken(token).pipe(
			Effect.mapError((error) => {
				if (error instanceof ProxyAuthenticationError) {
					return new AuthenticationError({
						message: error.message,
						detail: error.detail,
					})
				}
				return new AuthenticationError({
					message: "Bearer token authentication failed",
					detail: String(error),
				})
			}),
		)

		// Get cached access context from Redis-backed cache
		const accessContext = yield* cache.getUserContext(authContext.internalUserId).pipe(
			Effect.mapError(
				(error) =>
					new AuthenticationError({
						message: "Failed to get user access context",
						detail: String(error),
					}),
			),
		)

		return {
			userId: authContext.workosUserId,
			internalUserId: authContext.internalUserId,
			email: authContext.email,
			organizationId: authContext.organizationId,
			role: authContext.role,
			refreshedSession: undefined,
			accessContext,
		} satisfies AuthenticatedUserWithContext
	}

	// Fall back to cookie authentication (web apps)
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

	// Validate session using @hazel/auth (uses Redis caching)
	const authContext = yield* proxyAuth.validateSession(sessionCookie).pipe(
		Effect.mapError((error) => {
			if (error instanceof ProxyAuthenticationError) {
				return new AuthenticationError({
					message: error.message,
					detail: error.detail,
				})
			}
			// Handle other error types from the auth package
			return new AuthenticationError({
				message: "Authentication failed",
				detail: String(error),
			})
		}),
	)

	// Get cached access context from Redis-backed cache
	const accessContext = yield* cache.getUserContext(authContext.internalUserId).pipe(
		Effect.mapError(
			(error) =>
				new AuthenticationError({
					message: "Failed to get user access context",
					detail: String(error),
				}),
		),
	)

	return {
		userId: authContext.workosUserId,
		internalUserId: authContext.internalUserId,
		email: authContext.email,
		organizationId: authContext.organizationId,
		role: authContext.role,
		refreshedSession: authContext.refreshedSession,
		accessContext,
	} satisfies AuthenticatedUserWithContext
})

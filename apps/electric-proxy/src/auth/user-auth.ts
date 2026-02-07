import { ProxyAuth, ProxyAuthenticationError } from "@hazel/auth/proxy"
import type { UserId } from "@hazel/schema"
import { Effect } from "effect"

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

	// Check for Bearer token first (Tauri desktop apps)
	const authHeader = request.headers.get("Authorization")
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice(7)
		yield* Effect.logDebug("Auth: Using Bearer token authentication")

		const authContext = yield* proxyAuth.validateBearerToken(token)

		return {
			userId: authContext.workosUserId,
			internalUserId: authContext.internalUserId,
			email: authContext.email,
			organizationId: authContext.organizationId,
			role: authContext.role,
			refreshedSession: undefined,
		} satisfies AuthenticatedUser
	}

	// Fall back to cookie authentication (web apps)
	const cookieHeader = request.headers.get("Cookie")
	if (!cookieHeader) {
		yield* Effect.logDebug("Auth failed: No cookie header")
		return yield* new ProxyAuthenticationError({
			message: "No cookie header found",
			detail: "Authentication required",
		})
	}

	const sessionCookie = parseCookie(cookieHeader, "workos-session")
	if (!sessionCookie) {
		yield* Effect.logDebug("Auth failed: No workos-session cookie")
		return yield* new ProxyAuthenticationError({
			message: "No workos-session cookie found",
			detail: "Authentication required",
		})
	}

	// Validate session using @hazel/auth (uses Redis caching)
	const authContext = yield* proxyAuth.validateSession(sessionCookie)

	return {
		userId: authContext.workosUserId,
		internalUserId: authContext.internalUserId,
		email: authContext.email,
		organizationId: authContext.organizationId,
		role: authContext.role,
		refreshedSession: authContext.refreshedSession,
	} satisfies AuthenticatedUser
})

import { ProxyAuth, ProxyAuthenticationError } from "@hazel/auth/proxy"
import type { UserId } from "@hazel/schema"
import { Effect } from "effect"

/**
 * Authenticated user context extracted from the Clerk JWT.
 */
export interface AuthenticatedUser {
	/** Clerk user ID (e.g., user_2abc...) — stored in users.externalId. */
	externalId: string
	/** Internal Hazel database user UUID. */
	internalUserId: UserId
	email: string
}

/**
 * Validate authentication and return authenticated user.
 * Requires a Bearer token (JWT) in the Authorization header.
 * Uses @hazel/auth for JWT validation with user lookup caching.
 */
export const validateSession = Effect.fn("ElectricProxy.validateSession")(function* (request: Request) {
	const proxyAuth = yield* ProxyAuth

	// Require Bearer token
	const authHeader = request.headers.get("Authorization")
	if (!authHeader?.startsWith("Bearer ")) {
		yield* Effect.annotateCurrentSpan("auth.header.present", false)
		return yield* new ProxyAuthenticationError({
			message: "No Bearer token provided",
			detail: "Authentication requires a Bearer token in the Authorization header",
		})
	}

	const token = authHeader.slice(7)
	yield* Effect.annotateCurrentSpan("auth.header.present", true)
	yield* Effect.annotateCurrentSpan("auth.scheme", "bearer")

	const authContext = yield* proxyAuth.validateBearerToken(token)

	return {
		externalId: authContext.externalId,
		internalUserId: authContext.internalUserId,
		email: authContext.email,
	} satisfies AuthenticatedUser
})

import { ProxyAuth, ProxyAuthenticationError } from "@hazel/auth/proxy"
import type { UserId } from "@hazel/schema"
import { Effect } from "effect"

/** The signed-in user a shape request is filtered for. */
export interface AuthenticatedUser {
	/** Hazel's `users.id`, the access token's subject. */
	internalUserId: UserId
}

/**
 * Validate authentication and return the authenticated user.
 * Requires the Hazel access token (`POST /auth/token` on the API) as a Bearer token.
 */
export const validateSession = Effect.fn("ElectricProxy.validateSession")(function* (request: Request) {
	const proxyAuth = yield* ProxyAuth

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

	return (yield* proxyAuth.validateBearerToken(token)) satisfies AuthenticatedUser
})

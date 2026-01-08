/**
 * Client-safe RPC Middleware Exports
 *
 * This file re-exports ONLY the client-side middleware layers that are safe
 * to import in the frontend. Server-side implementations that depend on
 * database, WorkOS, or other Node.js/Bun APIs are NOT exported here.
 *
 * Frontend code should import from:
 * - `@hazel/backend/rpc/middleware/client` for middleware client layers
 * - `@hazel/backend/rpc/groups/*` for RPC group schemas
 *
 * DO NOT import from:
 * - `@hazel/backend/rpc/middleware/auth` (contains server code)
 * - `@hazel/backend/rpc/handlers/*` (contains database code)
 * - `@hazel/backend/rpc/server` (contains server configuration)
 */

import { RpcMiddleware } from "@effect/rpc"
import { Effect } from "effect"
import { AuthMiddleware } from "./auth-class"

/**
 * Global token getter that can be set by the frontend
 * Used for desktop auth to add bearer token to requests
 */
declare global {
	interface Window {
		__HAZEL_GET_AUTH_TOKEN__?: () => string | null | Promise<string | null>
	}
}

/**
 * Get the bearer token for desktop auth from the global token getter
 */
const getBearerToken = async (): Promise<string | null> => {
	if (typeof window === "undefined") {
		return null
	}

	const getter = window.__HAZEL_GET_AUTH_TOKEN__
	if (!getter) {
		return null
	}

	try {
		return await getter()
	} catch {
		return null
	}
}

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request }) =>
	Effect.gen(function* () {
		// Try to get bearer token (for desktop auth)
		const bearerToken = yield* Effect.promise(getBearerToken)

		if (bearerToken) {
			// Desktop auth - add bearer token to headers
			return {
				...request,
				headers: {
					...request.headers,
					authorization: `Bearer ${bearerToken}`,
				},
			}
		}

		// Web auth - cookies are automatically included by browser
		return {
			...request,
		}
	}),
)

/**
 * Register a token getter function for desktop auth
 * Call this from the frontend to enable bearer token auth
 */
export function registerAuthTokenGetter(getter: () => string | null | Promise<string | null>): void {
	if (typeof window !== "undefined") {
		window.__HAZEL_GET_AUTH_TOKEN__ = getter
	}
}

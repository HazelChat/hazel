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

import { Headers } from "@effect/platform"
import { RpcMiddleware } from "@effect/rpc"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { Effect } from "effect"

/**
 * Get stored access token for Tauri desktop apps
 * Always try to read from localStorage - if token exists, use it
 * Web users won't have a token here, so they'll fall back to cookie auth
 */
const getAccessToken = (): string | null => {
	if (typeof window === "undefined") return null
	return localStorage.getItem("hazel_access_token")
}

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request }) =>
	Effect.gen(function* () {
		// For Tauri desktop apps, add Bearer token to headers
		const token = getAccessToken()

		if (token) {
			const newHeaders = Headers.set(request.headers, "authorization", `Bearer ${token}`)
			return {
				...request,
				headers: newHeaders,
			}
		}

		return request
	}),
)

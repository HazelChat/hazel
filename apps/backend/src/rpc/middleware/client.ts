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
 * Client-side implementation of AuthMiddleware.
 *
 * For browser clients, cookies are sent automatically via 'credentials: include'.
 * This layer is required but doesn't need to modify the request.
 */
export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request }) =>
	Effect.succeed({
		...request,
		// No changes needed - cookies sent automatically by browser
		// But you could add custom auth headers here if needed
	}),
)

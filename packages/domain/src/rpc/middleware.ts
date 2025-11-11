/**
 * RPC Middleware Definitions (Client-Safe)
 *
 * This file contains ONLY middleware class definitions that are safe to import
 * in browser code. Server-side implementations live in the backend package.
 */

import { RpcMiddleware } from "@effect/rpc"
import * as CurrentUser from "../current-user"
import { UnauthorizedError } from "../errors"

/**
 * Authentication middleware that provides CurrentUser context to RPC handlers.
 *
 * This middleware:
 * 1. Extracts the session cookie from request headers
 * 2. Verifies the session via WorkOS and retrieves user information
 * 3. Provides CurrentUser to the RPC handler via Effect context
 *
 * Usage in RPC definition:
 * ```typescript
 * Rpc.make("MessageCreate", { ... }).middleware(AuthMiddleware)
 * ```
 *
 * Usage in handler:
 * ```typescript
 * MessageCreate: (payload) =>
 *   Effect.gen(function* () {
 *     const user = yield* CurrentUser.Context
 *     // user is automatically available from middleware!
 *   })
 * ```
 */
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()("AuthMiddleware", {
	provides: CurrentUser.Context,
	failure: UnauthorizedError,
	requiredForClient: true,
}) {}

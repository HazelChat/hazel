/**
 * RPC Middleware Definitions (Client-Safe)
 *
 * This file contains ONLY middleware class definitions that are safe to import
 * in browser code. Server-side implementations live in the backend package.
 */

import { RpcMiddleware } from "@effect/rpc"
import { Schema as S } from "effect"
import * as CurrentUser from "../current-user"
import { UnauthorizedError } from "../errors"
import {
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	SessionAuthenticationError,
	SessionExpiredError,
	SessionLoadError,
	SessionNotProvidedError,
	SessionRefreshError,
	WorkOSUserFetchError,
} from "../session-errors"

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
const AuthFailure = S.Union(
	UnauthorizedError,
	SessionLoadError,
	SessionAuthenticationError,
	InvalidJwtPayloadError,
	SessionNotProvidedError,
	SessionRefreshError,
	SessionExpiredError,
	InvalidBearerTokenError,
	WorkOSUserFetchError,
)

export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()("AuthMiddleware", {
	provides: CurrentUser.Context,
	failure: AuthFailure,
	requiredForClient: true,
}) {}

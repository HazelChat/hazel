/**
 * Client-side RPC auth middleware. Browsers authenticate RPC with the session cookie,
 * which the protocol sends through `RpcCredentialsLive`, so requests pass through as-is.
 */
import { FetchHttpClient } from "effect/http"
import { RpcMiddleware } from "effect/rpc"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { Layer } from "effect"

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request, next }) =>
	next(request),
)

/** Sends the API's session cookie with cross-origin RPC requests. */
export const RpcCredentialsLive = Layer.succeed(FetchHttpClient.RequestInit, { credentials: "include" })

/**
 * Client-side RPC auth middleware. Browsers authenticate RPC with the session cookie, which
 * the protocol sends through `RpcCredentialsLive`; the desktop app adds its session as a bearer.
 */
import { FetchHttpClient, Headers } from "effect/http"
import { RpcMiddleware } from "effect/rpc"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { Effect, Layer } from "effect"
import { sessionAuthorization } from "./session-bearer"

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request, next }) =>
	Effect.gen(function* () {
		const authorization = yield* Effect.promise(sessionAuthorization)
		return yield* next(
			authorization === null
				? request
				: { ...request, headers: Headers.set(request.headers, "authorization", authorization) },
		)
	}),
)

/** Sends the API's session cookie with cross-origin RPC requests. */
export const RpcCredentialsLive = Layer.succeed(FetchHttpClient.RequestInit, { credentials: "include" })

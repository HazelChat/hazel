/**
 * @module RPC Auth Middleware
 * @platform desktop
 * @description Client-side auth middleware that adds Bearer token from Tauri store
 */

import { Headers } from "@effect/platform"
import { RpcMiddleware } from "@effect/rpc"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { isTauri } from "~/lib/tauri"
import { getAccessToken } from "~/lib/token-storage"

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request }) =>
	Effect.gen(function* () {
		if (isTauri()) {
			const token = yield* Effect.promise(() => getAccessToken())
			if (token) {
				const newHeaders = Headers.set(request.headers, "authorization", `Bearer ${token}`)
				return { ...request, headers: newHeaders }
			}
		}
		return request
	}),
)

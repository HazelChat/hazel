/**
 * @module RPC Auth Middleware
 * @platform all
 * @description Client-side auth middleware that adds Bearer token from storage (Tauri store or localStorage)
 */

import { Headers } from "@effect/platform"
import { RpcMiddleware } from "@effect/rpc"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { waitForRefreshEffect, getAccessTokenEffect } from "~/lib/auth-token"

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request }) =>
	Effect.gen(function* () {
		yield* waitForRefreshEffect

		const token = yield* getAccessTokenEffect

		if (token) {
			const newHeaders = Headers.set(request.headers, "authorization", `Bearer ${token}`)
			return { ...request, headers: newHeaders }
		}

		return request
	}),
)

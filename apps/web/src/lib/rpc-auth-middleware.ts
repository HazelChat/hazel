/**
 * @module RPC Auth Middleware
 * @platform all
 * @description Client-side auth middleware that adds Bearer token from storage (Tauri store or localStorage)
 */

import { Headers } from "effect/unstable/http"
import { RpcMiddleware } from "effect/unstable/rpc"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { waitForRefreshEffect, getAccessTokenEffect } from "~/lib/auth-token"
import { getClerkToken } from "~/lib/clerk-token"

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request, next }) =>
	Effect.gen(function* () {
		// Prefer a Clerk session token if the user is signed in with Clerk.
		// Fall back to the legacy WorkOS token path otherwise — this lets existing
		// sessions keep working during the migration window.
		const clerkToken = yield* Effect.promise(() => getClerkToken())
		if (clerkToken) {
			const newHeaders = Headers.set(request.headers, "authorization", `Bearer ${clerkToken}`)
			return yield* next({ ...request, headers: newHeaders })
		}

		yield* waitForRefreshEffect
		const token = yield* getAccessTokenEffect

		if (token) {
			const newHeaders = Headers.set(request.headers, "authorization", `Bearer ${token}`)
			return yield* next({ ...request, headers: newHeaders })
		}

		return yield* next(request)
	}),
)

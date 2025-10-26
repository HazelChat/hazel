/**
 * Auth Middleware Implementation (Server-Only)
 *
 * This file contains the server-side implementation of AuthMiddleware.
 * It should NOT be imported in browser code as it depends on:
 * - UserRepo (database queries)
 * - WorkOS (Node.js SDK)
 *
 * For client-safe imports, use:
 * - `./auth-class` for the middleware class definition
 * - `./client` for the client-side middleware layer
 */

import { Headers } from "@effect/platform"
import { RpcMiddleware } from "@effect/rpc"
import { CurrentUser, UnauthorizedError, withSystemActor } from "@hazel/effect-lib"
import { Config, Effect, Layer, Option } from "effect"
import { UserRepo } from "../../repositories/user-repo"
import { WorkOS } from "../../services/workos"
import { AuthMiddleware } from "./auth-class"

// Re-export the class for backward compatibility with server code
export { AuthMiddleware } from "./auth-class"

/**
 * Server-side implementation of AuthMiddleware.
 *
 * Extracts and verifies the session cookie using WorkOS, then provides the CurrentUser.
 * This implementation mirrors the logic from services/auth.ts but adapted for RPC middleware.
 */
export const AuthMiddlewareLive = Layer.effect(
	AuthMiddleware,
	Effect.gen(function* () {
		const userRepo = yield* UserRepo
		const workos = yield* WorkOS
		const workOsCookiePassword = yield* Config.string("WORKOS_COOKIE_PASSWORD").pipe(Effect.orDie)

		return AuthMiddleware.of(({ headers }) =>
			Effect.gen(function* () {
				// Extract cookies from headers
				const cookieHeader = Headers.get(headers, "cookie")

				if (Option.isNone(cookieHeader)) {
					return yield* Effect.fail(
						new UnauthorizedError({
							message: "No session cookie provided",
							detail: "Authentication required",
						}),
					)
				}

				// Parse cookies to find the workos-session cookie
				const cookies = cookieHeader.value
					.split(";")
					.map((c) => c.trim())
					.reduce(
						(acc, cookie) => {
							const [key, ...valueParts] = cookie.split("=")
							if (key && valueParts.length > 0) {
								acc[key] = valueParts.join("=")
							}
							return acc
						},
						{} as Record<string, string>,
					)

				const sessionCookie = cookies["workos-session"]

				if (!sessionCookie) {
					return yield* Effect.fail(
						new UnauthorizedError({
							message: "No WorkOS session cookie provided",
							detail: "Authentication required",
						}),
					)
				}

				// Load and verify the sealed session
				const res = yield* workos
					.call(async (client) =>
						client.userManagement.loadSealedSession({
							sessionData: sessionCookie,
							cookiePassword: workOsCookiePassword,
						}),
					)
					.pipe(
						Effect.catchTag("WorkOSApiError", (error) =>
							Effect.fail(
								new UnauthorizedError({
									message: "Failed to get session from cookie",
									detail: String(error.cause),
								}),
							),
						),
					)

				const session = yield* Effect.tryPromise(() => res.authenticate()).pipe(
					Effect.catchTag("UnknownException", (error) =>
						Effect.fail(
							new UnauthorizedError({
								message: "Failed to call authenticate on sealed session",
								detail: String(error.cause),
							}),
						),
					),
				)

				if (!session.authenticated) {
					return yield* Effect.fail(
						new UnauthorizedError({
							message: "Session not authenticated",
							detail: session.reason || "Unknown reason",
						}),
					)
				}

				// Find user by WorkOS external ID
				const user = yield* userRepo
					.findByExternalId(session.user.id)
					.pipe(Effect.orDie, withSystemActor)

				if (Option.isNone(user)) {
					return yield* Effect.fail(
						new UnauthorizedError({
							message: "User not found",
							detail: `The user ${session.user.id} was not found`,
						}),
					)
				}

				return new CurrentUser.Schema({
					id: user.value.id,
					role: (session.role as "admin" | "member") || "member",
					workosOrganizationId: session.organizationId,
					avatarUrl: user.value.avatarUrl,
					firstName: user.value.firstName,
					lastName: user.value.lastName,
					email: user.value.email,
				})
			}),
		)
	}),
)

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

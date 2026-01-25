import { Headers } from "@effect/platform"
import {
	InvalidBearerTokenError,
	type CurrentUser,
	SessionNotProvidedError,
	withSystemActor,
} from "@hazel/domain"
import { Config, Effect, Layer, Option } from "effect"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { BotRepo } from "../../repositories/bot-repo"
import { UserRepo } from "../../repositories/user-repo"
import { SessionManager } from "../../services/session-manager"

export { AuthMiddleware } from "@hazel/domain/rpc"

/**
 * Hash a token using SHA-256 (Web Crypto API)
 */
async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(token)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Check if a token looks like a JWT (three base64url-encoded segments)
 */
function isJwtToken(token: string): boolean {
	const parts = token.split(".")
	return parts.length === 3 && parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))
}

export const AuthMiddlewareLive = Layer.effect(
	AuthMiddleware,
	Effect.gen(function* () {
		const sessionManager = yield* SessionManager
		const botRepo = yield* BotRepo
		const userRepo = yield* UserRepo
		const workOsCookiePassword = yield* Config.string("WORKOS_COOKIE_PASSWORD").pipe(Effect.orDie)

		return AuthMiddleware.of(({ headers }) =>
			Effect.gen(function* () {
				// Check for Bearer token first (bot SDK or desktop app authentication)
				const authHeader = Headers.get(headers, "authorization")

				if (Option.isSome(authHeader) && authHeader.value.startsWith("Bearer ")) {
					const token = authHeader.value.slice(7)

					// Check if this is a JWT token (used by desktop apps via WorkOS)
					if (isJwtToken(token)) {
						// Authenticate using WorkOS JWT
						const currentUser = yield* sessionManager.authenticateWithBearer(token)
						return currentUser
					}

					// Otherwise, treat as bot token (hash-based lookup)
					const tokenHash = yield* Effect.promise(() => hashToken(token))

					// Find bot by token hash
					const botOption = yield* botRepo.findByTokenHash(tokenHash).pipe(
						withSystemActor,
						Effect.catchTag("DatabaseError", () =>
							Effect.fail(
								new InvalidBearerTokenError({
									message: "Failed to validate bot token",
									detail: "Database error",
								}),
							),
						),
					)
					if (Option.isNone(botOption)) {
						return yield* Effect.fail(
							new InvalidBearerTokenError({
								message: "Invalid bot token",
								detail: "No bot found with this token",
							}),
						)
					}

					const bot = botOption.value

					// Get the bot's user from users table
					const userOption = yield* userRepo.findById(bot.userId).pipe(
						withSystemActor,
						Effect.catchTag("DatabaseError", () =>
							Effect.fail(
								new InvalidBearerTokenError({
									message: "Failed to validate bot token",
									detail: "Database error",
								}),
							),
						),
					)
					if (Option.isNone(userOption)) {
						return yield* Effect.fail(
							new InvalidBearerTokenError({
								message: "Invalid bot token",
								detail: "Bot user not found",
							}),
						)
					}

					const user = userOption.value

					// Construct CurrentUser.Schema for the bot
					const botUser: CurrentUser.Schema = {
						id: user.id,
						email: user.email,
						firstName: user.firstName,
						lastName: user.lastName,
						avatarUrl: user.avatarUrl,
						role: "member",
						isOnboarded: true,
						timezone: user.timezone,
						organizationId: null,
						settings: user.settings,
					}

					return botUser
				}

				// Fall back to WorkOS session cookie authentication
				const cookieHeader = Headers.get(headers, "cookie")

				if (Option.isNone(cookieHeader)) {
					return yield* Effect.fail(
						new SessionNotProvidedError({
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
						new SessionNotProvidedError({
							message: "No WorkOS session cookie provided",
							detail: "Authentication required",
						}),
					)
				}

				// Use SessionManager to handle authentication and refresh logic
				const result = yield* sessionManager.authenticateAndGetUser(
					sessionCookie,
					workOsCookiePassword,
				)

				// Log if a session was refreshed
				if (result.refreshedSession) {
					yield* Effect.logDebug("Session was refreshed during RPC request")
				}

				return result.currentUser
			}),
		)
	}),
)

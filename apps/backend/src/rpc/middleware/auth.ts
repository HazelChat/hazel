import { Headers } from "effect/unstable/http"
import { BotRepo, UserRepo } from "@hazel/backend-core"
import { InvalidBearerTokenError, type CurrentUser, SessionNotProvidedError } from "@hazel/domain"
import { Effect, FiberRef, Layer, Option } from "effect"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { type ApiScope, CurrentBotScopes } from "@hazel/domain/scopes"
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

					// Set the bot's declared scopes for authorization
					const botApiScopes = new Set(bot.scopes ?? []) as ReadonlySet<ApiScope>
					yield* FiberRef.set(CurrentBotScopes, Option.some(botApiScopes))

					// Get the bot's user from users table
					const userOption = yield* userRepo.findById(bot.userId).pipe(
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
						avatarUrl: user.avatarUrl ?? undefined,
						role: "member",
						isOnboarded: true,
						timezone: user.timezone,
						organizationId: null,
						settings: user.settings,
					}

					return botUser
				}

				// No valid authentication provided
				return yield* Effect.fail(
					new SessionNotProvidedError({
						message: "No authentication provided",
						detail: "Bearer token required",
					}),
				)
			}),
		)
	}),
)

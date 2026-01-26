/**
 * Stream Auth Service
 *
 * Handles authentication and authorization for stream access.
 *
 * Auth Methods:
 * - Bot Token: `Bearer hzl_bot_{uuid}` → SHA-256 hash → DB lookup
 * - Service Token: `Bearer {SERVICE_TOKEN}` → env var match
 *
 * Access Control:
 * - Bot: Can only read from `/bots/{ownId}/commands`
 * - Backend Service: Full read/write access to all `/bots/{any}/*`
 */
import { PgClient } from "@effect/sql-pg"
import { Context, Effect, FiberRef, Layer, Option, Redacted } from "effect"
import { AccessDeniedError, AuthenticationRequiredError, InvalidTokenError } from "../errors.ts"
import { type BotLookupResult, validateBotToken } from "./BotTokenValidator.ts"

// ============ Auth Context Types ============

export type AuthContextBot = {
	readonly type: "bot"
	readonly botId: string
	readonly userId: string
	readonly name: string
}

export type AuthContextService = {
	readonly type: "service"
}

export type AuthContext = AuthContextBot | AuthContextService

// ============ Config ============

export interface StreamAuthConfig {
	readonly serviceToken: Redacted.Redacted<string>
}

export class StreamAuthConfigTag extends Context.Tag("@durable-streams/StreamAuthConfig")<
	StreamAuthConfigTag,
	StreamAuthConfig
>() {}

// ============ FiberRef for current auth context ============

export const CurrentAuthContext = FiberRef.unsafeMake<Option.Option<AuthContext>>(Option.none())

// ============ Service ============

export class StreamAuth extends Effect.Service<StreamAuth>()("StreamAuth", {
	accessors: true,
	effect: Effect.gen(function* () {
		const config = yield* StreamAuthConfigTag

		/**
		 * Parse Authorization header and extract token
		 */
		const parseAuthHeader = (
			authHeader: string | undefined,
		): Effect.Effect<string, AuthenticationRequiredError> => {
			if (!authHeader) {
				return Effect.fail(
					new AuthenticationRequiredError({ message: "Missing Authorization header" }),
				)
			}

			if (!authHeader.startsWith("Bearer ")) {
				return Effect.fail(
					new AuthenticationRequiredError({ message: "Invalid Authorization header format" }),
				)
			}

			const token = authHeader.slice(7).trim()
			if (!token) {
				return Effect.fail(new AuthenticationRequiredError({ message: "Empty bearer token" }))
			}

			return Effect.succeed(token)
		}

		/**
		 * Try to authenticate as service using the service token
		 */
		const tryServiceAuth = (token: string): Option.Option<AuthContextService> => {
			const serviceToken = Redacted.value(config.serviceToken)
			if (serviceToken && token === serviceToken) {
				return Option.some({ type: "service" as const })
			}
			return Option.none()
		}

		/**
		 * Try to authenticate as bot using the bot token
		 */
		const tryBotAuth = (
			token: string,
		): Effect.Effect<Option.Option<AuthContextBot>, never, PgClient.PgClient> =>
			validateBotToken(token).pipe(
				Effect.map(
					(bot): AuthContextBot => ({
						type: "bot",
						botId: bot.id,
						userId: bot.userId,
						name: bot.name,
					}),
				),
				Effect.map(Option.some),
				Effect.catchTag("InvalidTokenError", () => Effect.succeed(Option.none())),
			)

		/**
		 * Authenticate a request from the Authorization header
		 */
		const authenticate = (
			authHeader: string | undefined,
		): Effect.Effect<AuthContext, AuthenticationRequiredError | InvalidTokenError, PgClient.PgClient> =>
			Effect.gen(function* () {
				const token = yield* parseAuthHeader(authHeader)

				// Try service token first (fast path)
				const serviceAuth = tryServiceAuth(token)
				if (Option.isSome(serviceAuth)) {
					return serviceAuth.value
				}

				// Try bot token lookup
				const botAuth = yield* tryBotAuth(token)
				if (Option.isSome(botAuth)) {
					return botAuth.value
				}

				// Neither worked
				return yield* new InvalidTokenError({ message: "Invalid token" })
			})

		/**
		 * Extract botId from a path like /bots/{botId}/commands
		 */
		const extractBotIdFromPath = (path: string): Option.Option<string> => {
			const match = path.match(/^\/bots\/([^/]+)/)
			if (match && match[1]) {
				return Option.some(match[1])
			}
			return Option.none()
		}

		/**
		 * Check if the path is a bot stream path
		 */
		const isBotStreamPath = (path: string): boolean => {
			return path.startsWith("/bots/")
		}

		/**
		 * Authorize access to a path for read operations
		 */
		const authorizeRead = (auth: AuthContext, path: string): Effect.Effect<void, AccessDeniedError> => {
			// Service has full read access
			if (auth.type === "service") {
				return Effect.void
			}

			// Bot can only read from their own command stream
			if (auth.type === "bot") {
				if (!isBotStreamPath(path)) {
					return Effect.fail(
						new AccessDeniedError({
							message: "Bots can only access /bots/{botId}/* paths",
							path,
						}),
					)
				}

				const pathBotId = extractBotIdFromPath(path)
				if (Option.isNone(pathBotId) || pathBotId.value !== auth.botId) {
					return Effect.fail(
						new AccessDeniedError({
							message: "Bots can only read from their own streams",
							path,
						}),
					)
				}

				return Effect.void
			}

			return Effect.fail(new AccessDeniedError({ message: "Unknown auth type", path }))
		}

		/**
		 * Authorize access to a path for write operations
		 */
		const authorizeWrite = (auth: AuthContext, path: string): Effect.Effect<void, AccessDeniedError> => {
			// Service has full write access
			if (auth.type === "service") {
				return Effect.void
			}

			// Bots cannot write to streams
			if (auth.type === "bot") {
				return Effect.fail(
					new AccessDeniedError({
						message: "Bots cannot write to streams",
						path,
					}),
				)
			}

			return Effect.fail(new AccessDeniedError({ message: "Unknown auth type", path }))
		}

		return {
			authenticate,
			authorizeRead,
			authorizeWrite,
			extractBotIdFromPath,
			isBotStreamPath,
		}
	}),
}) {}

/**
 * Create a StreamAuth layer with the provided config
 */
export const StreamAuthLive = (config: StreamAuthConfig) =>
	StreamAuth.Default.pipe(Layer.provide(Layer.succeed(StreamAuthConfigTag, config)))

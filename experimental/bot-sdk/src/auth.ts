import { Effect } from "effect"
import { AuthenticationError } from "./errors.ts"

/**
 * Bot authentication context
 */
export interface BotAuthContext {
	/**
	 * Bot ID
	 */
	readonly botId: string

	/**
	 * User ID associated with this bot (used as authorId for messages)
	 */
	readonly userId: string

	/**
	 * Channel IDs the bot has access to
	 */
	readonly channelIds: readonly string[]

	/**
	 * Bot token
	 */
	readonly token: string
}

/**
 * Service for bot authentication
 */
export class BotAuth extends Effect.Service<BotAuth>()("BotAuth", {
	accessors: true,
	effect: Effect.fn(function* (context: BotAuthContext) {
		return {
			getContext: Effect.succeed(context),

			validateToken: (token: string) =>
				Effect.gen(function* () {
					if (token !== context.token) {
						return yield* Effect.fail(
							new AuthenticationError({
								message: "Invalid bot token",
								cause: "Token does not match",
							}),
						)
					}
					return true
				}),
		}
	}),
}) {}

/**
 * Helper to create auth context from bot token by calling the backend API
 * This validates the token and retrieves the real bot ID
 */
export const createAuthContextFromToken = (
	token: string,
	backendUrl: string,
): Effect.Effect<BotAuthContext, AuthenticationError> =>
	Effect.gen(function* () {
		// Call /bot-commands/me to validate token and get bot info
		const response = yield* Effect.tryPromise({
			try: async () => {
				const res = await fetch(`${backendUrl}/bot-commands/me`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) {
					const text = await res.text()
					throw new Error(`Failed to authenticate bot: ${res.status} ${text}`)
				}

				return (await res.json()) as { botId: string; userId: string; name: string }
			},
			catch: (error) =>
				new AuthenticationError({
					message: "Failed to authenticate with backend",
					cause: String(error),
				}),
		})

		yield* Effect.log(`Bot authenticated: ${response.name} (${response.botId})`)

		return {
			botId: response.botId,
			userId: response.userId,
			channelIds: [],
			token,
		}
	})

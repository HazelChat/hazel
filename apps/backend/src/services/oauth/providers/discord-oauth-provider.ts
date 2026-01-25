import { Discord } from "@hazel/integrations"
import { Effect, Redacted } from "effect"
import {
	AccountInfoError,
	createBaseAuthorizationUrl,
	type OAuthProvider,
	TokenExchangeError,
} from "../oauth-provider"
import type { OAuthProviderConfig, OAuthTokens } from "../provider-config"

/**
 * Discord Bot OAuth Provider Implementation.
 *
 * Discord Bot OAuth works differently from standard OAuth:
 * - User authorizes the bot to join their server
 * - Discord redirects with `code` and `guild_id` in URL params
 * - We exchange the code for tokens (gives us user's access token)
 * - We use our Bot Token (from env) to interact with the Discord API
 * - The important info is the `guild_id` - which server the bot was added to
 *
 * Key differences from standard OAuth:
 * - The access token from code exchange is for the USER, not the bot
 * - The bot uses its own token (DISCORD_BOT_TOKEN) for API calls
 * - getAccountInfo uses guild_id (not access token) to fetch server info
 *
 * @see https://discord.com/developers/docs/topics/oauth2#bots
 */
export const createDiscordOAuthProvider = (config: OAuthProviderConfig): OAuthProvider => ({
	provider: "discord",
	config,

	buildAuthorizationUrl: (state: string) => Effect.succeed(createBaseAuthorizationUrl(config, state)),

	// For Discord bot OAuth, we still exchange the code but the resulting token
	// is for the user who authorized (not the bot). We don't really need it,
	// but we go through the flow to be consistent.
	exchangeCodeForTokens: (code: string) =>
		Effect.gen(function* () {
			// For Discord bot OAuth, the code exchange gives us the user's token
			// but we'll use the bot token for actual API calls.
			// We return a minimal token response since we won't use this token.

			// Note: Discord's token endpoint expects form-urlencoded body
			const response = yield* Effect.tryPromise({
				try: async () => {
					const res = await fetch(config.tokenUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: new URLSearchParams({
							client_id: config.clientId,
							client_secret: Redacted.value(config.clientSecret),
							grant_type: "authorization_code",
							code,
							redirect_uri: config.redirectUri,
						}),
					})

					if (!res.ok) {
						const text = await res.text()
						throw new Error(`Discord token exchange failed: ${res.status} ${text}`)
					}

					return res.json() as Promise<{
						access_token: string
						token_type: string
						expires_in?: number
						refresh_token?: string
						scope?: string
					}>
				},
				catch: (error) => error,
			})

			return {
				accessToken: response.access_token,
				refreshToken: response.refresh_token,
				expiresAt: response.expires_in
					? new Date(Date.now() + response.expires_in * 1000)
					: undefined,
				scope: response.scope,
				tokenType: response.token_type,
			} satisfies OAuthTokens
		}).pipe(
			Effect.mapError(
				(error) =>
					new TokenExchangeError({
						provider: "discord",
						message: `Failed to exchange code for tokens: ${error instanceof Error ? error.message : String(error)}`,
						cause: error,
					}),
			),
		),

	// For Discord bot OAuth, getAccountInfo receives the GUILD_ID (not access token)
	// We use the bot token to fetch guild info
	getAccountInfo: (guildId: string) =>
		Effect.gen(function* () {
			const client = yield* Discord.DiscordApiClient
			return yield* client.getAccountInfo(guildId)
		}).pipe(
			Effect.provide(Discord.DiscordApiClient.Default),
			Effect.mapError(
				(error) =>
					new AccountInfoError({
						provider: "discord",
						message: `Failed to get Discord guild info: ${"message" in error ? error.message : String(error)}`,
						cause: error,
					}),
			),
		),
})

import { Discord } from "@hazel/integrations"
import { Effect, Redacted } from "effect"
import {
	AccountInfoError,
	createBaseAuthorizationUrl,
	makeTokenExchangeRequest,
	type OAuthProvider,
} from "../oauth-provider"
import type { OAuthProviderConfig } from "../provider-config"

export const createDiscordOAuthProvider = (config: OAuthProviderConfig): OAuthProvider => ({
	provider: "discord",
	config,

	buildAuthorizationUrl: (state: string) => Effect.succeed(createBaseAuthorizationUrl(config, state)),

	exchangeCodeForTokens: (code: string) =>
		makeTokenExchangeRequest(config, code, Redacted.value(config.clientSecret)),

	getAccountInfo: (accessToken: string) =>
		Discord.DiscordApiClient.getAccountInfo(accessToken).pipe(
			Effect.provide(Discord.DiscordApiClient.Default),
			Effect.mapError(
				(error) =>
					new AccountInfoError({
						provider: "discord",
						message: `Failed to get Discord account info: ${"message" in error ? String(error.message) : String(error)}`,
						cause: error,
					}),
			),
		),
})

import { Slack } from "@hazel/integrations"
import { Effect, Redacted } from "effect"
import {
	AccountInfoError,
	createBaseAuthorizationUrl,
	makeTokenExchangeRequest,
	type OAuthProvider,
} from "../oauth-provider"
import type { OAuthProviderConfig } from "../provider-config"

export const createSlackOAuthProvider = (config: OAuthProviderConfig): OAuthProvider => ({
	provider: "slack",
	config,

	buildAuthorizationUrl: (state: string) => Effect.succeed(createBaseAuthorizationUrl(config, state)),

	exchangeCodeForTokens: (code: string) =>
		makeTokenExchangeRequest(config, code, Redacted.value(config.clientSecret)),

	getAccountInfo: (accessToken: string) =>
		Slack.SlackApiClient.getAccountInfo(accessToken).pipe(
			Effect.provide(Slack.SlackApiClient.Default),
			Effect.mapError(
				(error) =>
					new AccountInfoError({
						provider: "slack",
						message: `Failed to get Slack workspace info: ${"message" in error ? String(error.message) : String(error)}`,
						cause: error,
					}),
			),
			Effect.map((account) => ({
				externalAccountId: account.externalAccountId,
				externalAccountName: account.externalAccountName,
			})),
		),
})

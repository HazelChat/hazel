import { OrganizationId } from "@hazel/schema"
import { Effect } from "effect"
import { Command } from "foldkit"
import { load } from "foldkit/navigation"
import { catchCommon } from "../../../data/actions"
import { HazelApiClient } from "../../../rpc"
import { Message } from "./message"

/** `integrations.getOAuthUrl`, then a full-page redirect to the provider. */
export const StartDiscordLink = Command.define("StartDiscordLink", {
	args: { orgId: OrganizationId },
	messages: [Message.SucceededGetDiscordOAuthUrl, Message.FailedGetDiscordOAuthUrl],
	execute: ({ orgId }) =>
		HazelApiClient.use((client) =>
			client.integrations.getOAuthUrl({
				params: { orgId, provider: "discord" },
				query: { level: "user" },
			}),
		).pipe(
			Effect.flatMap((response) => load(response.authorizationUrl)),
			Effect.as(Message.SucceededGetDiscordOAuthUrl()),
			Effect.catchTags({
				UnsupportedProviderError: () =>
					Effect.succeed(Message.FailedGetDiscordOAuthUrl({ reason: "UnsupportedProvider" })),
			}),
			catchCommon((reason) => Message.FailedGetDiscordOAuthUrl({ reason })),
		),
})

export const DisconnectDiscord = Command.define("DisconnectDiscord", {
	args: { orgId: OrganizationId },
	messages: [Message.SucceededDisconnectDiscord, Message.FailedDisconnectDiscord],
	execute: ({ orgId }) =>
		HazelApiClient.use((client) =>
			client.integrations.disconnect({
				params: { orgId, provider: "discord" },
				query: { level: "user" },
			}),
		).pipe(
			Effect.as(Message.SucceededDisconnectDiscord()),
			Effect.catchTags({
				IntegrationNotConnectedError: () =>
					Effect.succeed(Message.FailedDisconnectDiscord({ reason: "NotConnected" })),
				UnsupportedProviderError: () =>
					Effect.succeed(Message.FailedDisconnectDiscord({ reason: "UnsupportedProvider" })),
			}),
			catchCommon((reason) => Message.FailedDisconnectDiscord({ reason })),
		),
})

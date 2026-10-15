import { IntegrationConnection } from "@hazel/domain/models"
import { OrganizationId } from "@hazel/schema"
import { Effect, Schema } from "effect"
import { Command } from "foldkit"
import { load } from "foldkit/navigation"
import { HazelApiClient } from "../../../../rpc"
import { catchCommon } from "../../../../data/actions"
import { Message } from "./message"

const Provider = IntegrationConnection.IntegrationProvider

const target = { orgId: OrganizationId, provider: Provider }

/** `getOAuthUrlMutation`, organization level. */
export const GetOAuthUrl = Command.define("GetOAuthUrl", {
	args: target,
	messages: [Message.SucceededGetOAuthUrl, Message.FailedGetOAuthUrl],
	execute: (params) =>
		HazelApiClient.use((client) =>
			client.integrations.getOAuthUrl({ params, query: { level: "organization" } }),
		).pipe(
			Effect.map((response) =>
				Message.SucceededGetOAuthUrl({ authorizationUrl: response.authorizationUrl }),
			),
			Effect.catchTags({
				UnsupportedProviderError: () =>
					Effect.succeed(Message.FailedGetOAuthUrl({ reason: "UnsupportedProvider" })),
			}),
			catchCommon((reason) => Message.FailedGetOAuthUrl({ reason })),
		),
})

/** `window.location.href = authorizationUrl` */
export const RedirectToProvider = Command.define("RedirectToProvider", {
	args: { authorizationUrl: Schema.String },
	messages: [Message.CompletedRedirectToProvider],
	execute: ({ authorizationUrl }) =>
		load(authorizationUrl).pipe(Effect.as(Message.CompletedRedirectToProvider())),
})

/** `disconnectMutation`, organization level. */
export const Disconnect = Command.define("Disconnect", {
	args: target,
	messages: [Message.SucceededDisconnect, Message.FailedDisconnect],
	execute: (params) =>
		HazelApiClient.use((client) =>
			client.integrations.disconnect({ params, query: { level: "organization" } }),
		).pipe(
			Effect.as(Message.SucceededDisconnect()),
			Effect.catchTags({
				IntegrationNotConnectedError: () =>
					Effect.succeed(Message.FailedDisconnect({ reason: "NotConnected" })),
				UnsupportedProviderError: () =>
					Effect.succeed(Message.FailedDisconnect({ reason: "UnsupportedProvider" })),
			}),
			catchCommon((reason) => Message.FailedDisconnect({ reason })),
		),
})

/** `connectApiKeyMutation` */
export const ConnectApiKey = Command.define("ConnectApiKey", {
	args: { ...target, token: Schema.String, baseUrl: Schema.String },
	messages: [Message.SucceededConnectApiKey, Message.FailedConnectApiKey],
	execute: ({ orgId, provider, token, baseUrl }) =>
		HazelApiClient.use((client) =>
			client.integrations.connectApiKey({
				params: { orgId, provider },
				payload: { token, baseUrl },
			}),
		).pipe(
			Effect.map((response) =>
				Message.SucceededConnectApiKey({ externalAccountName: response.externalAccountName }),
			),
			Effect.catchTags({
				InvalidApiKeyError: () =>
					Effect.succeed(Message.FailedConnectApiKey({ reason: "InvalidApiKey" })),
				UnsupportedProviderError: () =>
					Effect.succeed(Message.FailedConnectApiKey({ reason: "UnsupportedProvider" })),
			}),
			catchCommon((reason) => Message.FailedConnectApiKey({ reason })),
		),
})

export const isProvider = Schema.is(Provider)

import { Schema } from "effect"
import { defineMessageUnion } from "foldkit/message"
import { CommonReason } from "~/lib/error-messages"
import { Connection } from "../shared/connections"

/** What can go wrong fetching the OAuth URL, beyond the shared reasons. */
export const GetOAuthUrlFailure = Schema.Union([Schema.Literals(["UnsupportedProvider"]), CommonReason])
export type GetOAuthUrlFailure = typeof GetOAuthUrlFailure.Type

/** What can go wrong disconnecting, beyond the shared reasons. */
export const DisconnectFailure = Schema.Union([
	Schema.Literals(["NotConnected", "UnsupportedProvider"]),
	CommonReason,
])
export type DisconnectFailure = typeof DisconnectFailure.Type

/** What can go wrong connecting with an API key, beyond the shared reasons. */
export const ConnectApiKeyFailure = Schema.Union([
	Schema.Literals(["InvalidApiKey", "UnsupportedProvider"]),
	CommonReason,
])
export type ConnectApiKeyFailure = typeof ConnectApiKeyFailure.Type

export const Message = defineMessageUnion({
	UpdatedConnection: { connection: Schema.NullOr(Connection) },
	ClickedBack: {},
	ClickedConnect: {},
	SucceededGetOAuthUrl: { authorizationUrl: Schema.String },
	FailedGetOAuthUrl: { reason: GetOAuthUrlFailure },
	CompletedRedirectToProvider: {},
	ClickedDisconnect: {},
	SucceededDisconnect: {},
	FailedDisconnect: { reason: DisconnectFailure },
	ChangedApiToken: { value: Schema.String },
	ChangedApiBaseUrl: { value: Schema.String },
	SubmittedApiKeyForm: {},
	SucceededConnectApiKey: { externalAccountName: Schema.NullOr(Schema.String) },
	FailedConnectApiKey: { reason: ConnectApiKeyFailure },
	ToggledConfigOption: { optionId: Schema.String, isSelected: Schema.Boolean },
})
export type Message = typeof Message.Type

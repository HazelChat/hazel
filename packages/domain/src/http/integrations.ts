import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import * as CurrentUser from "../current-user"
import { InternalServerError, UnauthorizedError } from "../errors"
import { OrganizationId } from "../ids"
import { IntegrationConnection } from "../models"

// Provider type from the model
const IntegrationProvider = IntegrationConnection.IntegrationProvider

// OAuth URL response - returned from getOAuthUrl endpoint for SPA OAuth flow
export class OAuthUrlResponse extends Schema.Class<OAuthUrlResponse>("OAuthUrlResponse")({
	authorizationUrl: Schema.String,
}) {}

export class ConnectionStatusResponse extends Schema.Class<ConnectionStatusResponse>(
	"ConnectionStatusResponse",
)({
	connected: Schema.Boolean,
	provider: IntegrationProvider,
	externalAccountName: Schema.NullOr(Schema.String),
	status: Schema.NullOr(IntegrationConnection.ConnectionStatus),
	connectedAt: Schema.NullOr(Schema.DateFromString),
	lastUsedAt: Schema.NullOr(Schema.DateFromString),
}) {}

// Error types
export class IntegrationNotConnectedError extends Schema.TaggedError<IntegrationNotConnectedError>()(
	"IntegrationNotConnectedError",
	{
		provider: IntegrationProvider,
	},
) {}

export class InvalidOAuthStateError extends Schema.TaggedError<InvalidOAuthStateError>()(
	"InvalidOAuthStateError",
	{
		message: Schema.String,
	},
) {}

export class UnsupportedProviderError extends Schema.TaggedError<UnsupportedProviderError>()(
	"UnsupportedProviderError",
	{
		provider: Schema.String,
	},
) {}

export class IntegrationGroup extends HttpApiGroup.make("integrations")
	// Initiate OAuth flow - returns authorization URL for SPA redirect
	.add(
		HttpApiEndpoint.get("getOAuthUrl", `/:orgId/:provider/oauth`)
			.addSuccess(OAuthUrlResponse)
			.addError(UnsupportedProviderError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
					provider: IntegrationProvider,
				}),
			)
			.middleware(CurrentUser.Authorization)
			.annotateContext(
				OpenApi.annotations({
					title: "Get OAuth Authorization URL",
					description:
						"Returns the OAuth authorization URL for the provider. The frontend should redirect the user to this URL. Sets a session cookie to preserve context for the callback.",
					summary: "Get OAuth URL",
				}),
			),
	)
	// OAuth callback handler
	.add(
		HttpApiEndpoint.get("oauthCallback", `/:provider/callback`)
			.addSuccess(Schema.Void, { status: 302 })
			.addError(InvalidOAuthStateError)
			.addError(UnsupportedProviderError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					provider: IntegrationProvider,
				}),
			)
			.setUrlParams(
				Schema.Struct({
					// Standard OAuth uses `code`
					code: Schema.optional(Schema.String),
					// State is optional because GitHub doesn't send it for update callbacks
					state: Schema.optional(Schema.String),
					// GitHub App uses `installation_id` instead of code
					installation_id: Schema.optional(Schema.String),
					// GitHub also sends setup_action (e.g., "install", "update")
					setup_action: Schema.optional(Schema.String),
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "OAuth Callback",
					description: "Handle OAuth callback from integration provider",
					summary: "Process OAuth callback",
				}),
			),
	)
	// Get connection status
	.add(
		HttpApiEndpoint.get("getConnectionStatus", `/:orgId/:provider/status`)
			.addSuccess(ConnectionStatusResponse)
			.addError(UnsupportedProviderError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
					provider: IntegrationProvider,
				}),
			)
			.middleware(CurrentUser.Authorization)
			.annotateContext(
				OpenApi.annotations({
					title: "Get Connection Status",
					description: "Check the connection status for a provider",
					summary: "Get integration status",
				}),
			),
	)
	// Disconnect integration
	.add(
		HttpApiEndpoint.del("disconnect", `/:orgId/:provider`)
			.addSuccess(Schema.Void)
			.addError(IntegrationNotConnectedError)
			.addError(UnsupportedProviderError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
					provider: IntegrationProvider,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Disconnect Integration",
					description: "Disconnect an integration and revoke tokens",
					summary: "Disconnect provider",
				}),
			)
			.middleware(CurrentUser.Authorization),
	)
	.prefix("/integrations") {}

import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import { InternalServerError, UnauthorizedError } from "../errors"
import { OrganizationId } from "../ids"

export class AuthCallbackRequest extends Schema.Class<AuthCallbackRequest>("AuthCallbackRequest")({
	code: Schema.String,
	state: Schema.optional(Schema.String),
}) {}

export class LoginResponse extends Schema.Class<LoginResponse>("LoginResponse")({
	authorizationUrl: Schema.String,
}) {}

/**
 * Request body for desktop token exchange
 */
export class DesktopTokenRequest extends Schema.Class<DesktopTokenRequest>("DesktopTokenRequest")({
	code: Schema.String,
	code_verifier: Schema.String,
	redirect_uri: Schema.String,
}) {}

/**
 * Response for desktop token exchange
 */
export class DesktopTokenResponse extends Schema.Class<DesktopTokenResponse>("DesktopTokenResponse")({
	access_token: Schema.String,
	refresh_token: Schema.optional(Schema.String),
	token_type: Schema.String,
	expires_in: Schema.Number,
}) {}

/**
 * Request body for desktop token refresh
 */
export class DesktopRefreshRequest extends Schema.Class<DesktopRefreshRequest>("DesktopRefreshRequest")({
	refresh_token: Schema.String,
}) {}

export class AuthGroup extends HttpApiGroup.make("auth")
	.add(
		HttpApiEndpoint.get("login")`/login`
			.addSuccess(LoginResponse)
			.addError(InternalServerError)
			.setUrlParams(
				Schema.Struct({
					returnTo: Schema.String,
					organizationId: Schema.optional(OrganizationId),
					invitationToken: Schema.optional(Schema.String),
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Login",
					description: "Get WorkOS authorization URL for authentication",
					summary: "Initiate login flow",
				}),
			),
	)
	.add(
		HttpApiEndpoint.get("callback")`/callback`
			.addSuccess(Schema.Void, { status: 302 })
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setUrlParams(
				Schema.Struct({
					code: Schema.String,
					state: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "OAuth Callback",
					description: "Handle OAuth callback from WorkOS and set session cookie",
					summary: "Process OAuth callback",
				}),
			),
	)
	.add(
		HttpApiEndpoint.get("logout")`/logout`
			.addSuccess(Schema.Void)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Logout",
					description: "Clear session and logout user",
					summary: "End user session",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("desktopToken")`/desktop/token`
			.addSuccess(DesktopTokenResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPayload(DesktopTokenRequest)
			.annotateContext(
				OpenApi.annotations({
					title: "Desktop Token Exchange",
					description: "Exchange authorization code for access token (PKCE flow for desktop apps)",
					summary: "Exchange code for tokens",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("desktopRefresh")`/desktop/refresh`
			.addSuccess(DesktopTokenResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPayload(DesktopRefreshRequest)
			.annotateContext(
				OpenApi.annotations({
					title: "Desktop Token Refresh",
					description: "Refresh access token using refresh token (for desktop apps)",
					summary: "Refresh access token",
				}),
			),
	)
	.prefix("/auth") {}

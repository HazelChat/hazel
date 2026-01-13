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

export class TokenRequest extends Schema.Class<TokenRequest>("TokenRequest")({
	code: Schema.String,
	state: Schema.String,
}) {}

export class TokenResponse extends Schema.Class<TokenResponse>("TokenResponse")({
	accessToken: Schema.String,
	user: Schema.Struct({
		id: Schema.String,
		email: Schema.String,
		firstName: Schema.String,
		lastName: Schema.String,
	}),
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
			.setUrlParams(
				Schema.Struct({
					redirectTo: Schema.optional(Schema.String),
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Logout",
					description: "Clear session and logout user",
					summary: "End user session",
				}),
			),
	)
	.add(
		HttpApiEndpoint.get("loginDesktop")`/login/desktop`
			.addSuccess(Schema.Void, { status: 302 })
			.addError(InternalServerError)
			.setUrlParams(
				Schema.Struct({
					returnTo: Schema.String,
					redirectUri: Schema.optional(Schema.String),
					organizationId: Schema.optional(OrganizationId),
					invitationToken: Schema.optional(Schema.String),
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Desktop Login",
					description: "Initiate OAuth flow for desktop apps with localhost callback",
					summary: "Desktop login flow",
				}),
			),
	)
	.add(
		HttpApiEndpoint.post("token")`/token`
			.addSuccess(TokenResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPayload(TokenRequest)
			.annotateContext(
				OpenApi.annotations({
					title: "Token Exchange",
					description: "Exchange authorization code for access token (desktop apps)",
					summary: "Exchange code for token",
				}),
			),
	)
	.prefix("/auth") {}

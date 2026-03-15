import { HttpApiSchema } from "effect/unstable/httpapi"
import { Schema } from "effect"

// 401 Errors - Client needs to re-authenticate
export class SessionNotProvidedError extends Schema.TaggedErrorClass<SessionNotProvidedError>(
	"SessionNotProvidedError",
)(
	"SessionNotProvidedError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

export class SessionAuthenticationError extends Schema.TaggedErrorClass<SessionAuthenticationError>(
	"SessionAuthenticationError",
)(
	"SessionAuthenticationError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

export class InvalidJwtPayloadError extends Schema.TaggedErrorClass<InvalidJwtPayloadError>(
	"InvalidJwtPayloadError",
)(
	"InvalidJwtPayloadError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

export class SessionExpiredError extends Schema.TaggedErrorClass<SessionExpiredError>("SessionExpiredError")(
	"SessionExpiredError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

export class InvalidBearerTokenError extends Schema.TaggedErrorClass<InvalidBearerTokenError>(
	"InvalidBearerTokenError",
)(
	"InvalidBearerTokenError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

// 503 Errors - Infrastructure/Service issues (client can retry)
export class SessionLoadError extends Schema.TaggedErrorClass<SessionLoadError>("SessionLoadError")(
	"SessionLoadError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(503),
) {}

export class SessionRefreshError extends Schema.TaggedErrorClass<SessionRefreshError>("SessionRefreshError")(
	"SessionRefreshError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(401),
) {}

export class WorkOSUserFetchError extends Schema.TaggedErrorClass<WorkOSUserFetchError>("WorkOSUserFetchError")(
	"WorkOSUserFetchError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.status(503),
) {}

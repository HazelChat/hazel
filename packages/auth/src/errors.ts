import { Schema } from "effect"

/**
 * Error thrown when session cache operations fail
 */
export class SessionCacheError extends Schema.TaggedErrorClass<SessionCacheError>()("SessionCacheError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error thrown when user lookup cache operations fail
 */
export class UserLookupCacheError extends Schema.TaggedErrorClass<UserLookupCacheError>()("UserLookupCacheError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error thrown when fetching organization from WorkOS fails
 */
export class OrganizationFetchError extends Schema.TaggedErrorClass<OrganizationFetchError>()(
	"OrganizationFetchError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}

// Re-export session errors from domain package for convenience
export {
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	SessionAuthenticationError,
	SessionExpiredError,
	SessionLoadError,
	SessionNotProvidedError,
	SessionRefreshError,
	WorkOSUserFetchError,
} from "@hazel/domain"

import { Schema } from "effect"

/**
 * Error when loading configuration from environment
 */
export class ConfigError extends Schema.TaggedErrorClass<ConfigError>()("ConfigError", {
	message: Schema.String,
}) {}

/**
 * Error when token format is invalid (not a JWT or bot token)
 */
export class InvalidTokenFormatError extends Schema.TaggedErrorClass<InvalidTokenFormatError>()(
	"InvalidTokenFormatError",
	{
		message: Schema.String,
	},
) {}

/**
 * Error when JWT validation fails (invalid signature, expired, wrong issuer, etc.)
 */
export class JwtValidationError extends Schema.TaggedErrorClass<JwtValidationError>()("JwtValidationError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error when bot token validation fails (invalid token, backend error, etc.)
 */
export class BotTokenValidationError extends Schema.TaggedErrorClass<BotTokenValidationError>()(
	"BotTokenValidationError",
	{
		message: Schema.String,
		statusCode: Schema.optional(Schema.Number),
	},
) {}

/**
 * Union of all token validation errors
 */
export type TokenValidationError =
	| ConfigError
	| InvalidTokenFormatError
	| JwtValidationError
	| BotTokenValidationError

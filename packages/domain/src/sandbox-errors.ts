import { HttpApiSchema } from "@effect/platform"
import { AgentSessionId, SandboxId, UserCredentialId } from "@hazel/schema"
import { Predicate, Schema } from "effect"

/**
 * Error thrown when a sandbox is not found.
 */
export class SandboxNotFoundError extends Schema.TaggedError<SandboxNotFoundError>("SandboxNotFoundError")(
	"SandboxNotFoundError",
	{
		sandboxId: SandboxId,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {
	static is(u: unknown): u is SandboxNotFoundError {
		return Predicate.isTagged(u, "SandboxNotFoundError")
	}
}

/**
 * Error thrown when a credential is not found for a given provider.
 */
export class CredentialNotFoundError extends Schema.TaggedError<CredentialNotFoundError>(
	"CredentialNotFoundError",
)(
	"CredentialNotFoundError",
	{
		provider: Schema.String,
		message: Schema.optional(Schema.String),
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {
	static is(u: unknown): u is CredentialNotFoundError {
		return Predicate.isTagged(u, "CredentialNotFoundError")
	}
}

/**
 * Error thrown when a user credential already exists for a provider.
 */
export class CredentialAlreadyExistsError extends Schema.TaggedError<CredentialAlreadyExistsError>(
	"CredentialAlreadyExistsError",
)(
	"CredentialAlreadyExistsError",
	{
		provider: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 409,
	}),
) {}

/**
 * Error thrown when a credential ID is not found.
 */
export class CredentialIdNotFoundError extends Schema.TaggedError<CredentialIdNotFoundError>(
	"CredentialIdNotFoundError",
)(
	"CredentialIdNotFoundError",
	{
		credentialId: UserCredentialId,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

/**
 * Error thrown when a sandbox has expired.
 */
export class SandboxExpiredError extends Schema.TaggedError<SandboxExpiredError>("SandboxExpiredError")(
	"SandboxExpiredError",
	{
		sandboxId: SandboxId,
		expiredAt: Schema.DateTimeUtc,
	},
	HttpApiSchema.annotations({
		status: 410, // Gone
	}),
) {}

/**
 * Error thrown when sandbox provisioning fails.
 */
export class SandboxProvisioningError extends Schema.TaggedError<SandboxProvisioningError>(
	"SandboxProvisioningError",
)(
	"SandboxProvisioningError",
	{
		provider: Schema.String,
		message: Schema.String,
		cause: Schema.optional(Schema.String),
	},
	HttpApiSchema.annotations({
		status: 500,
	}),
) {}

/**
 * Error thrown when the sandbox provider API is unavailable.
 */
export class SandboxProviderUnavailableError extends Schema.TaggedError<SandboxProviderUnavailableError>(
	"SandboxProviderUnavailableError",
)(
	"SandboxProviderUnavailableError",
	{
		provider: Schema.String,
		message: Schema.String,
		cause: Schema.optional(Schema.String),
	},
	HttpApiSchema.annotations({
		status: 503,
	}),
) {}

/**
 * Error thrown when an agent session is not found.
 */
export class AgentSessionNotFoundError extends Schema.TaggedError<AgentSessionNotFoundError>(
	"AgentSessionNotFoundError",
)(
	"AgentSessionNotFoundError",
	{
		sessionId: AgentSessionId,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

/**
 * Error thrown when an agent session is in an invalid state for the requested operation.
 */
export class AgentSessionInvalidStateError extends Schema.TaggedError<AgentSessionInvalidStateError>(
	"AgentSessionInvalidStateError",
)(
	"AgentSessionInvalidStateError",
	{
		sessionId: AgentSessionId,
		currentState: Schema.String,
		expectedState: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 409,
	}),
) {}

/**
 * Error thrown when the sandbox-agent server returns an error.
 */
export class SandboxAgentError extends Schema.TaggedError<SandboxAgentError>("SandboxAgentError")(
	"SandboxAgentError",
	{
		sandboxId: SandboxId,
		message: Schema.String,
		statusCode: Schema.optional(Schema.Number),
		cause: Schema.optional(Schema.String),
	},
	HttpApiSchema.annotations({
		status: 502, // Bad Gateway - upstream error
	}),
) {}

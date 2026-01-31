import { SandboxId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { Sandbox } from "../../models"

// ============================================================================
// Activity Result Schemas
// ============================================================================

/**
 * Result of creating a sandbox via E2B or Daytona API
 */
export const CreateSandboxResult = Schema.Struct({
	externalSandboxId: Schema.String, // Provider's sandbox ID
	provider: Sandbox.SandboxProvider,
})

export type CreateSandboxResult = typeof CreateSandboxResult.Type

/**
 * Result of starting the sandbox-agent server
 */
export const StartSandboxAgentResult = Schema.Struct({
	publicUrl: Schema.String, // URL to access sandbox-agent
	healthCheckPassed: Schema.Boolean,
})

export type StartSandboxAgentResult = typeof StartSandboxAgentResult.Type

/**
 * Result of installing agents in the sandbox
 */
export const InstallAgentsResult = Schema.Struct({
	installedAgents: Schema.Array(Schema.Literal("claude", "codex", "opencode")),
})

export type InstallAgentsResult = typeof InstallAgentsResult.Type

/**
 * Result of storing sandbox record in database
 */
export const StoreSandboxRecordResult = Schema.Struct({
	sandboxId: SandboxId,
	publicUrl: Schema.String,
})

export type StoreSandboxRecordResult = typeof StoreSandboxRecordResult.Type

/**
 * Result of destroying a sandbox
 */
export const DestroySandboxResult = Schema.Struct({
	destroyed: Schema.Boolean,
})

export type DestroySandboxResult = typeof DestroySandboxResult.Type

// ============================================================================
// Activity Error Schemas
// ============================================================================

/**
 * Error when E2B API call fails
 */
export class E2BApiError extends Schema.TaggedError<E2BApiError>()("E2BApiError", {
	message: Schema.String,
	statusCode: Schema.optional(Schema.Number),
	cause: Schema.Unknown.pipe(Schema.optional),
}) {
	readonly retryable = true // API errors are often transient
}

/**
 * Error when Daytona API call fails
 */
export class DaytonaApiError extends Schema.TaggedError<DaytonaApiError>()("DaytonaApiError", {
	message: Schema.String,
	statusCode: Schema.optional(Schema.Number),
	cause: Schema.Unknown.pipe(Schema.optional),
}) {
	readonly retryable = true // API errors are often transient
}

/**
 * Error when sandbox-agent installation fails
 */
export class SandboxAgentInstallError extends Schema.TaggedError<SandboxAgentInstallError>()(
	"SandboxAgentInstallError",
	{
		externalSandboxId: Schema.String,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {
	readonly retryable = true // Installation can be retried
}

/**
 * Error when sandbox-agent server fails to start
 */
export class SandboxAgentStartError extends Schema.TaggedError<SandboxAgentStartError>()(
	"SandboxAgentStartError",
	{
		externalSandboxId: Schema.String,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {
	readonly retryable = true // Server start can be retried
}

/**
 * Error when health check fails
 */
export class SandboxHealthCheckError extends Schema.TaggedError<SandboxHealthCheckError>()(
	"SandboxHealthCheckError",
	{
		publicUrl: Schema.String,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {
	readonly retryable = true // Health check can be retried
}

/**
 * Error when storing sandbox record fails
 */
export class StoreSandboxRecordError extends Schema.TaggedError<StoreSandboxRecordError>()(
	"StoreSandboxRecordError",
	{
		userId: UserId,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {
	readonly retryable = true // Database errors are transient
}

/**
 * Error when destroying sandbox fails
 */
export class DestroySandboxError extends Schema.TaggedError<DestroySandboxError>()("DestroySandboxError", {
	sandboxId: SandboxId,
	message: Schema.String,
	cause: Schema.Unknown.pipe(Schema.optional),
}) {
	readonly retryable = true // Can be retried
}

/**
 * Error when required credentials are not found
 */
export class CredentialsNotConfiguredError extends Schema.TaggedError<CredentialsNotConfiguredError>()(
	"CredentialsNotConfiguredError",
	{
		userId: UserId,
		provider: Schema.String,
		message: Schema.String,
	},
) {
	readonly retryable = false // User needs to add credentials
}

// ============================================================================
// Workflow Error Union
// ============================================================================

export const SandboxProvisioningWorkflowError = Schema.Union(
	E2BApiError,
	DaytonaApiError,
	SandboxAgentInstallError,
	SandboxAgentStartError,
	SandboxHealthCheckError,
	StoreSandboxRecordError,
	CredentialsNotConfiguredError,
)

export const SandboxCleanupWorkflowError = Schema.Union(
	DestroySandboxError,
	E2BApiError,
	DaytonaApiError,
	StoreSandboxRecordError, // Needed when updating sandbox status in DB
)

import { Workflow } from "@effect/workflow"
import { SandboxId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { Sandbox } from "../../models"
import { SandboxProvisioningWorkflowError } from "../activities/sandbox-activities"

/**
 * Sandbox Provisioning Workflow
 *
 * Provisions a new cloud sandbox with sandbox-agent installed.
 * This workflow:
 * 1. Creates a sandbox via E2B or Daytona API
 * 2. Installs sandbox-agent in the sandbox
 * 3. Pre-installs available agents (Claude, Codex, OpenCode)
 * 4. Starts the sandbox-agent server
 * 5. Performs health check
 * 6. Updates the database with the public URL
 *
 * The workflow is idempotent based on sandboxId - running it twice with
 * the same ID will not create duplicate sandboxes.
 */
export const SandboxProvisioningWorkflow = Workflow.make({
	name: "SandboxProvisioningWorkflow",
	payload: {
		sandboxId: SandboxId, // Pre-generated sandbox ID for optimistic updates
		userId: UserId,
		provider: Sandbox.SandboxProvider,
		name: Schema.NullOr(Schema.String),
		// Encrypted credentials passed from backend
		providerApiKey: Schema.String, // E2B or Daytona API key
		anthropicApiKey: Schema.NullOr(Schema.String), // For Claude
		openaiApiKey: Schema.NullOr(Schema.String), // For Codex/OpenCode
	},
	error: SandboxProvisioningWorkflowError,
	// Each sandbox is provisioned only once
	idempotencyKey: (payload) => payload.sandboxId,
})

export type SandboxProvisioningWorkflowPayload = Schema.Schema.Type<
	typeof SandboxProvisioningWorkflow.payloadSchema
>

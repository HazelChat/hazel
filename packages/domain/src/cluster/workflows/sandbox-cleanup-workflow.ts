import { Workflow } from "@effect/workflow"
import { SandboxId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { Sandbox } from "../../models"
import { SandboxCleanupWorkflowError } from "../activities/sandbox-activities"

/**
 * Sandbox Cleanup Workflow
 *
 * Terminates and cleans up a sandbox.
 * This workflow:
 * 1. Stops all active sessions
 * 2. Terminates the sandbox via provider API
 * 3. Updates the database to mark as stopped/expired
 *
 * Used for:
 * - Manual sandbox destruction by user
 * - Automatic cleanup of expired sandboxes (cron job)
 */
export const SandboxCleanupWorkflow = Workflow.make({
	name: "SandboxCleanupWorkflow",
	payload: {
		sandboxId: SandboxId,
		userId: UserId,
		provider: Sandbox.SandboxProvider,
		externalSandboxId: Schema.String,
		providerApiKey: Schema.String, // E2B or Daytona API key
		reason: Schema.Literal("manual", "expired", "failed"),
	},
	error: SandboxCleanupWorkflowError,
	// Each cleanup is processed only once
	idempotencyKey: (payload) => `cleanup-${payload.sandboxId}`,
})

export type SandboxCleanupWorkflowPayload = Schema.Schema.Type<typeof SandboxCleanupWorkflow.payloadSchema>

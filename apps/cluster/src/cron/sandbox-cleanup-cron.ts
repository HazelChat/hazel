import * as ClusterCron from "@effect/cluster/ClusterCron"
import { WorkflowEngine } from "@effect/workflow"
import { and, Database, isNull, lt, or, eq, schema } from "@hazel/db"
import { Cluster } from "@hazel/domain"
import * as Cron from "effect/Cron"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"

// Run every 5 minutes
const everyFiveMinutes = Cron.unsafeParse("*/5 * * * *")

/**
 * Cron job that terminates expired sandboxes.
 * Sandboxes have a default expiry of 4 hours after creation.
 * This cron job finds expired sandboxes and triggers the cleanup workflow.
 */
export const SandboxCleanupCronLayer = ClusterCron.make({
	name: "SandboxCleanup",
	cron: everyFiveMinutes,
	execute: Effect.gen(function* () {
		const db = yield* Database.Database
		const engine = yield* WorkflowEngine.WorkflowEngine

		// Find sandboxes that have expired and are still running/provisioning
		const expiredSandboxes = yield* db.execute(
			(client) =>
				client
					.select({
						id: schema.sandboxesTable.id,
						userId: schema.sandboxesTable.userId,
						provider: schema.sandboxesTable.provider,
						externalSandboxId: schema.sandboxesTable.externalSandboxId,
						status: schema.sandboxesTable.status,
						expiresAt: schema.sandboxesTable.expiresAt,
					})
					.from(schema.sandboxesTable)
					.where(
						and(
							lt(schema.sandboxesTable.expiresAt, new Date()),
							or(
								eq(schema.sandboxesTable.status, "running"),
								eq(schema.sandboxesTable.status, "provisioning"),
							),
							isNull(schema.sandboxesTable.deletedAt),
						),
					)
					.limit(10), // Process 10 at a time to avoid overwhelming the system
		)

		if (expiredSandboxes.length === 0) {
			return
		}

		yield* Effect.logInfo(`Found ${expiredSandboxes.length} expired sandboxes to clean up`)

		// Trigger cleanup workflow for each expired sandbox
		for (const sandbox of expiredSandboxes) {
			yield* Effect.logInfo(`Triggering cleanup for expired sandbox ${sandbox.id}`)

			// First, get the user's provider credential to pass to the workflow
			const providerCredential = yield* db.execute((client) =>
				client
					.select({
						encryptedKey: schema.userCredentialsTable.encryptedKey,
					})
					.from(schema.userCredentialsTable)
					.where(
						and(
							eq(schema.userCredentialsTable.userId, sandbox.userId),
							eq(schema.userCredentialsTable.provider, sandbox.provider),
							isNull(schema.userCredentialsTable.deletedAt),
						),
					)
					.limit(1),
			)

			if (providerCredential.length === 0) {
				yield* Effect.logWarning(
					`No provider credential found for sandbox ${sandbox.id}, marking as expired without API cleanup`,
				)

				// Just mark as expired in database without calling provider API
				yield* db.execute((client) =>
					client
						.update(schema.sandboxesTable)
						.set({
							status: "expired",
							deletedAt: new Date(),
							updatedAt: new Date(),
						})
						.where(eq(schema.sandboxesTable.id, sandbox.id)),
				)

				continue
			}

			// Trigger the cleanup workflow
			// Note: In a real implementation, we'd need to decrypt the key here
			// For now, we pass a placeholder
			yield* engine
				.execute(Cluster.SandboxCleanupWorkflow, {
					executionId: `cleanup-${sandbox.id}-expired`,
					payload: {
						sandboxId: sandbox.id,
						userId: sandbox.userId,
						provider: sandbox.provider,
						externalSandboxId: sandbox.externalSandboxId,
						providerApiKey: "encrypted-key-placeholder", // Would need to decrypt
						reason: "expired" as const,
					},
					discard: true,
				})
				.pipe(
					Effect.catchAll((err) =>
						Effect.logError(`Failed to trigger cleanup for sandbox ${sandbox.id}`, {
							error: err,
						}),
					),
				)
		}

		yield* Effect.logInfo(`Triggered cleanup for ${expiredSandboxes.length} expired sandboxes`)
	}),
	skipIfOlderThan: Duration.minutes(10),
})

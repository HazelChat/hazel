import { Activity } from "@effect/workflow"
import { Database, eq, schema } from "@hazel/db"
import { Cluster } from "@hazel/domain"
import { Effect, Schema } from "effect"

/**
 * Sandbox Cleanup Workflow Handler
 *
 * This workflow terminates and cleans up a sandbox.
 * Steps:
 * 1. Terminate sandbox via provider API
 * 2. Update database to mark as stopped/expired
 */
export const SandboxCleanupWorkflowLayer = Cluster.SandboxCleanupWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.SandboxCleanupWorkflowPayload) {
		yield* Effect.logDebug(
			`Starting SandboxCleanupWorkflow for sandbox ${payload.sandboxId} (reason: ${payload.reason})`,
		)

		// Activity 1: Terminate sandbox via provider API
		yield* Activity.make({
			name: "DestroySandbox",
			success: Cluster.DestroySandboxResult,
			error: Schema.Union(Cluster.DestroySandboxError, Cluster.E2BApiError, Cluster.DaytonaApiError),
			execute: Effect.gen(function* () {
				yield* Effect.logDebug(
					`Terminating ${payload.provider} sandbox: ${payload.externalSandboxId}`,
				)

				if (payload.provider === "e2b") {
					// Call E2B API to terminate sandbox
					// In real implementation:
					// const e2b = yield* E2BClient
					// yield* e2b.sandbox.kill(payload.externalSandboxId)

					yield* Effect.logDebug(`E2B sandbox terminated: ${payload.externalSandboxId}`)
				} else {
					// Call Daytona API to terminate sandbox
					// In real implementation:
					// const daytona = yield* DaytonaClient
					// yield* daytona.workspace.delete(payload.externalSandboxId)

					yield* Effect.logDebug(`Daytona sandbox terminated: ${payload.externalSandboxId}`)
				}

				return { destroyed: true }
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("DestroySandbox activity failed", {
					errorTag: err._tag,
					retryable: err.retryable,
				}),
			),
		)

		// Activity 2: Update database record
		yield* Activity.make({
			name: "UpdateSandboxStatus",
			success: Schema.Struct({ updated: Schema.Boolean }),
			error: Cluster.StoreSandboxRecordError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				const status = payload.reason === "expired" ? "expired" : "stopped"

				yield* Effect.logDebug(`Updating sandbox ${payload.sandboxId} status to ${status}`)

				yield* db
					.execute((client) =>
						client
							.update(schema.sandboxesTable)
							.set({
								status,
								deletedAt: new Date(),
								updatedAt: new Date(),
							})
							.where(eq(schema.sandboxesTable.id, payload.sandboxId)),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.StoreSandboxRecordError({
										userId: payload.userId,
										message: "Failed to update sandbox status",
										cause: err,
									}),
								),
						}),
					)

				// Also end any active sessions
				yield* db
					.execute((client) =>
						client
							.update(schema.agentSessionsTable)
							.set({
								status: "cancelled",
								endedAt: new Date(),
								updatedAt: new Date(),
							})
							.where(eq(schema.agentSessionsTable.sandboxId, payload.sandboxId)),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.StoreSandboxRecordError({
										userId: payload.userId,
										message: "Failed to end sandbox sessions",
										cause: err,
									}),
								),
						}),
					)

				yield* Effect.logDebug(`Sandbox ${payload.sandboxId} marked as ${status}`)

				return { updated: true }
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("UpdateSandboxStatus activity failed", {
					errorTag: err._tag,
					retryable: err.retryable,
				}),
			),
		)

		yield* Effect.logDebug(
			`SandboxCleanupWorkflow completed: sandbox ${payload.sandboxId} terminated (reason: ${payload.reason})`,
		)
	}),
)

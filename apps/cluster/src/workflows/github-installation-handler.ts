import { Activity } from "@effect/workflow"
import { and, Database, eq, isNull, schema, sql } from "@hazel/db"
import { Cluster } from "@hazel/domain"
import { Effect } from "effect"

export const GitHubInstallationWorkflowLayer = Cluster.GitHubInstallationWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.GitHubInstallationWorkflowPayload) {
		yield* Effect.log(
			`Starting GitHubInstallationWorkflow for '${payload.action}' event on account ${payload.accountLogin}`,
		)

		// For "created" events, just log - OAuth callback handles the actual connection setup
		if (payload.action === "created") {
			yield* Effect.log(
				`GitHub App installed on ${payload.accountLogin} by ${payload.senderLogin} - no action needed (OAuth handles setup)`,
			)
			return
		}

		// Activity 1: Find the connection by installation ID
		const connectionResult = yield* Activity.make({
			name: "FindConnectionByInstallationId",
			success: Cluster.FindConnectionByInstallationResult,
			error: Cluster.FindConnectionByInstallationError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				yield* Effect.log(`Querying connection for installation ID ${payload.installationId}`)

				// Query for a connection with matching installationId in metadata
				const connections = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.integrationConnectionsTable.id,
								organizationId: schema.integrationConnectionsTable.organizationId,
								status: schema.integrationConnectionsTable.status,
								externalAccountName: schema.integrationConnectionsTable.externalAccountName,
							})
							.from(schema.integrationConnectionsTable)
							.where(
								and(
									eq(schema.integrationConnectionsTable.provider, "github"),
									sql`${schema.integrationConnectionsTable.metadata}->>'installationId' = ${String(payload.installationId)}`,
									isNull(schema.integrationConnectionsTable.deletedAt),
								),
							)
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.FindConnectionByInstallationError({
										installationId: payload.installationId,
										message: "Failed to query GitHub connection",
										cause: err,
									}),
								),
						}),
					)

				if (connections.length === 0) {
					yield* Effect.log(`No connection found for installation ID ${payload.installationId}`)
					return { found: false, connection: null }
				}

				const connection = connections[0]!
				yield* Effect.log(
					`Found connection ${connection.id} for installation ${payload.installationId}`,
				)

				return {
					found: true,
					connection: {
						id: connection.id,
						organizationId: connection.organizationId,
						status: connection.status,
						externalAccountName: connection.externalAccountName,
					},
				}
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("FindConnectionByInstallationId activity failed", { error: err }),
			),
			Effect.orDie,
		)

		// If no connection found, nothing more to do
		if (!connectionResult.found || !connectionResult.connection) {
			yield* Effect.log(
				`No connection found for installation ID ${payload.installationId}, workflow complete`,
			)
			return
		}

		const connection = connectionResult.connection

		// Determine the new status based on action
		const newStatus: "active" | "revoked" | "suspended" =
			payload.action === "deleted" ? "revoked" : payload.action === "suspend" ? "suspended" : "active" // unsuspend

		// Activity 2: Update the connection status
		const updateResult = yield* Activity.make({
			name: "UpdateConnectionStatus",
			success: Cluster.UpdateConnectionStatusResult,
			error: Cluster.UpdateConnectionStatusError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				yield* Effect.log(
					`Updating connection ${connection.id} status from '${connection.status}' to '${newStatus}'`,
				)

				// For "deleted" action, also set deletedAt
				const updateValues =
					payload.action === "deleted"
						? {
								status: newStatus as "revoked",
								deletedAt: new Date(),
								updatedAt: new Date(),
							}
						: {
								status: newStatus as "active" | "suspended",
								updatedAt: new Date(),
							}

				yield* db
					.execute((client) =>
						client
							.update(schema.integrationConnectionsTable)
							.set(updateValues)
							.where(eq(schema.integrationConnectionsTable.id, connection.id)),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.UpdateConnectionStatusError({
										connectionId: connection.id,
										message: "Failed to update connection status",
										cause: err,
									}),
								),
						}),
					)

				yield* Effect.log(`Successfully updated connection ${connection.id} to '${newStatus}'`)

				return {
					updated: true,
					previousStatus: connection.status,
					newStatus,
				}
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("UpdateConnectionStatus activity failed", { error: err }),
			),
			Effect.orDie,
		)

		yield* Effect.log(
			`GitHubInstallationWorkflow completed: connection ${connection.id} status changed from '${updateResult.previousStatus}' to '${updateResult.newStatus}' (action: ${payload.action})`,
		)
	}),
)

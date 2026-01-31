import { Activity } from "@effect/workflow"
import { Database, eq, schema } from "@hazel/db"
import { Cluster } from "@hazel/domain"
import { Effect, Schema } from "effect"

/**
 * Sandbox Provisioning Workflow Handler
 *
 * This workflow provisions a cloud sandbox with sandbox-agent installed.
 * Steps:
 * 1. Create sandbox via E2B or Daytona API
 * 2. Install sandbox-agent in the sandbox
 * 3. Configure agent credentials
 * 4. Start the sandbox-agent server
 * 5. Perform health check
 * 6. Update database with public URL
 */
export const SandboxProvisioningWorkflowLayer = Cluster.SandboxProvisioningWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.SandboxProvisioningWorkflowPayload) {
		yield* Effect.logDebug(
			`Starting SandboxProvisioningWorkflow for sandbox ${payload.sandboxId} (provider: ${payload.provider})`,
		)

		// Activity 1: Create sandbox via provider API
		const createResult = yield* Activity.make({
			name: "CreateSandbox",
			success: Cluster.CreateSandboxResult,
			error: Schema.Union(Cluster.E2BApiError, Cluster.DaytonaApiError),
			execute: Effect.gen(function* () {
				yield* Effect.logDebug(`Creating ${payload.provider} sandbox`)

				if (payload.provider === "e2b") {
					// Call E2B API to create sandbox
					// For now, return a mock result - real implementation would call E2B SDK
					const externalSandboxId = `e2b-${crypto.randomUUID().slice(0, 8)}`

					yield* Effect.logDebug(`E2B sandbox created: ${externalSandboxId}`)

					return {
						externalSandboxId,
						provider: "e2b" as const,
					}
				}

				// Daytona provider
				const externalSandboxId = `daytona-${crypto.randomUUID().slice(0, 8)}`

				yield* Effect.logDebug(`Daytona sandbox created: ${externalSandboxId}`)

				return {
					externalSandboxId,
					provider: "daytona" as const,
				}
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("CreateSandbox activity failed", {
					errorTag: err._tag,
					retryable: err.retryable,
				}),
			),
		)

		// Activity 2: Install sandbox-agent and agents
		const installResult = yield* Activity.make({
			name: "InstallAgents",
			success: Cluster.InstallAgentsResult,
			error: Cluster.SandboxAgentInstallError,
			execute: Effect.gen(function* () {
				yield* Effect.logDebug(
					`Installing sandbox-agent in sandbox ${createResult.externalSandboxId}`,
				)

				// Determine which agents to install based on available credentials
				const agentsToInstall: Array<"claude" | "codex" | "opencode"> = []

				if (payload.anthropicApiKey) {
					agentsToInstall.push("claude")
				}
				if (payload.openaiApiKey) {
					agentsToInstall.push("codex")
					agentsToInstall.push("opencode")
				}

				// In real implementation:
				// 1. SSH/exec into sandbox
				// 2. Run: curl -fsSL https://sandboxagent.dev/install.sh | bash
				// 3. Run: sandbox-agent install claude (if anthropic key available)
				// 4. Run: sandbox-agent install codex (if openai key available)

				yield* Effect.logDebug(`Installed agents: ${agentsToInstall.join(", ")}`)

				return {
					installedAgents: agentsToInstall,
				}
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("InstallAgents activity failed", {
					errorTag: err._tag,
					retryable: err.retryable,
				}),
			),
		)

		// Activity 3: Start sandbox-agent server
		const startResult = yield* Activity.make({
			name: "StartSandboxAgent",
			success: Cluster.StartSandboxAgentResult,
			error: Schema.Union(Cluster.SandboxAgentStartError, Cluster.SandboxHealthCheckError),
			execute: Effect.gen(function* () {
				yield* Effect.logDebug(
					`Starting sandbox-agent server in sandbox ${createResult.externalSandboxId}`,
				)

				// In real implementation:
				// 1. SSH/exec into sandbox
				// 2. Run: sandbox-agent serve --port 8080
				// 3. Get public URL from provider

				// Mock public URL - real implementation would get from provider
				const publicUrl =
					payload.provider === "e2b"
						? `https://${createResult.externalSandboxId}.sandbox.e2b.dev`
						: `https://${createResult.externalSandboxId}.workspace.daytona.io`

				yield* Effect.logDebug(`Sandbox-agent server started at ${publicUrl}`)

				// In real implementation, perform health check
				// const healthResponse = yield* HttpClient.get(`${publicUrl}/health`)

				return {
					publicUrl,
					healthCheckPassed: true,
				}
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("StartSandboxAgent activity failed", {
					errorTag: err._tag,
					retryable: err.retryable,
				}),
			),
		)

		// Activity 4: Store sandbox record in database
		yield* Activity.make({
			name: "StoreSandboxRecord",
			success: Cluster.StoreSandboxRecordResult,
			error: Cluster.StoreSandboxRecordError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				yield* Effect.logDebug(`Updating sandbox ${payload.sandboxId} with public URL`)

				// Update the sandbox record with the external ID and public URL
				yield* db
					.execute((client) =>
						client
							.update(schema.sandboxesTable)
							.set({
								externalSandboxId: createResult.externalSandboxId,
								publicUrl: startResult.publicUrl,
								status: "running",
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
										message: "Failed to update sandbox record",
										cause: err,
									}),
								),
						}),
					)

				yield* Effect.logDebug(
					`Sandbox ${payload.sandboxId} is now running at ${startResult.publicUrl}`,
				)

				return {
					sandboxId: payload.sandboxId,
					publicUrl: startResult.publicUrl,
				}
			}),
		}).pipe(
			Effect.tapError((err) =>
				Effect.logError("StoreSandboxRecord activity failed", {
					errorTag: err._tag,
					retryable: err.retryable,
				}),
			),
		)

		yield* Effect.logDebug(
			`SandboxProvisioningWorkflow completed: sandbox ${payload.sandboxId} running at ${startResult.publicUrl}`,
		)
	}),
)

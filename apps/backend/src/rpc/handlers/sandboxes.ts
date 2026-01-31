import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Database } from "@hazel/db"
import {
	AgentSessionNotFoundError,
	AgentSessionInvalidStateError,
	CredentialAlreadyExistsError,
	CredentialIdNotFoundError,
	CredentialNotFoundError,
	CurrentUser,
	InternalServerError,
	policyUse,
	SandboxAgentError,
	SandboxExpiredError,
	SandboxNotFoundError,
	withRemapDbErrors,
	withSystemActor,
} from "@hazel/domain"
import { SandboxRpcs } from "@hazel/domain/rpc"
import { DateTime, Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { AgentSessionPolicy } from "../../policies/agent-session-policy"
import { SandboxPolicy } from "../../policies/sandbox-policy"
import { UserCredentialPolicy } from "../../policies/user-credential-policy"
import { AgentSessionRepo } from "../../repositories/agent-session-repo"
import { SandboxRepo } from "../../repositories/sandbox-repo"
import { UserCredentialRepo } from "../../repositories/user-credential-repo"
import { CredentialVault, type EncryptedCredential } from "../../services/credential-vault"

/**
 * Sandbox RPC Handlers
 *
 * Implements the business logic for all sandbox-related RPC methods.
 * Handles credentials, sandboxes, and agent sessions.
 */
export const SandboxRpcLive = SandboxRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			// ================================================================
			// Credential Management
			// ================================================================

			"sandbox.storeCredential": ({ provider, apiKey }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// Check if credential already exists
							const existing = yield* UserCredentialRepo.findByUserAndProvider(
								user.id,
								provider,
							).pipe(withSystemActor, withRemapDbErrors("UserCredential", "select"))

							if (Option.isSome(existing)) {
								return yield* Effect.fail(new CredentialAlreadyExistsError({ provider }))
							}

							// Encrypt the API key
							const vault = yield* CredentialVault
							const encrypted = yield* vault.encrypt(apiKey)
							const keyHint = vault.createKeyHint(apiKey)

							// Store the credential
							const createdCredential = yield* UserCredentialRepo.insert({
								userId: user.id,
								provider,
								encryptedKey: JSON.stringify(encrypted),
								keyHint,
							}).pipe(
								Effect.map((res) => res[0]!),
								policyUse(UserCredentialPolicy.canCreate()),
							)

							const txid = yield* generateTransactionId()

							return {
								data: createdCredential,
								transactionId: txid,
							}
						}),
					)
					.pipe(
						withRemapDbErrors("UserCredential", "create"),
						// Map CredentialEncryptionError to InternalServerError
						Effect.catchTag("CredentialEncryptionError", (err) =>
							Effect.fail(
								new InternalServerError({
									message: `Failed to encrypt credential: ${err.operation}`,
								}),
							),
						),
					),

			"sandbox.listCredentials": () =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					const credentials = yield* UserCredentialRepo.findAllByUser(user.id).pipe(
						withSystemActor,
						withRemapDbErrors("UserCredential", "select"),
					)

					return { credentials }
				}),

			"sandbox.deleteCredential": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const credentialOption = yield* UserCredentialRepo.findById(id).pipe(
								withSystemActor,
								withRemapDbErrors("UserCredential", "select"),
							)

							if (Option.isNone(credentialOption)) {
								return yield* Effect.fail(new CredentialIdNotFoundError({ credentialId: id }))
							}

							yield* UserCredentialRepo.softDelete(id).pipe(
								policyUse(UserCredentialPolicy.canDelete(id)),
							)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("UserCredential", "delete")),

			// ================================================================
			// Sandbox Management
			// ================================================================

			"sandbox.provision": ({ provider, name }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// Check for provider credential
							const providerCredential = yield* UserCredentialRepo.findByUserAndProvider(
								user.id,
								provider,
							).pipe(withSystemActor, withRemapDbErrors("UserCredential", "select"))

							if (Option.isNone(providerCredential)) {
								return yield* Effect.fail(
									new CredentialNotFoundError({
										provider,
										message: `No ${provider} API key configured. Please add your API key first.`,
									}),
								)
							}

							// Create sandbox record with "provisioning" status
							// The actual provisioning will be done by a cluster workflow
							const expiresAt = DateTime.addDuration(DateTime.unsafeNow(), "4 hours")

							const createdSandbox = yield* SandboxRepo.insert({
								userId: user.id,
								provider,
								externalSandboxId: "pending", // Will be updated by workflow
								status: "provisioning",
								name: name ?? null,
								expiresAt: new Date(DateTime.toEpochMillis(expiresAt)),
								publicUrl: null, // Will be set by workflow
								errorMessage: null,
								deletedAt: null,
							}).pipe(
								Effect.map((res) => res[0]!),
								policyUse(SandboxPolicy.canCreate()),
							)

							// TODO: Trigger SandboxProvisioningWorkflow via WorkflowClient
							// For now, we just return the pending sandbox
							// The frontend should poll for status updates

							const txid = yield* generateTransactionId()

							return {
								data: createdSandbox,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Sandbox", "create")),

			"sandbox.list": ({ status }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					const sandboxes = yield* SandboxRepo.findAllByUser(user.id, status).pipe(
						withSystemActor,
						withRemapDbErrors("Sandbox", "select"),
					)

					return { sandboxes }
				}),

			"sandbox.get": ({ id }) =>
				Effect.gen(function* () {
					// Check policy, then clear auth requirement (policy verified ownership)
					yield* SandboxPolicy.canView(id)

					const sandboxOption = yield* SandboxRepo.findById(id).pipe(
						withSystemActor,
						withRemapDbErrors("Sandbox", "select"),
					)

					if (Option.isNone(sandboxOption)) {
						return yield* Effect.fail(new SandboxNotFoundError({ sandboxId: id }))
					}

					return sandboxOption.value
				}),

			"sandbox.destroy": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const sandboxOption = yield* SandboxRepo.findById(id).pipe(
								withSystemActor,
								withRemapDbErrors("Sandbox", "select"),
							)

							if (Option.isNone(sandboxOption)) {
								return yield* Effect.fail(new SandboxNotFoundError({ sandboxId: id }))
							}

							// End all active sessions
							yield* AgentSessionRepo.endAllForSandbox(id).pipe(
								withSystemActor,
								withRemapDbErrors("AgentSession", "update"),
							)

							// Mark sandbox as stopped
							yield* SandboxRepo.softDelete(id).pipe(policyUse(SandboxPolicy.canDelete(id)))

							// TODO: Trigger SandboxCleanupWorkflow to terminate the actual sandbox

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("Sandbox", "delete")),

			// ================================================================
			// Session Management
			// ================================================================

			"sandbox.createSession": ({ sandboxId, agent, workingDirectory }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// Verify sandbox ownership
							yield* SandboxPolicy.canView(sandboxId)

							// Get sandbox
							const sandboxOption = yield* SandboxRepo.findById(sandboxId).pipe(
								withSystemActor,
								withRemapDbErrors("Sandbox", "select"),
							)

							if (Option.isNone(sandboxOption)) {
								return yield* Effect.fail(new SandboxNotFoundError({ sandboxId }))
							}

							const sandbox = sandboxOption.value

							// Check if sandbox is expired
							if (
								sandbox.expiresAt &&
								DateTime.lessThan(
									DateTime.unsafeFromDate(sandbox.expiresAt),
									DateTime.unsafeNow(),
								)
							) {
								return yield* Effect.fail(
									new SandboxExpiredError({
										sandboxId,
										expiredAt: DateTime.unsafeFromDate(sandbox.expiresAt),
									}),
								)
							}

							// Check if sandbox is running
							if (sandbox.status !== "running") {
								return yield* Effect.fail(
									new SandboxAgentError({
										sandboxId,
										message: `Sandbox is not running (status: ${sandbox.status})`,
									}),
								)
							}

							// Check for agent's API credential
							const agentProvider = agent === "claude" ? "anthropic" : "openai"
							const agentCredential = yield* UserCredentialRepo.findByUserAndProvider(
								user.id,
								agentProvider,
							).pipe(withSystemActor, withRemapDbErrors("UserCredential", "select"))

							if (Option.isNone(agentCredential)) {
								return yield* Effect.fail(
									new CredentialNotFoundError({
										provider: agentProvider,
										message: `No ${agentProvider} API key configured for ${agent}. Please add your API key first.`,
									}),
								)
							}

							// TODO: Call sandbox-agent API to create session
							// For now, create a placeholder session
							const externalSessionId = `session-${crypto.randomUUID()}`

							// Verify user can create sessions
							yield* AgentSessionPolicy.canCreate()

							const createdSession = yield* AgentSessionRepo.insert({
								sandboxId,
								userId: user.id,
								externalSessionId,
								agent,
								status: "creating",
								workingDirectory: workingDirectory ?? null,
								lastMessage: null,
								metadata: null,
								endedAt: null,
								deletedAt: null,
							}).pipe(
								Effect.map((res) => res[0]!),
								withSystemActor,
							)

							const txid = yield* generateTransactionId()

							return {
								data: createdSession,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("AgentSession", "create")),

			"sandbox.listSessions": ({ sandboxId, status }) =>
				Effect.gen(function* () {
					// Verify sandbox access
					yield* SandboxPolicy.canView(sandboxId)

					const sessions = yield* AgentSessionRepo.findAllBySandbox(sandboxId, status).pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "select"),
					)

					return { sessions }
				}),

			"sandbox.getSession": ({ id }) =>
				Effect.gen(function* () {
					// Verify session access
					yield* AgentSessionPolicy.canView(id)

					const sessionOption = yield* AgentSessionRepo.findById(id).pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "select"),
					)

					if (Option.isNone(sessionOption)) {
						return yield* Effect.fail(new AgentSessionNotFoundError({ sessionId: id }))
					}

					return sessionOption.value
				}),

			"sandbox.sendMessage": ({ sessionId, message }) =>
				Effect.gen(function* () {
					// Verify session access
					yield* AgentSessionPolicy.canUpdate(sessionId)

					const sessionOption = yield* AgentSessionRepo.findById(sessionId).pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "select"),
					)

					if (Option.isNone(sessionOption)) {
						return yield* Effect.fail(new AgentSessionNotFoundError({ sessionId }))
					}

					const session = sessionOption.value

					// Check session is active
					if (session.status !== "active") {
						return yield* Effect.fail(
							new AgentSessionInvalidStateError({
								sessionId,
								currentState: session.status,
								expectedState: "active",
							}),
						)
					}

					// TODO: Send message to sandbox-agent via HTTP
					// Update last message
					yield* AgentSessionRepo.updateLastMessage(sessionId, message).pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "update"),
					)

					const txid = yield* generateTransactionId()

					return {
						acknowledged: true,
						transactionId: txid,
					}
				}),

			"sandbox.respondToPermission": ({ sessionId, permissionId, approved, explanation }) =>
				Effect.gen(function* () {
					// Verify session access
					yield* AgentSessionPolicy.canUpdate(sessionId)

					const sessionOption = yield* AgentSessionRepo.findById(sessionId).pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "select"),
					)

					if (Option.isNone(sessionOption)) {
						return yield* Effect.fail(new AgentSessionNotFoundError({ sessionId }))
					}

					const session = sessionOption.value

					// Check session is waiting for input
					if (session.status !== "waiting_input") {
						return yield* Effect.fail(
							new AgentSessionInvalidStateError({
								sessionId,
								currentState: session.status,
								expectedState: "waiting_input",
							}),
						)
					}

					// TODO: Send permission response to sandbox-agent via HTTP
					// Update session status back to active
					yield* AgentSessionRepo.updateStatus(sessionId, "active").pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "update"),
					)

					const txid = yield* generateTransactionId()

					return {
						acknowledged: true,
						transactionId: txid,
					}
				}),

			"sandbox.respondToQuestion": ({ sessionId, questionId, answer }) =>
				Effect.gen(function* () {
					// Verify session access
					yield* AgentSessionPolicy.canUpdate(sessionId)

					const sessionOption = yield* AgentSessionRepo.findById(sessionId).pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "select"),
					)

					if (Option.isNone(sessionOption)) {
						return yield* Effect.fail(new AgentSessionNotFoundError({ sessionId }))
					}

					const session = sessionOption.value

					// Check session is waiting for input
					if (session.status !== "waiting_input") {
						return yield* Effect.fail(
							new AgentSessionInvalidStateError({
								sessionId,
								currentState: session.status,
								expectedState: "waiting_input",
							}),
						)
					}

					// TODO: Send question answer to sandbox-agent via HTTP
					// Update session status back to active
					yield* AgentSessionRepo.updateStatus(sessionId, "active").pipe(
						withSystemActor,
						withRemapDbErrors("AgentSession", "update"),
					)

					const txid = yield* generateTransactionId()

					return {
						acknowledged: true,
						transactionId: txid,
					}
				}),

			"sandbox.endSession": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Verify session access
							yield* AgentSessionPolicy.canUpdate(id)

							const sessionOption = yield* AgentSessionRepo.findById(id).pipe(
								withSystemActor,
								withRemapDbErrors("AgentSession", "select"),
							)

							if (Option.isNone(sessionOption)) {
								return yield* Effect.fail(new AgentSessionNotFoundError({ sessionId: id }))
							}

							const session = sessionOption.value

							// Check session is not already ended
							if (["completed", "failed", "cancelled"].includes(session.status)) {
								return yield* Effect.fail(
									new AgentSessionInvalidStateError({
										sessionId: id,
										currentState: session.status,
										expectedState: "active",
									}),
								)
							}

							// TODO: End session in sandbox-agent via HTTP
							// Update session status
							yield* AgentSessionRepo.updateStatus(id, "cancelled").pipe(
								withSystemActor,
								withRemapDbErrors("AgentSession", "update"),
							)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("AgentSession", "update")),
		}
	}),
)

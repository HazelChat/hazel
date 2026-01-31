import { RpcGroup } from "@effect/rpc"
import { AgentSessionId, SandboxId, UserCredentialId } from "@hazel/schema"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { AgentSession, Sandbox, UserCredential } from "../models"
import {
	AgentSessionInvalidStateError,
	AgentSessionNotFoundError,
	CredentialAlreadyExistsError,
	CredentialIdNotFoundError,
	CredentialNotFoundError,
	SandboxAgentError,
	SandboxExpiredError,
	SandboxNotFoundError,
	SandboxProvisioningError,
	SandboxProviderUnavailableError,
} from "../sandbox-errors"
import { TransactionId } from "../transaction-id"
import { AuthMiddleware } from "./middleware"

// ============================================================================
// Response Schemas
// ============================================================================

export class CredentialResponse extends Schema.Class<CredentialResponse>("CredentialResponse")({
	data: UserCredential.Model.json,
	transactionId: TransactionId,
}) {}

export class SandboxResponse extends Schema.Class<SandboxResponse>("SandboxResponse")({
	data: Sandbox.Model.json,
	transactionId: TransactionId,
}) {}

export class AgentSessionResponse extends Schema.Class<AgentSessionResponse>("AgentSessionResponse")({
	data: AgentSession.Model.json,
	transactionId: TransactionId,
}) {}

// ============================================================================
// RPC Definitions
// ============================================================================

export class SandboxRpcs extends RpcGroup.make(
	// ========================================================================
	// Credential Management
	// ========================================================================

	/**
	 * StoreCredential
	 *
	 * Stores an encrypted API key for a provider (anthropic, openai, e2b, daytona).
	 * The key is encrypted before storage and only the last 4 characters are stored as a hint.
	 *
	 * @param payload - Provider type and the API key to store
	 * @returns Credential metadata (without the actual key) and transaction ID
	 * @throws CredentialAlreadyExistsError if user already has a key for this provider
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.storeCredential", {
		payload: Schema.Struct({
			provider: UserCredential.CredentialProvider,
			apiKey: Schema.String, // Raw API key - will be encrypted
		}),
		success: CredentialResponse,
		error: Schema.Union(CredentialAlreadyExistsError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * ListCredentials
	 *
	 * Lists all stored credentials for the current user.
	 * Returns metadata only (provider, hint, dates) - never the actual keys.
	 *
	 * @returns Array of credential metadata
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.query("sandbox.listCredentials", {
		payload: Schema.Struct({}),
		success: Schema.Struct({
			credentials: Schema.Array(UserCredential.Model.json),
		}),
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * DeleteCredential
	 *
	 * Deletes a stored credential by ID.
	 *
	 * @param payload - Credential ID to delete
	 * @returns Transaction ID
	 * @throws CredentialIdNotFoundError if credential doesn't exist
	 * @throws UnauthorizedError if user is not authenticated or doesn't own the credential
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.deleteCredential", {
		payload: Schema.Struct({ id: UserCredentialId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(CredentialIdNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	// ========================================================================
	// Sandbox Management
	// ========================================================================

	/**
	 * ProvisionSandbox
	 *
	 * Provisions a new cloud sandbox (E2B or Daytona).
	 * This triggers a cluster workflow that:
	 * 1. Creates the sandbox via provider API
	 * 2. Installs sandbox-agent
	 * 3. Starts the sandbox-agent server
	 * 4. Returns the public URL
	 *
	 * @param payload - Sandbox provider and optional name
	 * @returns Sandbox info (initially with status "provisioning")
	 * @throws CredentialNotFoundError if required provider credentials are missing
	 * @throws SandboxProviderUnavailableError if provider API is down
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.provision", {
		payload: Schema.Struct({
			provider: Sandbox.SandboxProvider,
			name: Schema.optional(Schema.String),
		}),
		success: SandboxResponse,
		error: Schema.Union(
			CredentialNotFoundError,
			SandboxProviderUnavailableError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * ListSandboxes
	 *
	 * Lists all sandboxes for the current user.
	 * Includes active, provisioning, and recently stopped sandboxes.
	 *
	 * @param payload - Optional status filter
	 * @returns Array of sandbox info
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.query("sandbox.list", {
		payload: Schema.Struct({
			status: Schema.optional(Sandbox.SandboxStatus),
		}),
		success: Schema.Struct({
			sandboxes: Schema.Array(Sandbox.Model.json),
		}),
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * GetSandbox
	 *
	 * Gets detailed info for a specific sandbox.
	 *
	 * @param payload - Sandbox ID
	 * @returns Sandbox info
	 * @throws SandboxNotFoundError if sandbox doesn't exist
	 * @throws UnauthorizedError if user is not authenticated or doesn't own the sandbox
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.query("sandbox.get", {
		payload: Schema.Struct({ id: SandboxId }),
		success: Sandbox.Model.json,
		error: Schema.Union(SandboxNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * DestroySandbox
	 *
	 * Terminates and deletes a sandbox.
	 * This will also end all active sessions.
	 *
	 * @param payload - Sandbox ID to destroy
	 * @returns Transaction ID
	 * @throws SandboxNotFoundError if sandbox doesn't exist
	 * @throws UnauthorizedError if user is not authenticated or doesn't own the sandbox
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.destroy", {
		payload: Schema.Struct({ id: SandboxId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(
			SandboxNotFoundError,
			SandboxProviderUnavailableError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	// ========================================================================
	// Session Management
	// ========================================================================

	/**
	 * CreateSession
	 *
	 * Creates a new agent session in a sandbox.
	 *
	 * @param payload - Sandbox ID, agent type, and optional working directory
	 * @returns Session info
	 * @throws SandboxNotFoundError if sandbox doesn't exist
	 * @throws SandboxExpiredError if sandbox has expired
	 * @throws CredentialNotFoundError if agent's API key is missing
	 * @throws SandboxAgentError if sandbox-agent returns an error
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.createSession", {
		payload: Schema.Struct({
			sandboxId: SandboxId,
			agent: AgentSession.AgentType,
			workingDirectory: Schema.optional(Schema.String),
		}),
		success: AgentSessionResponse,
		error: Schema.Union(
			SandboxNotFoundError,
			SandboxExpiredError,
			CredentialNotFoundError,
			SandboxAgentError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * ListSessions
	 *
	 * Lists all sessions for a sandbox.
	 *
	 * @param payload - Sandbox ID and optional status filter
	 * @returns Array of session info
	 * @throws SandboxNotFoundError if sandbox doesn't exist
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.query("sandbox.listSessions", {
		payload: Schema.Struct({
			sandboxId: SandboxId,
			status: Schema.optional(AgentSession.AgentSessionStatus),
		}),
		success: Schema.Struct({
			sessions: Schema.Array(AgentSession.Model.json),
		}),
		error: Schema.Union(SandboxNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * GetSession
	 *
	 * Gets detailed info for a specific session.
	 *
	 * @param payload - Session ID
	 * @returns Session info
	 * @throws AgentSessionNotFoundError if session doesn't exist
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.query("sandbox.getSession", {
		payload: Schema.Struct({ id: AgentSessionId }),
		success: AgentSession.Model.json,
		error: Schema.Union(AgentSessionNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * SendMessage
	 *
	 * Sends a message to an active session.
	 * The response will be streamed via SSE (separate endpoint).
	 *
	 * @param payload - Session ID and message content
	 * @returns Acknowledgement
	 * @throws AgentSessionNotFoundError if session doesn't exist
	 * @throws AgentSessionInvalidStateError if session is not active
	 * @throws SandboxAgentError if sandbox-agent returns an error
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.sendMessage", {
		payload: Schema.Struct({
			sessionId: AgentSessionId,
			message: Schema.String,
		}),
		success: Schema.Struct({
			acknowledged: Schema.Boolean,
			transactionId: TransactionId,
		}),
		error: Schema.Union(
			AgentSessionNotFoundError,
			AgentSessionInvalidStateError,
			SandboxAgentError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * RespondToPermission
	 *
	 * Responds to a HITL permission request.
	 *
	 * @param payload - Session ID, permission ID, and approval decision
	 * @returns Acknowledgement
	 * @throws AgentSessionNotFoundError if session doesn't exist
	 * @throws AgentSessionInvalidStateError if session is not waiting for input
	 * @throws SandboxAgentError if sandbox-agent returns an error
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.respondToPermission", {
		payload: Schema.Struct({
			sessionId: AgentSessionId,
			permissionId: Schema.String,
			approved: Schema.Boolean,
			explanation: Schema.optional(Schema.String), // Optional reason for denial
		}),
		success: Schema.Struct({
			acknowledged: Schema.Boolean,
			transactionId: TransactionId,
		}),
		error: Schema.Union(
			AgentSessionNotFoundError,
			AgentSessionInvalidStateError,
			SandboxAgentError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * RespondToQuestion
	 *
	 * Responds to a HITL question request.
	 *
	 * @param payload - Session ID, question ID, and the answer
	 * @returns Acknowledgement
	 * @throws AgentSessionNotFoundError if session doesn't exist
	 * @throws AgentSessionInvalidStateError if session is not waiting for input
	 * @throws SandboxAgentError if sandbox-agent returns an error
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.respondToQuestion", {
		payload: Schema.Struct({
			sessionId: AgentSessionId,
			questionId: Schema.String,
			answer: Schema.String,
		}),
		success: Schema.Struct({
			acknowledged: Schema.Boolean,
			transactionId: TransactionId,
		}),
		error: Schema.Union(
			AgentSessionNotFoundError,
			AgentSessionInvalidStateError,
			SandboxAgentError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * EndSession
	 *
	 * Ends an active session.
	 *
	 * @param payload - Session ID
	 * @returns Transaction ID
	 * @throws AgentSessionNotFoundError if session doesn't exist
	 * @throws AgentSessionInvalidStateError if session is already ended
	 * @throws SandboxAgentError if sandbox-agent returns an error
	 * @throws UnauthorizedError if user is not authenticated
	 * @throws InternalServerError for unexpected errors
	 */
	Rpc.mutation("sandbox.endSession", {
		payload: Schema.Struct({ id: AgentSessionId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(
			AgentSessionNotFoundError,
			AgentSessionInvalidStateError,
			SandboxAgentError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),
) {}

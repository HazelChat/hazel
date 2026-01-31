/**
 * @module Sandbox Atoms
 * @description Atoms for managing cloud sandboxes (E2B/Daytona)
 */

import type { Sandbox } from "@hazel/domain/models"
import type { SandboxId } from "@hazel/schema"
import type { Schema } from "effect"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Type for sandbox data returned from RPC.
 */
export type SandboxData = Schema.Schema.Type<typeof Sandbox.Model.json>

/**
 * Query atom factory for listing all sandboxes for the current user.
 * Can optionally filter by status.
 */
export const listSandboxesQuery = (status?: Sandbox.SandboxStatus) =>
	HazelRpcClient.query("sandbox.list", { status })

/**
 * Query atom factory for getting a specific sandbox by ID.
 */
export const getSandboxQuery = (id: SandboxId) => HazelRpcClient.query("sandbox.get", { id })

/**
 * Mutation atom for provisioning a new sandbox.
 * Returns immediately with status "provisioning" - poll for updates.
 */
export const provisionSandboxMutation = HazelRpcClient.mutation("sandbox.provision")

/**
 * Mutation atom for destroying a sandbox.
 * Terminates all sessions and cleans up resources.
 */
export const destroySandboxMutation = HazelRpcClient.mutation("sandbox.destroy")

/**
 * Sandbox status display info
 */
export const SANDBOX_STATUS_INFO = {
	provisioning: { label: "Provisioning", color: "yellow", icon: "⏳" },
	running: { label: "Running", color: "green", icon: "🟢" },
	stopping: { label: "Stopping", color: "orange", icon: "⏹️" },
	stopped: { label: "Stopped", color: "gray", icon: "⏹️" },
	failed: { label: "Failed", color: "red", icon: "❌" },
	expired: { label: "Expired", color: "gray", icon: "⌛" },
} as const

/**
 * Sandbox provider display info
 */
export const SANDBOX_PROVIDER_INFO = {
	e2b: { name: "E2B", description: "Fast, ephemeral cloud sandboxes" },
	daytona: { name: "Daytona", description: "Development workspace provider" },
} as const

/**
 * @module Credential Atoms
 * @description Atoms for managing user API credentials (Anthropic, OpenAI, E2B, Daytona)
 */

import type { UserCredential } from "@hazel/domain/models"
import type { Schema } from "effect"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Type for credential data returned from RPC.
 * Note: The actual API key is never returned - only metadata and hint.
 */
export type CredentialData = Schema.Schema.Type<typeof UserCredential.Model.json>

/**
 * Query atom for listing all stored credentials for the current user.
 * Returns credential metadata only (provider, hint, dates) - never actual keys.
 */
export const listCredentialsQuery = () => HazelRpcClient.query("sandbox.listCredentials", {})

/**
 * Mutation atom for storing a new API credential.
 * The key is encrypted before storage.
 */
export const storeCredentialMutation = HazelRpcClient.mutation("sandbox.storeCredential")

/**
 * Mutation atom for deleting a stored credential.
 */
export const deleteCredentialMutation = HazelRpcClient.mutation("sandbox.deleteCredential")

/**
 * Available credential providers
 */
export const CREDENTIAL_PROVIDERS = [
	{ id: "anthropic", name: "Anthropic", description: "For Claude agents" },
	{ id: "openai", name: "OpenAI", description: "For Codex and OpenCode agents" },
	{ id: "e2b", name: "E2B", description: "Cloud sandbox provider" },
	{ id: "daytona", name: "Daytona", description: "Cloud sandbox provider" },
] as const

export type CredentialProviderId = (typeof CREDENTIAL_PROVIDERS)[number]["id"]

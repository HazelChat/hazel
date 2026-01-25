import type { ExternalChannelLink } from "@hazel/domain/models"
import type { Schema } from "effect"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Type for external channel link data returned from RPC.
 * Inferred from the domain model's JSON schema to stay in sync automatically.
 */
export type ExternalChannelLinkData = Schema.Schema.Type<typeof ExternalChannelLink.Model.json>

/**
 * Query atom for listing external channel links for a channel.
 */
export const listExternalChannelLinksMutation = HazelRpcClient.mutation("externalChannelLink.list")

/**
 * Query atom for listing external channel links for an organization.
 */
export const listExternalChannelLinksByOrgMutation = HazelRpcClient.mutation("externalChannelLink.listByOrg")

/**
 * Mutation atom for creating an external channel link.
 */
export const createExternalChannelLinkMutation = HazelRpcClient.mutation("externalChannelLink.create")

/**
 * Mutation atom for updating an external channel link.
 */
export const updateExternalChannelLinkMutation = HazelRpcClient.mutation("externalChannelLink.update")

/**
 * Mutation atom for deleting an external channel link.
 */
export const deleteExternalChannelLinkMutation = HazelRpcClient.mutation("externalChannelLink.delete")

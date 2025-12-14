import type { GitHubSubscription } from "@hazel/domain/models"
import type { Schema } from "effect"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Type for GitHub subscription data returned from RPC.
 * Inferred from the domain model's JSON schema to stay in sync automatically.
 */
export type GitHubSubscriptionData = Schema.Schema.Type<typeof GitHubSubscription.Model.json>

/**
 * Mutation atom for creating a GitHub subscription.
 * Subscribes a channel to a GitHub repository.
 */
export const createGitHubSubscriptionMutation = HazelRpcClient.mutation("githubSubscription.create")

/**
 * Mutation atom for listing GitHub subscriptions for a channel.
 */
export const listGitHubSubscriptionsMutation = HazelRpcClient.mutation("githubSubscription.list")

/**
 * Mutation atom for updating a GitHub subscription.
 * Can update enabled events, branch filter, and enabled status.
 */
export const updateGitHubSubscriptionMutation = HazelRpcClient.mutation("githubSubscription.update")

/**
 * Mutation atom for deleting a GitHub subscription (soft delete).
 */
export const deleteGitHubSubscriptionMutation = HazelRpcClient.mutation("githubSubscription.delete")

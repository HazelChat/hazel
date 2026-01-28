import type { RssSubscription } from "@hazel/domain/models"
import type { Schema } from "effect"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Type for RSS subscription data returned from RPC.
 * Inferred from the domain model's JSON schema to stay in sync automatically.
 */
export type RssSubscriptionData = Schema.Schema.Type<typeof RssSubscription.Model.json>

/**
 * Mutation atom for creating an RSS subscription.
 * Subscribes a channel to an RSS feed URL.
 */
export const createRssSubscriptionMutation = HazelRpcClient.mutation("rssSubscription.create")

/**
 * Mutation atom for listing RSS subscriptions for a channel.
 */
export const listRssSubscriptionsMutation = HazelRpcClient.mutation("rssSubscription.list")

/**
 * Mutation atom for listing all RSS subscriptions for an organization.
 * Used by the organization-level integration settings page.
 */
export const listOrganizationRssSubscriptionsMutation = HazelRpcClient.mutation(
	"rssSubscription.listByOrganization",
)

/**
 * Mutation atom for updating an RSS subscription.
 * Can update isEnabled and pollingIntervalMinutes.
 */
export const updateRssSubscriptionMutation = HazelRpcClient.mutation("rssSubscription.update")

/**
 * Mutation atom for deleting an RSS subscription (soft delete).
 */
export const deleteRssSubscriptionMutation = HazelRpcClient.mutation("rssSubscription.delete")

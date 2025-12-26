import { RpcGroup } from "@effect/rpc"
import { ChannelId, GitHubSubscriptionId } from "@hazel/schema"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { GitHubSubscription } from "../models"
import { TransactionId } from "../transaction-id"
import { ChannelNotFoundError } from "./channels"
import { AuthMiddleware } from "./middleware"

/**
 * Response schema for GitHub subscription operations.
 * Contains the subscription data and a transaction ID for optimistic updates.
 */
export class GitHubSubscriptionResponse extends Schema.Class<GitHubSubscriptionResponse>(
	"GitHubSubscriptionResponse",
)({
	data: GitHubSubscription.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Response for listing GitHub subscriptions.
 */
export class GitHubSubscriptionListResponse extends Schema.Class<GitHubSubscriptionListResponse>(
	"GitHubSubscriptionListResponse",
)({
	data: Schema.Array(GitHubSubscription.Model.json),
}) {}

/**
 * Error thrown when a GitHub subscription is not found.
 */
export class GitHubSubscriptionNotFoundError extends Schema.TaggedError<GitHubSubscriptionNotFoundError>()(
	"GitHubSubscriptionNotFoundError",
	{
		subscriptionId: GitHubSubscriptionId,
	},
) {}

/**
 * Error thrown when trying to subscribe to a repo that's already subscribed.
 */
export class GitHubSubscriptionExistsError extends Schema.TaggedError<GitHubSubscriptionExistsError>()(
	"GitHubSubscriptionExistsError",
	{
		channelId: ChannelId,
		repositoryId: Schema.Number,
	},
) {}

/**
 * Error thrown when the organization doesn't have GitHub connected.
 */
export class GitHubNotConnectedError extends Schema.TaggedError<GitHubNotConnectedError>()(
	"GitHubNotConnectedError",
	{},
) {}

/**
 * GitHub Subscription RPC Group
 *
 * Defines all RPC methods for GitHub subscription operations:
 * - githubSubscription.create: Subscribe a channel to a GitHub repository
 * - githubSubscription.list: List all GitHub subscriptions for a channel
 * - githubSubscription.update: Update subscription settings
 * - githubSubscription.delete: Remove a subscription
 *
 * All methods require authentication via AuthMiddleware.
 */
export class GitHubSubscriptionRpcs extends RpcGroup.make(
	/**
	 * githubSubscription.create
	 *
	 * Subscribes a channel to a GitHub repository.
	 * The organization must have GitHub connected.
	 *
	 * @param payload - Channel ID and repository details
	 * @returns Subscription data and transaction ID
	 * @throws ChannelNotFoundError if channel doesn't exist
	 * @throws GitHubNotConnectedError if GitHub is not connected
	 * @throws GitHubSubscriptionExistsError if already subscribed
	 * @throws UnauthorizedError if user is not authorized
	 */
	Rpc.mutation("githubSubscription.create", {
		payload: Schema.Struct({
			channelId: ChannelId,
			repositoryId: Schema.Number,
			repositoryFullName: Schema.String,
			repositoryOwner: Schema.String,
			repositoryName: Schema.String,
			enabledEvents: GitHubSubscription.GitHubEventTypes,
			branchFilter: Schema.optional(Schema.NullOr(Schema.String)),
		}),
		success: GitHubSubscriptionResponse,
		error: Schema.Union(
			ChannelNotFoundError,
			GitHubNotConnectedError,
			GitHubSubscriptionExistsError,
			UnauthorizedError,
			InternalServerError,
		),
	}).middleware(AuthMiddleware),

	/**
	 * githubSubscription.list
	 *
	 * Lists all GitHub subscriptions for a channel.
	 *
	 * @param payload - Channel ID
	 * @returns Array of subscriptions
	 * @throws ChannelNotFoundError if channel doesn't exist
	 * @throws UnauthorizedError if user is not authorized
	 */
	Rpc.query("githubSubscription.list", {
		payload: Schema.Struct({ channelId: ChannelId }),
		success: GitHubSubscriptionListResponse,
		error: Schema.Union(ChannelNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * githubSubscription.update
	 *
	 * Updates a GitHub subscription's settings.
	 *
	 * @param payload - Subscription ID and fields to update
	 * @returns Updated subscription data and transaction ID
	 * @throws GitHubSubscriptionNotFoundError if subscription doesn't exist
	 * @throws UnauthorizedError if user is not authorized
	 */
	Rpc.mutation("githubSubscription.update", {
		payload: Schema.Struct({
			id: GitHubSubscriptionId,
			enabledEvents: Schema.optional(GitHubSubscription.GitHubEventTypes),
			branchFilter: Schema.optional(Schema.NullOr(Schema.String)),
			isEnabled: Schema.optional(Schema.Boolean),
		}),
		success: GitHubSubscriptionResponse,
		error: Schema.Union(GitHubSubscriptionNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),

	/**
	 * githubSubscription.delete
	 *
	 * Deletes a GitHub subscription (soft delete).
	 *
	 * @param payload - Subscription ID
	 * @returns Transaction ID
	 * @throws GitHubSubscriptionNotFoundError if subscription doesn't exist
	 * @throws UnauthorizedError if user is not authorized
	 */
	Rpc.mutation("githubSubscription.delete", {
		payload: Schema.Struct({ id: GitHubSubscriptionId }),
		success: Schema.Struct({ transactionId: TransactionId }),
		error: Schema.Union(GitHubSubscriptionNotFoundError, UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}

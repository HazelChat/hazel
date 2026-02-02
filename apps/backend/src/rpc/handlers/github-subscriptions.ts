import { ChannelRepo, GitHubSubscriptionRepo, IntegrationConnectionRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import {
	ChannelNotFoundError,
	GitHubNotConnectedError,
	GitHubSubscriptionExistsError,
	GitHubSubscriptionListResponse,
	GitHubSubscriptionNotFoundError,
	GitHubSubscriptionResponse,
	GitHubSubscriptionRpcs,
} from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { GitHubSubscriptionPolicy } from "../../policies/github-subscription-policy"

/**
 * GitHub Subscription RPC Handlers
 *
 * Implements the business logic for all GitHub subscription-related RPC methods.
 * Only organization admins can manage subscriptions.
 */
export const GitHubSubscriptionRpcLive = GitHubSubscriptionRpcs.toLayer(
	Effect.gen(function* () {
		// Yield services once at initialization
		const db = yield* Database.Database
		const channelRepo = yield* ChannelRepo
		const subscriptionRepo = yield* GitHubSubscriptionRepo
		const integrationRepo = yield* IntegrationConnectionRepo

		return {
			"githubSubscription.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// Get channel to get organization ID
							const channelOption = yield* channelRepo
								.findById(payload.channelId)
								.pipe(withSystemActor)
							if (Option.isNone(channelOption)) {
								return yield* Effect.fail(
									new ChannelNotFoundError({ channelId: payload.channelId }),
								)
							}
							const channel = channelOption.value

							// Check if GitHub is connected for the organization
							const githubConnection = yield* integrationRepo
								.findOrgConnection(channel.organizationId, "github")
								.pipe(withSystemActor)
							if (Option.isNone(githubConnection)) {
								return yield* Effect.fail(new GitHubNotConnectedError())
							}

							// Check if already subscribed to this repo
							const existingOption = yield* subscriptionRepo
								.findByChannelAndRepo(payload.channelId, payload.repositoryId)
								.pipe(withSystemActor)
							if (Option.isSome(existingOption)) {
								return yield* Effect.fail(
									new GitHubSubscriptionExistsError({
										channelId: payload.channelId,
										repositoryId: payload.repositoryId,
									}),
								)
							}

							// Create subscription
							const [subscription] = yield* subscriptionRepo
								.insert({
									channelId: payload.channelId,
									organizationId: channel.organizationId,
									repositoryId: payload.repositoryId,
									repositoryFullName: payload.repositoryFullName,
									repositoryOwner: payload.repositoryOwner,
									repositoryName: payload.repositoryName,
									enabledEvents: [...payload.enabledEvents],
									branchFilter: payload.branchFilter ?? null,
									isEnabled: true,
									createdBy: user.id,
									deletedAt: null,
								})
								.pipe(withSystemActor)

							const txid = yield* generateTransactionId()

							return new GitHubSubscriptionResponse({
								data: subscription,
								transactionId: txid,
							})
						}).pipe(policyUse(GitHubSubscriptionPolicy.canCreate(payload.channelId))),
					)
					.pipe(withRemapDbErrors("GitHubSubscription", "create")),

			"githubSubscription.list": ({ channelId }) =>
				Effect.gen(function* () {
					const subscriptions = yield* subscriptionRepo.findByChannel(channelId)

					return new GitHubSubscriptionListResponse({ data: subscriptions })
				}).pipe(
					policyUse(GitHubSubscriptionPolicy.canRead(channelId)),
					withRemapDbErrors("GitHubSubscription", "select"),
				),

			"githubSubscription.listByOrganization": () =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// If no organization, return empty list
					if (!user.organizationId) {
						return new GitHubSubscriptionListResponse({ data: [] })
					}

					const organizationId = user.organizationId

					const subscriptions = yield* subscriptionRepo
						.findByOrganization(organizationId)
						.pipe(
							withSystemActor,
							policyUse(GitHubSubscriptionPolicy.canReadByOrganization(organizationId)),
						)

					return new GitHubSubscriptionListResponse({ data: subscriptions })
				}).pipe(withRemapDbErrors("GitHubSubscription", "select")),

			"githubSubscription.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Get current subscription
							const subscriptionOption = yield* subscriptionRepo
								.findById(id)
								.pipe(withSystemActor)
							if (Option.isNone(subscriptionOption)) {
								return yield* Effect.fail(
									new GitHubSubscriptionNotFoundError({ subscriptionId: id }),
								)
							}

							// Update subscription
							const [updatedSubscription] = yield* subscriptionRepo
								.updateSettings(id, {
									enabledEvents: payload.enabledEvents
										? [...payload.enabledEvents]
										: undefined,
									branchFilter: payload.branchFilter,
									isEnabled: payload.isEnabled,
								})
								.pipe(withSystemActor)

							const txid = yield* generateTransactionId()

							return new GitHubSubscriptionResponse({
								data: updatedSubscription,
								transactionId: txid,
							})
						}).pipe(policyUse(GitHubSubscriptionPolicy.canUpdate(id))),
					)
					.pipe(withRemapDbErrors("GitHubSubscription", "update")),

			"githubSubscription.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Check subscription exists
							const subscriptionOption = yield* subscriptionRepo
								.findById(id)
								.pipe(withSystemActor)
							if (Option.isNone(subscriptionOption)) {
								return yield* Effect.fail(
									new GitHubSubscriptionNotFoundError({ subscriptionId: id }),
								)
							}

							// Soft delete subscription
							yield* subscriptionRepo.softDelete(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}).pipe(policyUse(GitHubSubscriptionPolicy.canDelete(id))),
					)
					.pipe(withRemapDbErrors("GitHubSubscription", "delete")),
		}
	}),
)

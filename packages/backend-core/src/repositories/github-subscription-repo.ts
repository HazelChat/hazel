import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type ChannelId, type GitHubSubscriptionId, type OrganizationId, policyRequire } from "@hazel/domain"
import { GitHubSubscription } from "@hazel/domain/models"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class GitHubSubscriptionRepo extends Effect.Service<GitHubSubscriptionRepo>()(
	"GitHubSubscriptionRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.githubSubscriptionsTable,
				GitHubSubscription.Model,
				{
					idColumn: "id",
					name: "GitHubSubscription",
				},
			)
			const db = yield* Database.Database

			// Find all subscriptions for a channel
			const findByChannel = (channelId: ChannelId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { channelId: ChannelId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.githubSubscriptionsTable)
								.where(
									and(
										eq(schema.githubSubscriptionsTable.channelId, data.channelId),
										isNull(schema.githubSubscriptionsTable.deletedAt),
									),
								),
						),
					policyRequire("GitHubSubscription", "select"),
				)({ channelId }, tx)

			// Find all subscriptions for an organization
			const findByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { organizationId: OrganizationId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.githubSubscriptionsTable)
								.where(
									and(
										eq(
											schema.githubSubscriptionsTable.organizationId,
											data.organizationId,
										),
										isNull(schema.githubSubscriptionsTable.deletedAt),
									),
								),
						),
					policyRequire("GitHubSubscription", "select"),
				)({ organizationId }, tx)

			// Find subscription by channel and repository (for uniqueness check)
			const findByChannelAndRepo = (channelId: ChannelId, repositoryId: number, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, data: { channelId: ChannelId; repositoryId: number }) =>
							execute((client) =>
								client
									.select()
									.from(schema.githubSubscriptionsTable)
									.where(
										and(
											eq(schema.githubSubscriptionsTable.channelId, data.channelId),
											eq(
												schema.githubSubscriptionsTable.repositoryId,
												data.repositoryId,
											),
											isNull(schema.githubSubscriptionsTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("GitHubSubscription", "select"),
					)({ channelId, repositoryId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			// Update subscription settings
			const updateSettings = (
				id: GitHubSubscriptionId,
				settings: {
					enabledEvents?: GitHubSubscription.GitHubEventType[]
					branchFilter?: string | null
					isEnabled?: boolean
				},
				tx?: TxFn,
			) =>
				db.makeQuery(
					(
						execute,
						data: {
							id: GitHubSubscriptionId
							enabledEvents?: GitHubSubscription.GitHubEventType[]
							branchFilter?: string | null
							isEnabled?: boolean
						},
					) =>
						execute((client) =>
							client
								.update(schema.githubSubscriptionsTable)
								.set({
									...(data.enabledEvents !== undefined && {
										enabledEvents: data.enabledEvents,
									}),
									...(data.branchFilter !== undefined && {
										branchFilter: data.branchFilter,
									}),
									...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
									updatedAt: new Date(),
								})
								.where(eq(schema.githubSubscriptionsTable.id, data.id))
								.returning(),
						),
					policyRequire("GitHubSubscription", "update"),
				)({ id, ...settings }, tx)

			// Soft delete subscription
			const softDelete = (id: GitHubSubscriptionId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: GitHubSubscriptionId }) =>
						execute((client) =>
							client
								.update(schema.githubSubscriptionsTable)
								.set({
									deletedAt: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(schema.githubSubscriptionsTable.id, data.id))
								.returning(),
						),
					policyRequire("GitHubSubscription", "delete"),
				)({ id }, tx)

			return {
				...baseRepo,
				findByChannel,
				findByOrganization,
				findByChannelAndRepo,
				updateSettings,
				softDelete,
			}
		}),
	},
) {}

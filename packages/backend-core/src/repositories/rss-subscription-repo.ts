import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type ChannelId, type OrganizationId, policyRequire, type RssSubscriptionId } from "@hazel/domain"
import { RssSubscription } from "@hazel/domain/models"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class RssSubscriptionRepo extends Effect.Service<RssSubscriptionRepo>()("RssSubscriptionRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.rssSubscriptionsTable,
			RssSubscription.Model,
			{
				idColumn: "id",
				name: "RssSubscription",
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
							.from(schema.rssSubscriptionsTable)
							.where(
								and(
									eq(schema.rssSubscriptionsTable.channelId, data.channelId),
									isNull(schema.rssSubscriptionsTable.deletedAt),
								),
							),
					),
				policyRequire("RssSubscription", "select"),
			)({ channelId }, tx)

		// Find all subscriptions for an organization
		const findByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { organizationId: OrganizationId }) =>
					execute((client) =>
						client
							.select()
							.from(schema.rssSubscriptionsTable)
							.where(
								and(
									eq(schema.rssSubscriptionsTable.organizationId, data.organizationId),
									isNull(schema.rssSubscriptionsTable.deletedAt),
								),
							),
					),
				policyRequire("RssSubscription", "select"),
			)({ organizationId }, tx)

		// Find subscription by channel and feed URL (for uniqueness check)
		const findByChannelAndFeedUrl = (channelId: ChannelId, feedUrl: string, tx?: TxFn) =>
			db
				.makeQuery(
					(execute, data: { channelId: ChannelId; feedUrl: string }) =>
						execute((client) =>
							client
								.select()
								.from(schema.rssSubscriptionsTable)
								.where(
									and(
										eq(schema.rssSubscriptionsTable.channelId, data.channelId),
										eq(schema.rssSubscriptionsTable.feedUrl, data.feedUrl),
										isNull(schema.rssSubscriptionsTable.deletedAt),
									),
								)
								.limit(1),
						),
					policyRequire("RssSubscription", "select"),
				)({ channelId, feedUrl }, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		// Update subscription settings
		const updateSettings = (
			id: RssSubscriptionId,
			settings: {
				isEnabled?: boolean
				pollingIntervalMinutes?: number
			},
			tx?: TxFn,
		) =>
			db.makeQuery(
				(
					execute,
					data: {
						id: RssSubscriptionId
						isEnabled?: boolean
						pollingIntervalMinutes?: number
					},
				) =>
					execute((client) =>
						client
							.update(schema.rssSubscriptionsTable)
							.set({
								...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
								...(data.pollingIntervalMinutes !== undefined && {
									pollingIntervalMinutes: data.pollingIntervalMinutes,
								}),
								updatedAt: new Date(),
							})
							.where(eq(schema.rssSubscriptionsTable.id, data.id))
							.returning(),
					),
				policyRequire("RssSubscription", "update"),
			)({ id, ...settings }, tx)

		// Soft delete subscription
		const softDelete = (id: RssSubscriptionId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data: { id: RssSubscriptionId }) =>
					execute((client) =>
						client
							.update(schema.rssSubscriptionsTable)
							.set({
								deletedAt: new Date(),
								updatedAt: new Date(),
							})
							.where(eq(schema.rssSubscriptionsTable.id, data.id))
							.returning(),
					),
				policyRequire("RssSubscription", "delete"),
			)({ id }, tx)

		return {
			...baseRepo,
			findByChannel,
			findByOrganization,
			findByChannelAndFeedUrl,
			updateSettings,
			softDelete,
		}
	}),
}) {}

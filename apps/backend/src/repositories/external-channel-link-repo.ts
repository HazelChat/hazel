import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { type ChannelId, type ExternalChannelLinkId, type OrganizationId, policyRequire } from "@hazel/domain"
import { ExternalChannelLink, type IntegrationConnection } from "@hazel/domain/models"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ExternalChannelLinkRepo extends Effect.Service<ExternalChannelLinkRepo>()(
	"ExternalChannelLinkRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.externalChannelLinksTable,
				ExternalChannelLink.Model,
				{
					idColumn: "id",
					name: "ExternalChannelLink",
				},
			)
			const db = yield* Database.Database

			/**
			 * Find all external channel links for a Hazel channel.
			 */
			const findByChannelId = (channelId: ChannelId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { channelId: ChannelId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.externalChannelLinksTable)
								.where(
									and(
										eq(schema.externalChannelLinksTable.channelId, data.channelId),
										isNull(schema.externalChannelLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ExternalChannelLink", "select"),
				)({ channelId }, tx)

			/**
			 * Find all external channel links for an organization.
			 */
			const findByOrganizationId = (organizationId: OrganizationId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { organizationId: OrganizationId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.externalChannelLinksTable)
								.where(
									and(
										eq(
											schema.externalChannelLinksTable.organizationId,
											data.organizationId,
										),
										isNull(schema.externalChannelLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ExternalChannelLink", "select"),
				)({ organizationId }, tx)

			/**
			 * Find a link by external channel (for inbound messages).
			 */
			const findByExternalChannel = (
				provider: IntegrationConnection.IntegrationProvider,
				externalChannelId: string,
				tx?: TxFn,
			) =>
				db.makeQuery(
					(
						execute,
						data: {
							provider: IntegrationConnection.IntegrationProvider
							externalChannelId: string
						},
					) =>
						execute((client) =>
							client
								.select()
								.from(schema.externalChannelLinksTable)
								.where(
									and(
										eq(schema.externalChannelLinksTable.provider, data.provider),
										eq(
											schema.externalChannelLinksTable.externalChannelId,
											data.externalChannelId,
										),
										eq(schema.externalChannelLinksTable.isEnabled, true),
										isNull(schema.externalChannelLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ExternalChannelLink", "select"),
				)({ provider, externalChannelId }, tx)

			/**
			 * Find enabled links for outbound messages (from Hazel channel to external).
			 */
			const findEnabledByChannelId = (channelId: ChannelId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { channelId: ChannelId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.externalChannelLinksTable)
								.where(
									and(
										eq(schema.externalChannelLinksTable.channelId, data.channelId),
										eq(schema.externalChannelLinksTable.isEnabled, true),
										isNull(schema.externalChannelLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ExternalChannelLink", "select"),
				)({ channelId }, tx)

			/**
			 * Check if a link already exists between a Hazel channel and external channel.
			 */
			const findExisting = (
				channelId: ChannelId,
				provider: IntegrationConnection.IntegrationProvider,
				externalChannelId: string,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								channelId: ChannelId
								provider: IntegrationConnection.IntegrationProvider
								externalChannelId: string
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.externalChannelLinksTable)
									.where(
										and(
											eq(schema.externalChannelLinksTable.channelId, data.channelId),
											eq(schema.externalChannelLinksTable.provider, data.provider),
											eq(
												schema.externalChannelLinksTable.externalChannelId,
												data.externalChannelId,
											),
											isNull(schema.externalChannelLinksTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("ExternalChannelLink", "select"),
					)({ channelId, provider, externalChannelId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			/**
			 * Soft delete a link.
			 */
			const softDelete = (id: ExternalChannelLinkId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: ExternalChannelLinkId }) =>
						execute((client) =>
							client
								.update(schema.externalChannelLinksTable)
								.set({ deletedAt: new Date() })
								.where(eq(schema.externalChannelLinksTable.id, data.id))
								.returning(),
						),
					policyRequire("ExternalChannelLink", "delete"),
				)({ id }, tx)

			return {
				...baseRepo,
				findByChannelId,
				findByOrganizationId,
				findByExternalChannel,
				findEnabledByChannelId,
				findExisting,
				softDelete,
			}
		}),
		dependencies: [DatabaseLive],
	},
) {}

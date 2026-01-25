import { and, Database, eq, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import {
	type ChannelId,
	type ExternalChannelLinkId,
	type ExternalThreadLinkId,
	policyRequire,
} from "@hazel/domain"
import { ExternalThreadLink, type IntegrationConnection } from "@hazel/domain/models"
import { Effect, Option } from "effect"
import { DatabaseLive } from "../services/database"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ExternalThreadLinkRepo extends Effect.Service<ExternalThreadLinkRepo>()(
	"ExternalThreadLinkRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.externalThreadLinksTable,
				ExternalThreadLink.Model,
				{
					idColumn: "id",
					name: "ExternalThreadLink",
				},
			)
			const db = yield* Database.Database

			/**
			 * Find a thread link by Hazel thread ID.
			 */
			const findByHazelThreadId = (hazelThreadId: ChannelId, tx?: TxFn) =>
				db
					.makeQuery(
						(execute, data: { hazelThreadId: ChannelId }) =>
							execute((client) =>
								client
									.select()
									.from(schema.externalThreadLinksTable)
									.where(
										eq(schema.externalThreadLinksTable.hazelThreadId, data.hazelThreadId),
									)
									.limit(1),
							),
						policyRequire("ExternalThreadLink", "select"),
					)({ hazelThreadId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			/**
			 * Find a thread link by external thread ID.
			 */
			const findByExternalThread = (
				provider: IntegrationConnection.IntegrationProvider,
				externalThreadId: string,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								provider: IntegrationConnection.IntegrationProvider
								externalThreadId: string
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.externalThreadLinksTable)
									.where(
										and(
											eq(schema.externalThreadLinksTable.provider, data.provider),
											eq(
												schema.externalThreadLinksTable.externalThreadId,
												data.externalThreadId,
											),
										),
									)
									.limit(1),
							),
						policyRequire("ExternalThreadLink", "select"),
					)({ provider, externalThreadId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			/**
			 * Find all thread links for a channel link.
			 */
			const findByChannelLinkId = (channelLinkId: ExternalChannelLinkId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { channelLinkId: ExternalChannelLinkId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.externalThreadLinksTable)
								.where(eq(schema.externalThreadLinksTable.channelLinkId, data.channelLinkId)),
						),
					policyRequire("ExternalThreadLink", "select"),
				)({ channelLinkId }, tx)

			/**
			 * Upsert a thread link.
			 */
			const upsert = (
				data: {
					hazelThreadId: ChannelId
					provider: IntegrationConnection.IntegrationProvider
					externalThreadId: string
					externalParentMessageId?: string | null
					channelLinkId: ExternalChannelLinkId
				},
				tx?: TxFn,
			) =>
				Effect.gen(function* () {
					// Check if a link already exists
					const existing = yield* findByExternalThread(data.provider, data.externalThreadId, tx)
					if (Option.isSome(existing)) {
						return existing.value
					}

					// Create new link
					const result = yield* baseRepo.insert(
						{
							hazelThreadId: data.hazelThreadId,
							provider: data.provider,
							externalThreadId: data.externalThreadId,
							externalParentMessageId: data.externalParentMessageId ?? null,
							channelLinkId: data.channelLinkId,
						},
						tx,
					)
					return result[0]
				})

			return {
				...baseRepo,
				findByHazelThreadId,
				findByExternalThread,
				findByChannelLinkId,
				upsert,
			}
		}),
		dependencies: [DatabaseLive],
	},
) {}

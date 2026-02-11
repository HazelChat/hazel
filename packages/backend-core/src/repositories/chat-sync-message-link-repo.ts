import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { policyRequire } from "@hazel/domain"
import { ChatSyncMessageLink } from "@hazel/domain/models"
import type { MessageId, SyncChannelLinkId, SyncMessageLinkId } from "@hazel/schema"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ChatSyncMessageLinkRepo extends Effect.Service<ChatSyncMessageLinkRepo>()(
	"ChatSyncMessageLinkRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.chatSyncMessageLinksTable,
				ChatSyncMessageLink.Model,
				{
					idColumn: "id",
					name: "ChatSyncMessageLink",
				},
			)
			const db = yield* Database.Database

			const findByChannelLink = (channelLinkId: SyncChannelLinkId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { channelLinkId: SyncChannelLinkId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncMessageLinksTable)
								.where(
									and(
										eq(schema.chatSyncMessageLinksTable.channelLinkId, data.channelLinkId),
										isNull(schema.chatSyncMessageLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ChatSyncMessageLink", "select"),
				)({ channelLinkId }, tx)

			const findByHazelMessage = (
				channelLinkId: SyncChannelLinkId,
				hazelMessageId: MessageId,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								channelLinkId: SyncChannelLinkId
								hazelMessageId: MessageId
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncMessageLinksTable)
									.where(
										and(
											eq(schema.chatSyncMessageLinksTable.channelLinkId, data.channelLinkId),
											eq(schema.chatSyncMessageLinksTable.hazelMessageId, data.hazelMessageId),
											isNull(schema.chatSyncMessageLinksTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("ChatSyncMessageLink", "select"),
					)({ channelLinkId, hazelMessageId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const findByExternalMessage = (
				channelLinkId: SyncChannelLinkId,
				externalMessageId: string,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								channelLinkId: SyncChannelLinkId
								externalMessageId: string
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncMessageLinksTable)
									.where(
										and(
											eq(schema.chatSyncMessageLinksTable.channelLinkId, data.channelLinkId),
											eq(
												schema.chatSyncMessageLinksTable.externalMessageId,
												data.externalMessageId,
											),
											isNull(schema.chatSyncMessageLinksTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("ChatSyncMessageLink", "select"),
					)({ channelLinkId, externalMessageId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const findByRootHazelMessage = (
				channelLinkId: SyncChannelLinkId,
				rootHazelMessageId: MessageId,
				tx?: TxFn,
			) =>
				db.makeQuery(
					(
						execute,
						data: {
							channelLinkId: SyncChannelLinkId
							rootHazelMessageId: MessageId
						},
					) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncMessageLinksTable)
								.where(
									and(
										eq(schema.chatSyncMessageLinksTable.channelLinkId, data.channelLinkId),
										eq(
											schema.chatSyncMessageLinksTable.rootHazelMessageId,
											data.rootHazelMessageId,
										),
										isNull(schema.chatSyncMessageLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ChatSyncMessageLink", "select"),
				)({ channelLinkId, rootHazelMessageId }, tx)

			const updateLastSyncedAt = (id: SyncMessageLinkId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncMessageLinkId }) =>
						execute((client) =>
							client
								.update(schema.chatSyncMessageLinksTable)
								.set({
									lastSyncedAt: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncMessageLinksTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncMessageLink", "update"),
				)({ id }, tx)

			const softDelete = (id: SyncMessageLinkId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncMessageLinkId }) =>
						execute((client) =>
							client
								.update(schema.chatSyncMessageLinksTable)
								.set({
									deletedAt: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncMessageLinksTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncMessageLink", "delete"),
				)({ id }, tx)

			return {
				...baseRepo,
				findByChannelLink,
				findByHazelMessage,
				findByExternalMessage,
				findByRootHazelMessage,
				updateLastSyncedAt,
				softDelete,
			}
		}),
	},
) {}

import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"

import { ChatSyncMessageLink } from "@hazel/domain/models"
import type {
	ExternalMessageId,
	ExternalThreadId,
	MessageId,
	SyncChannelLinkId,
	SyncMessageLinkId,
} from "@hazel/schema"
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

			const normalizeMessageLink = <
				T extends {
					externalMessageId: string
					rootExternalMessageId: string | null
					externalThreadId: string | null
				},
			>(
				row: T,
			) => ({
				...row,
				externalMessageId: row.externalMessageId as ExternalMessageId,
				rootExternalMessageId:
					row.rootExternalMessageId === null
						? null
						: (row.rootExternalMessageId as ExternalMessageId),
				externalThreadId:
					row.externalThreadId === null ? null : (row.externalThreadId as ExternalThreadId),
			})

			const normalizeMessageLinkRows = <
				T extends {
					externalMessageId: string
					rootExternalMessageId: string | null
					externalThreadId: string | null
				},
			>(
				rows: readonly T[],
			) => rows.map(normalizeMessageLink)

			const normalizeMessageLinkOption = <
				T extends {
					externalMessageId: string
					rootExternalMessageId: string | null
					externalThreadId: string | null
				},
			>(
				value: Option.Option<T>,
			) => Option.map(value, normalizeMessageLink)

			const insert = (...args: Parameters<typeof baseRepo.insert>) =>
				baseRepo.insert(...args).pipe(Effect.map(normalizeMessageLinkRows)) as ReturnType<
					typeof baseRepo.insert
				>

			const findByChannelLink = (channelLinkId: SyncChannelLinkId, tx?: TxFn) =>
				db
					.makeQuery((execute, data: { channelLinkId: SyncChannelLinkId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncMessageLinksTable)
								.where(
									and(
										eq(
											schema.chatSyncMessageLinksTable.channelLinkId,
											data.channelLinkId,
										),
										isNull(schema.chatSyncMessageLinksTable.deletedAt),
									),
								),
						),
					)({ channelLinkId }, tx)
					.pipe(Effect.map((results) => normalizeMessageLinkRows(results)))

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
											eq(
												schema.chatSyncMessageLinksTable.channelLinkId,
												data.channelLinkId,
											),
											eq(
												schema.chatSyncMessageLinksTable.hazelMessageId,
												data.hazelMessageId,
											),
											isNull(schema.chatSyncMessageLinksTable.deletedAt),
										),
									)
									.limit(1),
							),
					)({ channelLinkId, hazelMessageId }, tx)
					.pipe(
						Effect.map((results) =>
							Option.fromNullable(results[0]).pipe(normalizeMessageLinkOption),
						),
					)

			const findByExternalMessage = (
				channelLinkId: SyncChannelLinkId,
				externalMessageId: ExternalMessageId,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								channelLinkId: SyncChannelLinkId
								externalMessageId: ExternalMessageId
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncMessageLinksTable)
									.where(
										and(
											eq(
												schema.chatSyncMessageLinksTable.channelLinkId,
												data.channelLinkId,
											),
											eq(
												schema.chatSyncMessageLinksTable.externalMessageId,
												data.externalMessageId,
											),
											isNull(schema.chatSyncMessageLinksTable.deletedAt),
										),
									)
									.limit(1),
							),
					)({ channelLinkId, externalMessageId }, tx)
					.pipe(
						Effect.map((results) =>
							Option.fromNullable(results[0]).pipe(normalizeMessageLinkOption),
						),
					)

			const findByRootHazelMessage = (
				channelLinkId: SyncChannelLinkId,
				rootHazelMessageId: MessageId,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
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
											eq(
												schema.chatSyncMessageLinksTable.channelLinkId,
												data.channelLinkId,
											),
											eq(
												schema.chatSyncMessageLinksTable.rootHazelMessageId,
												data.rootHazelMessageId,
											),
											isNull(schema.chatSyncMessageLinksTable.deletedAt),
										),
									),
							),
					)({ channelLinkId, rootHazelMessageId }, tx)
					.pipe(
						Effect.map((results) =>
							Option.fromNullable(results[0]).pipe(normalizeMessageLinkOption),
						),
					)

			const updateLastSyncedAt = (id: SyncMessageLinkId, tx?: TxFn) =>
				db.makeQuery((execute, data: { id: SyncMessageLinkId }) =>
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
				)({ id }, tx)

			const softDelete = (id: SyncMessageLinkId, tx?: TxFn) =>
				db.makeQuery((execute, data: { id: SyncMessageLinkId }) =>
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
				)({ id }, tx)

			return {
				...baseRepo,
				insert,
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

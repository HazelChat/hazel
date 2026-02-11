import { and, Database, eq, gte, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { policyRequire } from "@hazel/domain"
import { ChatSyncEventReceipt } from "@hazel/domain/models"
import type { SyncChannelLinkId, SyncConnectionId, SyncEventReceiptId } from "@hazel/schema"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ChatSyncEventReceiptRepo extends Effect.Service<ChatSyncEventReceiptRepo>()(
	"ChatSyncEventReceiptRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.chatSyncEventReceiptsTable,
				ChatSyncEventReceipt.Model,
				{
					idColumn: "id",
					name: "ChatSyncEventReceipt",
				},
			)
			const db = yield* Database.Database

			const findByDedupeKey = (
				syncConnectionId: SyncConnectionId,
				source: ChatSyncEventReceipt.ChatSyncReceiptSource,
				dedupeKey: string,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								syncConnectionId: SyncConnectionId
								source: ChatSyncEventReceipt.ChatSyncReceiptSource
								dedupeKey: string
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncEventReceiptsTable)
									.where(
										and(
											eq(
												schema.chatSyncEventReceiptsTable.syncConnectionId,
												data.syncConnectionId,
											),
											eq(schema.chatSyncEventReceiptsTable.source, data.source),
											eq(schema.chatSyncEventReceiptsTable.dedupeKey, data.dedupeKey),
										),
									)
									.limit(1),
							),
						policyRequire("ChatSyncEventReceipt", "select"),
					)({ syncConnectionId, source, dedupeKey }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const claimByDedupeKey = (
				params: {
					syncConnectionId: SyncConnectionId
					channelLinkId?: SyncChannelLinkId | null
					source: ChatSyncEventReceipt.ChatSyncReceiptSource
					dedupeKey: string
				},
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								syncConnectionId: SyncConnectionId
								channelLinkId?: SyncChannelLinkId | null
								source: ChatSyncEventReceipt.ChatSyncReceiptSource
								dedupeKey: string
							},
						) =>
							execute((client) =>
								client
									.insert(schema.chatSyncEventReceiptsTable)
									.values({
										syncConnectionId: data.syncConnectionId,
										channelLinkId: data.channelLinkId ?? null,
										source: data.source,
										externalEventId: null,
										dedupeKey: data.dedupeKey,
										payloadHash: null,
										status: "processed",
										errorMessage: null,
									})
									.onConflictDoNothing({
										target: [
											schema.chatSyncEventReceiptsTable.syncConnectionId,
											schema.chatSyncEventReceiptsTable.source,
											schema.chatSyncEventReceiptsTable.dedupeKey,
										],
									})
									.returning({ id: schema.chatSyncEventReceiptsTable.id }),
							),
						policyRequire("ChatSyncEventReceipt", "create"),
					)(params, tx)
					.pipe(Effect.map((results) => results.length > 0))

			const updateByDedupeKey = (
				params: {
					syncConnectionId: SyncConnectionId
					source: ChatSyncEventReceipt.ChatSyncReceiptSource
					dedupeKey: string
					channelLinkId?: SyncChannelLinkId | null
					externalEventId?: string | null
					payloadHash?: string | null
					status?: ChatSyncEventReceipt.ChatSyncReceiptStatus
					errorMessage?: string | null
				},
				tx?: TxFn,
			) =>
				db.makeQuery(
					(
						execute,
						data: {
							syncConnectionId: SyncConnectionId
							source: ChatSyncEventReceipt.ChatSyncReceiptSource
							dedupeKey: string
							channelLinkId?: SyncChannelLinkId | null
							externalEventId?: string | null
							payloadHash?: string | null
							status?: ChatSyncEventReceipt.ChatSyncReceiptStatus
							errorMessage?: string | null
						},
					) =>
						execute((client) => {
							const set: {
								channelLinkId?: SyncChannelLinkId | null
								externalEventId?: string | null
								payloadHash: string | null
								status: ChatSyncEventReceipt.ChatSyncReceiptStatus
								errorMessage: string | null
								processedAt: Date
							} = {
								payloadHash: data.payloadHash ?? null,
								status: data.status ?? "processed",
								errorMessage: data.errorMessage ?? null,
								processedAt: new Date(),
							}
							if (data.channelLinkId !== undefined) {
								set.channelLinkId = data.channelLinkId
							}
							if (data.externalEventId !== undefined) {
								set.externalEventId = data.externalEventId
							}

							return client
								.update(schema.chatSyncEventReceiptsTable)
								.set(set)
								.where(
									and(
										eq(
											schema.chatSyncEventReceiptsTable.syncConnectionId,
											data.syncConnectionId,
										),
										eq(schema.chatSyncEventReceiptsTable.source, data.source),
										eq(schema.chatSyncEventReceiptsTable.dedupeKey, data.dedupeKey),
									),
								)
								.returning()
						}),
					policyRequire("ChatSyncEventReceipt", "update"),
				)(params, tx)

			const findRecentByConnection = (
				syncConnectionId: SyncConnectionId,
				processedAfter: Date,
				tx?: TxFn,
			) =>
				db.makeQuery(
					(
						execute,
						data: {
							syncConnectionId: SyncConnectionId
							processedAfter: Date
						},
					) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncEventReceiptsTable)
								.where(
									and(
										eq(
											schema.chatSyncEventReceiptsTable.syncConnectionId,
											data.syncConnectionId,
										),
										gte(schema.chatSyncEventReceiptsTable.processedAt, data.processedAfter),
									),
								),
						),
					policyRequire("ChatSyncEventReceipt", "select"),
				)({ syncConnectionId, processedAfter }, tx)

			const markFailed = (id: SyncEventReceiptId, errorMessage: string, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncEventReceiptId; errorMessage: string }) =>
						execute((client) =>
							client
								.update(schema.chatSyncEventReceiptsTable)
								.set({
									status: "failed",
									errorMessage: data.errorMessage,
								})
								.where(eq(schema.chatSyncEventReceiptsTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncEventReceipt", "update"),
				)({ id, errorMessage }, tx)

			return {
				...baseRepo,
				findByDedupeKey,
				claimByDedupeKey,
				updateByDedupeKey,
				findRecentByConnection,
				markFailed,
			}
		}),
	},
) {}

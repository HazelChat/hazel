import { and, Database, eq, gte, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { policyRequire } from "@hazel/domain"
import { ChatSyncEventReceipt } from "@hazel/domain/models"
import type { SyncConnectionId, SyncEventReceiptId } from "@hazel/schema"
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
				findRecentByConnection,
				markFailed,
			}
		}),
	},
) {}

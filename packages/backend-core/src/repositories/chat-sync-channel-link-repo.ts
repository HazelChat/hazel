import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { policyRequire } from "@hazel/domain"
import { ChatSyncChannelLink } from "@hazel/domain/models"
import type { ChannelId, SyncChannelLinkId, SyncConnectionId } from "@hazel/schema"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ChatSyncChannelLinkRepo extends Effect.Service<ChatSyncChannelLinkRepo>()(
	"ChatSyncChannelLinkRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.chatSyncChannelLinksTable,
				ChatSyncChannelLink.Model,
				{
					idColumn: "id",
					name: "ChatSyncChannelLink",
				},
			)
			const db = yield* Database.Database

			const findBySyncConnection = (syncConnectionId: SyncConnectionId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { syncConnectionId: SyncConnectionId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncChannelLinksTable)
								.where(
									and(
										eq(
											schema.chatSyncChannelLinksTable.syncConnectionId,
											data.syncConnectionId,
										),
										isNull(schema.chatSyncChannelLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ChatSyncChannelLink", "select"),
				)({ syncConnectionId }, tx)

			const findActiveBySyncConnection = (syncConnectionId: SyncConnectionId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { syncConnectionId: SyncConnectionId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncChannelLinksTable)
								.where(
									and(
										eq(
											schema.chatSyncChannelLinksTable.syncConnectionId,
											data.syncConnectionId,
										),
										eq(schema.chatSyncChannelLinksTable.isActive, true),
										isNull(schema.chatSyncChannelLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ChatSyncChannelLink", "select"),
				)({ syncConnectionId }, tx)

			const findByHazelChannel = (
				syncConnectionId: SyncConnectionId,
				hazelChannelId: ChannelId,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								syncConnectionId: SyncConnectionId
								hazelChannelId: ChannelId
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncChannelLinksTable)
									.where(
										and(
											eq(
												schema.chatSyncChannelLinksTable.syncConnectionId,
												data.syncConnectionId,
											),
											eq(
												schema.chatSyncChannelLinksTable.hazelChannelId,
												data.hazelChannelId,
											),
											isNull(schema.chatSyncChannelLinksTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("ChatSyncChannelLink", "select"),
					)({ syncConnectionId, hazelChannelId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const findByExternalChannel = (
				syncConnectionId: SyncConnectionId,
				externalChannelId: string,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								syncConnectionId: SyncConnectionId
								externalChannelId: string
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncChannelLinksTable)
									.where(
										and(
											eq(
												schema.chatSyncChannelLinksTable.syncConnectionId,
												data.syncConnectionId,
											),
											eq(
												schema.chatSyncChannelLinksTable.externalChannelId,
												data.externalChannelId,
											),
											isNull(schema.chatSyncChannelLinksTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("ChatSyncChannelLink", "select"),
					)({ syncConnectionId, externalChannelId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const findActiveByExternalChannel = (externalChannelId: string, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { externalChannelId: string }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncChannelLinksTable)
								.where(
									and(
										eq(
											schema.chatSyncChannelLinksTable.externalChannelId,
											data.externalChannelId,
										),
										eq(schema.chatSyncChannelLinksTable.isActive, true),
										isNull(schema.chatSyncChannelLinksTable.deletedAt),
									),
								),
						),
					policyRequire("ChatSyncChannelLink", "select"),
				)({ externalChannelId }, tx)

			const setActive = (id: SyncChannelLinkId, isActive: boolean, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncChannelLinkId; isActive: boolean }) =>
						execute((client) =>
							client
								.update(schema.chatSyncChannelLinksTable)
								.set({
									isActive: data.isActive,
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncChannelLinksTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncChannelLink", "update"),
				)({ id, isActive }, tx)

			const updateLastSyncedAt = (id: SyncChannelLinkId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncChannelLinkId }) =>
						execute((client) =>
							client
								.update(schema.chatSyncChannelLinksTable)
								.set({
									lastSyncedAt: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncChannelLinksTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncChannelLink", "update"),
				)({ id }, tx)

			const updateDirection = (
			id: SyncChannelLinkId,
			direction: ChatSyncChannelLink.ChatSyncDirection,
			tx?: TxFn,
		) =>
			db.makeQuery(
				(execute, data: { id: SyncChannelLinkId; direction: ChatSyncChannelLink.ChatSyncDirection }) =>
					execute((client) =>
						client
							.update(schema.chatSyncChannelLinksTable)
							.set({
								direction: data.direction,
								updatedAt: new Date(),
							})
							.where(eq(schema.chatSyncChannelLinksTable.id, data.id))
							.returning(),
					),
				policyRequire("ChatSyncChannelLink", "update"),
			)({ id, direction }, tx)

		const softDelete = (id: SyncChannelLinkId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncChannelLinkId }) =>
						execute((client) =>
							client
								.update(schema.chatSyncChannelLinksTable)
								.set({
									deletedAt: new Date(),
									isActive: false,
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncChannelLinksTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncChannelLink", "delete"),
				)({ id }, tx)

			return {
				...baseRepo,
				findBySyncConnection,
				findActiveBySyncConnection,
				findByHazelChannel,
				findByExternalChannel,
				findActiveByExternalChannel,
				setActive,
				updateDirection,
				updateLastSyncedAt,
				softDelete,
			}
		}),
	},
) {}

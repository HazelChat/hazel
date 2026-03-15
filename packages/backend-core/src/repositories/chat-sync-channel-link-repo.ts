import { and, Database, eq, isNull, ModelRepository, schema, type TxFn } from "@hazel/db"

import { ChatSyncChannelLink } from "@hazel/domain/models"
import type { ChannelId, ExternalChannelId, SyncChannelLinkId, SyncConnectionId } from "@hazel/schema"
import { ServiceMap, Effect, Option, Schema } from "effect"

export class ChatSyncChannelLinkRepo extends ServiceMap.Service<ChatSyncChannelLinkRepo>()(
	"ChatSyncChannelLinkRepo",
	{
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
			const decodeChannelLink = Schema.decodeUnknownSync(ChatSyncChannelLink.Model)
			const decodeChannelLinkRows = (rows: readonly unknown[]) =>
				rows.map((row) => decodeChannelLink(row))
			const decodeChannelLinkOption = <T>(value: Option.Option<T>) =>
				Option.map(value, decodeChannelLink)

			const insert = (...args: Parameters<typeof baseRepo.insert>) =>
				baseRepo.insert(...args).pipe(Effect.map(decodeChannelLinkRows)) as ReturnType<
					typeof baseRepo.insert
				>

			const findById = (id: SyncChannelLinkId, tx?: TxFn) =>
				db
					.makeQuery((execute, data: { id: SyncChannelLinkId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncChannelLinksTable)
								.where(
									and(
										eq(schema.chatSyncChannelLinksTable.id, data.id),
										isNull(schema.chatSyncChannelLinksTable.deletedAt),
									),
								)
								.limit(1),
						),
					)({ id }, tx)
					.pipe(
						Effect.map((results) =>
							Option.fromNullable(results[0]).pipe(decodeChannelLinkOption),
						),
					)

			const findBySyncConnection = (syncConnectionId: SyncConnectionId, tx?: TxFn) =>
				db
					.makeQuery((execute, data: { syncConnectionId: SyncConnectionId }) =>
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
					)({ syncConnectionId }, tx)
					.pipe(Effect.map(decodeChannelLinkRows))

			const findActiveBySyncConnection = (syncConnectionId: SyncConnectionId, tx?: TxFn) =>
				db
					.makeQuery((execute, data: { syncConnectionId: SyncConnectionId }) =>
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
					)({ syncConnectionId }, tx)
					.pipe(Effect.map(decodeChannelLinkRows))

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
					)({ syncConnectionId, hazelChannelId }, tx)
					.pipe(
						Effect.map((results) =>
							Option.fromNullable(results[0]).pipe(decodeChannelLinkOption),
						),
					)

			const findByExternalChannel = (
				syncConnectionId: SyncConnectionId,
				externalChannelId: ExternalChannelId,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								syncConnectionId: SyncConnectionId
								externalChannelId: ExternalChannelId
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
					)({ syncConnectionId, externalChannelId }, tx)
					.pipe(
						Effect.map((results) =>
							Option.fromNullable(results[0]).pipe(decodeChannelLinkOption),
						),
					)

			const findActiveByExternalChannel = (externalChannelId: ExternalChannelId, tx?: TxFn) =>
				db
					.makeQuery((execute, data: { externalChannelId: ExternalChannelId }) =>
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
					)({ externalChannelId }, tx)
					.pipe(Effect.map(decodeChannelLinkRows))

			const setActive = (id: SyncChannelLinkId, isActive: boolean, tx?: TxFn) =>
				db.makeQuery((execute, data: { id: SyncChannelLinkId; isActive: boolean }) =>
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
				)({ id, isActive }, tx)

			const updateLastSyncedAt = (id: SyncChannelLinkId, tx?: TxFn) =>
				db.makeQuery((execute, data: { id: SyncChannelLinkId }) =>
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
				)({ id }, tx)

			const updateDirection = (
				id: SyncChannelLinkId,
				direction: ChatSyncChannelLink.ChatSyncDirection,
				tx?: TxFn,
			) =>
				db.makeQuery(
					(
						execute,
						data: { id: SyncChannelLinkId; direction: ChatSyncChannelLink.ChatSyncDirection },
					) =>
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
				)({ id, direction }, tx)

			const softDelete = (id: SyncChannelLinkId, tx?: TxFn) =>
				db.makeQuery((execute, data: { id: SyncChannelLinkId }) =>
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
				)({ id }, tx)

			const updateSettings = (
				id: SyncChannelLinkId,
				settings: Record<string, unknown> | null,
				tx?: TxFn,
			) =>
				db.makeQuery(
					(execute, data: { id: SyncChannelLinkId; settings: Record<string, unknown> | null }) =>
						execute((client) =>
							client
								.update(schema.chatSyncChannelLinksTable)
								.set({
									settings: data.settings,
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncChannelLinksTable.id, data.id))
								.returning(),
						),
				)({ id, settings }, tx)

			return {
				...baseRepo,
				insert,
				findBySyncConnection,
				findById,
				findActiveBySyncConnection,
				findByHazelChannel,
				findByExternalChannel,
				findActiveByExternalChannel,
				setActive,
				updateDirection,
				updateLastSyncedAt,
				updateSettings,
				softDelete,
			}
		}),
	},
) {}

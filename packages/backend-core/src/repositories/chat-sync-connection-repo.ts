import { and, Database, eq, isNull, ModelRepository, schema, type TransactionClient } from "@hazel/db"
import { policyRequire } from "@hazel/domain"
import { ChatSyncConnection } from "@hazel/domain/models"
import type { IntegrationConnectionId, OrganizationId, SyncConnectionId } from "@hazel/schema"
import { Effect, Option } from "effect"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, any, never>

export class ChatSyncConnectionRepo extends Effect.Service<ChatSyncConnectionRepo>()(
	"ChatSyncConnectionRepo",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const baseRepo = yield* ModelRepository.makeRepository(
				schema.chatSyncConnectionsTable,
				ChatSyncConnection.Model,
				{
					idColumn: "id",
					name: "ChatSyncConnection",
				},
			)
			const db = yield* Database.Database

			const findByOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { organizationId: OrganizationId }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncConnectionsTable)
								.where(
									and(
										eq(schema.chatSyncConnectionsTable.organizationId, data.organizationId),
										isNull(schema.chatSyncConnectionsTable.deletedAt),
									),
								),
						),
					policyRequire("ChatSyncConnection", "select"),
				)({ organizationId }, tx)

			const findByProviderAndWorkspace = (
				organizationId: OrganizationId,
				provider: string,
				externalWorkspaceId: string,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(
							execute,
							data: {
								organizationId: OrganizationId
								provider: string
								externalWorkspaceId: string
							},
						) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncConnectionsTable)
									.where(
										and(
											eq(schema.chatSyncConnectionsTable.organizationId, data.organizationId),
											eq(schema.chatSyncConnectionsTable.provider, data.provider),
											eq(
												schema.chatSyncConnectionsTable.externalWorkspaceId,
												data.externalWorkspaceId,
											),
											isNull(schema.chatSyncConnectionsTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("ChatSyncConnection", "select"),
					)({ organizationId, provider, externalWorkspaceId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const findActiveByProvider = (provider: string, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { provider: string }) =>
						execute((client) =>
							client
								.select()
								.from(schema.chatSyncConnectionsTable)
								.where(
									and(
										eq(schema.chatSyncConnectionsTable.provider, data.provider),
										eq(schema.chatSyncConnectionsTable.status, "active"),
										isNull(schema.chatSyncConnectionsTable.deletedAt),
									),
								),
						),
					policyRequire("ChatSyncConnection", "select"),
				)({ provider }, tx)

			const findByIntegrationConnectionId = (
				integrationConnectionId: IntegrationConnectionId,
				tx?: TxFn,
			) =>
				db
					.makeQuery(
						(execute, data: { integrationConnectionId: IntegrationConnectionId }) =>
							execute((client) =>
								client
									.select()
									.from(schema.chatSyncConnectionsTable)
									.where(
										and(
											eq(
												schema.chatSyncConnectionsTable.integrationConnectionId,
												data.integrationConnectionId,
											),
											isNull(schema.chatSyncConnectionsTable.deletedAt),
										),
									)
									.limit(1),
							),
						policyRequire("ChatSyncConnection", "select"),
					)({ integrationConnectionId }, tx)
					.pipe(Effect.map((results) => Option.fromNullable(results[0])))

			const updateStatus = (
				id: SyncConnectionId,
				status: ChatSyncConnection.ChatSyncConnectionStatus,
				errorMessage?: string,
				tx?: TxFn,
			) =>
				db.makeQuery(
					(
						execute,
						data: {
							id: SyncConnectionId
							status: ChatSyncConnection.ChatSyncConnectionStatus
							errorMessage?: string
						},
					) =>
						execute((client) =>
							client
								.update(schema.chatSyncConnectionsTable)
								.set({
									status: data.status,
									errorMessage: data.errorMessage ?? null,
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncConnectionsTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncConnection", "update"),
				)({ id, status, errorMessage }, tx)

			const updateLastSyncedAt = (id: SyncConnectionId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncConnectionId }) =>
						execute((client) =>
							client
								.update(schema.chatSyncConnectionsTable)
								.set({
									lastSyncedAt: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncConnectionsTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncConnection", "update"),
				)({ id }, tx)

			const softDelete = (id: SyncConnectionId, tx?: TxFn) =>
				db.makeQuery(
					(execute, data: { id: SyncConnectionId }) =>
						execute((client) =>
							client
								.update(schema.chatSyncConnectionsTable)
								.set({
									deletedAt: new Date(),
									status: "disabled",
									updatedAt: new Date(),
								})
								.where(eq(schema.chatSyncConnectionsTable.id, data.id))
								.returning(),
						),
					policyRequire("ChatSyncConnection", "delete"),
				)({ id }, tx)

			return {
				...baseRepo,
				findByOrganization,
				findByProviderAndWorkspace,
				findActiveByProvider,
				findByIntegrationConnectionId,
				updateStatus,
				updateLastSyncedAt,
				softDelete,
			}
		}),
	},
) {}

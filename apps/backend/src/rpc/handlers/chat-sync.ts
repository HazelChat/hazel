import {
	ChatSyncChannelLinkRepo,
	ChatSyncConnectionRepo,
	IntegrationConnectionRepo,
} from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, InternalServerError, UnauthorizedError, withSystemActor } from "@hazel/domain"
import {
	ChatSyncChannelLinkExistsError,
	ChatSyncChannelLinkListResponse,
	ChatSyncChannelLinkNotFoundError,
	ChatSyncChannelLinkResponse,
	ChatSyncConnectionExistsError,
	ChatSyncIntegrationNotConnectedError,
	ChatSyncConnectionListResponse,
	ChatSyncConnectionNotFoundError,
	ChatSyncConnectionResponse,
	ChatSyncRpcs,
} from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"

const ensureOrgAccess = Effect.fn("chatSyncRpc.ensureOrgAccess")(function* (organizationId: string) {
	const currentUser = yield* CurrentUser.Context
	if (!currentUser.organizationId || currentUser.organizationId !== organizationId) {
		return yield* Effect.fail(
			new UnauthorizedError({
				message: "You are not authorized to access this organization",
				detail: `organizationId=${organizationId}`,
			}),
		)
	}
})

export const ChatSyncRpcLive = ChatSyncRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const connectionRepo = yield* ChatSyncConnectionRepo
		const channelLinkRepo = yield* ChatSyncChannelLinkRepo
		const integrationConnectionRepo = yield* IntegrationConnectionRepo

		return {
			"chatSync.connection.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* ensureOrgAccess(payload.organizationId)
							const currentUser = yield* CurrentUser.Context

							const integrationConnectionId = yield* Effect.gen(function* () {
								if (payload.provider !== "discord") {
									return payload.integrationConnectionId ?? null
								}

								if (payload.integrationConnectionId) {
									return payload.integrationConnectionId
								}

								const integrationOption = yield* integrationConnectionRepo
									.findOrgConnection(payload.organizationId, "discord")
									.pipe(withSystemActor)
								if (
									Option.isNone(integrationOption) ||
									integrationOption.value.status !== "active"
								) {
									return yield* Effect.fail(
										new ChatSyncIntegrationNotConnectedError({
											organizationId: payload.organizationId,
											provider: "discord",
										}),
									)
								}

								return integrationOption.value.id
							})

							const existing = yield* connectionRepo
								.findByProviderAndWorkspace(
									payload.organizationId,
									payload.provider,
									payload.externalWorkspaceId,
								)
								.pipe(withSystemActor)
							if (Option.isSome(existing)) {
								return yield* Effect.fail(
									new ChatSyncConnectionExistsError({
										organizationId: payload.organizationId,
										provider: payload.provider,
										externalWorkspaceId: payload.externalWorkspaceId,
									}),
								)
							}

							const [connection] = yield* connectionRepo
								.insert({
									organizationId: payload.organizationId,
									integrationConnectionId,
									provider: payload.provider,
									externalWorkspaceId: payload.externalWorkspaceId,
									externalWorkspaceName: payload.externalWorkspaceName ?? null,
									status: "active",
									settings: payload.settings ?? null,
									metadata: payload.metadata ?? null,
									errorMessage: null,
									lastSyncedAt: null,
									createdBy: currentUser.id,
									deletedAt: null,
								})
								.pipe(withSystemActor)

							const txid = yield* generateTransactionId()
							return new ChatSyncConnectionResponse({
								data: connection,
								transactionId: txid,
							})
						}),
					)
					.pipe(
						Effect.catchTag("ParseError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Invalid sync connection data",
									detail: String(error),
								}),
							),
						),
						Effect.catchTag("DatabaseError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while creating sync connection",
									detail: String(error),
								}),
							),
						),
					),

			"chatSync.connection.list": ({ organizationId }) =>
				Effect.gen(function* () {
					yield* ensureOrgAccess(organizationId)
					const data = yield* connectionRepo
						.findByOrganization(organizationId)
						.pipe(withSystemActor)
					return new ChatSyncConnectionListResponse({ data })
				}).pipe(
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while listing sync connections",
								detail: String(error),
							}),
						),
					),
				),

			"chatSync.connection.delete": ({ syncConnectionId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const connectionOption = yield* connectionRepo
								.findById(syncConnectionId)
								.pipe(withSystemActor)
							if (Option.isNone(connectionOption)) {
								return yield* Effect.fail(
									new ChatSyncConnectionNotFoundError({
										syncConnectionId,
									}),
								)
							}
							const connection = connectionOption.value
							yield* ensureOrgAccess(connection.organizationId)

							yield* connectionRepo.softDelete(syncConnectionId).pipe(withSystemActor)
							const links = yield* channelLinkRepo
								.findBySyncConnection(syncConnectionId)
								.pipe(withSystemActor)
							yield* Effect.forEach(
								links,
								(link) => channelLinkRepo.softDelete(link.id).pipe(withSystemActor),
								{
									concurrency: 10,
								},
							)

							const txid = yield* generateTransactionId()
							return { transactionId: txid }
						}),
					)
					.pipe(
						Effect.catchTag("DatabaseError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while deleting sync connection",
									detail: String(error),
								}),
							),
						),
					),

			"chatSync.channelLink.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const connectionOption = yield* connectionRepo
								.findById(payload.syncConnectionId)
								.pipe(withSystemActor)
							if (Option.isNone(connectionOption)) {
								return yield* Effect.fail(
									new ChatSyncConnectionNotFoundError({
										syncConnectionId: payload.syncConnectionId,
									}),
								)
							}
							const connection = connectionOption.value
							yield* ensureOrgAccess(connection.organizationId)

							const existingHazel = yield* channelLinkRepo
								.findByHazelChannel(payload.syncConnectionId, payload.hazelChannelId)
								.pipe(withSystemActor)
							if (Option.isSome(existingHazel)) {
								return yield* Effect.fail(
									new ChatSyncChannelLinkExistsError({
										syncConnectionId: payload.syncConnectionId,
										hazelChannelId: payload.hazelChannelId,
										externalChannelId: payload.externalChannelId,
									}),
								)
							}

							const existingExternal = yield* channelLinkRepo
								.findByExternalChannel(payload.syncConnectionId, payload.externalChannelId)
								.pipe(withSystemActor)
							if (Option.isSome(existingExternal)) {
								return yield* Effect.fail(
									new ChatSyncChannelLinkExistsError({
										syncConnectionId: payload.syncConnectionId,
										hazelChannelId: payload.hazelChannelId,
										externalChannelId: payload.externalChannelId,
									}),
								)
							}

							const [link] = yield* channelLinkRepo
								.insert({
									syncConnectionId: payload.syncConnectionId,
									hazelChannelId: payload.hazelChannelId,
									externalChannelId: payload.externalChannelId,
									externalChannelName: payload.externalChannelName ?? null,
									direction: payload.direction ?? "both",
									isActive: true,
									settings: payload.settings ?? null,
									lastSyncedAt: null,
									deletedAt: null,
								})
								.pipe(withSystemActor)

							const txid = yield* generateTransactionId()
							return new ChatSyncChannelLinkResponse({
								data: link,
								transactionId: txid,
							})
						}),
					)
					.pipe(
						Effect.catchTag("ParseError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Invalid channel link data",
									detail: String(error),
								}),
							),
						),
						Effect.catchTag("DatabaseError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while creating channel link",
									detail: String(error),
								}),
							),
						),
					),

			"chatSync.channelLink.list": ({ syncConnectionId }) =>
				Effect.gen(function* () {
					const connectionOption = yield* connectionRepo
						.findById(syncConnectionId)
						.pipe(withSystemActor)
					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(
							new ChatSyncConnectionNotFoundError({
								syncConnectionId,
							}),
						)
					}
					const connection = connectionOption.value
					yield* ensureOrgAccess(connection.organizationId)

					const data = yield* channelLinkRepo
						.findBySyncConnection(syncConnectionId)
						.pipe(withSystemActor)
					return new ChatSyncChannelLinkListResponse({ data })
				}).pipe(
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							new InternalServerError({
								message: "Database error while listing channel links",
								detail: String(error),
							}),
						),
					),
				),

			"chatSync.channelLink.delete": ({ syncChannelLinkId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const linkOption = yield* channelLinkRepo
								.findById(syncChannelLinkId)
								.pipe(withSystemActor)
							if (Option.isNone(linkOption)) {
								return yield* Effect.fail(
									new ChatSyncChannelLinkNotFoundError({
										syncChannelLinkId,
									}),
								)
							}
							const link = linkOption.value

							const connectionOption = yield* connectionRepo
								.findById(link.syncConnectionId)
								.pipe(withSystemActor)
							if (Option.isNone(connectionOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Sync connection not found for channel link",
										detail: `syncConnectionId=${link.syncConnectionId}`,
									}),
								)
							}
							yield* ensureOrgAccess(connectionOption.value.organizationId)

							yield* channelLinkRepo.softDelete(syncChannelLinkId).pipe(withSystemActor)
							const txid = yield* generateTransactionId()
							return { transactionId: txid }
						}),
					)
					.pipe(
						Effect.catchTag("DatabaseError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while deleting channel link",
									detail: String(error),
								}),
							),
						),
					),
			"chatSync.channelLink.update": ({ syncChannelLinkId, direction, isActive }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const linkOption = yield* channelLinkRepo
								.findById(syncChannelLinkId)
								.pipe(withSystemActor)
							if (Option.isNone(linkOption)) {
								return yield* Effect.fail(
									new ChatSyncChannelLinkNotFoundError({
										syncChannelLinkId,
									}),
								)
							}
							const link = linkOption.value

							const connectionOption = yield* connectionRepo
								.findById(link.syncConnectionId)
								.pipe(withSystemActor)
							if (Option.isNone(connectionOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Sync connection not found for channel link",
										detail: `syncConnectionId=${link.syncConnectionId}`,
									}),
								)
							}
							yield* ensureOrgAccess(connectionOption.value.organizationId)

							if (direction !== undefined) {
								yield* channelLinkRepo
									.updateDirection(syncChannelLinkId, direction)
									.pipe(withSystemActor)
							}
							if (isActive !== undefined) {
								yield* channelLinkRepo
									.setActive(syncChannelLinkId, isActive)
									.pipe(withSystemActor)
							}

							const updatedOption = yield* channelLinkRepo
								.findById(syncChannelLinkId)
								.pipe(withSystemActor)
							if (Option.isNone(updatedOption)) {
								return yield* Effect.fail(
									new ChatSyncChannelLinkNotFoundError({
										syncChannelLinkId,
									}),
								)
							}

							const txid = yield* generateTransactionId()
							return new ChatSyncChannelLinkResponse({
								data: updatedOption.value,
								transactionId: txid,
							})
						}),
					)
					.pipe(
						Effect.catchTag("DatabaseError", (error) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while updating channel link",
									detail: String(error),
								}),
							),
						),
					),
		}
	}),
)

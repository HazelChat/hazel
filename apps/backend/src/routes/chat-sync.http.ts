import {
	ChatSyncChannelLinkExistsError,
	ChatSyncChannelLinkNotFoundError,
	ChatSyncChannelLinkResponse,
	ChatSyncChannelLinkListResponse,
	ChatSyncConnectionExistsError,
	ChatSyncIntegrationNotConnectedError,
	ChatSyncConnectionNotFoundError,
	ChatSyncConnectionResponse,
	ChatSyncConnectionListResponse,
	ChatSyncDeleteResponse,
} from "@hazel/domain/http"
import {
	ChatSyncChannelLinkRepo,
	ChatSyncConnectionRepo,
	IntegrationConnectionRepo,
} from "@hazel/backend-core"
import { CurrentUser, InternalServerError, UnauthorizedError, withSystemActor } from "@hazel/domain"
import { HttpApiBuilder } from "@effect/platform"
import { Effect, Option } from "effect"
import { HazelApi } from "../api"
import { generateTransactionId } from "../lib/create-transactionId"

const ensureOrgAccess = Effect.fn("chatSync.ensureOrgAccess")(function* (organizationId: string) {
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

const toInternalServerError = (message: string, error: unknown) =>
	new InternalServerError({
		message,
		detail: String(error),
	})

export const HttpChatSyncLive = HttpApiBuilder.group(HazelApi, "chat-sync", (handlers) =>
	Effect.gen(function* () {
		const connectionRepo = yield* ChatSyncConnectionRepo
		const channelLinkRepo = yield* ChatSyncChannelLinkRepo
		const integrationConnectionRepo = yield* IntegrationConnectionRepo

		return handlers
			.handle("createConnection", ({ path, payload }) =>
				Effect.gen(function* () {
					yield* ensureOrgAccess(path.orgId)
					const currentUser = yield* CurrentUser.Context

					const integrationConnectionId = yield* Effect.gen(function* () {
						if (payload.provider !== "discord") {
							return payload.integrationConnectionId ?? null
						}

						if (payload.integrationConnectionId) {
							return payload.integrationConnectionId
						}

						const integrationOption = yield* integrationConnectionRepo
							.findOrgConnection(path.orgId, "discord")
							.pipe(withSystemActor)
						if (Option.isNone(integrationOption) || integrationOption.value.status !== "active") {
							return yield* Effect.fail(
								new ChatSyncIntegrationNotConnectedError({
									organizationId: path.orgId,
									provider: "discord",
								}),
							)
						}

						return integrationOption.value.id
					})

					const existing = yield* connectionRepo
						.findByProviderAndWorkspace(path.orgId, payload.provider, payload.externalWorkspaceId)
						.pipe(withSystemActor)
					if (Option.isSome(existing)) {
						return yield* Effect.fail(
							new ChatSyncConnectionExistsError({
								organizationId: path.orgId,
								provider: payload.provider,
								externalWorkspaceId: payload.externalWorkspaceId,
							}),
						)
					}

					const [connection] = yield* connectionRepo
						.insert({
							organizationId: path.orgId,
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
					return new ChatSyncConnectionResponse({ data: connection, transactionId: txid })
				}).pipe(
					Effect.catchTag("ParseError", (error) =>
						Effect.fail(toInternalServerError("Invalid sync connection data", error)),
					),
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							toInternalServerError("Database error while creating sync connection", error),
						),
					),
				),
			)
			.handle("listConnections", ({ path }) =>
				Effect.gen(function* () {
					yield* ensureOrgAccess(path.orgId)
					const connections = yield* connectionRepo
						.findByOrganization(path.orgId)
						.pipe(withSystemActor)
					return new ChatSyncConnectionListResponse({ data: connections })
				}).pipe(
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							toInternalServerError("Database error while listing sync connections", error),
						),
					),
				),
			)
			.handle("deleteConnection", ({ path }) =>
				Effect.gen(function* () {
					const connectionOption = yield* connectionRepo
						.findById(path.syncConnectionId)
						.pipe(withSystemActor)
					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(
							new ChatSyncConnectionNotFoundError({
								syncConnectionId: path.syncConnectionId,
							}),
						)
					}
					const connection = connectionOption.value
					yield* ensureOrgAccess(connection.organizationId)

					yield* connectionRepo.softDelete(path.syncConnectionId).pipe(withSystemActor)

					const links = yield* channelLinkRepo
						.findBySyncConnection(path.syncConnectionId)
						.pipe(withSystemActor)
					yield* Effect.forEach(
						links,
						(link) => channelLinkRepo.softDelete(link.id).pipe(withSystemActor),
						{
							concurrency: 10,
						},
					)

					const txid = yield* generateTransactionId()
					return new ChatSyncDeleteResponse({ transactionId: txid })
				}).pipe(
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							toInternalServerError("Database error while deleting sync connection", error),
						),
					),
				),
			)
			.handle("createChannelLink", ({ path, payload }) =>
				Effect.gen(function* () {
					const connectionOption = yield* connectionRepo
						.findById(path.syncConnectionId)
						.pipe(withSystemActor)
					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(
							new ChatSyncConnectionNotFoundError({
								syncConnectionId: path.syncConnectionId,
							}),
						)
					}
					const connection = connectionOption.value
					yield* ensureOrgAccess(connection.organizationId)

					const existingHazel = yield* channelLinkRepo
						.findByHazelChannel(path.syncConnectionId, payload.hazelChannelId)
						.pipe(withSystemActor)
					if (Option.isSome(existingHazel)) {
						return yield* Effect.fail(
							new ChatSyncChannelLinkExistsError({
								syncConnectionId: path.syncConnectionId,
								hazelChannelId: payload.hazelChannelId,
								externalChannelId: payload.externalChannelId,
							}),
						)
					}

					const existingExternal = yield* channelLinkRepo
						.findByExternalChannel(path.syncConnectionId, payload.externalChannelId)
						.pipe(withSystemActor)
					if (Option.isSome(existingExternal)) {
						return yield* Effect.fail(
							new ChatSyncChannelLinkExistsError({
								syncConnectionId: path.syncConnectionId,
								hazelChannelId: payload.hazelChannelId,
								externalChannelId: payload.externalChannelId,
							}),
						)
					}

					const [link] = yield* channelLinkRepo
						.insert({
							syncConnectionId: path.syncConnectionId,
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
					return new ChatSyncChannelLinkResponse({ data: link, transactionId: txid })
				}).pipe(
					Effect.catchTag("ParseError", (error) =>
						Effect.fail(toInternalServerError("Invalid channel link data", error)),
					),
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							toInternalServerError("Database error while creating channel link", error),
						),
					),
				),
			)
			.handle("listChannelLinks", ({ path }) =>
				Effect.gen(function* () {
					const connectionOption = yield* connectionRepo
						.findById(path.syncConnectionId)
						.pipe(withSystemActor)
					if (Option.isNone(connectionOption)) {
						return yield* Effect.fail(
							new ChatSyncConnectionNotFoundError({
								syncConnectionId: path.syncConnectionId,
							}),
						)
					}
					const connection = connectionOption.value
					yield* ensureOrgAccess(connection.organizationId)

					const links = yield* channelLinkRepo
						.findBySyncConnection(path.syncConnectionId)
						.pipe(withSystemActor)
					return new ChatSyncChannelLinkListResponse({ data: links })
				}).pipe(
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							toInternalServerError("Database error while listing channel links", error),
						),
					),
				),
			)
			.handle("deleteChannelLink", ({ path }) =>
				Effect.gen(function* () {
					const linkOption = yield* channelLinkRepo
						.findById(path.syncChannelLinkId)
						.pipe(withSystemActor)
					if (Option.isNone(linkOption)) {
						return yield* Effect.fail(
							new ChatSyncChannelLinkNotFoundError({
								syncChannelLinkId: path.syncChannelLinkId,
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

					yield* channelLinkRepo.softDelete(path.syncChannelLinkId).pipe(withSystemActor)
					const txid = yield* generateTransactionId()
					return new ChatSyncDeleteResponse({ transactionId: txid })
				}).pipe(
					Effect.catchTag("DatabaseError", (error) =>
						Effect.fail(
							toInternalServerError("Database error while deleting channel link", error),
						),
					),
				),
			)
	}),
)

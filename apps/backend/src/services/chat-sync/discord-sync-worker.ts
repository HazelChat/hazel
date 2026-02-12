import { createHash } from "node:crypto"
import { and, asc, Database, eq, isNull, schema } from "@hazel/db"
import {
	ChatSyncChannelLinkRepo,
	ChatSyncConnectionRepo,
	ChatSyncEventReceiptRepo,
	ChatSyncMessageLinkRepo,
	IntegrationConnectionRepo,
	MessageRepo,
	OrganizationMemberRepo,
	UserRepo,
} from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import { MessageId, ChannelId, OrganizationId, SyncChannelLinkId, SyncConnectionId } from "@hazel/schema"
import { Config, Effect, Option, Redacted, Schema } from "effect"
import { IntegrationBotService } from "../integrations/integration-bot-service"
import { Discord } from "@hazel/integrations"

export class DiscordSyncConfigurationError extends Schema.TaggedError<DiscordSyncConfigurationError>()(
	"DiscordSyncConfigurationError",
	{
		message: Schema.String,
	},
) {}

export class DiscordSyncConnectionNotFoundError extends Schema.TaggedError<DiscordSyncConnectionNotFoundError>()(
	"DiscordSyncConnectionNotFoundError",
	{
		syncConnectionId: SyncConnectionId,
	},
) {}

export class DiscordSyncChannelLinkNotFoundError extends Schema.TaggedError<DiscordSyncChannelLinkNotFoundError>()(
	"DiscordSyncChannelLinkNotFoundError",
	{
		syncConnectionId: SyncConnectionId,
		externalChannelId: Schema.optional(Schema.String),
	},
) {}

export class DiscordSyncMessageNotFoundError extends Schema.TaggedError<DiscordSyncMessageNotFoundError>()(
	"DiscordSyncMessageNotFoundError",
	{
		messageId: MessageId,
	},
) {}

export class DiscordSyncApiError extends Schema.TaggedError<DiscordSyncApiError>()("DiscordSyncApiError", {
	message: Schema.String,
	status: Schema.optional(Schema.Number),
	detail: Schema.optional(Schema.String),
}) {}

export interface DiscordIngressMessageCreate {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly content: string
	readonly externalAuthorId?: string
	readonly externalAuthorDisplayName?: string
	readonly externalAuthorAvatarUrl?: string | null
	readonly externalThreadId?: string | null
	readonly dedupeKey?: string
}

export interface DiscordIngressMessageUpdate {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly content: string
	readonly dedupeKey?: string
}

export interface DiscordIngressMessageDelete {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly dedupeKey?: string
}

export class DiscordSyncWorker extends Effect.Service<DiscordSyncWorker>()("DiscordSyncWorker", {
	accessors: true,
	effect: Effect.gen(function* () {
		const db = yield* Database.Database
		const connectionRepo = yield* ChatSyncConnectionRepo
		const channelLinkRepo = yield* ChatSyncChannelLinkRepo
		const messageLinkRepo = yield* ChatSyncMessageLinkRepo
		const eventReceiptRepo = yield* ChatSyncEventReceiptRepo
		const messageRepo = yield* MessageRepo
		const integrationConnectionRepo = yield* IntegrationConnectionRepo
		const userRepo = yield* UserRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const integrationBotService = yield* IntegrationBotService

		const getDiscordToken = Effect.fn("DiscordSyncWorker.getDiscordToken")(function* () {
			const discordBotToken = yield* Config.redacted("DISCORD_BOT_TOKEN").pipe(Effect.option)
			if (Option.isNone(discordBotToken)) {
				return yield* Effect.fail(
					new DiscordSyncConfigurationError({
						message: "DISCORD_BOT_TOKEN is not configured",
					}),
				)
			}
			return Redacted.value(discordBotToken.value)
		})

		const payloadHash = (value: unknown): string =>
			createHash("sha256").update(JSON.stringify(value)).digest("hex")
		const getStatusCode = (error: unknown): number | undefined => {
			if (typeof error !== "object" || error === null || !("status" in error)) {
				return undefined
			}

			const status = (error as { status: unknown }).status
			return typeof status === "number" ? status : undefined
		}

		const claimReceipt = Effect.fn("DiscordSyncWorker.claimReceipt")(function* (params: {
			syncConnectionId: SyncConnectionId
			channelLinkId?: SyncChannelLinkId
			source: "hazel" | "external"
			dedupeKey: string
		}) {
			return yield* eventReceiptRepo
				.claimByDedupeKey({
					syncConnectionId: params.syncConnectionId,
					channelLinkId: params.channelLinkId,
					source: params.source,
					dedupeKey: params.dedupeKey,
				})
				.pipe(withSystemActor)
		})

		const writeReceipt = Effect.fn("DiscordSyncWorker.writeReceipt")(function* (params: {
			syncConnectionId: SyncConnectionId
			channelLinkId?: SyncChannelLinkId
			source: "hazel" | "external"
			dedupeKey: string
			status?: "processed" | "ignored" | "failed"
			errorMessage?: string
			payload?: unknown
		}) {
			yield* eventReceiptRepo
				.updateByDedupeKey({
					syncConnectionId: params.syncConnectionId,
					source: params.source,
					dedupeKey: params.dedupeKey,
					channelLinkId: params.channelLinkId,
					externalEventId: null,
					payloadHash: params.payload ? payloadHash(params.payload) : null,
					status: params.status ?? "processed",
					errorMessage: params.errorMessage ?? null,
				})
				.pipe(withSystemActor)
		})

		const discordCreateMessage = Effect.fn("DiscordSyncWorker.discordCreateMessage")(function* (
			externalChannelId: string,
			content: string,
		) {
			const token = yield* getDiscordToken()
			return yield* Discord.DiscordApiClient.createMessage({
				channelId: externalChannelId,
				content,
				botToken: token,
			}).pipe(
				Effect.provide(Discord.DiscordApiClient.Default),
				Effect.mapError(
					(error) =>
						new DiscordSyncApiError({
							message: error.message,
							status: getStatusCode(error),
							detail: String(error),
						}),
				),
			)
		})

		const discordUpdateMessage = Effect.fn("DiscordSyncWorker.discordUpdateMessage")(function* (params: {
			externalChannelId: string
			externalMessageId: string
			content: string
		}) {
			const token = yield* getDiscordToken()
			yield* Discord.DiscordApiClient.updateMessage({
				channelId: params.externalChannelId,
				messageId: params.externalMessageId,
				content: params.content,
				botToken: token,
			}).pipe(
				Effect.provide(Discord.DiscordApiClient.Default),
				Effect.mapError(
					(error) =>
						new DiscordSyncApiError({
							message: error.message,
							status: getStatusCode(error),
							detail: String(error),
						}),
				),
			)
		})

		const discordDeleteMessage = Effect.fn("DiscordSyncWorker.discordDeleteMessage")(function* (params: {
			externalChannelId: string
			externalMessageId: string
		}) {
			const token = yield* getDiscordToken()
			yield* Discord.DiscordApiClient.deleteMessage({
				channelId: params.externalChannelId,
				messageId: params.externalMessageId,
				botToken: token,
			}).pipe(
				Effect.provide(Discord.DiscordApiClient.Default),
				Effect.mapError(
					(error) =>
						new DiscordSyncApiError({
							message: error.message,
							status: getStatusCode(error),
							detail: String(error),
						}),
				),
			)
		})

		const getOrCreateDiscordShadowUserId = Effect.fn(
			"DiscordSyncWorker.getOrCreateDiscordShadowUserId",
		)(function* (params: {
			organizationId: OrganizationId
			discordUserId: string
			displayName: string
			avatarUrl: string | null
		}) {
			const externalId = `discord-user-${params.discordUserId}`
			const user = yield* userRepo
				.upsertByExternalId(
					{
						externalId,
						email: `${externalId}@discord.internal`,
						firstName: params.displayName,
						lastName: "",
						avatarUrl: params.avatarUrl ?? "",
						userType: "machine",
						settings: null,
						isOnboarded: true,
						timezone: null,
						deletedAt: null,
					},
					{ syncAvatarUrl: true },
				)
				.pipe(withSystemActor)

			yield* organizationMemberRepo
				.upsertByOrgAndUser({
					organizationId: params.organizationId,
					userId: user.id,
					role: "member",
					nickname: null,
					joinedAt: new Date(),
					invitedBy: null,
					deletedAt: null,
				})
				.pipe(withSystemActor)

			return user.id
		})

		const resolveDiscordAuthorUserId = Effect.fn("DiscordSyncWorker.resolveDiscordAuthorUserId")(
			function* (params: {
				organizationId: OrganizationId
				discordUserId: string
				displayName: string
				avatarUrl: string | null
			}) {
				const linkedConnection = yield* integrationConnectionRepo
					.findActiveUserByExternalAccountId(params.organizationId, "discord", params.discordUserId)
					.pipe(withSystemActor)

				if (Option.isSome(linkedConnection) && linkedConnection.value.userId) {
					return linkedConnection.value.userId
				}

				return yield* getOrCreateDiscordShadowUserId(params)
			},
		)

		const syncHazelMessageToDiscord = Effect.fn("DiscordSyncWorker.syncHazelMessageToDiscord")(function* (
			syncConnectionId: SyncConnectionId,
			hazelMessageId: MessageId,
			dedupeKeyOverride?: string,
		) {
			const dedupeKey = dedupeKeyOverride ?? `hazel:message:create:${hazelMessageId}`
			const claimed = yield* claimReceipt({ syncConnectionId, source: "hazel", dedupeKey })
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return yield* Effect.fail(
					new DiscordSyncMessageNotFoundError({
						messageId: hazelMessageId,
					}),
				)
			}
			const message = messageOption.value

			const linkOption = yield* channelLinkRepo
				.findByHazelChannel(syncConnectionId, message.channelId)
				.pipe(withSystemActor)
			if (Option.isNone(linkOption)) {
				return yield* Effect.fail(
					new DiscordSyncChannelLinkNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const link = linkOption.value

			const existingMessageLink = yield* messageLinkRepo
				.findByHazelMessage(link.id, hazelMessageId)
				.pipe(withSystemActor)
			if (Option.isSome(existingMessageLink)) {
				yield* writeReceipt({
					syncConnectionId,
					channelLinkId: link.id,
					source: "hazel",
					dedupeKey,
					status: "ignored",
				})
				return { status: "already_linked" as const }
			}

			const externalMessageId = yield* discordCreateMessage(link.externalChannelId, message.content)

			yield* messageLinkRepo
				.insert({
					channelLinkId: link.id,
					hazelMessageId: message.id,
					externalMessageId,
					source: "hazel",
					rootHazelMessageId: null,
					rootExternalMessageId: null,
					hazelThreadChannelId: message.threadChannelId,
					externalThreadId: null,
					deletedAt: null,
				})
				.pipe(withSystemActor)

			yield* writeReceipt({
				syncConnectionId,
				channelLinkId: link.id,
				source: "hazel",
				dedupeKey,
				payload: {
					hazelMessageId,
					externalMessageId,
				},
			})
			yield* connectionRepo.updateLastSyncedAt(syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "synced" as const, externalMessageId }
		})

		const syncConnection = Effect.fn("DiscordSyncWorker.syncConnection")(function* (
			syncConnectionId: SyncConnectionId,
			maxMessagesPerChannel = 50,
		) {
			const connectionOption = yield* connectionRepo.findById(syncConnectionId).pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			if (connection.provider !== "discord") {
				return { sent: 0, skipped: 0, failed: 0 }
			}
			if (connection.status !== "active") {
				return { sent: 0, skipped: 0, failed: 0 }
			}

			const links = yield* channelLinkRepo
				.findActiveBySyncConnection(syncConnectionId)
				.pipe(withSystemActor)

			let sent = 0
			let skipped = 0
			let failed = 0

			for (const link of links) {
				const unsyncedMessages = yield* db.execute((client) =>
					client
						.select({
							id: schema.messagesTable.id,
						})
						.from(schema.messagesTable)
						.leftJoin(
							schema.chatSyncMessageLinksTable,
							and(
								eq(schema.chatSyncMessageLinksTable.channelLinkId, link.id),
								eq(schema.chatSyncMessageLinksTable.hazelMessageId, schema.messagesTable.id),
								isNull(schema.chatSyncMessageLinksTable.deletedAt),
							),
						)
						.where(
							and(
								eq(schema.messagesTable.channelId, link.hazelChannelId),
								isNull(schema.messagesTable.deletedAt),
								isNull(schema.chatSyncMessageLinksTable.id),
							),
						)
						.orderBy(asc(schema.messagesTable.createdAt), asc(schema.messagesTable.id))
						.limit(maxMessagesPerChannel),
				)

				for (const unsyncedMessage of unsyncedMessages) {
					const result = yield* syncHazelMessageToDiscord(
						syncConnectionId,
						unsyncedMessage.id,
					).pipe(Effect.either)
					if (result._tag === "Right") {
						if (result.right.status === "synced") {
							sent++
						} else {
							skipped++
						}
					} else {
						failed++
						yield* Effect.logWarning("Failed to sync Hazel message to Discord", {
							syncConnectionId,
							hazelMessageId: unsyncedMessage.id,
							error: result.left,
						})
					}
				}
			}

			return { sent, skipped, failed }
		})

		const syncHazelMessageUpdateToDiscord = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageUpdateToDiscord",
		)(function* (
			syncConnectionId: SyncConnectionId,
			hazelMessageId: MessageId,
			dedupeKeyOverride?: string,
		) {
			const dedupeKey = dedupeKeyOverride ?? `hazel:message:update:${hazelMessageId}`
			const claimed = yield* claimReceipt({ syncConnectionId, source: "hazel", dedupeKey })
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return yield* Effect.fail(new DiscordSyncMessageNotFoundError({ messageId: hazelMessageId }))
			}
			const message = messageOption.value

			const linkOption = yield* channelLinkRepo
				.findByHazelChannel(syncConnectionId, message.channelId)
				.pipe(withSystemActor)
			if (Option.isNone(linkOption)) {
				return yield* Effect.fail(
					new DiscordSyncChannelLinkNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const link = linkOption.value

			const messageLinkOption = yield* messageLinkRepo
				.findByHazelMessage(link.id, hazelMessageId)
				.pipe(withSystemActor)
			if (Option.isNone(messageLinkOption)) {
				yield* writeReceipt({
					syncConnectionId,
					channelLinkId: link.id,
					source: "hazel",
					dedupeKey,
					status: "ignored",
					payload: { hazelMessageId },
				})
				return { status: "ignored_missing_link" as const }
			}
			const messageLink = messageLinkOption.value

			yield* discordUpdateMessage({
				externalChannelId: link.externalChannelId,
				externalMessageId: messageLink.externalMessageId,
				content: message.content,
			})

			yield* messageLinkRepo.updateLastSyncedAt(messageLink.id).pipe(withSystemActor)
			yield* writeReceipt({
				syncConnectionId,
				channelLinkId: link.id,
				source: "hazel",
				dedupeKey,
				payload: {
					hazelMessageId,
					externalMessageId: messageLink.externalMessageId,
				},
			})
			yield* connectionRepo.updateLastSyncedAt(syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "updated" as const, externalMessageId: messageLink.externalMessageId }
		})

		const syncHazelMessageDeleteToDiscord = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageDeleteToDiscord",
		)(function* (
			syncConnectionId: SyncConnectionId,
			hazelMessageId: MessageId,
			dedupeKeyOverride?: string,
		) {
			const dedupeKey = dedupeKeyOverride ?? `hazel:message:delete:${hazelMessageId}`
			const claimed = yield* claimReceipt({ syncConnectionId, source: "hazel", dedupeKey })
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return yield* Effect.fail(new DiscordSyncMessageNotFoundError({ messageId: hazelMessageId }))
			}
			const message = messageOption.value

			const linkOption = yield* channelLinkRepo
				.findByHazelChannel(syncConnectionId, message.channelId)
				.pipe(withSystemActor)
			if (Option.isNone(linkOption)) {
				return yield* Effect.fail(
					new DiscordSyncChannelLinkNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const link = linkOption.value

			const messageLinkOption = yield* messageLinkRepo
				.findByHazelMessage(link.id, hazelMessageId)
				.pipe(withSystemActor)
			if (Option.isNone(messageLinkOption)) {
				yield* writeReceipt({
					syncConnectionId,
					channelLinkId: link.id,
					source: "hazel",
					dedupeKey,
					status: "ignored",
					payload: { hazelMessageId },
				})
				return { status: "ignored_missing_link" as const }
			}
			const messageLink = messageLinkOption.value

			yield* discordDeleteMessage({
				externalChannelId: link.externalChannelId,
				externalMessageId: messageLink.externalMessageId,
			})

			yield* messageLinkRepo.softDelete(messageLink.id).pipe(withSystemActor)
			yield* writeReceipt({
				syncConnectionId,
				channelLinkId: link.id,
				source: "hazel",
				dedupeKey,
				payload: {
					hazelMessageId,
					externalMessageId: messageLink.externalMessageId,
				},
			})
			yield* connectionRepo.updateLastSyncedAt(syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "deleted" as const, externalMessageId: messageLink.externalMessageId }
		})

		const getActiveOutboundTargets = Effect.fn("DiscordSyncWorker.getActiveOutboundTargets")(function* (
			hazelChannelId: ChannelId,
		) {
			const targets = yield* db.execute((client) =>
				client
					.select({
						syncConnectionId: schema.chatSyncConnectionsTable.id,
						channelLinkId: schema.chatSyncChannelLinksTable.id,
						direction: schema.chatSyncChannelLinksTable.direction,
					})
					.from(schema.chatSyncChannelLinksTable)
					.innerJoin(
						schema.chatSyncConnectionsTable,
						eq(
							schema.chatSyncConnectionsTable.id,
							schema.chatSyncChannelLinksTable.syncConnectionId,
						),
					)
					.where(
						and(
							eq(schema.chatSyncChannelLinksTable.hazelChannelId, hazelChannelId),
							eq(schema.chatSyncChannelLinksTable.isActive, true),
							isNull(schema.chatSyncChannelLinksTable.deletedAt),
							eq(schema.chatSyncConnectionsTable.provider, "discord"),
							eq(schema.chatSyncConnectionsTable.status, "active"),
							isNull(schema.chatSyncConnectionsTable.deletedAt),
						),
					),
			)
			return targets
		})

		const syncHazelMessageCreateToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageCreateToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return { synced: 0, failed: 0 }
			}
			const targets = yield* getActiveOutboundTargets(messageOption.value.channelId)
			let synced = 0
			let failed = 0

			for (const target of targets) {
				if (target.direction === "external_to_hazel") continue
				const result = yield* syncHazelMessageToDiscord(
					target.syncConnectionId,
					hazelMessageId,
					dedupeKey,
				).pipe(Effect.either)
				if (result._tag === "Right") {
					if (result.right.status === "synced" || result.right.status === "already_linked") {
						synced++
					}
				} else {
					failed++
					yield* Effect.logWarning("Failed to sync create message to Discord", {
						hazelMessageId,
						syncConnectionId: target.syncConnectionId,
						error: result.left,
					})
				}
			}

			return { synced, failed }
		})

		const syncHazelMessageUpdateToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageUpdateToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return { synced: 0, failed: 0 }
			}
			const targets = yield* getActiveOutboundTargets(messageOption.value.channelId)
			let synced = 0
			let failed = 0

			for (const target of targets) {
				if (target.direction === "external_to_hazel") continue
				const result = yield* syncHazelMessageUpdateToDiscord(
					target.syncConnectionId,
					hazelMessageId,
					dedupeKey,
				).pipe(Effect.either)
				if (result._tag === "Right") {
					if (result.right.status === "updated") {
						synced++
					}
				} else {
					failed++
					yield* Effect.logWarning("Failed to sync update message to Discord", {
						hazelMessageId,
						syncConnectionId: target.syncConnectionId,
						error: result.left,
					})
				}
			}

			return { synced, failed }
		})

		const syncHazelMessageDeleteToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageDeleteToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return { synced: 0, failed: 0 }
			}
			const targets = yield* getActiveOutboundTargets(messageOption.value.channelId)
			let synced = 0
			let failed = 0

			for (const target of targets) {
				if (target.direction === "external_to_hazel") continue
				const result = yield* syncHazelMessageDeleteToDiscord(
					target.syncConnectionId,
					hazelMessageId,
					dedupeKey,
				).pipe(Effect.either)
				if (result._tag === "Right") {
					if (result.right.status === "deleted") {
						synced++
					}
				} else {
					failed++
					yield* Effect.logWarning("Failed to sync delete message to Discord", {
						hazelMessageId,
						syncConnectionId: target.syncConnectionId,
						error: result.left,
					})
				}
			}

			return { synced, failed }
		})

		const syncAllActiveConnections = Effect.fn("DiscordSyncWorker.syncAllActiveConnections")(function* (
			maxMessagesPerChannel = 50,
		) {
			const connections = yield* connectionRepo.findActiveByProvider("discord").pipe(withSystemActor)
			return yield* Effect.forEach(
				connections,
				(connection) =>
					syncConnection(connection.id, maxMessagesPerChannel).pipe(
						Effect.map((summary) => ({
							syncConnectionId: connection.id,
							...summary,
						})),
					),
				{ concurrency: 5 },
			)
		})

		const ingestMessageCreate = Effect.fn("DiscordSyncWorker.ingestMessageCreate")(function* (
			payload: DiscordIngressMessageCreate,
		) {
			const dedupeKey = payload.dedupeKey ?? `discord:message:create:${payload.externalMessageId}`
			const claimed = yield* claimReceipt({
				syncConnectionId: payload.syncConnectionId,
				source: "external",
				dedupeKey,
			})
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const connectionOption = yield* connectionRepo
				.findById(payload.syncConnectionId)
				.pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId: payload.syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			if (connection.provider !== "discord" || connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}

			const linkOption = yield* channelLinkRepo
				.findByExternalChannel(payload.syncConnectionId, payload.externalChannelId)
				.pipe(withSystemActor)
			if (Option.isNone(linkOption)) {
				return yield* Effect.fail(
					new DiscordSyncChannelLinkNotFoundError({
						syncConnectionId: payload.syncConnectionId,
						externalChannelId: payload.externalChannelId,
					}),
				)
			}
			const link = linkOption.value

			const existingMessageLink = yield* messageLinkRepo
				.findByExternalMessage(link.id, payload.externalMessageId)
				.pipe(withSystemActor)
			if (Option.isSome(existingMessageLink)) {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					channelLinkId: link.id,
					source: "external",
					dedupeKey,
					status: "ignored",
				})
				return { status: "already_linked" as const }
			}

			const authorId = payload.externalAuthorId
				? yield* resolveDiscordAuthorUserId({
						organizationId: connection.organizationId,
						discordUserId: payload.externalAuthorId,
						displayName: payload.externalAuthorDisplayName ?? "Discord User",
						avatarUrl: payload.externalAuthorAvatarUrl ?? null,
					})
				: (
						yield* integrationBotService.getOrCreateBotUser(
							"discord",
							connection.organizationId,
						)
					).id
			const [message] = yield* messageRepo
				.insert({
					channelId: link.hazelChannelId,
					authorId,
					content: payload.content,
					embeds: null,
					replyToMessageId: null,
					threadChannelId: null,
					deletedAt: null,
				})
				.pipe(withSystemActor)

			yield* messageLinkRepo
				.insert({
					channelLinkId: link.id,
					hazelMessageId: message.id,
					externalMessageId: payload.externalMessageId,
					source: "external",
					rootHazelMessageId: null,
					rootExternalMessageId: null,
					hazelThreadChannelId: message.threadChannelId,
					externalThreadId: payload.externalThreadId ?? null,
					deletedAt: null,
				})
				.pipe(withSystemActor)

			yield* writeReceipt({
				syncConnectionId: payload.syncConnectionId,
				channelLinkId: link.id,
				source: "external",
				dedupeKey,
				payload,
			})
			yield* connectionRepo.updateLastSyncedAt(payload.syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "created" as const, hazelMessageId: message.id }
		})

		const ingestMessageUpdate = Effect.fn("DiscordSyncWorker.ingestMessageUpdate")(function* (
			payload: DiscordIngressMessageUpdate,
		) {
			const dedupeKey = payload.dedupeKey ?? `discord:message:update:${payload.externalMessageId}`
			const claimed = yield* claimReceipt({
				syncConnectionId: payload.syncConnectionId,
				source: "external",
				dedupeKey,
			})
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const connectionOption = yield* connectionRepo
				.findById(payload.syncConnectionId)
				.pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId: payload.syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			if (connection.provider !== "discord" || connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}

			const linkOption = yield* channelLinkRepo
				.findByExternalChannel(payload.syncConnectionId, payload.externalChannelId)
				.pipe(withSystemActor)
			if (Option.isNone(linkOption)) {
				return yield* Effect.fail(
					new DiscordSyncChannelLinkNotFoundError({
						syncConnectionId: payload.syncConnectionId,
						externalChannelId: payload.externalChannelId,
					}),
				)
			}
			const link = linkOption.value

			const messageLinkOption = yield* messageLinkRepo
				.findByExternalMessage(link.id, payload.externalMessageId)
				.pipe(withSystemActor)
			if (Option.isNone(messageLinkOption)) {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					channelLinkId: link.id,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_missing_link" as const }
			}
			const messageLink = messageLinkOption.value

			yield* messageRepo
				.update({
					id: messageLink.hazelMessageId,
					content: payload.content,
					updatedAt: new Date(),
				})
				.pipe(withSystemActor)

			yield* writeReceipt({
				syncConnectionId: payload.syncConnectionId,
				channelLinkId: link.id,
				source: "external",
				dedupeKey,
				payload,
			})
			yield* connectionRepo.updateLastSyncedAt(payload.syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "updated" as const, hazelMessageId: messageLink.hazelMessageId }
		})

		const ingestMessageDelete = Effect.fn("DiscordSyncWorker.ingestMessageDelete")(function* (
			payload: DiscordIngressMessageDelete,
		) {
			const dedupeKey = payload.dedupeKey ?? `discord:message:delete:${payload.externalMessageId}`
			const claimed = yield* claimReceipt({
				syncConnectionId: payload.syncConnectionId,
				source: "external",
				dedupeKey,
			})
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const connectionOption = yield* connectionRepo
				.findById(payload.syncConnectionId)
				.pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId: payload.syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			if (connection.provider !== "discord" || connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}

			const linkOption = yield* channelLinkRepo
				.findByExternalChannel(payload.syncConnectionId, payload.externalChannelId)
				.pipe(withSystemActor)
			if (Option.isNone(linkOption)) {
				return yield* Effect.fail(
					new DiscordSyncChannelLinkNotFoundError({
						syncConnectionId: payload.syncConnectionId,
						externalChannelId: payload.externalChannelId,
					}),
				)
			}
			const link = linkOption.value

			const messageLinkOption = yield* messageLinkRepo
				.findByExternalMessage(link.id, payload.externalMessageId)
				.pipe(withSystemActor)
			if (Option.isNone(messageLinkOption)) {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					channelLinkId: link.id,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_missing_link" as const }
			}
			const messageLink = messageLinkOption.value

			yield* messageRepo
				.update({
					id: messageLink.hazelMessageId,
					deletedAt: new Date(),
					updatedAt: new Date(),
				})
				.pipe(withSystemActor)

			yield* writeReceipt({
				syncConnectionId: payload.syncConnectionId,
				channelLinkId: link.id,
				source: "external",
				dedupeKey,
				payload,
			})
			yield* connectionRepo.updateLastSyncedAt(payload.syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "deleted" as const, hazelMessageId: messageLink.hazelMessageId }
		})

		return {
			syncConnection,
			syncAllActiveConnections,
			syncHazelMessageToDiscord,
			syncHazelMessageUpdateToDiscord,
			syncHazelMessageDeleteToDiscord,
			syncHazelMessageCreateToAllConnections,
			syncHazelMessageUpdateToAllConnections,
			syncHazelMessageDeleteToAllConnections,
			ingestMessageCreate,
			ingestMessageUpdate,
			ingestMessageDelete,
		}
	}),
	dependencies: [
		ChatSyncConnectionRepo.Default,
		ChatSyncChannelLinkRepo.Default,
		ChatSyncMessageLinkRepo.Default,
		ChatSyncEventReceiptRepo.Default,
		MessageRepo.Default,
		IntegrationConnectionRepo.Default,
		UserRepo.Default,
		OrganizationMemberRepo.Default,
		IntegrationBotService.Default,
	],
}) {}

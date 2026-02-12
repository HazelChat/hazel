import { createHash } from "node:crypto"
import { and, asc, Database, eq, isNull, schema } from "@hazel/db"
import {
	ChannelRepo,
	ChatSyncChannelLinkRepo,
	ChatSyncConnectionRepo,
	ChatSyncEventReceiptRepo,
	ChatSyncMessageLinkRepo,
	IntegrationConnectionRepo,
	MessageReactionRepo,
	MessageRepo,
	OrganizationMemberRepo,
	UserRepo,
} from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import { IntegrationConnection } from "@hazel/domain/models"
import {
	MessageId,
	MessageReactionId,
	ChannelId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	UserId,
} from "@hazel/schema"
import { Effect, Option, Schema } from "effect"
import { ChannelAccessSyncService } from "../channel-access-sync"
import { IntegrationBotService } from "../integrations/integration-bot-service"
import { ChatSyncProviderRegistry } from "./chat-sync-provider-registry"

export const DEFAULT_MAX_MESSAGES_PER_CHANNEL = 50
export const DEFAULT_CHAT_SYNC_CONCURRENCY = 5

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

export interface ChatSyncIngressMessageCreate {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly content: string
	readonly externalAuthorId?: string
	readonly externalAuthorDisplayName?: string
	readonly externalAuthorAvatarUrl?: string | null
	readonly externalReplyToMessageId?: string | null
	readonly externalThreadId?: string | null
	readonly dedupeKey?: string
}

export interface ChatSyncIngressMessageUpdate {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly content: string
	readonly dedupeKey?: string
}

export interface ChatSyncIngressMessageDelete {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly dedupeKey?: string
}

export interface ChatSyncIngressReactionAdd {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly externalUserId: string
	readonly emoji: string
	readonly dedupeKey?: string
}

export interface ChatSyncIngressReactionRemove {
	readonly syncConnectionId: SyncConnectionId
	readonly externalChannelId: string
	readonly externalMessageId: string
	readonly externalUserId: string
	readonly emoji: string
	readonly dedupeKey?: string
}

export interface ChatSyncIngressThreadCreate {
	readonly syncConnectionId: SyncConnectionId
	readonly externalParentChannelId: string
	readonly externalThreadId: string
	readonly externalRootMessageId?: string | null
	readonly name?: string | null
	readonly dedupeKey?: string
}

export class ChatSyncCoreWorker extends Effect.Service<ChatSyncCoreWorker>()("ChatSyncCoreWorker", {
	accessors: true,
	effect: Effect.gen(function* () {
		const db = yield* Database.Database
		const connectionRepo = yield* ChatSyncConnectionRepo
		const channelLinkRepo = yield* ChatSyncChannelLinkRepo
		const messageLinkRepo = yield* ChatSyncMessageLinkRepo
		const eventReceiptRepo = yield* ChatSyncEventReceiptRepo
		const messageRepo = yield* MessageRepo
		const messageReactionRepo = yield* MessageReactionRepo
		const channelRepo = yield* ChannelRepo
		const integrationConnectionRepo = yield* IntegrationConnectionRepo
		const userRepo = yield* UserRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const integrationBotService = yield* IntegrationBotService
		const channelAccessSyncService = yield* ChannelAccessSyncService
		const providerRegistry = yield* ChatSyncProviderRegistry

		const payloadHash = (value: unknown): string =>
			createHash("sha256").update(JSON.stringify(value)).digest("hex")

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

		const getProviderAdapter = Effect.fn("ChatSyncCoreWorker.getProviderAdapter")(function* (
			provider: string,
		) {
			return yield* providerRegistry.getAdapter(provider)
		})

		const getOrCreateShadowUserId = Effect.fn("DiscordSyncWorker.getOrCreateShadowUserId")(
			function* (params: {
				provider: string
				organizationId: OrganizationId
				externalUserId: string
				displayName: string
				avatarUrl: string | null
			}) {
				const externalId = `${params.provider}-user-${params.externalUserId}`
				const user = yield* userRepo
					.upsertByExternalId(
						{
							externalId,
							email: `${externalId}@${params.provider}.internal`,
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
			},
		)

		const decodeProvider = Schema.decodeUnknownSync(IntegrationConnection.IntegrationProvider)

		const resolveAuthorUserId = Effect.fn("DiscordSyncWorker.resolveAuthorUserId")(function* (params: {
			provider: string
			organizationId: OrganizationId
			externalUserId: string
			displayName: string
			avatarUrl: string | null
		}) {
			const linkedConnection = yield* integrationConnectionRepo
				.findActiveUserByExternalAccountId(
					params.organizationId,
					decodeProvider(params.provider),
					params.externalUserId,
				)
				.pipe(withSystemActor)

			if (Option.isSome(linkedConnection) && linkedConnection.value.userId) {
				return linkedConnection.value.userId
			}

			return yield* getOrCreateShadowUserId(params)
		})

		const resolveExternalMessageId = Effect.fn("DiscordSyncWorker.resolveExternalMessageId")(function* (
			params: {
				syncConnectionId: SyncConnectionId
				hazelMessageId: MessageId
				preferredChannelLinkId?: SyncChannelLinkId
			},
		) {
			if (params.preferredChannelLinkId) {
				const preferred = yield* messageLinkRepo
					.findByHazelMessage(params.preferredChannelLinkId, params.hazelMessageId)
					.pipe(withSystemActor)
				if (Option.isSome(preferred)) {
					return Option.some(preferred.value.externalMessageId)
				}
			}

			const links = yield* db.execute((client) =>
				client
					.select({
						externalMessageId: schema.chatSyncMessageLinksTable.externalMessageId,
					})
					.from(schema.chatSyncMessageLinksTable)
					.innerJoin(
						schema.chatSyncChannelLinksTable,
						and(
							eq(
								schema.chatSyncChannelLinksTable.id,
								schema.chatSyncMessageLinksTable.channelLinkId,
							),
							eq(
								schema.chatSyncChannelLinksTable.syncConnectionId,
								params.syncConnectionId,
							),
							isNull(schema.chatSyncChannelLinksTable.deletedAt),
						),
					)
					.where(
						and(
							eq(schema.chatSyncMessageLinksTable.hazelMessageId, params.hazelMessageId),
							isNull(schema.chatSyncMessageLinksTable.deletedAt),
						),
					)
					.limit(1),
			)
			return Option.fromNullable(links[0]?.externalMessageId)
		})

		const resolveHazelMessageId = Effect.fn("DiscordSyncWorker.resolveHazelMessageId")(function* (params: {
			syncConnectionId: SyncConnectionId
			externalMessageId: string
			preferredChannelLinkId?: SyncChannelLinkId
		}) {
			if (params.preferredChannelLinkId) {
				const preferred = yield* messageLinkRepo
					.findByExternalMessage(params.preferredChannelLinkId, params.externalMessageId)
					.pipe(withSystemActor)
				if (Option.isSome(preferred)) {
					return Option.some(preferred.value.hazelMessageId)
				}
			}

			const links = yield* db.execute((client) =>
				client
					.select({
						hazelMessageId: schema.chatSyncMessageLinksTable.hazelMessageId,
					})
					.from(schema.chatSyncMessageLinksTable)
					.innerJoin(
						schema.chatSyncChannelLinksTable,
						and(
							eq(
								schema.chatSyncChannelLinksTable.id,
								schema.chatSyncMessageLinksTable.channelLinkId,
							),
							eq(
								schema.chatSyncChannelLinksTable.syncConnectionId,
								params.syncConnectionId,
							),
							isNull(schema.chatSyncChannelLinksTable.deletedAt),
						),
					)
					.where(
						and(
							eq(
								schema.chatSyncMessageLinksTable.externalMessageId,
								params.externalMessageId,
							),
							isNull(schema.chatSyncMessageLinksTable.deletedAt),
						),
					)
					.limit(1),
			)
			return Option.fromNullable(links[0]?.hazelMessageId)
		})

		const resolveOrCreateOutboundLinkForMessage = Effect.fn(
			"DiscordSyncWorker.resolveOrCreateOutboundLinkForMessage",
		)(
			function* (params: {
				syncConnectionId: SyncConnectionId
				provider: string
				hazelChannelId: ChannelId
			}) {
				const directLink = yield* channelLinkRepo
					.findByHazelChannel(params.syncConnectionId, params.hazelChannelId)
					.pipe(withSystemActor)
				if (Option.isSome(directLink)) {
					return directLink.value
				}

				const channelOption = yield* channelRepo.findById(params.hazelChannelId).pipe(withSystemActor)
				if (Option.isNone(channelOption)) {
					return yield* Effect.fail(
						new DiscordSyncChannelLinkNotFoundError({
							syncConnectionId: params.syncConnectionId,
						}),
					)
				}
				const channel = channelOption.value

				if (channel.type !== "thread" || !channel.parentChannelId) {
					return yield* Effect.fail(
						new DiscordSyncChannelLinkNotFoundError({
							syncConnectionId: params.syncConnectionId,
						}),
					)
				}

				const parentLinkOption = yield* channelLinkRepo
					.findByHazelChannel(params.syncConnectionId, channel.parentChannelId)
					.pipe(withSystemActor)
				if (Option.isNone(parentLinkOption)) {
					return yield* Effect.fail(
						new DiscordSyncChannelLinkNotFoundError({
							syncConnectionId: params.syncConnectionId,
						}),
					)
				}
				const parentLink = parentLinkOption.value

				const rootMessages = yield* db.execute((client) =>
					client
						.select({
							id: schema.messagesTable.id,
						})
						.from(schema.messagesTable)
						.where(
							and(
								eq(schema.messagesTable.threadChannelId, params.hazelChannelId),
								isNull(schema.messagesTable.deletedAt),
							),
						)
						.orderBy(asc(schema.messagesTable.createdAt), asc(schema.messagesTable.id))
						.limit(1),
				)
				const rootMessageId = rootMessages[0]?.id
				if (!rootMessageId) {
					return yield* Effect.fail(
						new DiscordSyncChannelLinkNotFoundError({
							syncConnectionId: params.syncConnectionId,
						}),
					)
				}

				const rootMessageLinkOption = yield* messageLinkRepo
					.findByHazelMessage(parentLink.id, rootMessageId)
					.pipe(withSystemActor)
				if (Option.isNone(rootMessageLinkOption)) {
					return yield* Effect.fail(
						new DiscordSyncChannelLinkNotFoundError({
							syncConnectionId: params.syncConnectionId,
						}),
					)
				}

				const adapter = yield* getProviderAdapter(params.provider)
				const externalThreadId = yield* adapter.createThread({
					externalChannelId: parentLink.externalChannelId,
					externalMessageId: rootMessageLinkOption.value.externalMessageId,
					name: channel.name,
				})

				const existingThreadLink = yield* channelLinkRepo
					.findByExternalChannel(params.syncConnectionId, externalThreadId)
					.pipe(withSystemActor)
				if (Option.isSome(existingThreadLink)) {
					return existingThreadLink.value
				}

				const [threadLink] = yield* channelLinkRepo
					.insert({
						syncConnectionId: params.syncConnectionId,
						hazelChannelId: channel.id,
						externalChannelId: externalThreadId,
						externalChannelName: channel.name,
						direction: parentLink.direction,
						isActive: true,
						settings: parentLink.settings,
						lastSyncedAt: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				yield* channelAccessSyncService.syncChannel(channel.id)
				return threadLink
			},
		)

		const syncHazelMessageToProvider = Effect.fn("DiscordSyncWorker.syncHazelMessageToProvider")(
			function* (
				syncConnectionId: SyncConnectionId,
				hazelMessageId: MessageId,
				dedupeKeyOverride?: string,
			) {
				const dedupeKey = dedupeKeyOverride ?? `hazel:message:create:${hazelMessageId}`
				const claimed = yield* claimReceipt({ syncConnectionId, source: "hazel", dedupeKey })
				if (!claimed) {
					return { status: "deduped" as const }
				}

				const connectionOption = yield* connectionRepo
					.findById(syncConnectionId)
					.pipe(withSystemActor)
				if (Option.isNone(connectionOption)) {
					return yield* Effect.fail(
						new DiscordSyncConnectionNotFoundError({
							syncConnectionId,
						}),
					)
				}
				const connection = connectionOption.value

				const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
				if (Option.isNone(messageOption)) {
					return yield* Effect.fail(
						new DiscordSyncMessageNotFoundError({
							messageId: hazelMessageId,
						}),
					)
				}
				const message = messageOption.value
				const adapter = yield* getProviderAdapter(connection.provider)
				const link = yield* resolveOrCreateOutboundLinkForMessage({
					syncConnectionId,
					provider: connection.provider,
					hazelChannelId: message.channelId,
				})

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

				const replyToExternalMessageId = message.replyToMessageId
					? yield* resolveExternalMessageId({
							syncConnectionId,
							hazelMessageId: message.replyToMessageId,
							preferredChannelLinkId: link.id,
						}).pipe(
							Effect.map((id) =>
								Option.match(id, {
									onNone: () => undefined,
									onSome: (value) => value,
								}),
							),
						)
					: undefined

				const externalMessageId = yield* adapter.createMessage({
					externalChannelId: link.externalChannelId,
					content: message.content,
					replyToExternalMessageId,
				})

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
			},
		)

		const syncConnection = Effect.fn("DiscordSyncWorker.syncConnection")(function* (
			syncConnectionId: SyncConnectionId,
			maxMessagesPerChannel = DEFAULT_MAX_MESSAGES_PER_CHANNEL,
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
					const result = yield* syncHazelMessageToProvider(
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
						yield* Effect.logWarning("Failed to sync Hazel message to provider", {
							provider: connection.provider,
							syncConnectionId,
							hazelMessageId: unsyncedMessage.id,
							error: result.left,
						})
					}
				}
			}

			return { sent, skipped, failed }
		})

		const syncHazelMessageUpdateToProvider = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageUpdateToProvider",
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

			const connectionOption = yield* connectionRepo.findById(syncConnectionId).pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			const adapter = yield* getProviderAdapter(connection.provider)

			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return yield* Effect.fail(new DiscordSyncMessageNotFoundError({ messageId: hazelMessageId }))
			}
			const message = messageOption.value

			const link = yield* resolveOrCreateOutboundLinkForMessage({
				syncConnectionId,
				provider: connection.provider,
				hazelChannelId: message.channelId,
			})

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

			yield* adapter.updateMessage({
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

		const syncHazelMessageDeleteToProvider = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageDeleteToProvider",
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

			const connectionOption = yield* connectionRepo.findById(syncConnectionId).pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			const adapter = yield* getProviderAdapter(connection.provider)

			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return yield* Effect.fail(new DiscordSyncMessageNotFoundError({ messageId: hazelMessageId }))
			}
			const message = messageOption.value

			const link = yield* resolveOrCreateOutboundLinkForMessage({
				syncConnectionId,
				provider: connection.provider,
				hazelChannelId: message.channelId,
			})

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

			yield* adapter.deleteMessage({
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

		const syncHazelReactionCreateToProvider = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionCreateToProvider",
		)(function* (
			syncConnectionId: SyncConnectionId,
			hazelReactionId: MessageReactionId,
			dedupeKeyOverride?: string,
		) {
			const dedupeKey = dedupeKeyOverride ?? `hazel:reaction:create:${hazelReactionId}`
			const claimed = yield* claimReceipt({ syncConnectionId, source: "hazel", dedupeKey })
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const connectionOption = yield* connectionRepo.findById(syncConnectionId).pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			const adapter = yield* getProviderAdapter(connection.provider)

			const reactionOption = yield* messageReactionRepo.findById(hazelReactionId).pipe(withSystemActor)
			if (Option.isNone(reactionOption)) {
				yield* writeReceipt({
					syncConnectionId,
					source: "hazel",
					dedupeKey,
					status: "ignored",
				})
				return { status: "ignored_missing_reaction" as const }
			}
			const reaction = reactionOption.value

			const link = yield* resolveOrCreateOutboundLinkForMessage({
				syncConnectionId,
				provider: connection.provider,
				hazelChannelId: reaction.channelId,
			})

			const messageLinkOption = yield* messageLinkRepo
				.findByHazelMessage(link.id, reaction.messageId)
				.pipe(withSystemActor)
			if (Option.isNone(messageLinkOption)) {
				yield* writeReceipt({
					syncConnectionId,
					channelLinkId: link.id,
					source: "hazel",
					dedupeKey,
					status: "ignored",
					payload: {
						hazelReactionId,
					},
				})
				return { status: "ignored_missing_link" as const }
			}
			const messageLink = messageLinkOption.value

			yield* adapter.addReaction({
				externalChannelId: link.externalChannelId,
				externalMessageId: messageLink.externalMessageId,
				emoji: reaction.emoji,
			})

			yield* writeReceipt({
				syncConnectionId,
				channelLinkId: link.id,
				source: "hazel",
				dedupeKey,
				payload: {
					hazelReactionId,
					externalMessageId: messageLink.externalMessageId,
					emoji: reaction.emoji,
				},
			})
			yield* connectionRepo.updateLastSyncedAt(syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "created" as const, externalMessageId: messageLink.externalMessageId }
		})

		const syncHazelReactionDeleteToProvider = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionDeleteToProvider",
		)(function* (
			syncConnectionId: SyncConnectionId,
			payload: {
				hazelChannelId: ChannelId
				hazelMessageId: MessageId
				emoji: string
				userId?: UserId
			},
			dedupeKeyOverride?: string,
		) {
			const dedupeKey =
				dedupeKeyOverride ??
				`hazel:reaction:delete:${payload.hazelMessageId}:${payload.emoji}:${payload.userId ?? "unknown"}`
			const claimed = yield* claimReceipt({ syncConnectionId, source: "hazel", dedupeKey })
			if (!claimed) {
				return { status: "deduped" as const }
			}

			const connectionOption = yield* connectionRepo.findById(syncConnectionId).pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value
			const adapter = yield* getProviderAdapter(connection.provider)

			const link = yield* resolveOrCreateOutboundLinkForMessage({
				syncConnectionId,
				provider: connection.provider,
				hazelChannelId: payload.hazelChannelId,
			})

			const messageLinkOption = yield* messageLinkRepo
				.findByHazelMessage(link.id, payload.hazelMessageId)
				.pipe(withSystemActor)
			if (Option.isNone(messageLinkOption)) {
				yield* writeReceipt({
					syncConnectionId,
					channelLinkId: link.id,
					source: "hazel",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_missing_link" as const }
			}
			const messageLink = messageLinkOption.value

			const remainingReactions = yield* db.execute((client) =>
				client
					.select({
						id: schema.messageReactionsTable.id,
					})
					.from(schema.messageReactionsTable)
					.where(
						and(
							eq(schema.messageReactionsTable.messageId, payload.hazelMessageId),
							eq(schema.messageReactionsTable.emoji, payload.emoji),
						),
					)
					.limit(1),
			)
			if (remainingReactions.length > 0) {
				yield* writeReceipt({
					syncConnectionId,
					channelLinkId: link.id,
					source: "hazel",
					dedupeKey,
					status: "ignored",
					payload: {
						...payload,
						reason: "remaining_reactions_for_emoji",
					},
				})
				return { status: "ignored_remaining_reactions" as const }
			}

			yield* adapter.removeReaction({
				externalChannelId: link.externalChannelId,
				externalMessageId: messageLink.externalMessageId,
				emoji: payload.emoji,
			})

			yield* writeReceipt({
				syncConnectionId,
				channelLinkId: link.id,
				source: "hazel",
				dedupeKey,
				payload: {
					...payload,
					externalMessageId: messageLink.externalMessageId,
				},
			})
			yield* connectionRepo.updateLastSyncedAt(syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "deleted" as const, externalMessageId: messageLink.externalMessageId }
		})

		const getActiveOutboundTargets = Effect.fn("DiscordSyncWorker.getActiveOutboundTargets")(function* (
			hazelChannelId: ChannelId,
			provider: string,
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
							eq(schema.chatSyncConnectionsTable.provider, provider),
							eq(schema.chatSyncConnectionsTable.status, "active"),
							isNull(schema.chatSyncConnectionsTable.deletedAt),
						),
					),
			)
			return targets
		})

		const syncHazelMessageCreateToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageCreateToAllConnections",
		)(function* (provider: string, hazelMessageId: MessageId, dedupeKey?: string) {
			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return { synced: 0, failed: 0 }
			}
			const targets = yield* getActiveOutboundTargets(messageOption.value.channelId, provider)
			let synced = 0
			let failed = 0

			for (const target of targets) {
				if (target.direction === "external_to_hazel") continue
				const result = yield* syncHazelMessageToProvider(
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
					yield* Effect.logWarning("Failed to sync create message to provider", {
						provider,
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
		)(function* (provider: string, hazelMessageId: MessageId, dedupeKey?: string) {
			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return { synced: 0, failed: 0 }
			}
			const targets = yield* getActiveOutboundTargets(messageOption.value.channelId, provider)
			let synced = 0
			let failed = 0

			for (const target of targets) {
				if (target.direction === "external_to_hazel") continue
				const result = yield* syncHazelMessageUpdateToProvider(
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
					yield* Effect.logWarning("Failed to sync update message to provider", {
						provider,
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
		)(function* (provider: string, hazelMessageId: MessageId, dedupeKey?: string) {
			const messageOption = yield* messageRepo.findById(hazelMessageId).pipe(withSystemActor)
			if (Option.isNone(messageOption)) {
				return { synced: 0, failed: 0 }
			}
			const targets = yield* getActiveOutboundTargets(messageOption.value.channelId, provider)
			let synced = 0
			let failed = 0

			for (const target of targets) {
				if (target.direction === "external_to_hazel") continue
				const result = yield* syncHazelMessageDeleteToProvider(
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
					yield* Effect.logWarning("Failed to sync delete message to provider", {
						provider,
						hazelMessageId,
						syncConnectionId: target.syncConnectionId,
						error: result.left,
					})
				}
			}

			return { synced, failed }
		})

		const syncHazelReactionCreateToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionCreateToAllConnections",
		)(function* (provider: string, hazelReactionId: MessageReactionId, dedupeKey?: string) {
			const reactionOption = yield* messageReactionRepo.findById(hazelReactionId).pipe(withSystemActor)
			if (Option.isNone(reactionOption)) {
				return { synced: 0, failed: 0 }
			}
			const reaction = reactionOption.value
			const targets = yield* getActiveOutboundTargets(reaction.channelId, provider)
			let synced = 0
			let failed = 0

			for (const target of targets) {
				if (target.direction === "external_to_hazel") continue
				const result = yield* syncHazelReactionCreateToProvider(
					target.syncConnectionId,
					hazelReactionId,
					dedupeKey,
				).pipe(Effect.either)
				if (result._tag === "Right") {
					if (result.right.status === "created") {
						synced++
					}
				} else {
					failed++
					yield* Effect.logWarning("Failed to sync create reaction to provider", {
						provider,
						hazelReactionId,
						syncConnectionId: target.syncConnectionId,
						error: result.left,
					})
				}
			}

			return { synced, failed }
		})

		const syncHazelReactionDeleteToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionDeleteToAllConnections",
		)(
			function* (
				provider: string,
				payload: {
					hazelChannelId: ChannelId
					hazelMessageId: MessageId
					emoji: string
					userId?: UserId
				},
				dedupeKey?: string,
			) {
				const targets = yield* getActiveOutboundTargets(payload.hazelChannelId, provider)
				let synced = 0
				let failed = 0

				for (const target of targets) {
					if (target.direction === "external_to_hazel") continue
					const result = yield* syncHazelReactionDeleteToProvider(
						target.syncConnectionId,
						payload,
						dedupeKey,
					).pipe(Effect.either)
					if (result._tag === "Right") {
						if (result.right.status === "deleted") {
							synced++
						}
					} else {
						failed++
						yield* Effect.logWarning("Failed to sync delete reaction to provider", {
							provider,
							hazelMessageId: payload.hazelMessageId,
							syncConnectionId: target.syncConnectionId,
							error: result.left,
						})
					}
				}

				return { synced, failed }
			},
		)

		const syncAllActiveConnections = Effect.fn("DiscordSyncWorker.syncAllActiveConnections")(function* (
			provider: string,
			maxMessagesPerChannel = DEFAULT_MAX_MESSAGES_PER_CHANNEL,
		) {
			const connections = yield* connectionRepo.findActiveByProvider(provider).pipe(withSystemActor)
			return yield* Effect.forEach(
				connections,
				(connection) =>
					syncConnection(connection.id, maxMessagesPerChannel).pipe(
						Effect.map((summary) => ({
							syncConnectionId: connection.id,
							...summary,
						})),
					),
				{ concurrency: DEFAULT_CHAT_SYNC_CONCURRENCY },
			)
		})

		const ingestMessageCreate = Effect.fn("DiscordSyncWorker.ingestMessageCreate")(function* (
			payload: ChatSyncIngressMessageCreate,
		) {
			const dedupeKey = payload.dedupeKey ?? `external:message:create:${payload.externalMessageId}`
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
			if (connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}
			yield* getProviderAdapter(connection.provider)

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
				? yield* resolveAuthorUserId({
						provider: connection.provider,
						organizationId: connection.organizationId,
						externalUserId: payload.externalAuthorId,
						displayName: payload.externalAuthorDisplayName ?? "External User",
						avatarUrl: payload.externalAuthorAvatarUrl ?? null,
					})
				: (yield* integrationBotService.getOrCreateBotUser(
						decodeProvider(connection.provider),
						connection.organizationId,
					)).id
			const replyToMessageId = payload.externalReplyToMessageId
				? yield* resolveHazelMessageId({
						syncConnectionId: payload.syncConnectionId,
						externalMessageId: payload.externalReplyToMessageId,
						preferredChannelLinkId: link.id,
					}).pipe(
						Effect.map((id) =>
							Option.match(id, {
								onNone: () => null,
								onSome: (value) => value,
							}),
						),
					)
				: null
			const [message] = yield* messageRepo
				.insert({
					channelId: link.hazelChannelId,
					authorId,
					content: payload.content,
					embeds: null,
					replyToMessageId,
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
			payload: ChatSyncIngressMessageUpdate,
		) {
			const dedupeKey = payload.dedupeKey ?? `external:message:update:${payload.externalMessageId}`
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
			if (connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}
			yield* getProviderAdapter(connection.provider)

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
			payload: ChatSyncIngressMessageDelete,
		) {
			const dedupeKey = payload.dedupeKey ?? `external:message:delete:${payload.externalMessageId}`
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
			if (connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}
			yield* getProviderAdapter(connection.provider)

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

		const ingestReactionAdd = Effect.fn("DiscordSyncWorker.ingestReactionAdd")(function* (
			payload: ChatSyncIngressReactionAdd,
		) {
			const dedupeKey =
				payload.dedupeKey ??
				`external:reaction:add:${payload.externalMessageId}:${payload.externalUserId}:${payload.emoji}`
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
			if (connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}
			yield* getProviderAdapter(connection.provider)

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

			const userId = yield* resolveAuthorUserId({
				provider: connection.provider,
				organizationId: connection.organizationId,
				externalUserId: payload.externalUserId,
				displayName: "External User",
				avatarUrl: null,
			})

			const existingReaction = yield* messageReactionRepo
				.findByMessageUserEmoji(messageLink.hazelMessageId, userId, payload.emoji)
				.pipe(withSystemActor)
			if (Option.isSome(existingReaction)) {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					channelLinkId: link.id,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "already_exists" as const }
			}

			const [reaction] = yield* messageReactionRepo
				.insert({
					messageId: messageLink.hazelMessageId,
					channelId: link.hazelChannelId,
					userId,
					emoji: payload.emoji,
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

			return { status: "created" as const, hazelReactionId: reaction.id }
		})

		const ingestReactionRemove = Effect.fn("DiscordSyncWorker.ingestReactionRemove")(function* (
			payload: ChatSyncIngressReactionRemove,
		) {
			const dedupeKey =
				payload.dedupeKey ??
				`external:reaction:remove:${payload.externalMessageId}:${payload.externalUserId}:${payload.emoji}`
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
			if (connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}
			yield* getProviderAdapter(connection.provider)

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

			const userId = yield* resolveAuthorUserId({
				provider: connection.provider,
				organizationId: connection.organizationId,
				externalUserId: payload.externalUserId,
				displayName: "External User",
				avatarUrl: null,
			})

			const existingReaction = yield* messageReactionRepo
				.findByMessageUserEmoji(messageLink.hazelMessageId, userId, payload.emoji)
				.pipe(withSystemActor)
			if (Option.isNone(existingReaction)) {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					channelLinkId: link.id,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "already_deleted" as const }
			}

			yield* messageReactionRepo.deleteById(existingReaction.value.id).pipe(withSystemActor)

			yield* writeReceipt({
				syncConnectionId: payload.syncConnectionId,
				channelLinkId: link.id,
				source: "external",
				dedupeKey,
				payload,
			})
			yield* connectionRepo.updateLastSyncedAt(payload.syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(link.id).pipe(withSystemActor)

			return { status: "deleted" as const, hazelReactionId: existingReaction.value.id }
		})

		const ingestThreadCreate = Effect.fn("DiscordSyncWorker.ingestThreadCreate")(function* (
			payload: ChatSyncIngressThreadCreate,
		) {
			const dedupeKey = payload.dedupeKey ?? `external:thread:create:${payload.externalThreadId}`
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
			if (connection.status !== "active") {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "ignored_connection_inactive" as const }
			}
			yield* getProviderAdapter(connection.provider)

			const parentLinkOption = yield* channelLinkRepo
				.findByExternalChannel(payload.syncConnectionId, payload.externalParentChannelId)
				.pipe(withSystemActor)
			if (Option.isNone(parentLinkOption)) {
				return yield* Effect.fail(
					new DiscordSyncChannelLinkNotFoundError({
						syncConnectionId: payload.syncConnectionId,
						externalChannelId: payload.externalParentChannelId,
					}),
				)
			}
			const parentLink = parentLinkOption.value

			const existingThreadLink = yield* channelLinkRepo
				.findByExternalChannel(payload.syncConnectionId, payload.externalThreadId)
				.pipe(withSystemActor)
			if (Option.isSome(existingThreadLink)) {
				yield* writeReceipt({
					syncConnectionId: payload.syncConnectionId,
					channelLinkId: existingThreadLink.value.id,
					source: "external",
					dedupeKey,
					status: "ignored",
					payload,
				})
				return { status: "already_linked" as const }
			}

			const [threadChannel] = yield* channelRepo
				.insert({
					name: payload.name?.trim() || "Thread",
					icon: null,
					type: "thread",
					organizationId: connection.organizationId,
					parentChannelId: parentLink.hazelChannelId,
					sectionId: null,
					deletedAt: null,
				})
				.pipe(withSystemActor)

			yield* channelAccessSyncService.syncChannel(threadChannel.id)

			const [threadLink] = yield* channelLinkRepo
				.insert({
					syncConnectionId: payload.syncConnectionId,
					hazelChannelId: threadChannel.id,
					externalChannelId: payload.externalThreadId,
					externalChannelName: payload.name ?? null,
					direction: parentLink.direction,
					isActive: true,
					settings: parentLink.settings,
					lastSyncedAt: null,
					deletedAt: null,
				})
				.pipe(withSystemActor)

			if (payload.externalRootMessageId) {
				const rootMessageLink = yield* messageLinkRepo
					.findByExternalMessage(parentLink.id, payload.externalRootMessageId)
					.pipe(withSystemActor)
				if (Option.isSome(rootMessageLink)) {
					yield* messageRepo
						.update({
							id: rootMessageLink.value.hazelMessageId,
							threadChannelId: threadChannel.id,
							updatedAt: new Date(),
						})
						.pipe(withSystemActor)
				}
			}

			yield* writeReceipt({
				syncConnectionId: payload.syncConnectionId,
				channelLinkId: threadLink.id,
				source: "external",
				dedupeKey,
				payload,
			})
			yield* connectionRepo.updateLastSyncedAt(payload.syncConnectionId).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(threadLink.id).pipe(withSystemActor)
			yield* channelLinkRepo.updateLastSyncedAt(parentLink.id).pipe(withSystemActor)

			return {
				status: "created" as const,
				hazelThreadChannelId: threadChannel.id,
				channelLinkId: threadLink.id,
			}
		})

		return {
			syncConnection,
			syncAllActiveConnections,
			syncHazelMessageToProvider,
			syncHazelMessageUpdateToProvider,
			syncHazelMessageDeleteToProvider,
			syncHazelReactionCreateToProvider,
			syncHazelReactionDeleteToProvider,
			syncHazelMessageCreateToAllConnections,
			syncHazelMessageUpdateToAllConnections,
			syncHazelMessageDeleteToAllConnections,
			syncHazelReactionCreateToAllConnections,
			syncHazelReactionDeleteToAllConnections,
			ingestMessageCreate,
			ingestMessageUpdate,
			ingestMessageDelete,
			ingestReactionAdd,
			ingestReactionRemove,
			ingestThreadCreate,
		}
	}),
	dependencies: [
		ChatSyncConnectionRepo.Default,
		ChatSyncChannelLinkRepo.Default,
		ChatSyncMessageLinkRepo.Default,
		ChatSyncEventReceiptRepo.Default,
		MessageRepo.Default,
		MessageReactionRepo.Default,
		ChannelRepo.Default,
		IntegrationConnectionRepo.Default,
		UserRepo.Default,
		OrganizationMemberRepo.Default,
		IntegrationBotService.Default,
		ChannelAccessSyncService.Default,
		ChatSyncProviderRegistry.Default,
	],
}) {}

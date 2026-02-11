import { createHash } from "node:crypto"
import {
	and,
	asc,
	Database,
	eq,
	isNull,
	schema,
} from "@hazel/db"
import {
	ChatSyncChannelLinkRepo,
	ChatSyncConnectionRepo,
	ChatSyncEventReceiptRepo,
	ChatSyncMessageLinkRepo,
	MessageRepo,
} from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import {
	MessageId,
	SyncChannelLinkId,
	SyncConnectionId,
} from "@hazel/schema"
import { Config, Effect, Option, Redacted, Schema } from "effect"
import { IntegrationBotService } from "../integrations/integration-bot-service"

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

		const hasReceipt = (
			syncConnectionId: SyncConnectionId,
			source: "hazel" | "external",
			dedupeKey: string,
		) =>
			eventReceiptRepo
				.findByDedupeKey(syncConnectionId, source, dedupeKey)
				.pipe(Effect.map(Option.isSome), withSystemActor)

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
				.insert({
					syncConnectionId: params.syncConnectionId,
					channelLinkId: params.channelLinkId ?? null,
					source: params.source,
					externalEventId: null,
					dedupeKey: params.dedupeKey,
					payloadHash: params.payload ? payloadHash(params.payload) : null,
					status: params.status ?? "processed",
					errorMessage: params.errorMessage ?? null,
				})
				.pipe(
					withSystemActor,
					Effect.catchTag("DatabaseError", (error) =>
						error.type === "unique_violation" ? Effect.void : Effect.fail(error),
					),
				)
		})

		const discordCreateMessage = Effect.fn("DiscordSyncWorker.discordCreateMessage")(function* (
			externalChannelId: string,
			content: string,
		) {
			const token = yield* getDiscordToken()
			const response = yield* Effect.tryPromise({
				try: () =>
					fetch(`https://discord.com/api/v10/channels/${externalChannelId}/messages`, {
						method: "POST",
						headers: {
							Authorization: `Bot ${token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ content }),
					}),
				catch: (error) =>
					new DiscordSyncApiError({
						message: "Discord API request failed",
						detail: String(error),
					}),
			})

			if (!response.ok) {
				const detail = yield* Effect.tryPromise({
					try: () => response.text(),
					catch: () => "",
				})
				return yield* Effect.fail(
					new DiscordSyncApiError({
						message: "Discord API returned an error",
						status: response.status,
						detail,
					}),
				)
			}

			const body = (yield* Effect.tryPromise({
				try: () => response.json() as Promise<{ id?: string }>,
				catch: (error) =>
					new DiscordSyncApiError({
						message: "Failed to parse Discord response",
						detail: String(error),
					}),
			})) as { id?: string }

			if (!body.id) {
				return yield* Effect.fail(
					new DiscordSyncApiError({
						message: "Discord response missing message id",
					}),
				)
			}

			return body.id
		})

		const syncHazelMessageToDiscord = Effect.fn("DiscordSyncWorker.syncHazelMessageToDiscord")(function* (
			syncConnectionId: SyncConnectionId,
			hazelMessageId: MessageId,
		) {
			const dedupeKey = `hazel:message:create:${hazelMessageId}`
			const alreadyProcessed = yield* hasReceipt(syncConnectionId, "hazel", dedupeKey)
			if (alreadyProcessed) {
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

			const links = yield* channelLinkRepo.findActiveBySyncConnection(syncConnectionId).pipe(withSystemActor)

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
					const result = yield* syncHazelMessageToDiscord(syncConnectionId, unsyncedMessage.id).pipe(
						Effect.either,
					)
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
			const alreadyProcessed = yield* hasReceipt(payload.syncConnectionId, "external", dedupeKey)
			if (alreadyProcessed) {
				return { status: "deduped" as const }
			}

			const connectionOption = yield* connectionRepo.findById(payload.syncConnectionId).pipe(withSystemActor)
			if (Option.isNone(connectionOption)) {
				return yield* Effect.fail(
					new DiscordSyncConnectionNotFoundError({
						syncConnectionId: payload.syncConnectionId,
					}),
				)
			}
			const connection = connectionOption.value

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

			const botUser = yield* integrationBotService.getOrCreateBotUser("discord", connection.organizationId)
			const [message] = yield* messageRepo
				.insert({
					channelId: link.hazelChannelId,
					authorId: botUser.id,
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
			const alreadyProcessed = yield* hasReceipt(payload.syncConnectionId, "external", dedupeKey)
			if (alreadyProcessed) {
				return { status: "deduped" as const }
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
			const alreadyProcessed = yield* hasReceipt(payload.syncConnectionId, "external", dedupeKey)
			if (alreadyProcessed) {
				return { status: "deduped" as const }
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
		IntegrationBotService.Default,
	],
}) {}

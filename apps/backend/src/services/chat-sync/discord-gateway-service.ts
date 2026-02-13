import { createHash } from "node:crypto"
import { FetchHttpClient } from "@effect/platform"
import { BunSocket } from "@effect/platform-bun"
import { ChatSyncChannelLinkRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import {
	ExternalChannelId,
	ExternalMessageId,
	ExternalThreadId,
	ExternalUserId,
	ExternalWebhookId,
} from "@hazel/schema"
import { DiscordConfig } from "dfx"
import { DiscordGateway, DiscordLive } from "dfx/gateway"
import { Config, Effect, Layer, Option, Redacted, Ref, Schema } from "effect"
import { DiscordSyncWorker } from "./discord-sync-worker"
import type { ChatSyncIngressMessageAttachment } from "./chat-sync-core-worker"

interface DiscordMessageAuthor {
	id?: string
	username?: string
	global_name?: string | null
	discriminator?: string
	avatar?: string | null
	bot?: boolean
}

interface DiscordReadyEvent {
	user?: { id?: string }
}

interface DiscordMessageCreateEvent {
	id?: string
	channel_id?: string
	content?: string
	webhook_id?: string
	attachments?: ReadonlyArray<DiscordMessageAttachment>
	author?: DiscordMessageAuthor
	message_reference?: {
		message_id?: string
		channel_id?: string
	}
}

interface DiscordMessageAttachment {
	id?: string
	filename?: string
	size?: number
	url?: string
}

interface DiscordMessageUpdateEvent {
	id?: string
	channel_id?: string
	content?: string
	webhook_id?: string
	author?: DiscordMessageAuthor
	edited_timestamp?: string | null
}

interface DiscordMessageDeleteEvent {
	id?: string
	channel_id?: string
	webhook_id?: string
}

interface DiscordReactionEmoji {
	id?: string | null
	name?: string | null
}

interface DiscordMessageReactionAddEvent {
	channel_id?: string
	message_id?: string
	user_id?: string
	user?: DiscordMessageAuthor
	member?: {
		user?: DiscordMessageAuthor
	}
	emoji?: DiscordReactionEmoji
}

interface DiscordMessageReactionRemoveEvent {
	channel_id?: string
	message_id?: string
	user_id?: string
	user?: DiscordMessageAuthor
	member?: {
		user?: DiscordMessageAuthor
	}
	emoji?: DiscordReactionEmoji
}

interface DiscordThreadCreateEvent {
	id?: string
	parent_id?: string
	name?: string
	type?: number
}

const formatDiscordDisplayName = (author?: DiscordMessageAuthor): string => {
	if (!author) return "Discord User"
	if (author.global_name) return author.global_name
	if (author.discriminator && author.discriminator !== "0") {
		return `${author.username ?? "discord-user"}#${author.discriminator}`
	}
	return author.username ?? "Discord User"
}

const buildAuthorAvatarUrl = (author?: DiscordMessageAuthor): string | null => {
	if (!author?.id || !author.avatar) return null
	return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
}

export const normalizeDiscordMessageAttachments = (
	attachments: ReadonlyArray<DiscordMessageAttachment> | undefined,
): ReadonlyArray<ChatSyncIngressMessageAttachment> => {
	if (!attachments || attachments.length === 0) {
		return []
	}

	const normalized: Array<ChatSyncIngressMessageAttachment> = []
	for (const attachment of attachments) {
		const fileName = typeof attachment.filename === "string" ? attachment.filename.trim() : ""
		const publicUrl = typeof attachment.url === "string" ? attachment.url.trim() : ""
		if (!fileName || !publicUrl) {
			continue
		}

		normalized.push({
			externalAttachmentId:
				typeof attachment.id === "string" && attachment.id.trim().length > 0 ? attachment.id : undefined,
			fileName,
			fileSize:
				typeof attachment.size === "number" && Number.isFinite(attachment.size) && attachment.size >= 0
					? attachment.size
					: 0,
			publicUrl,
		})
	}

	return normalized
}

export const extractReactionAuthor = (event: {
	member?: { user?: DiscordMessageAuthor }
	user?: DiscordMessageAuthor
}) => {
	const author = event.member?.user ?? event.user
	return {
		externalAuthorDisplayName: author ? formatDiscordDisplayName(author) : undefined,
		externalAuthorAvatarUrl: author ? buildAuthorAvatarUrl(author) : undefined,
	}
}

const formatDiscordEmoji = (emoji?: DiscordReactionEmoji): string | null => {
	if (!emoji?.name) return null
	if (emoji.id) return `${emoji.name}:${emoji.id}`
	return emoji.name
}

const DISCORD_REQUIRED_GATEWAY_INTENTS = 34305
type ExternalIdDecoder<A> = (value: unknown) => Option.Option<A>

const decodeExternalChannelId: ExternalIdDecoder<ExternalChannelId> = (value) =>
	Schema.decodeUnknownOption(ExternalChannelId)(value)
const decodeExternalMessageId: ExternalIdDecoder<ExternalMessageId> = (value) =>
	Schema.decodeUnknownOption(ExternalMessageId)(value)
const decodeExternalThreadId: ExternalIdDecoder<ExternalThreadId> = (value) =>
	Schema.decodeUnknownOption(ExternalThreadId)(value)
const decodeExternalUserId: ExternalIdDecoder<ExternalUserId> = (value) =>
	Schema.decodeUnknownOption(ExternalUserId)(value)
const decodeExternalWebhookId: ExternalIdDecoder<ExternalWebhookId> = (value) =>
	Schema.decodeUnknownOption(ExternalWebhookId)(value)

export const decodeRequiredExternalId = <A>(
	value: unknown,
	decode: ExternalIdDecoder<A>,
): Option.Option<A> => decode(value)

export const decodeOptionalExternalId = <A>(
	value: unknown,
	decode: ExternalIdDecoder<A>,
): A | undefined => {
	if (value === undefined) return undefined
	const decoded = decode(value)
	return Option.isSome(decoded) ? decoded.value : undefined
}

const getValueType = (value: unknown): string => (value === null ? "null" : typeof value)

export class DiscordGatewayService extends Effect.Service<DiscordGatewayService>()("DiscordGatewayService", {
	accessors: true,
	effect: Effect.gen(function* () {
		const discordSyncWorker = yield* DiscordSyncWorker
		const channelLinkRepo = yield* ChatSyncChannelLinkRepo

		const gatewayEnabled = yield* Config.boolean("DISCORD_GATEWAY_ENABLED").pipe(
			Config.withDefault(true),
			Effect.orDie,
		)
		const configuredIntents = yield* Config.number("DISCORD_GATEWAY_INTENTS").pipe(
			// GUILDS + GUILD_MESSAGES + GUILD_MESSAGE_REACTIONS + MESSAGE_CONTENT
			Config.withDefault(DISCORD_REQUIRED_GATEWAY_INTENTS),
			Effect.orDie,
		)
		const intents = configuredIntents | DISCORD_REQUIRED_GATEWAY_INTENTS
		if (intents !== configuredIntents) {
			yield* Effect.logWarning("DISCORD_GATEWAY_INTENTS missing required bits; forcing minimum intents", {
				configuredIntents,
				effectiveIntents: intents,
			})
		}
		const botTokenOption = yield* Config.redacted("DISCORD_BOT_TOKEN").pipe(Effect.option)

		if (!gatewayEnabled) {
			yield* Effect.logInfo("Discord gateway disabled via DISCORD_GATEWAY_ENABLED=false")
			return {
				start: Effect.void,
			}
		}

		if (Option.isNone(botTokenOption)) {
			yield* Effect.logWarning("Discord gateway disabled: DISCORD_BOT_TOKEN is not configured")
			return {
				start: Effect.void,
			}
		}

		const botToken = Redacted.value(botTokenOption.value)
		const botUserIdRef = yield* Ref.make<Option.Option<ExternalUserId>>(Option.none())

		const DiscordLayer = DiscordLive.pipe(
			Layer.provide(
				DiscordConfig.layer({
					token: Redacted.make(botToken),
					gateway: { intents },
				}),
			),
			Layer.provide(BunSocket.layerWebSocketConstructor),
			Layer.provide(FetchHttpClient.layer),
		)

		const isCurrentBotAuthor = (authorId?: string) =>
			Effect.gen(function* () {
				if (!authorId) return false
				const botUserId = yield* Ref.get(botUserIdRef)
				return Option.isSome(botUserId) && botUserId.value === authorId
			})

		const decodeRequiredExternalIdOrWarn = <A>(params: {
			eventType: string
			field: string
			value: unknown
			decode: ExternalIdDecoder<A>
		}) =>
			Effect.gen(function* () {
				const decoded = decodeRequiredExternalId(params.value, params.decode)
				if (Option.isNone(decoded)) {
					yield* Effect.logWarning("Discord gateway dropped event: invalid external id", {
						eventType: params.eventType,
						field: params.field,
						valueType: getValueType(params.value),
					})
				}
				return decoded
			})

		const decodeOptionalExternalIdOrWarn = <A>(params: {
			eventType: string
			field: string
			value: unknown
			decode: ExternalIdDecoder<A>
		}) =>
			Effect.gen(function* () {
				const decoded = decodeOptionalExternalId(params.value, params.decode)
				if (params.value !== undefined && decoded === undefined) {
					yield* Effect.logWarning("Discord gateway ignored optional invalid external id", {
						eventType: params.eventType,
						field: params.field,
						valueType: getValueType(params.value),
					})
				}
				return decoded
			})

		const ingestMessageCreateEvent = Effect.fn("DiscordGatewayService.ingestMessageCreateEvent")(
			function* (event: DiscordMessageCreateEvent) {
				if (!event.id || !event.channel_id || typeof event.content !== "string") return
				if (event.author?.bot) return
				if (yield* isCurrentBotAuthor(event.author?.id)) return

				const externalChannelIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_CREATE",
					field: "channel_id",
					value: event.channel_id,
					decode: decodeExternalChannelId,
				})
				if (Option.isNone(externalChannelIdOption)) return

				const externalMessageIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_CREATE",
					field: "id",
					value: event.id,
					decode: decodeExternalMessageId,
				})
				if (Option.isNone(externalMessageIdOption)) return

				const externalChannelId = externalChannelIdOption.value
				const externalMessageId = externalMessageIdOption.value
				const externalAuthorId = yield* decodeOptionalExternalIdOrWarn({
					eventType: "MESSAGE_CREATE",
					field: "author.id",
					value: event.author?.id,
					decode: decodeExternalUserId,
				})
				const externalAuthorDisplayName = formatDiscordDisplayName(event.author)
				const externalAuthorAvatarUrl = buildAuthorAvatarUrl(event.author)
				const externalReplyToMessageId = yield* decodeOptionalExternalIdOrWarn({
					eventType: "MESSAGE_CREATE",
					field: "message_reference.message_id",
					value: event.message_reference?.message_id,
					decode: decodeExternalMessageId,
				})
				const externalWebhookId = yield* decodeOptionalExternalIdOrWarn({
					eventType: "MESSAGE_CREATE",
					field: "webhook_id",
					value: event.webhook_id,
					decode: decodeExternalWebhookId,
				})
				const externalAttachments = normalizeDiscordMessageAttachments(event.attachments)

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(externalChannelId)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestMessageCreate({
						syncConnectionId: link.syncConnectionId,
						externalChannelId,
						externalMessageId,
						content: event.content,
						externalAuthorId,
						externalAuthorDisplayName,
						externalAuthorAvatarUrl,
						externalReplyToMessageId: externalReplyToMessageId ?? null,
						externalThreadId: null,
						externalAttachments,
						externalWebhookId,
						dedupeKey: `discord:gateway:create:${externalMessageId}`,
					})
				}
			},
		)

		const ingestMessageUpdateEvent = Effect.fn("DiscordGatewayService.ingestMessageUpdateEvent")(
			function* (event: DiscordMessageUpdateEvent) {
				if (!event.id || !event.channel_id || typeof event.content !== "string") return
				if (event.author?.bot) return
				if (yield* isCurrentBotAuthor(event.author?.id)) return

				const externalChannelIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_UPDATE",
					field: "channel_id",
					value: event.channel_id,
					decode: decodeExternalChannelId,
				})
				if (Option.isNone(externalChannelIdOption)) return

				const externalMessageIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_UPDATE",
					field: "id",
					value: event.id,
					decode: decodeExternalMessageId,
				})
				if (Option.isNone(externalMessageIdOption)) return

				const externalChannelId = externalChannelIdOption.value
				const externalMessageId = externalMessageIdOption.value
				const externalWebhookId = yield* decodeOptionalExternalIdOrWarn({
					eventType: "MESSAGE_UPDATE",
					field: "webhook_id",
					value: event.webhook_id,
					decode: decodeExternalWebhookId,
				})

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(externalChannelId)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					const updateVersion =
						event.edited_timestamp ??
						createHash("sha256")
							.update(`${externalMessageId}:${event.content ?? ""}`)
							.digest("hex")
							.slice(0, 16)
					yield* discordSyncWorker.ingestMessageUpdate({
						syncConnectionId: link.syncConnectionId,
						externalChannelId,
						externalMessageId,
						externalWebhookId,
						content: event.content,
						dedupeKey: `discord:gateway:update:${externalMessageId}:${updateVersion}`,
					})
				}
			},
		)

		const ingestMessageDeleteEvent = Effect.fn("DiscordGatewayService.ingestMessageDeleteEvent")(
			function* (event: DiscordMessageDeleteEvent) {
				if (!event.id || !event.channel_id) return

				const externalChannelIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_DELETE",
					field: "channel_id",
					value: event.channel_id,
					decode: decodeExternalChannelId,
				})
				if (Option.isNone(externalChannelIdOption)) return

				const externalMessageIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_DELETE",
					field: "id",
					value: event.id,
					decode: decodeExternalMessageId,
				})
				if (Option.isNone(externalMessageIdOption)) return

				const externalChannelId = externalChannelIdOption.value
				const externalMessageId = externalMessageIdOption.value
				const externalWebhookId = yield* decodeOptionalExternalIdOrWarn({
					eventType: "MESSAGE_DELETE",
					field: "webhook_id",
					value: event.webhook_id,
					decode: decodeExternalWebhookId,
				})

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(externalChannelId)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestMessageDelete({
						syncConnectionId: link.syncConnectionId,
						externalChannelId,
						externalMessageId,
						externalWebhookId,
						dedupeKey: `discord:gateway:delete:${externalMessageId}`,
					})
				}
			},
		)
		const ingestMessageReactionAddEvent = Effect.fn(
			"DiscordGatewayService.ingestMessageReactionAddEvent",
		)(function* (event: DiscordMessageReactionAddEvent) {
				if (!event.channel_id || !event.message_id || !event.user_id) return
				if (yield* isCurrentBotAuthor(event.user_id)) return

				const emoji = formatDiscordEmoji(event.emoji)
				if (!emoji) return
				const { externalAuthorDisplayName, externalAuthorAvatarUrl } = extractReactionAuthor(event)
				const externalChannelIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_REACTION_ADD",
					field: "channel_id",
					value: event.channel_id,
					decode: decodeExternalChannelId,
				})
				if (Option.isNone(externalChannelIdOption)) return

				const externalMessageIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_REACTION_ADD",
					field: "message_id",
					value: event.message_id,
					decode: decodeExternalMessageId,
				})
				if (Option.isNone(externalMessageIdOption)) return

				const externalUserIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_REACTION_ADD",
					field: "user_id",
					value: event.user_id,
					decode: decodeExternalUserId,
				})
				if (Option.isNone(externalUserIdOption)) return

				const externalChannelId = externalChannelIdOption.value
				const externalMessageId = externalMessageIdOption.value
				const externalUserId = externalUserIdOption.value

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(externalChannelId)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestReactionAdd({
						syncConnectionId: link.syncConnectionId,
						externalChannelId,
						externalMessageId,
						externalUserId,
						externalAuthorDisplayName,
						externalAuthorAvatarUrl,
						emoji,
						dedupeKey: `discord:gateway:reaction:add:${externalChannelId}:${externalMessageId}:${externalUserId}:${emoji}`,
					})
				}
			})

		const ingestMessageReactionRemoveEvent = Effect.fn(
			"DiscordGatewayService.ingestMessageReactionRemoveEvent",
		)(function* (event: DiscordMessageReactionRemoveEvent) {
				if (!event.channel_id || !event.message_id || !event.user_id) return
				if (yield* isCurrentBotAuthor(event.user_id)) return

				const emoji = formatDiscordEmoji(event.emoji)
				if (!emoji) return
				const { externalAuthorDisplayName, externalAuthorAvatarUrl } = extractReactionAuthor(event)
				const externalChannelIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_REACTION_REMOVE",
					field: "channel_id",
					value: event.channel_id,
					decode: decodeExternalChannelId,
				})
				if (Option.isNone(externalChannelIdOption)) return

				const externalMessageIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_REACTION_REMOVE",
					field: "message_id",
					value: event.message_id,
					decode: decodeExternalMessageId,
				})
				if (Option.isNone(externalMessageIdOption)) return

				const externalUserIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "MESSAGE_REACTION_REMOVE",
					field: "user_id",
					value: event.user_id,
					decode: decodeExternalUserId,
				})
				if (Option.isNone(externalUserIdOption)) return

				const externalChannelId = externalChannelIdOption.value
				const externalMessageId = externalMessageIdOption.value
				const externalUserId = externalUserIdOption.value

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(externalChannelId)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestReactionRemove({
						syncConnectionId: link.syncConnectionId,
						externalChannelId,
						externalMessageId,
						externalUserId,
						externalAuthorDisplayName,
						externalAuthorAvatarUrl,
						emoji,
						dedupeKey: `discord:gateway:reaction:remove:${externalChannelId}:${externalMessageId}:${externalUserId}:${emoji}`,
					})
				}
			})

		const ingestThreadCreateEvent = Effect.fn("DiscordGatewayService.ingestThreadCreateEvent")(
			function* (event: DiscordThreadCreateEvent) {
				if (!event.id || !event.parent_id) return
				if (event.type !== undefined && event.type !== 11 && event.type !== 12) return

				const externalParentChannelIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "THREAD_CREATE",
					field: "parent_id",
					value: event.parent_id,
					decode: decodeExternalChannelId,
				})
				if (Option.isNone(externalParentChannelIdOption)) return

				const externalThreadIdOption = yield* decodeRequiredExternalIdOrWarn({
					eventType: "THREAD_CREATE",
					field: "id",
					value: event.id,
					decode: decodeExternalThreadId,
				})
				if (Option.isNone(externalThreadIdOption)) return

				const externalParentChannelId = externalParentChannelIdOption.value
				const externalThreadId = externalThreadIdOption.value

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(externalParentChannelId)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestThreadCreate({
						syncConnectionId: link.syncConnectionId,
						externalParentChannelId,
						externalThreadId,
						externalRootMessageId: null,
						name: event.name ?? "Thread",
						dedupeKey: `discord:gateway:thread:create:${externalThreadId}`,
					})
				}
			},
		)

		const onReady = Effect.fn("DiscordGatewayService.onReady")(function* (event: DiscordReadyEvent) {
			if (!event.user?.id) {
				yield* Effect.logWarning("Discord gateway READY payload missing bot user id")
				return
			}
			const botUserId = decodeRequiredExternalId(event.user.id, decodeExternalUserId)
			if (Option.isNone(botUserId)) {
				yield* Effect.logWarning("Discord gateway READY payload has invalid bot user id", {
					eventType: "READY",
					field: "user.id",
					valueType: getValueType(event.user.id),
				})
				return
			}

			yield* Ref.set(botUserIdRef, Option.some(botUserId.value))
			yield* Effect.logInfo("Discord gateway READY", {
				botUserId: botUserId.value,
			})
		})

		const onDispatchError = (eventType: string, error: unknown) =>
			Effect.logWarning("Discord gateway dispatch handler failed", {
				eventType,
				error: String(error),
			})

		const start = Effect.gen(function* () {
			yield* Effect.logInfo("Starting Discord gateway background worker with dfx", {
				intents,
			})

			yield* Effect.gen(function* () {
				const gateway = yield* DiscordGateway

				yield* Effect.all(
					[
						gateway.handleDispatch("READY", (event) =>
							onReady(event as DiscordReadyEvent).pipe(
								Effect.catchAll((error) => onDispatchError("READY", error)),
							),
						),
						gateway.handleDispatch("MESSAGE_CREATE", (event) =>
							ingestMessageCreateEvent(event as DiscordMessageCreateEvent).pipe(
								Effect.catchAll((error) => onDispatchError("MESSAGE_CREATE", error)),
							),
						),
						gateway.handleDispatch("MESSAGE_UPDATE", (event) =>
							ingestMessageUpdateEvent(event as DiscordMessageUpdateEvent).pipe(
								Effect.catchAll((error) => onDispatchError("MESSAGE_UPDATE", error)),
							),
						),
						gateway.handleDispatch("MESSAGE_DELETE", (event) =>
							ingestMessageDeleteEvent(event as DiscordMessageDeleteEvent).pipe(
								Effect.catchAll((error) => onDispatchError("MESSAGE_DELETE", error)),
							),
						),
						gateway.handleDispatch("MESSAGE_REACTION_ADD", (event) =>
							ingestMessageReactionAddEvent(event as DiscordMessageReactionAddEvent).pipe(
								Effect.catchAll((error) =>
									onDispatchError("MESSAGE_REACTION_ADD", error),
								),
							),
						),
						gateway.handleDispatch("MESSAGE_REACTION_REMOVE", (event) =>
							ingestMessageReactionRemoveEvent(event as DiscordMessageReactionRemoveEvent).pipe(
								Effect.catchAll((error) =>
									onDispatchError("MESSAGE_REACTION_REMOVE", error),
								),
							),
						),
						gateway.handleDispatch("THREAD_CREATE", (event) =>
							ingestThreadCreateEvent(event as DiscordThreadCreateEvent).pipe(
								Effect.catchAll((error) => onDispatchError("THREAD_CREATE", error)),
							),
						),
					],
					{
						concurrency: "unbounded",
						discard: true,
					},
				)
			}).pipe(
				Effect.provide(DiscordLayer),
				Effect.catchAllCause((cause) =>
					Effect.logError("Discord gateway background worker stopped", {
						cause: String(cause),
					}),
				),
				Effect.forkScoped,
				Effect.asVoid,
			)
		})

		yield* start

		return {
			start: Effect.void,
		}
	}),
	dependencies: [DiscordSyncWorker.Default, ChatSyncChannelLinkRepo.Default],
}) {}

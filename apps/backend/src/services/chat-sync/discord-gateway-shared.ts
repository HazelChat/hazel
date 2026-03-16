import { createHash } from "node:crypto"
import {
	ExternalChannelId,
	ExternalMessageId,
	ExternalThreadId,
	ExternalUserId,
	ExternalWebhookId,
	SyncConnectionId,
} from "@hazel/schema"
import { ServiceMap, Effect, Option, Schema } from "effect"
import { DiscordSyncWorker } from "./discord-sync-worker"
import type { ChatSyncIngressMessageAttachment } from "./chat-sync-core-worker"

export interface DiscordMessageAuthor {
	id?: string
	username?: string
	global_name?: string | null
	discriminator?: string
	avatar?: string | null
	bot?: boolean
}

export interface DiscordReadyEvent {
	user?: { id?: string }
}

export interface DiscordMessageCreateEvent {
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

export interface DiscordMessageUpdateEvent {
	id?: string
	channel_id?: string
	content?: string
	webhook_id?: string
	author?: DiscordMessageAuthor
	edited_timestamp?: string | null
}

export interface DiscordMessageDeleteEvent {
	id?: string
	channel_id?: string
	webhook_id?: string
}

interface DiscordReactionEmoji {
	id?: string | null
	name?: string | null
}

export interface DiscordMessageReactionAddEvent {
	channel_id?: string
	message_id?: string
	user_id?: string
	user?: DiscordMessageAuthor
	member?: {
		user?: DiscordMessageAuthor
	}
	emoji?: DiscordReactionEmoji
}

export interface DiscordMessageReactionRemoveEvent {
	channel_id?: string
	message_id?: string
	user_id?: string
	user?: DiscordMessageAuthor
	member?: {
		user?: DiscordMessageAuthor
	}
	emoji?: DiscordReactionEmoji
}

export interface DiscordThreadCreateEvent {
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
				typeof attachment.id === "string" && attachment.id.trim().length > 0
					? attachment.id
					: undefined,
			fileName,
			fileSize:
				typeof attachment.size === "number" &&
				Number.isFinite(attachment.size) &&
				attachment.size >= 0
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

export const decodeRequiredExternalId = <A>(value: unknown, decode: ExternalIdDecoder<A>): Option.Option<A> =>
	decode(value)

export const decodeOptionalExternalId = <A>(value: unknown, decode: ExternalIdDecoder<A>): A | undefined => {
	if (value === undefined) return undefined
	const decoded = decode(value)
	return Option.isSome(decoded) ? decoded.value : undefined
}

const getValueType = (value: unknown): string => (value === null ? "null" : typeof value)

type GatewayDirection = "both" | "hazel_to_external" | "external_to_hazel"

type DiscordGatewayChannelLink = {
	readonly syncConnectionId: SyncConnectionId
	readonly direction: GatewayDirection
}

type DiscordGatewayDispatchWorker = Pick<
	ServiceMap.Service.Shape<typeof DiscordSyncWorker>,
	| "ingestMessageCreate"
	| "ingestMessageUpdate"
	| "ingestMessageDelete"
	| "ingestReactionAdd"
	| "ingestReactionRemove"
	| "ingestThreadCreate"
>

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

export const createDiscordGatewayDispatchHandlers = (deps: {
	discordSyncWorker: DiscordGatewayDispatchWorker
	findActiveLinksByExternalChannel: (
		externalChannelId: ExternalChannelId,
	) => Effect.Effect<ReadonlyArray<DiscordGatewayChannelLink>, unknown, never>
	isCurrentBotAuthor: (authorId?: string) => Effect.Effect<boolean, never, never>
}) => {
	const ingestMessageCreateEvent = Effect.fn("DiscordGatewayService.ingestMessageCreateEvent")(function* (
		event: DiscordMessageCreateEvent,
	) {
		if (!event.id || !event.channel_id || typeof event.content !== "string") return
		if (event.author?.bot) return
		if (yield* deps.isCurrentBotAuthor(event.author?.id)) return

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

		const externalAuthorId = yield* decodeOptionalExternalIdOrWarn({
			eventType: "MESSAGE_CREATE",
			field: "author.id",
			value: event.author?.id,
			decode: decodeExternalUserId,
		})

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
		const links = yield* deps.findActiveLinksByExternalChannel(externalChannelIdOption.value)
		const inboundLinks = links.filter((link) => link.direction !== "hazel_to_external")

		yield* Effect.forEach(inboundLinks, (link) =>
			deps.discordSyncWorker.ingestMessageCreate({
				syncConnectionId: link.syncConnectionId,
				externalChannelId: externalChannelIdOption.value,
				externalMessageId: externalMessageIdOption.value,
				externalWebhookId,
				content: event.content ?? "",
				externalAuthorId,
				externalAuthorDisplayName: formatDiscordDisplayName(event.author),
				externalAuthorAvatarUrl: buildAuthorAvatarUrl(event.author),
				externalReplyToMessageId: externalReplyToMessageId ?? null,
				externalAttachments,
				dedupeKey: `discord:gateway:create:${externalMessageIdOption.value}`,
			}),
		)
	})

	const ingestMessageUpdateEvent = Effect.fn("DiscordGatewayService.ingestMessageUpdateEvent")(function* (
		event: DiscordMessageUpdateEvent,
	) {
		if (!event.id || !event.channel_id || typeof event.content !== "string") return
		if (event.author?.bot) return
		if (yield* deps.isCurrentBotAuthor(event.author?.id)) return

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

		const externalWebhookId = yield* decodeOptionalExternalIdOrWarn({
			eventType: "MESSAGE_UPDATE",
			field: "webhook_id",
			value: event.webhook_id,
			decode: decodeExternalWebhookId,
		})

		const links = yield* deps.findActiveLinksByExternalChannel(externalChannelIdOption.value)
		const inboundLinks = links.filter((link) => link.direction !== "hazel_to_external")
		const content = event.content
		const dedupeSuffix =
			event.edited_timestamp ??
			createHash("sha256")
				.update(`${externalMessageIdOption.value}:${event.content ?? ""}`)
				.digest("hex")
				.slice(0, 16)

		yield* Effect.forEach(inboundLinks, (link) =>
			deps.discordSyncWorker.ingestMessageUpdate({
				syncConnectionId: link.syncConnectionId,
				externalChannelId: externalChannelIdOption.value,
				externalMessageId: externalMessageIdOption.value,
				externalWebhookId,
				content,
				dedupeKey: `discord:gateway:update:${externalMessageIdOption.value}:${dedupeSuffix}`,
			}),
		)
	})

	const ingestMessageDeleteEvent = Effect.fn("DiscordGatewayService.ingestMessageDeleteEvent")(function* (
		event: DiscordMessageDeleteEvent,
	) {
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

		const externalWebhookId = yield* decodeOptionalExternalIdOrWarn({
			eventType: "MESSAGE_DELETE",
			field: "webhook_id",
			value: event.webhook_id,
			decode: decodeExternalWebhookId,
		})

		const links = yield* deps.findActiveLinksByExternalChannel(externalChannelIdOption.value)
		const inboundLinks = links.filter((link) => link.direction !== "hazel_to_external")

		yield* Effect.forEach(inboundLinks, (link) =>
			deps.discordSyncWorker.ingestMessageDelete({
				syncConnectionId: link.syncConnectionId,
				externalChannelId: externalChannelIdOption.value,
				externalMessageId: externalMessageIdOption.value,
				externalWebhookId,
				dedupeKey: `discord:gateway:delete:${externalMessageIdOption.value}`,
			}),
		)
	})

	const ingestMessageReactionAddEvent = Effect.fn("DiscordGatewayService.ingestMessageReactionAddEvent")(
		function* (event: DiscordMessageReactionAddEvent) {
			if (!event.channel_id || !event.message_id || !event.user_id) return

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

			const links = yield* deps.findActiveLinksByExternalChannel(externalChannelIdOption.value)
			const inboundLinks = links.filter((link) => link.direction !== "hazel_to_external")

			yield* Effect.forEach(inboundLinks, (link) =>
				deps.discordSyncWorker.ingestReactionAdd({
					syncConnectionId: link.syncConnectionId,
					externalChannelId: externalChannelIdOption.value,
					externalMessageId: externalMessageIdOption.value,
					externalUserId: externalUserIdOption.value,
					emoji,
					externalAuthorDisplayName,
					externalAuthorAvatarUrl,
					dedupeKey: `discord:gateway:reaction:add:${externalChannelIdOption.value}:${externalMessageIdOption.value}:${externalUserIdOption.value}:${emoji}`,
				}),
			)
		},
	)

	const ingestMessageReactionRemoveEvent = Effect.fn(
		"DiscordGatewayService.ingestMessageReactionRemoveEvent",
	)(function* (event: DiscordMessageReactionRemoveEvent) {
		if (!event.channel_id || !event.message_id || !event.user_id) return

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

		const links = yield* deps.findActiveLinksByExternalChannel(externalChannelIdOption.value)
		const inboundLinks = links.filter((link) => link.direction !== "hazel_to_external")

		yield* Effect.forEach(inboundLinks, (link) =>
			deps.discordSyncWorker.ingestReactionRemove({
				syncConnectionId: link.syncConnectionId,
				externalChannelId: externalChannelIdOption.value,
				externalMessageId: externalMessageIdOption.value,
				externalUserId: externalUserIdOption.value,
				emoji,
				externalAuthorDisplayName,
				externalAuthorAvatarUrl,
				dedupeKey: `discord:gateway:reaction:remove:${externalChannelIdOption.value}:${externalMessageIdOption.value}:${externalUserIdOption.value}:${emoji}`,
			}),
		)
	})

	const ingestThreadCreateEvent = Effect.fn("DiscordGatewayService.ingestThreadCreateEvent")(function* (
		event: DiscordThreadCreateEvent,
	) {
		if (!event.id || !event.parent_id || event.type !== 11) return

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

		const links = yield* deps.findActiveLinksByExternalChannel(externalParentChannelIdOption.value)
		const inboundLinks = links.filter((link) => link.direction !== "hazel_to_external")

		yield* Effect.forEach(inboundLinks, (link) =>
			deps.discordSyncWorker.ingestThreadCreate({
				syncConnectionId: link.syncConnectionId,
				externalParentChannelId: externalParentChannelIdOption.value,
				externalThreadId: externalThreadIdOption.value,
				name: event.name,
				dedupeKey: `discord:gateway:thread:create:${externalThreadIdOption.value}`,
			}),
		)
	})

	return {
		ingestMessageCreateEvent,
		ingestMessageUpdateEvent,
		ingestMessageDeleteEvent,
		ingestMessageReactionAddEvent,
		ingestMessageReactionRemoveEvent,
		ingestThreadCreateEvent,
	}
}

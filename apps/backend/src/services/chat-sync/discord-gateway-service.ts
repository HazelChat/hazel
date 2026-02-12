import { createHash } from "node:crypto"
import { FetchHttpClient } from "@effect/platform"
import { BunSocket } from "@effect/platform-bun"
import { ChatSyncChannelLinkRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import { DiscordConfig } from "dfx"
import { DiscordGateway, DiscordLive } from "dfx/gateway"
import { Config, Effect, Layer, Option, Redacted, Ref } from "effect"
import { DiscordSyncWorker } from "./discord-sync-worker"

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
	author?: DiscordMessageAuthor
	message_reference?: {
		message_id?: string
		channel_id?: string
	}
}

interface DiscordMessageUpdateEvent {
	id?: string
	channel_id?: string
	content?: string
	author?: DiscordMessageAuthor
	edited_timestamp?: string | null
}

interface DiscordMessageDeleteEvent {
	id?: string
	channel_id?: string
}

interface DiscordReactionEmoji {
	id?: string | null
	name?: string | null
}

interface DiscordMessageReactionAddEvent {
	channel_id?: string
	message_id?: string
	user_id?: string
	emoji?: DiscordReactionEmoji
}

interface DiscordMessageReactionRemoveEvent {
	channel_id?: string
	message_id?: string
	user_id?: string
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

const formatDiscordEmoji = (emoji?: DiscordReactionEmoji): string | null => {
	if (!emoji?.name) return null
	if (emoji.id) return `${emoji.name}:${emoji.id}`
	return emoji.name
}

const DISCORD_REQUIRED_GATEWAY_INTENTS = 34305

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
		const botUserIdRef = yield* Ref.make<Option.Option<string>>(Option.none())

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

		const ingestMessageCreateEvent = Effect.fn("DiscordGatewayService.ingestMessageCreateEvent")(
			function* (event: DiscordMessageCreateEvent) {
				if (!event.id || !event.channel_id || typeof event.content !== "string") return
				if (event.author?.bot) return
				if (yield* isCurrentBotAuthor(event.author?.id)) return

				const externalAuthorId = event.author?.id ?? null
				const externalAuthorDisplayName = formatDiscordDisplayName(event.author)
				const externalAuthorAvatarUrl = buildAuthorAvatarUrl(event.author)

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(event.channel_id)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestMessageCreate({
						syncConnectionId: link.syncConnectionId,
						externalChannelId: event.channel_id,
						externalMessageId: event.id,
						content: event.content,
						externalAuthorId: externalAuthorId ?? undefined,
						externalAuthorDisplayName,
						externalAuthorAvatarUrl,
						externalReplyToMessageId: event.message_reference?.message_id ?? null,
						externalThreadId: null,
						dedupeKey: `discord:gateway:create:${event.id}`,
					})
				}
			},
		)

		const ingestMessageUpdateEvent = Effect.fn("DiscordGatewayService.ingestMessageUpdateEvent")(
			function* (event: DiscordMessageUpdateEvent) {
				if (!event.id || !event.channel_id || typeof event.content !== "string") return
				if (event.author?.bot) return
				if (yield* isCurrentBotAuthor(event.author?.id)) return

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(event.channel_id)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					const updateVersion =
						event.edited_timestamp ??
						createHash("sha256")
							.update(`${event.id}:${event.content ?? ""}`)
							.digest("hex")
							.slice(0, 16)
					yield* discordSyncWorker.ingestMessageUpdate({
						syncConnectionId: link.syncConnectionId,
						externalChannelId: event.channel_id,
						externalMessageId: event.id,
						content: event.content,
						dedupeKey: `discord:gateway:update:${event.id}:${updateVersion}`,
					})
				}
			},
		)

		const ingestMessageDeleteEvent = Effect.fn("DiscordGatewayService.ingestMessageDeleteEvent")(
			function* (event: DiscordMessageDeleteEvent) {
				if (!event.id || !event.channel_id) return

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(event.channel_id)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestMessageDelete({
						syncConnectionId: link.syncConnectionId,
						externalChannelId: event.channel_id,
						externalMessageId: event.id,
						dedupeKey: `discord:gateway:delete:${event.id}`,
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

			const links = yield* channelLinkRepo
				.findActiveByExternalChannel(event.channel_id)
				.pipe(withSystemActor)

			for (const link of links) {
				if (link.direction === "hazel_to_external") continue
				yield* discordSyncWorker.ingestReactionAdd({
					syncConnectionId: link.syncConnectionId,
					externalChannelId: event.channel_id,
					externalMessageId: event.message_id,
					externalUserId: event.user_id,
					emoji,
					dedupeKey: `discord:gateway:reaction:add:${event.channel_id}:${event.message_id}:${event.user_id}:${emoji}`,
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

			const links = yield* channelLinkRepo
				.findActiveByExternalChannel(event.channel_id)
				.pipe(withSystemActor)

			for (const link of links) {
				if (link.direction === "hazel_to_external") continue
				yield* discordSyncWorker.ingestReactionRemove({
					syncConnectionId: link.syncConnectionId,
					externalChannelId: event.channel_id,
					externalMessageId: event.message_id,
					externalUserId: event.user_id,
					emoji,
					dedupeKey: `discord:gateway:reaction:remove:${event.channel_id}:${event.message_id}:${event.user_id}:${emoji}`,
				})
			}
		})

		const ingestThreadCreateEvent = Effect.fn("DiscordGatewayService.ingestThreadCreateEvent")(
			function* (event: DiscordThreadCreateEvent) {
				if (!event.id || !event.parent_id) return
				if (event.type !== undefined && event.type !== 11 && event.type !== 12) return

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(event.parent_id)
					.pipe(withSystemActor)

				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker.ingestThreadCreate({
						syncConnectionId: link.syncConnectionId,
						externalParentChannelId: event.parent_id,
						externalThreadId: event.id,
						externalRootMessageId: event.id,
						name: event.name ?? "Thread",
						dedupeKey: `discord:gateway:thread:create:${event.id}`,
					})
				}
			},
		)

		const onReady = Effect.fn("DiscordGatewayService.onReady")(function* (event: DiscordReadyEvent) {
			if (!event.user?.id) {
				yield* Effect.logWarning("Discord gateway READY payload missing bot user id")
				return
			}

			yield* Ref.set(botUserIdRef, Option.some(event.user.id))
			yield* Effect.logInfo("Discord gateway READY", {
				botUserId: event.user.id,
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

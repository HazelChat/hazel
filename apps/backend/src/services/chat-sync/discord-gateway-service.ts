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
}

interface DiscordMessageUpdateEvent {
	id?: string
	channel_id?: string
	content?: string
	author?: DiscordMessageAuthor
}

interface DiscordMessageDeleteEvent {
	id?: string
	channel_id?: string
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

export class DiscordGatewayService extends Effect.Service<DiscordGatewayService>()("DiscordGatewayService", {
	accessors: true,
	effect: Effect.gen(function* () {
		const discordSyncWorker = yield* DiscordSyncWorker
		const channelLinkRepo = yield* ChatSyncChannelLinkRepo

		const gatewayEnabled = yield* Config.boolean("DISCORD_GATEWAY_ENABLED").pipe(
			Config.withDefault(true),
			Effect.orDie,
		)
		const intents = yield* Config.number("DISCORD_GATEWAY_INTENTS").pipe(
			Config.withDefault(33281),
			Effect.orDie,
		)
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
					yield* discordSyncWorker.ingestMessageUpdate({
						syncConnectionId: link.syncConnectionId,
						externalChannelId: event.channel_id,
						externalMessageId: event.id,
						content: event.content,
						dedupeKey: `discord:gateway:update:${event.id}`,
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

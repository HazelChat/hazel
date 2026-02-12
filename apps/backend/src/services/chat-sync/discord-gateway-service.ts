import { ChatSyncChannelLinkRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import { Config, Effect, Option, Redacted, Runtime } from "effect"
import { DiscordSyncWorker } from "./discord-sync-worker"

interface DiscordGatewayEnvelope {
	op: number
	t?: string
	s?: number | null
	d?: unknown
}

interface DiscordReadyEvent {
	session_id?: string
	resume_gateway_url?: string
	user?: { id?: string }
}

interface DiscordMessageAuthor {
	id?: string
	username?: string
	global_name?: string | null
	discriminator?: string
	avatar?: string | null
	bot?: boolean
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

const DISCORD_GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"
const DISCORD_FATAL_CLOSE_CODES = new Set([4004, 4010, 4011, 4012, 4013, 4014])

export class DiscordGatewayService extends Effect.Service<DiscordGatewayService>()("DiscordGatewayService", {
	accessors: true,
	effect: Effect.gen(function* () {
		const discordSyncWorker = yield* DiscordSyncWorker
		const channelLinkRepo = yield* ChatSyncChannelLinkRepo
		const runtime = yield* Effect.runtime<DiscordSyncWorker | ChatSyncChannelLinkRepo>()
		const runFork = Runtime.runFork(runtime)

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
		let sequence: number | null = null
		let sessionId: string | null = null
		let resumeGatewayUrl: string | null = null
		let botUserId: string | null = null

		const ingestMessageCreateEvent = Effect.fn("DiscordGatewayService.ingestMessageCreateEvent")(
			function* (event: DiscordMessageCreateEvent) {
				if (!event.id || !event.channel_id || typeof event.content !== "string") {
					return
				}
				if (event.author?.bot) {
					return
				}
				if (botUserId && event.author?.id === botUserId) {
					return
				}

				const externalAuthorId = event.author?.id ?? null
				const externalAuthorDisplayName = event.author
					? event.author.global_name ??
						(event.author.discriminator && event.author.discriminator !== "0"
							? `${event.author.username ?? "discord-user"}#${event.author.discriminator}`
							: event.author.username ?? "Discord User")
					: "Discord User"
				const externalAuthorAvatarUrl =
					externalAuthorId && event.author?.avatar
						? `https://cdn.discordapp.com/avatars/${externalAuthorId}/${event.author.avatar}.png`
						: null

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(event.channel_id)
					.pipe(withSystemActor)
				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker
						.ingestMessageCreate({
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
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to ingest Discord message create", {
									externalMessageId: event.id,
									syncConnectionId: link.syncConnectionId,
									error: String(error),
								}),
							),
						)
				}
			},
		)

		const ingestMessageUpdateEvent = Effect.fn("DiscordGatewayService.ingestMessageUpdateEvent")(
			function* (event: DiscordMessageUpdateEvent) {
				if (!event.id || !event.channel_id || typeof event.content !== "string") {
					return
				}
				if (event.author?.bot) {
					return
				}
				if (botUserId && event.author?.id === botUserId) {
					return
				}

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(event.channel_id)
					.pipe(withSystemActor)
				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker
						.ingestMessageUpdate({
							syncConnectionId: link.syncConnectionId,
							externalChannelId: event.channel_id,
							externalMessageId: event.id,
							content: event.content,
							dedupeKey: `discord:gateway:update:${event.id}`,
						})
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to ingest Discord message update", {
									externalMessageId: event.id,
									syncConnectionId: link.syncConnectionId,
									error: String(error),
								}),
							),
						)
				}
			},
		)

		const ingestMessageDeleteEvent = Effect.fn("DiscordGatewayService.ingestMessageDeleteEvent")(
			function* (event: DiscordMessageDeleteEvent) {
				if (!event.id || !event.channel_id) {
					return
				}

				const links = yield* channelLinkRepo
					.findActiveByExternalChannel(event.channel_id)
					.pipe(withSystemActor)
				for (const link of links) {
					if (link.direction === "hazel_to_external") continue
					yield* discordSyncWorker
						.ingestMessageDelete({
							syncConnectionId: link.syncConnectionId,
							externalChannelId: event.channel_id,
							externalMessageId: event.id,
							dedupeKey: `discord:gateway:delete:${event.id}`,
						})
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to ingest Discord message delete", {
									externalMessageId: event.id,
									syncConnectionId: link.syncConnectionId,
									error: String(error),
								}),
							),
						)
				}
			},
		)

		const runGatewaySession = Effect.fn("DiscordGatewayService.runGatewaySession")(function* () {
			const gatewayUrl = resumeGatewayUrl
				? `wss://${resumeGatewayUrl}/?v=10&encoding=json`
				: DISCORD_GATEWAY_URL

			yield* Effect.logInfo("Connecting to Discord gateway", {
				gatewayUrl,
				hasSessionId: !!sessionId,
				hasSequence: sequence !== null,
			})

			const result = yield* Effect.async<{ fatal: boolean }, never>((resume) => {
				let finished = false
				let heartbeatInterval: ReturnType<typeof setInterval> | null = null
				const websocket = new WebSocket(gatewayUrl)

				const finish = (fatal: boolean) => {
					if (finished) return
					finished = true
					if (heartbeatInterval) {
						clearInterval(heartbeatInterval)
						heartbeatInterval = null
					}
					resume(Effect.succeed({ fatal }))
				}

				const sendPayload = (payload: unknown) => {
					if (websocket.readyState === WebSocket.OPEN) {
						websocket.send(JSON.stringify(payload))
					}
				}

				const sendHeartbeat = () => {
					sendPayload({ op: 1, d: sequence })
				}

				const sendIdentifyOrResume = () => {
					if (sessionId && sequence !== null) {
						sendPayload({
							op: 6,
							d: {
								token: botToken,
								session_id: sessionId,
								seq: sequence,
							},
						})
						return
					}

					sendPayload({
						op: 2,
						d: {
							token: botToken,
							intents,
							properties: {
								os: "linux",
								browser: "hazel",
								device: "hazel-backend",
							},
						},
					})
				}

				websocket.onopen = () => {
					runFork(
						Effect.logDebug("Discord gateway websocket opened", {
							gatewayUrl,
						}),
					)
				}

				websocket.onmessage = (event) => {
					if (typeof event.data !== "string") {
						return
					}

					let payload: DiscordGatewayEnvelope
					try {
						payload = JSON.parse(event.data) as DiscordGatewayEnvelope
					} catch {
						return
					}

					if (typeof payload.s === "number") {
						sequence = payload.s
					}

					switch (payload.op) {
						case 10: {
							const helloData = payload.d as { heartbeat_interval?: number } | undefined
							const intervalMs = helloData?.heartbeat_interval ?? 41250
							sendIdentifyOrResume()
							sendHeartbeat()
							heartbeatInterval = setInterval(sendHeartbeat, intervalMs)
							return
						}
						case 9: {
							// Invalid session: drop state and reconnect with fresh identify
							sessionId = null
							sequence = null
							resumeGatewayUrl = null
							websocket.close(4000, "invalid session")
							return
						}
						case 0: {
							if (!payload.t) return

							if (payload.t === "READY") {
								const ready = payload.d as DiscordReadyEvent
								if (ready.session_id) {
									sessionId = ready.session_id
								}
								if (ready.resume_gateway_url) {
									resumeGatewayUrl = ready.resume_gateway_url
								}
								if (ready.user?.id) {
									botUserId = ready.user.id
								}
								return
							}

							if (payload.t === "MESSAGE_CREATE") {
								runFork(ingestMessageCreateEvent(payload.d as DiscordMessageCreateEvent))
								return
							}

							if (payload.t === "MESSAGE_UPDATE") {
								runFork(ingestMessageUpdateEvent(payload.d as DiscordMessageUpdateEvent))
								return
							}

							if (payload.t === "MESSAGE_DELETE") {
								runFork(ingestMessageDeleteEvent(payload.d as DiscordMessageDeleteEvent))
							}
						}
					}
				}

				websocket.onerror = (error) => {
					runFork(
						Effect.logWarning("Discord gateway websocket error", {
							error: String(error),
						}),
					)
				}

				websocket.onclose = (event) => {
					const fatal = DISCORD_FATAL_CLOSE_CODES.has(event.code)
					runFork(
						Effect.logWarning("Discord gateway websocket closed", {
							code: event.code,
							reason: event.reason,
							fatal,
						}),
					)
					finish(fatal)
				}

				return Effect.sync(() => {
					if (!finished) {
						try {
							websocket.close()
						} catch {
							// no-op
						}
					}
					if (heartbeatInterval) {
						clearInterval(heartbeatInterval)
					}
				})
			})

			return result
		})

		const start = Effect.gen(function* () {
			yield* Effect.logInfo("Starting Discord gateway background worker")

			yield* Effect.forever(
				Effect.gen(function* () {
					const session = yield* runGatewaySession()
					if (session.fatal) {
						yield* Effect.logError(
							"Discord gateway closed with fatal code; stopping reconnect loop",
						)
						return yield* Effect.interrupt
					}

					yield* Effect.sleep("2 seconds")
				}),
			).pipe(
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

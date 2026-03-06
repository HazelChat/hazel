import { BunRuntime } from "@effect/platform-bun"
import { BotRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import {
	BotGatewayClientFrame,
	BotGatewayEnvelope,
	BotGatewayHeartbeatAckFrame,
	BotGatewayHelloFrame,
	BotGatewayIdentifyFrame,
	BotGatewayServerFrame,
} from "@hazel/domain"
import { Redis } from "@hazel/effect-bun"
import type { BotId } from "@hazel/schema"
import type { ServerWebSocket } from "bun"
import { Config, ConfigProvider, Deferred, Effect, Layer, Option, Ref, Runtime, Schema } from "effect"

const DEFAULT_PORT = 3034
const DEFAULT_DURABLE_STREAMS_URL = "http://localhost:4437/v1/stream"
const DEFAULT_HEARTBEAT_INTERVAL_MS = 25_000
const DEFAULT_LEASE_TTL_SECONDS = 75
const DEFAULT_BATCH_ACK_TIMEOUT_MS = 60_000

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, "")
const buildStreamPath = (baseUrl: string, botId: BotId): string =>
	`${normalizeBaseUrl(baseUrl)}/bots/${botId}/gateway`
const leaseKeyForBot = (botId: BotId): string => `bot-gateway:lease:${botId}`
const sessionId = (): string => crypto.randomUUID()

async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(token)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

const responseText = (response: Response): Promise<string> =>
	response.text().catch(() => `${response.status} ${response.statusText}`)

class GatewayConfig extends Effect.Service<GatewayConfig>()("GatewayConfig", {
	accessors: true,
	effect: Effect.gen(function* () {
		return {
			port: yield* Config.integer("PORT").pipe(Config.withDefault(DEFAULT_PORT)),
			isDev: yield* Config.boolean("IS_DEV").pipe(Config.withDefault(false)),
			databaseUrl: yield* Config.redacted("DATABASE_URL"),
			durableStreamsUrl: yield* Config.string("DURABLE_STREAMS_URL").pipe(
				Config.withDefault(DEFAULT_DURABLE_STREAMS_URL),
			),
			heartbeatIntervalMs: yield* Config.integer("GATEWAY_HEARTBEAT_INTERVAL_MS").pipe(
				Config.withDefault(DEFAULT_HEARTBEAT_INTERVAL_MS),
			),
			leaseTtlSeconds: yield* Config.integer("GATEWAY_LEASE_TTL_SECONDS").pipe(
				Config.withDefault(DEFAULT_LEASE_TTL_SECONDS),
			),
			batchAckTimeoutMs: yield* Config.integer("GATEWAY_BATCH_ACK_TIMEOUT_MS").pipe(
				Config.withDefault(DEFAULT_BATCH_ACK_TIMEOUT_MS),
			),
		} as const
	}),
}) {}

class GatewayAuthError extends Schema.TaggedError<GatewayAuthError>()("GatewayAuthError", {
	message: Schema.String,
}) {}

class GatewayProtocolError extends Schema.TaggedError<GatewayProtocolError>()("GatewayProtocolError", {
	message: Schema.String,
}) {}

class DurableStreamGatewayError extends Schema.TaggedError<DurableStreamGatewayError>()(
	"DurableStreamGatewayError",
	{
		message: Schema.String,
		cause: Schema.Unknown,
	},
) {}

interface GatewayBatch {
	readonly events: ReadonlyArray<Schema.Schema.Type<typeof BotGatewayEnvelope>>
	readonly nextOffset: string
}

interface PendingAck {
	readonly nextOffset: string
	readonly deferred: Deferred.Deferred<void, GatewayProtocolError>
}

interface GatewaySession {
	readonly sessionId: string
	readonly botId: BotId
	readonly botName: string
	currentOffset: string
	socket: ServerWebSocket<{ sessionId: string | null }>
	pendingAck: PendingAck | null
	closed: boolean
}

class DurableStreamClient extends Effect.Service<DurableStreamClient>()("DurableStreamClient", {
	accessors: true,
	effect: Effect.gen(function* () {
		const config = yield* GatewayConfig
		const ensuredStreamsRef = yield* Ref.make(new Set<string>())

		const ensureStream = Effect.fn("BotGateway.ensureStream")(function* (botId: BotId) {
			const ensured = yield* Ref.get(ensuredStreamsRef)
			if (ensured.has(botId)) {
				return
			}

			const response = yield* Effect.tryPromise({
				try: () =>
					fetch(buildStreamPath(config.durableStreamsUrl, botId), {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
					}),
				catch: (cause) =>
					new DurableStreamGatewayError({
						message: `Failed to create durable stream for bot ${botId}`,
						cause,
					}),
			})

			if (!response.ok && response.status !== 409) {
				const detail = yield* Effect.promise(() => responseText(response))
				return yield* Effect.fail(
					new DurableStreamGatewayError({
						message: `Failed to create durable stream for bot ${botId}: ${detail}`,
						cause: response.status,
					}),
				)
			}

			yield* Ref.update(ensuredStreamsRef, (current) => {
				const next = new Set(current)
				next.add(botId)
				return next
			})
		})

		const proxyRead = Effect.fn("BotGateway.proxyRead")(function* (
			botId: BotId,
			query: URLSearchParams,
		) {
			yield* ensureStream(botId)
			const url = new URL(buildStreamPath(config.durableStreamsUrl, botId))
			for (const [key, value] of query.entries()) {
				url.searchParams.set(key, value)
			}

			const response = yield* Effect.tryPromise({
				try: () =>
					fetch(url, {
						method: "GET",
						headers: { Accept: "application/json" },
					}),
				catch: (cause) =>
					new DurableStreamGatewayError({
						message: `Failed to read durable stream for bot ${botId}`,
						cause,
					}),
			})

			if (!response.ok) {
				const detail = yield* Effect.promise(() => responseText(response))
				return yield* Effect.fail(
					new DurableStreamGatewayError({
						message: `Failed to read durable stream for bot ${botId}: ${detail}`,
						cause: response.status,
					}),
				)
			}

			return response
		})

		const readBatch = Effect.fn("BotGateway.readBatch")(function* (botId: BotId, offset: string) {
			const query = new URLSearchParams({
				offset,
				live: "long-poll",
			})
			const response = yield* proxyRead(botId, query)
			const payload = yield* Effect.tryPromise({
				try: () => response.text(),
				catch: (cause) =>
					new DurableStreamGatewayError({
						message: `Failed to read durable stream payload for bot ${botId}`,
						cause,
					}),
			})
			const nextOffset = response.headers.get("Stream-Next-Offset") ?? offset

			if (payload.trim().length === 0) {
				return {
					events: [],
					nextOffset,
				} satisfies GatewayBatch
			}

			const raw = yield* Effect.try({
				try: () => JSON.parse(payload) as unknown,
				catch: (cause) =>
					new DurableStreamGatewayError({
						message: `Failed to parse durable stream payload for bot ${botId}`,
						cause,
					}),
			})
			const events = yield* Schema.decodeUnknown(Schema.Array(BotGatewayEnvelope))(raw).pipe(
				Effect.mapError(
					(cause) =>
						new DurableStreamGatewayError({
							message: `Failed to decode durable stream payload for bot ${botId}`,
							cause,
						}),
				),
			)

			return {
				events,
				nextOffset,
			} satisfies GatewayBatch
		})

		return {
			ensureStream,
			proxyRead,
			readBatch,
		}
	}),
}) {}

class BotGatewayHub extends Effect.Service<BotGatewayHub>()("BotGatewayHub", {
	accessors: true,
	effect: Effect.gen(function* () {
		const botRepo = yield* BotRepo
		const redis = yield* Redis
		const durableStreams = yield* DurableStreamClient
		const config = yield* GatewayConfig
		const runtime = (yield* Effect.runtime<any>()) as Runtime.Runtime<never>
		const sessionsRef = yield* Ref.make(new Map<string, GatewaySession>())

		const sendFrame = (socket: ServerWebSocket<{ sessionId: string | null }>, frame: BotGatewayServerFrame) =>
			Effect.sync(() => {
				socket.send(JSON.stringify(frame))
			})

		const getSession = (id: string) =>
			Ref.get(sessionsRef).pipe(Effect.map((sessions) => sessions.get(id) ?? null))

		const updateSession = (
			id: string,
			update: (session: GatewaySession) => GatewaySession,
		) =>
			Ref.update(sessionsRef, (sessions) => {
				const existing = sessions.get(id)
				if (!existing) {
					return sessions
				}
				const next = new Map(sessions)
				next.set(id, update(existing))
				return next
			})

		const deleteSession = (id: string) =>
			Ref.update(sessionsRef, (sessions) => {
				if (!sessions.has(id)) {
					return sessions
				}
				const next = new Map(sessions)
				next.delete(id)
				return next
			})

		const tryClaimLease = Effect.fn("BotGateway.tryClaimLease")(function* (
			botId: BotId,
			id: string,
		) {
			const key = leaseKeyForBot(botId)
			const existing = yield* redis.get(key)
			if (existing === id) {
				yield* redis.expire(key, config.leaseTtlSeconds)
				return true
			}
			if (existing !== null) {
				return false
			}

			const result = yield* redis.send<string | null>("SET", [
				key,
				id,
				"EX",
				String(config.leaseTtlSeconds),
				"NX",
			])
			return result === "OK"
		})

		const renewLease = Effect.fn("BotGateway.renewLease")(function* (botId: BotId, id: string) {
			const key = leaseKeyForBot(botId)
			const existing = yield* redis.get(key)
			if (existing !== id) {
				return false
			}
			yield* redis.expire(key, config.leaseTtlSeconds)
			return true
		})

		const releaseLease = Effect.fn("BotGateway.releaseLease")(function* (botId: BotId, id: string) {
			const key = leaseKeyForBot(botId)
			const existing = yield* redis.get(key)
			if (existing === id) {
				yield* redis.del(key)
			}
		})

		const validateBotToken = Effect.fn("BotGateway.validateBotToken")(function* (token: string) {
			const tokenHash = yield* Effect.promise(() => hashToken(token))
			const botOption = yield* botRepo.findByTokenHash(tokenHash)
			if (Option.isNone(botOption)) {
				return yield* Effect.fail(new GatewayAuthError({ message: "Invalid bot token" }))
			}
			return botOption.value
		})

		const parseClientFrame = (payload: string) =>
			Effect.try({
				try: () => Schema.decodeUnknownSync(BotGatewayClientFrame)(JSON.parse(payload)),
				catch: (cause) =>
					new GatewayProtocolError({
						message: `Failed to decode gateway frame: ${String(cause)}`,
					}),
			})

			const decodePayload = (payload: string | BufferSource) => {
				if (typeof payload === "string") {
					return payload
				}
				if (payload instanceof ArrayBuffer) {
					return new TextDecoder().decode(new Uint8Array(payload))
				}
				return new TextDecoder().decode(
					new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength),
				)
			}

		const startDeliveryLoop = (id: string) =>
			Effect.gen(function* () {
				while (true) {
					const session = yield* getSession(id)
					if (!session || session.closed) {
						return
					}

					const batch = yield* durableStreams.readBatch(session.botId, session.currentOffset)
					if (batch.events.length === 0) {
						yield* updateSession(id, (current) => ({
							...current,
							currentOffset: batch.nextOffset,
						}))
						continue
					}

					const ackDeferred = yield* Deferred.make<void, GatewayProtocolError>()
					yield* updateSession(id, (current) => ({
						...current,
						pendingAck: {
							nextOffset: batch.nextOffset,
							deferred: ackDeferred,
						},
					}))

					yield* sendFrame(session.socket, {
						op: "DISPATCH",
						sessionId: id,
						events: batch.events,
						nextOffset: batch.nextOffset,
					})

					const ackResult = yield* Deferred.await(ackDeferred).pipe(
						Effect.timeoutFail({
							onTimeout: () =>
								new GatewayProtocolError({
									message: `Timed out waiting for ACK from session ${id}`,
								}),
							duration: config.batchAckTimeoutMs,
						}),
					)
					void ackResult
				}
			}).pipe(
				Effect.catchTags({
					DurableStreamGatewayError: (error: DurableStreamGatewayError) =>
						Effect.logWarning("Gateway delivery loop failed", { error, sessionId: id }).pipe(
							Effect.zipRight(
								Effect.gen(function* () {
									const session = yield* getSession(id)
									if (session) {
										yield* sendFrame(session.socket, {
											op: "RECONNECT",
											reason: "durable_stream_unavailable",
										})
										yield* Effect.sync(() => session.socket.close(1012, "durable_stream_unavailable"))
									}
								}),
							),
						),
					GatewayProtocolError: (error: GatewayProtocolError) =>
						Effect.logWarning("Gateway delivery loop protocol failure", { error, sessionId: id }).pipe(
							Effect.zipRight(
								Effect.gen(function* () {
									const session = yield* getSession(id)
									if (session) {
										yield* sendFrame(session.socket, {
											op: "RECONNECT",
											reason: error.message,
										})
										yield* Effect.sync(() => session.socket.close(1012, error.message))
									}
								}),
							),
						),
				}),
			)

		const identify = Effect.fn("BotGateway.identify")(function* (
			socket: ServerWebSocket<{ sessionId: string | null }>,
			frame: Schema.Schema.Type<typeof BotGatewayIdentifyFrame>,
			resumed: boolean,
			resumeSessionId?: string,
		) {
			const bot = yield* validateBotToken(frame.botToken)
			const id = resumeSessionId ?? sessionId()
			const leaseClaimed = yield* tryClaimLease(bot.id, id)
			if (!leaseClaimed) {
				yield* sendFrame(socket, {
					op: "INVALID_SESSION",
					reason: "another active session already owns this bot token",
				})
				return
			}

			yield* durableStreams.ensureStream(bot.id)
			const session: GatewaySession = {
				sessionId: id,
				botId: bot.id,
				botName: bot.name,
				currentOffset: frame.resumeOffset,
				socket,
				pendingAck: null,
				closed: false,
			}
			yield* Ref.update(sessionsRef, (sessions) => {
				const next = new Map(sessions)
				next.set(id, session)
				return next
			})
			socket.data.sessionId = id

			yield* sendFrame(socket, {
				op: "READY",
				sessionId: id,
				resumed,
				resumeOffset: frame.resumeOffset,
			})

			Runtime.runFork(runtime)(startDeliveryLoop(id))
		})

		const onOpen = (socket: ServerWebSocket<{ sessionId: string | null }>) =>
			sendFrame(socket, {
				op: "HELLO",
				heartbeatIntervalMs: config.heartbeatIntervalMs,
			} satisfies Schema.Schema.Type<typeof BotGatewayHelloFrame>)

		const onMessage = (
			socket: ServerWebSocket<{ sessionId: string | null }>,
			rawPayload: string | BufferSource,
		) =>
			Effect.gen(function* () {
				const frame = yield* parseClientFrame(decodePayload(rawPayload))
				switch (frame.op) {
					case "IDENTIFY": {
						yield* identify(socket, frame, false)
						return
					}
					case "RESUME": {
						yield* identify(
							socket,
							{
								op: "IDENTIFY",
								botToken: frame.botToken,
								resumeOffset: frame.resumeOffset,
							},
							true,
							frame.sessionId,
						)
						return
					}
					case "HEARTBEAT": {
						const id = socket.data.sessionId ?? frame.sessionId ?? null
						if (id) {
							const session = yield* getSession(id)
							if (session) {
								yield* renewLease(session.botId, id)
							}
						}
						yield* sendFrame(socket, {
							op: "HEARTBEAT_ACK",
							sessionId: id ?? undefined,
						} satisfies Schema.Schema.Type<typeof BotGatewayHeartbeatAckFrame>)
						return
					}
					case "ACK": {
						const session = yield* getSession(frame.sessionId)
						if (!session || session.pendingAck === null) {
							return
						}
						if (session.pendingAck.nextOffset !== frame.nextOffset) {
							return
						}

						yield* updateSession(frame.sessionId, (current) => ({
							...current,
							currentOffset: frame.nextOffset,
							pendingAck: null,
						}))
						yield* Deferred.succeed(session.pendingAck.deferred, undefined)
						return
					}
				}
			}).pipe(
				Effect.catchTags({
					GatewayAuthError: (error) =>
						sendFrame(socket, {
							op: "INVALID_SESSION",
							reason: error.message,
						}),
					GatewayProtocolError: (error) =>
						sendFrame(socket, {
							op: "INVALID_SESSION",
							reason: error.message,
						}).pipe(
							Effect.zipRight(Effect.sync(() => socket.close(1008, error.message))),
						),
				}),
			)

		const onClose = (socket: ServerWebSocket<{ sessionId: string | null }>) =>
			Effect.gen(function* () {
				const id = socket.data.sessionId
				if (!id) {
					return
				}
				const session = yield* getSession(id)
				if (!session) {
					return
				}

				session.closed = true
				if (session.pendingAck) {
					yield* Deferred.fail(
						session.pendingAck.deferred,
						new GatewayProtocolError({
							message: `Session ${id} closed before ACK`,
						}),
					).pipe(Effect.catchAll(() => Effect.void))
				}
				yield* releaseLease(session.botId, id).pipe(Effect.catchAll(() => Effect.void))
				yield* deleteSession(id)
			})

		return {
			onOpen,
			onMessage,
			onClose,
			validateBotToken,
			proxyRead: durableStreams.proxyRead,
		}
	}),
}) {}

const DatabaseLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* GatewayConfig
		return Database.layer({
			url: config.databaseUrl,
			ssl: !config.isDev,
		})
	}),
).pipe(Layer.provide(GatewayConfig.Default))

const RepoLive = Layer.mergeAll(BotRepo.Default).pipe(Layer.provide(DatabaseLive))
const DurableStreamClientLive = DurableStreamClient.Default.pipe(Layer.provide(GatewayConfig.Default))
const BotGatewayHubLive = BotGatewayHub.Default.pipe(
	Layer.provideMerge(GatewayConfig.Default),
	Layer.provideMerge(Redis.Default),
	Layer.provideMerge(RepoLive),
	Layer.provideMerge(DurableStreamClientLive),
)

const MainLive = Layer.mergeAll(
	GatewayConfig.Default,
	DatabaseLive,
	RepoLive,
	Redis.Default,
	DurableStreamClientLive,
	BotGatewayHubLive,
).pipe(Layer.provideMerge(Layer.setConfigProvider(ConfigProvider.fromEnv())))

const program = Effect.gen(function* () {
	const config = yield* GatewayConfig
	const hub = yield* BotGatewayHub
	const runtime = (yield* Effect.runtime<any>()) as Runtime.Runtime<never>

	const server = yield* Effect.acquireRelease(
		Effect.sync(() =>
			Bun.serve<{ sessionId: string | null }>({
				port: config.port,
				fetch(request, server) {
					const url = new URL(request.url)
					if (request.method === "GET" && url.pathname === "/health") {
						return new Response("OK")
					}

					if (request.method === "GET" && url.pathname === "/bot-gateway/ws") {
						if (server.upgrade(request, { data: { sessionId: null } })) {
							return undefined
						}
						return new Response("Failed to upgrade websocket", { status: 400 })
					}

					if (request.method === "GET" && url.pathname === "/bot-gateway/stream") {
						return Runtime.runPromise(runtime)(
							Effect.gen(function* () {
								const authHeader = request.headers.get("Authorization")
								if (!authHeader || !authHeader.startsWith("Bearer ")) {
									return new Response("Missing bot token", { status: 401 })
								}
								const bot = yield* hub.validateBotToken(authHeader.slice(7))
								const upstream = yield* hub.proxyRead(bot.id, url.searchParams)
								const body = yield* Effect.promise(() => upstream.text())
								return new Response(body, {
									status: upstream.status,
									headers: upstream.headers,
								})
							}).pipe(
								Effect.catchTag("GatewayAuthError", (error) =>
									Effect.succeed(new Response(error.message, { status: 401 })),
								),
								Effect.catchTag("DurableStreamGatewayError", (error) =>
									Effect.succeed(new Response(error.message, { status: 503 })),
								),
							),
						)
					}

					return new Response("Not found", { status: 404 })
				},
				websocket: {
					open(socket) {
						Runtime.runFork(runtime)(hub.onOpen(socket))
					},
					message(socket, message) {
						Runtime.runFork(runtime)(hub.onMessage(socket, message))
					},
					close(socket) {
						Runtime.runFork(runtime)(hub.onClose(socket))
					},
				},
			}),
		),
		(server) => Effect.sync(() => server.stop(true)),
	)

	yield* Effect.logInfo("Bot gateway listening", {
		port: server.port,
		websocketPath: "/bot-gateway/ws",
	})

	return yield* Effect.never
}).pipe(Effect.scoped, Effect.provide(MainLive))

BunRuntime.runMain(program as Effect.Effect<never, unknown, never>)

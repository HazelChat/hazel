import { describe, expect, it } from "@effect/vitest"
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
import { Database } from "@hazel/db"
import type {
	ChannelId,
	ExternalChannelId,
	ExternalMessageId,
	ExternalUserId,
	ExternalWebhookId,
	MessageId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	UserId,
} from "@hazel/schema"
import { Discord } from "@hazel/integrations"
import { Effect, Layer, Option } from "effect"
import { ChannelAccessSyncService } from "../channel-access-sync.ts"
import { IntegrationBotService } from "../integrations/integration-bot-service.ts"
import { ChatSyncCoreWorker } from "./chat-sync-core-worker.ts"
import { ChatSyncProviderRegistry } from "./chat-sync-provider-registry.ts"
import {
	DiscordSyncWorker,
	type DiscordIngressMessageCreate,
	type DiscordIngressMessageUpdate,
	type DiscordIngressMessageDelete,
	type DiscordIngressReactionAdd,
	type DiscordIngressReactionRemove,
} from "./discord-sync-worker.ts"

const SYNC_CONNECTION_ID = "00000000-0000-0000-0000-000000000001" as SyncConnectionId
const CHANNEL_LINK_ID = "00000000-0000-0000-0000-000000000002" as SyncChannelLinkId
const HAZEL_CHANNEL_ID = "00000000-0000-0000-0000-000000000003" as ChannelId
const ORGANIZATION_ID = "00000000-0000-0000-0000-000000000004" as OrganizationId
const HAZEL_MESSAGE_ID = "00000000-0000-0000-0000-000000000005" as MessageId
const BOT_USER_ID = "00000000-0000-0000-0000-000000000006" as UserId
const REACTION_USER_ID = "00000000-0000-0000-0000-000000000007" as UserId
const DISCORD_CHANNEL_ID = "discord-channel-1" as ExternalChannelId
const DISCORD_CHANNEL_ID_SNOWFLAKE = "123456789012345678" as ExternalChannelId
const DISCORD_MESSAGE_ID = "discord-message-1" as ExternalMessageId
const DISCORD_WEBHOOK_ID = "123456789012345678" as ExternalWebhookId
const DISCORD_WEBHOOK_TOKEN = "webhook-test-token"
const DISCORD_WEBHOOK_MESSAGE_ID = "987654321098765432" as ExternalMessageId
const DISCORD_USER_ID_1 = "discord-user-1" as ExternalUserId
const DISCORD_USER_ID_2 = "discord-user-2" as ExternalUserId
const DISCORD_USER_ID_3 = "discord-user-3" as ExternalUserId
const DISCORD_WEBHOOK_EMPTY_SETTINGS = {
	outboundIdentity: {
		enabled: true,
		strategy: "webhook",
		providers: {},
	},
} as const

const DISCORD_WEBHOOK_IDENTITY_SETTINGS = {
	outboundIdentity: {
		enabled: true,
		strategy: "webhook",
		providers: {
			discord: {
				kind: "discord.webhook",
				webhookId: DISCORD_WEBHOOK_ID,
				webhookToken: DISCORD_WEBHOOK_TOKEN,
			},
		},
	},
} as const

const DISCORD_WEBHOOK_DENIED_PERMISSION_SETTINGS = {
	outboundIdentity: {
		enabled: true,
		strategy: "webhook",
		providers: {},
	},
	webhookPermission: {
		status: "denied",
		checkedAt: "2026-02-01T00:00:00.000Z",
		reason: "user revoked webhook permissions",
	},
} as const

type WorkerLayerDeps = {
	connectionRepo: unknown
	channelLinkRepo: unknown
	messageLinkRepo: unknown
	eventReceiptRepo: unknown
	messageRepo: unknown
	messageReactionRepo: unknown
	channelRepo: unknown
	integrationConnectionRepo: unknown
	userRepo: unknown
	organizationMemberRepo: unknown
	integrationBotService: unknown
	channelAccessSyncService: unknown
	providerRegistry?: unknown
	discordApiClient?: unknown
	databaseExecute?: (query: unknown) => Effect.Effect<unknown, unknown, never>
}

const PAYLOAD: DiscordIngressMessageCreate = {
	syncConnectionId: SYNC_CONNECTION_ID,
	externalChannelId: DISCORD_CHANNEL_ID,
	externalMessageId: DISCORD_MESSAGE_ID,
	content: "hello",
}

const runWorkerEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	Effect.runPromise(effect as Effect.Effect<A, E, never>)

const makeWorkerLayer = (deps: WorkerLayerDeps) =>
	DiscordSyncWorker.DefaultWithoutDependencies.pipe(
		Layer.provide(
			ChatSyncCoreWorker.DefaultWithoutDependencies.pipe(
				Layer.provide(
					deps.providerRegistry
						? (Layer.succeed(ChatSyncProviderRegistry, deps.providerRegistry as ChatSyncProviderRegistry))
						: ChatSyncProviderRegistry.Default,
				),
				Layer.provide(
					deps.discordApiClient
						? (Layer.succeed(Discord.DiscordApiClient, deps.discordApiClient as Discord.DiscordApiClient))
						: Discord.DiscordApiClient.Default,
				),
			),
		),
		Layer.provide(
			Layer.succeed(Database.Database, {
				execute: (query: unknown) =>
					deps.databaseExecute ? deps.databaseExecute(query) : Effect.succeed([]),
				transaction: (effect: any) => effect,
				makeQuery: () => Effect.die("not used in this test"),
				makeQueryWithSchema: () => Effect.die("not used in this test"),
			} as any),
		),
			Layer.provide(
				Layer.succeed(ChatSyncConnectionRepo, deps.connectionRepo as ChatSyncConnectionRepo),
			),
			Layer.provide(
				Layer.succeed(ChatSyncChannelLinkRepo, deps.channelLinkRepo as ChatSyncChannelLinkRepo),
			),
			Layer.provide(
				Layer.succeed(ChatSyncMessageLinkRepo, deps.messageLinkRepo as ChatSyncMessageLinkRepo),
			),
			Layer.provide(
				Layer.succeed(ChatSyncEventReceiptRepo, deps.eventReceiptRepo as ChatSyncEventReceiptRepo),
			),
			Layer.provide(Layer.succeed(MessageRepo, deps.messageRepo as MessageRepo)),
			Layer.provide(
				Layer.succeed(MessageReactionRepo, deps.messageReactionRepo as MessageReactionRepo),
			),
			Layer.provide(Layer.succeed(ChannelRepo, deps.channelRepo as ChannelRepo)),
			Layer.provide(
				Layer.succeed(
					IntegrationConnectionRepo,
					deps.integrationConnectionRepo as IntegrationConnectionRepo,
				),
			),
			Layer.provide(Layer.succeed(UserRepo, deps.userRepo as UserRepo)),
			Layer.provide(
				Layer.succeed(OrganizationMemberRepo, deps.organizationMemberRepo as OrganizationMemberRepo),
			),
			Layer.provide(
				Layer.succeed(
					IntegrationBotService,
					deps.integrationBotService as IntegrationBotService,
			),
		),
		Layer.provide(
			Layer.succeed(
				ChannelAccessSyncService,
				deps.channelAccessSyncService as ChannelAccessSyncService,
			),
		),
	)

const makeWorkerLayerWithOverrides = (deps: WorkerLayerDeps) => {
	let layer = makeWorkerLayer(deps)
	return layer
}

describe("DiscordSyncWorker dedupe claim", () => {
	it("returns deduped and exits before side effects when claim fails", async () => {
		let connectionLookupCalled = false
		let channelLookupCalled = false
		let messageLinkLookupCalled = false
		let messageInsertCalled = false
		let botLookupCalled = false

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () => {
					connectionLookupCalled = true
					return Effect.succeed(Option.none())
				},
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByExternalChannel: () => {
					channelLookupCalled = true
					return Effect.succeed(Option.none())
				},
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () => {
					messageLinkLookupCalled = true
					return Effect.succeed(Option.none())
				},
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(false),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				insert: () => {
					messageInsertCalled = true
					return Effect.succeed([])
				},
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => {
					botLookupCalled = true
					return Effect.succeed({
						id: BOT_USER_ID,
					})
				},
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestMessageCreate(PAYLOAD).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("deduped")
		expect(connectionLookupCalled).toBe(false)
		expect(channelLookupCalled).toBe(false)
		expect(messageLinkLookupCalled).toBe(false)
		expect(messageInsertCalled).toBe(false)
		expect(botLookupCalled).toBe(false)
	})

	it("marks claimed receipt as ignored when message is already linked", async () => {
		let updatedStatus: "processed" | "ignored" | "failed" | undefined
		let updatedChannelLinkId: SyncChannelLinkId | undefined
		let botLookupCalled = false
		let messageInsertCalled = false

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByExternalChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
						}),
					),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () =>
					Effect.succeed(
						Option.some({
							channelLinkId: CHANNEL_LINK_ID,
							hazelMessageId: HAZEL_MESSAGE_ID,
							externalMessageId: PAYLOAD.externalMessageId,
						}),
					),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: (params: any) => {
					updatedStatus = params.status
					updatedChannelLinkId = params.channelLinkId
					return Effect.succeed([])
				},
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				insert: () => {
					messageInsertCalled = true
					return Effect.succeed([])
				},
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => {
					botLookupCalled = true
					return Effect.succeed({
						id: BOT_USER_ID,
					})
				},
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestMessageCreate(PAYLOAD).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("already_linked")
		expect(updatedStatus).toBe("ignored")
		expect(updatedChannelLinkId).toBe(CHANNEL_LINK_ID)
		expect(botLookupCalled).toBe(false)
		expect(messageInsertCalled).toBe(false)
	})
})

describe("DiscordSyncWorker reaction author enrichment", () => {
	it("uses external reaction author metadata when creating shadow reaction users", async () => {
		let upsertPayload: unknown = null
		let upsertOptions: unknown = null

		const payload: DiscordIngressReactionAdd = {
			syncConnectionId: SYNC_CONNECTION_ID,
			externalChannelId: DISCORD_CHANNEL_ID,
			externalMessageId: DISCORD_MESSAGE_ID,
			externalUserId: DISCORD_USER_ID_1,
			emoji: "🚀",
			externalAuthorDisplayName: "Alex Doe",
			externalAuthorAvatarUrl: "https://cdn.discordapp.com/avatars/discord-user-1/abc.png",
		}

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				updateLastSyncedAt: () => Effect.succeed({ id: SYNC_CONNECTION_ID } as any),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByExternalChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed({ id: CHANNEL_LINK_ID } as any),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () =>
					Effect.succeed(
						Option.some({
							channelLinkId: CHANNEL_LINK_ID,
							hazelMessageId: HAZEL_MESSAGE_ID,
							externalMessageId: DISCORD_MESSAGE_ID,
						}),
				),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				insert: () => Effect.succeed([]),
			} as unknown as MessageRepo,
			messageReactionRepo: {
				findByMessageUserEmoji: () => Effect.succeed(Option.none()),
				insert: () =>
					Effect.succeed([
						{
							id: REACTION_USER_ID,
							messageId: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							userId: "00000000-0000-0000-0000-000000000008",
							emoji: "🚀",
						},
					]),
			} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {
				findActiveUserByExternalAccountId: () => Effect.succeed(Option.none()),
			} as unknown as IntegrationConnectionRepo,
			userRepo: {
				upsertByExternalId: (
					data: { externalId: string; firstName: string; avatarUrl?: string | null },
					options: { syncAvatarUrl?: boolean } | undefined,
				) => {
						upsertPayload = {
							externalId: data.externalId,
							firstName: data.firstName,
							avatarUrl: data.avatarUrl ?? "",
						}
						upsertOptions = options ?? null
						return Effect.succeed({
							id: REACTION_USER_ID,
						})
					},
			} as unknown as UserRepo,
			organizationMemberRepo: {
				upsertByOrgAndUser: () => Effect.succeed({ id: REACTION_USER_ID }),
			} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestReactionAdd(payload).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("created")
		const createdPayload = upsertPayload as {
			externalId: string
			firstName: string
			avatarUrl: string
		} | null
		const createdOptions = upsertOptions as { syncAvatarUrl?: boolean } | null

		expect(createdPayload?.firstName).toBe("Alex Doe")
		expect(createdPayload?.avatarUrl).toBe("https://cdn.discordapp.com/avatars/discord-user-1/abc.png")
		expect(createdPayload?.externalId).toBe("discord-user-discord-user-1")
		expect(createdOptions?.syncAvatarUrl).toBe(true)
	})

	it("falls back to generic shadow user name when reaction author metadata is unavailable", async () => {
		let upsertPayload: unknown = null
		let upsertOptions: unknown = null

		const payload: DiscordIngressReactionAdd = {
			syncConnectionId: SYNC_CONNECTION_ID,
			externalChannelId: DISCORD_CHANNEL_ID,
			externalMessageId: DISCORD_MESSAGE_ID,
			externalUserId: DISCORD_USER_ID_2,
			emoji: "🚀",
		}

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				updateLastSyncedAt: () => Effect.succeed({ id: SYNC_CONNECTION_ID } as any),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByExternalChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed({ id: CHANNEL_LINK_ID } as any),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () =>
					Effect.succeed(
						Option.some({
							channelLinkId: CHANNEL_LINK_ID,
							hazelMessageId: HAZEL_MESSAGE_ID,
							externalMessageId: DISCORD_MESSAGE_ID,
						}),
				),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				insert: () => Effect.succeed([]),
			} as unknown as MessageRepo,
			messageReactionRepo: {
				findByMessageUserEmoji: () => Effect.succeed(Option.none()),
				insert: () =>
					Effect.succeed([
						{
							id: REACTION_USER_ID,
							messageId: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							userId: "00000000-0000-0000-0000-000000000008",
							emoji: "🚀",
						},
					]),
			} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {
				findActiveUserByExternalAccountId: () => Effect.succeed(Option.none()),
			} as unknown as IntegrationConnectionRepo,
			userRepo: {
				upsertByExternalId: (
					data: { firstName: string; avatarUrl?: string | null },
					options: { syncAvatarUrl?: boolean } | undefined,
				) => {
					upsertPayload = {
						firstName: data.firstName,
						avatarUrl: data.avatarUrl ?? "",
					}
						upsertOptions = options ?? null
					return Effect.succeed({
						id: REACTION_USER_ID,
					})
				},
			} as unknown as UserRepo,
			organizationMemberRepo: {
				upsertByOrgAndUser: () => Effect.succeed({ id: REACTION_USER_ID }),
			} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestReactionAdd(payload).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("created")
		const fallbackPayload = upsertPayload as { firstName: string; avatarUrl: string } | null
		const fallbackOptions = upsertOptions as { syncAvatarUrl?: boolean } | null

		expect(fallbackPayload?.firstName).toBe("Discord User")
		expect(fallbackPayload?.avatarUrl).toBe("")
		expect(fallbackOptions?.syncAvatarUrl).toBe(false)
	})

	it("uses external reaction author metadata on reaction removal as well", async () => {
		let upsertPayload: unknown = null
		let upsertOptions: unknown = null

		const payload: DiscordIngressReactionRemove = {
			syncConnectionId: SYNC_CONNECTION_ID,
			externalChannelId: DISCORD_CHANNEL_ID,
			externalMessageId: DISCORD_MESSAGE_ID,
			externalUserId: DISCORD_USER_ID_3,
			emoji: "🚀",
			externalAuthorDisplayName: "Taylor",
			externalAuthorAvatarUrl: "https://cdn.discordapp.com/avatars/discord-user-3/xyz.png",
		}

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				updateLastSyncedAt: () => Effect.succeed({ id: SYNC_CONNECTION_ID } as any),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByExternalChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed({ id: CHANNEL_LINK_ID } as any),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () =>
					Effect.succeed(
						Option.some({
							channelLinkId: CHANNEL_LINK_ID,
							hazelMessageId: HAZEL_MESSAGE_ID,
							externalMessageId: DISCORD_MESSAGE_ID,
						}),
				),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				insert: () => Effect.succeed([]),
			} as unknown as MessageRepo,
			messageReactionRepo: {
				findByMessageUserEmoji: () =>
					Effect.succeed(
						Option.some({ id: "00000000-0000-0000-0000-000000000008", messageId: HAZEL_MESSAGE_ID }),
					),
				insert: () => Effect.succeed([]),
				deleteById: () => Effect.succeed([]),
			} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {
				findActiveUserByExternalAccountId: () => Effect.succeed(Option.none()),
			} as unknown as IntegrationConnectionRepo,
			userRepo: {
				upsertByExternalId: (
					data: { firstName: string; avatarUrl?: string | null },
					options: { syncAvatarUrl?: boolean } | undefined,
				) => {
					upsertPayload = {
						firstName: data.firstName,
						avatarUrl: data.avatarUrl ?? "",
					}
						upsertOptions = options ?? null
					return Effect.succeed({ id: REACTION_USER_ID })
				},
			} as unknown as UserRepo,
			organizationMemberRepo: {
				upsertByOrgAndUser: () => Effect.succeed({ id: REACTION_USER_ID }),
			} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestReactionRemove(payload).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("deleted")
		const removePayload = upsertPayload as { firstName: string; avatarUrl: string } | null
		const removeOptions = upsertOptions as { syncAvatarUrl?: boolean } | null

		expect(removePayload?.firstName).toBe("Taylor")
		expect(removeOptions?.syncAvatarUrl).toBe(true)
	})
})

describe("DiscordSyncWorker inbound webhook origin filtering", () => {
	it("ignores created messages sent by configured outbound webhook", async () => {
		let messageInserted = false
		let externalLookupCalled = false
		let receiptStatus: string | undefined

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				} as unknown as ChatSyncConnectionRepo,
				channelLinkRepo: {
				findByExternalChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: DISCORD_WEBHOOK_IDENTITY_SETTINGS,
						}),
				),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () => {
					externalLookupCalled = true
					return Effect.succeed(Option.none())
				},
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: (params: unknown) => {
					receiptStatus = (params as { status: string }).status
					return Effect.succeed([])
				},
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				insert: () => {
					messageInserted = true
					return Effect.succeed([])
				},
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestMessageCreate({
				...PAYLOAD,
				externalWebhookId: DISCORD_WEBHOOK_ID,
			}).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("ignored_webhook_origin")
		expect(externalLookupCalled).toBe(false)
		expect(messageInserted).toBe(false)
		expect(receiptStatus).toBe("ignored")
	})

	it("ignores updated messages sent by configured outbound webhook", async () => {
		let externalLookupCalled = false

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
						),
				} as unknown as ChatSyncConnectionRepo,
				channelLinkRepo: {
				findByExternalChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: DISCORD_WEBHOOK_IDENTITY_SETTINGS,
						}),
				),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () => {
					externalLookupCalled = true
					return Effect.succeed(Option.none())
				},
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestMessageUpdate({
				syncConnectionId: SYNC_CONNECTION_ID,
				externalChannelId: DISCORD_CHANNEL_ID,
				externalMessageId: DISCORD_MESSAGE_ID,
				externalWebhookId: DISCORD_WEBHOOK_ID,
				content: "updated",
			}).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("ignored_webhook_origin")
		expect(externalLookupCalled).toBe(false)
	})

	it("ignores deleted messages sent by configured outbound webhook", async () => {
		let externalLookupCalled = false

		const layer = makeWorkerLayer({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				} as unknown as ChatSyncConnectionRepo,
				channelLinkRepo: {
				findByExternalChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: DISCORD_WEBHOOK_IDENTITY_SETTINGS,
						}),
				),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByExternalMessage: () => {
					externalLookupCalled = true
					return Effect.succeed(Option.none())
				},
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.ingestMessageDelete({
				syncConnectionId: SYNC_CONNECTION_ID,
				externalChannelId: DISCORD_CHANNEL_ID,
				externalMessageId: DISCORD_MESSAGE_ID,
				externalWebhookId: DISCORD_WEBHOOK_ID,
			}).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("ignored_webhook_origin")
		expect(externalLookupCalled).toBe(false)
	})
})

describe("DiscordSyncWorker outbound webhook dispatch", () => {
	it("creates hazel messages through webhook when outbound identity is configured", async () => {
		let webhookCalled = false
		let adapterCreateCalled = false
		let insertedExternalMessageId: string | null = null
		const executeWebhookMessage = ({ webhookId, webhookToken }: { webhookId: string; webhookToken: string }) => {
			webhookCalled = true
			expect(webhookId).toBe(DISCORD_WEBHOOK_ID)
			expect(webhookToken).toBe(DISCORD_WEBHOOK_TOKEN)
			return Effect.succeed(DISCORD_WEBHOOK_MESSAGE_ID)
		}
		const providerAdapter = {
			provider: "discord",
			createMessage: () => {
				adapterCreateCalled = true
				return Effect.fail(new Error("should not create via bot API"))
			},
			updateMessage: () => Effect.succeed(undefined),
			deleteMessage: () => Effect.succeed(undefined),
			addReaction: () => Effect.succeed(undefined),
			removeReaction: () => Effect.succeed(undefined),
			createThread: () => Effect.succeed("thread-id"),
		}
		const layer = makeWorkerLayerWithOverrides({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
							Option.some({
								id: CHANNEL_LINK_ID,
								externalChannelId: DISCORD_CHANNEL_ID,
								hazelChannelId: HAZEL_CHANNEL_ID,
								settings: DISCORD_WEBHOOK_IDENTITY_SETTINGS,
							}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
				updateSettings: () => Effect.succeed([]),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () => Effect.succeed(Option.none()),
				insert: (payload: { channelLinkId: SyncChannelLinkId; externalMessageId: ExternalMessageId }) => {
					insertedExternalMessageId = payload.externalMessageId
					return Effect.succeed([{ id: "message-link-id", channelLinkId: payload.channelLinkId } as any])
				},
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "hello from hazel",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: BOT_USER_ID,
							firstName: "Alex",
							lastName: "Doe",
							avatarUrl: "https://avatar.example/discord",
						}),
					),
			} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () => Effect.succeed(providerAdapter),
			} as unknown as ChatSyncProviderRegistry,
			discordApiClient: {
				executeWebhookMessage,
				createWebhook: () => Effect.fail(new Error("webhook should already be configured")),
				updateWebhookMessage: () => Effect.succeed(undefined),
				deleteWebhookMessage: () => Effect.succeed(undefined),
			} as unknown as Discord.DiscordApiClient,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
				Effect.provide(layer),
			),
		)

		expect(result.status).toBe("synced")
		expect(result.externalMessageId).toBe(DISCORD_WEBHOOK_MESSAGE_ID)
		expect(webhookCalled).toBe(true)
		expect(adapterCreateCalled).toBe(false)
		expect(insertedExternalMessageId).toBe(DISCORD_WEBHOOK_MESSAGE_ID)
	})

	it("updates existing hazel messages through webhook", async () => {
		let updateWebhookCalled = false
		let updateMessageCalled = false
		const layer = makeWorkerLayerWithOverrides({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
				),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
							Option.some({
								id: CHANNEL_LINK_ID,
								externalChannelId: DISCORD_CHANNEL_ID,
								hazelChannelId: HAZEL_CHANNEL_ID,
								settings: DISCORD_WEBHOOK_IDENTITY_SETTINGS,
							}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () =>
					Effect.succeed(
						Option.some({
							id: "message-link-id",
							channelLinkId: CHANNEL_LINK_ID,
							externalMessageId: DISCORD_WEBHOOK_MESSAGE_ID,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "updated",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: BOT_USER_ID,
							firstName: "Alex",
							lastName: "Doe",
							avatarUrl: "https://avatar.example/discord",
						}),
					),
			} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
						getAdapter: () =>
							Effect.succeed({
								provider: "discord",
								createMessage: () => Effect.fail(new Error("should not call bot create")),
								updateMessage: () => {
									updateMessageCalled = true
									return Effect.succeed(undefined)
								},
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			discordApiClient: {
				updateWebhookMessage: ({ webhookId, webhookToken, webhookMessageId }: { webhookId: string; webhookToken: string; webhookMessageId: string }) => {
					updateWebhookCalled = true
					expect(webhookId).toBe(DISCORD_WEBHOOK_ID)
					expect(webhookToken).toBe(DISCORD_WEBHOOK_TOKEN)
					expect(webhookMessageId).toBe(DISCORD_WEBHOOK_MESSAGE_ID)
					return Effect.succeed(undefined)
				},
				createWebhook: () => Effect.fail(new Error("not expected")),
				executeWebhookMessage: () => Effect.fail(new Error("not expected")),
				deleteWebhookMessage: () => Effect.succeed(undefined),
			} as unknown as Discord.DiscordApiClient,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.syncHazelMessageUpdateToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
				Effect.provide(layer),
			),
		)

		expect(result.status).toBe("updated")
		expect(result.externalMessageId).toBe(DISCORD_WEBHOOK_MESSAGE_ID)
		expect(updateWebhookCalled).toBe(true)
		expect(updateMessageCalled).toBe(false)
	})

	it("deletes hazel messages through webhook", async () => {
		let deleteWebhookCalled = false
		let deleteMessageCalled = false
		const layer = makeWorkerLayerWithOverrides({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
				),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
							Option.some({
								id: CHANNEL_LINK_ID,
								externalChannelId: DISCORD_CHANNEL_ID,
								hazelChannelId: HAZEL_CHANNEL_ID,
								settings: DISCORD_WEBHOOK_IDENTITY_SETTINGS,
							}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () =>
					Effect.succeed(
						Option.some({
							id: "message-link-id",
							channelLinkId: CHANNEL_LINK_ID,
							externalMessageId: DISCORD_WEBHOOK_MESSAGE_ID,
						}),
					),
				softDelete: () => Effect.succeed([{ id: "message-link-id" } as any]),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "to delete",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: BOT_USER_ID,
							firstName: "Alex",
							lastName: "Doe",
							avatarUrl: "https://avatar.example/discord",
						}),
					),
			} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
						getAdapter: () =>
							Effect.succeed({
								provider: "discord",
								createMessage: () => Effect.succeed("fallback-bot-id"),
								updateMessage: () => {
									return Effect.fail(new Error("should not call bot update"))
								},
								deleteMessage: () => {
									deleteMessageCalled = true
									return Effect.succeed(undefined)
						},
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			discordApiClient: {
				deleteWebhookMessage: ({ webhookId, webhookToken, webhookMessageId }: { webhookId: string; webhookToken: string; webhookMessageId: string }) => {
					deleteWebhookCalled = true
					expect(webhookId).toBe(DISCORD_WEBHOOK_ID)
					expect(webhookToken).toBe(DISCORD_WEBHOOK_TOKEN)
					expect(webhookMessageId).toBe(DISCORD_WEBHOOK_MESSAGE_ID)
					return Effect.succeed(undefined)
				},
				createWebhook: () => Effect.fail(new Error("not expected")),
				executeWebhookMessage: () => Effect.fail(new Error("not expected")),
				updateWebhookMessage: () => Effect.succeed(undefined),
			} as unknown as Discord.DiscordApiClient,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.syncHazelMessageDeleteToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
				Effect.provide(layer),
			),
		)

		expect(result.status).toBe("deleted")
		expect(result.externalMessageId).toBe(DISCORD_WEBHOOK_MESSAGE_ID)
		expect(deleteWebhookCalled).toBe(true)
		expect(deleteMessageCalled).toBe(false)
	})

	it("provisions webhook config on first send and persists it back to settings", async () => {
		const previousSettings = DISCORD_WEBHOOK_EMPTY_SETTINGS
		let updatedSettings: Record<string, unknown> | null = null
		const originalToken = process.env.DISCORD_BOT_TOKEN
		process.env.DISCORD_BOT_TOKEN = "unit-test-token"

		try {
			let persistedLinkId: string | undefined
			const layer = makeWorkerLayerWithOverrides({
				connectionRepo: {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: SYNC_CONNECTION_ID,
								organizationId: ORGANIZATION_ID,
								provider: "discord",
								status: "active",
							}),
					),
					updateLastSyncedAt: () => Effect.succeed([]),
				} as unknown as ChatSyncConnectionRepo,
				channelLinkRepo: {
					findByHazelChannel: () =>
						Effect.succeed(
							Option.some({
								id: CHANNEL_LINK_ID,
								externalChannelId: DISCORD_CHANNEL_ID,
								hazelChannelId: HAZEL_CHANNEL_ID,
								settings: previousSettings,
							}),
						),
					updateLastSyncedAt: () => Effect.succeed([]),
					updateSettings: (id: SyncChannelLinkId, settings: Record<string, unknown> | null) => {
						persistedLinkId = id
						updatedSettings = settings
						return Effect.succeed([{ id }] as any)
					},
				} as unknown as ChatSyncChannelLinkRepo,
				messageLinkRepo: {
					findByHazelMessage: () => Effect.succeed(Option.none()),
					insert: () => Effect.succeed([{ id: "message-link-id" } as any]),
				} as unknown as ChatSyncMessageLinkRepo,
				eventReceiptRepo: {
					claimByDedupeKey: () => Effect.succeed(true),
					updateByDedupeKey: () => Effect.succeed([]),
				} as unknown as ChatSyncEventReceiptRepo,
				messageRepo: {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: HAZEL_MESSAGE_ID,
								channelId: HAZEL_CHANNEL_ID,
								authorId: BOT_USER_ID,
								content: "hello from hazel",
								replyToMessageId: null,
								threadChannelId: null,
							}),
						),
				} as unknown as MessageRepo,
				messageReactionRepo: {} as unknown as MessageReactionRepo,
				channelRepo: {} as unknown as ChannelRepo,
				integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
				userRepo: {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: BOT_USER_ID,
								firstName: "Alex",
								lastName: "Doe",
								avatarUrl: "https://avatar.example/discord",
							}),
						),
				} as unknown as UserRepo,
				organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
				integrationBotService: {
					getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
				} as unknown as IntegrationBotService,
				channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
				providerRegistry: {
					getAdapter: () =>
						Effect.succeed({
							provider: "discord",
							createMessage: () => Effect.fail(new Error("should not call bot API create message")),
							updateMessage: () => Effect.fail(new Error("should not call bot API update message")),
							deleteMessage: () => Effect.fail(new Error("should not call bot API delete message")),
							addReaction: () => Effect.succeed(undefined),
							removeReaction: () => Effect.succeed(undefined),
							createThread: () => Effect.succeed("thread-id"),
						}),
				} as unknown as ChatSyncProviderRegistry,
				discordApiClient: {
					createWebhook: () => Effect.succeed({ webhookId: DISCORD_WEBHOOK_ID, webhookToken: DISCORD_WEBHOOK_TOKEN }),
					executeWebhookMessage: ({ webhookId }: { webhookId: string }) => {
						expect(webhookId).toBe(DISCORD_WEBHOOK_ID)
						return Effect.succeed(DISCORD_WEBHOOK_MESSAGE_ID)
					},
					updateWebhookMessage: () => Effect.succeed(undefined),
					deleteWebhookMessage: () => Effect.succeed(undefined),
				} as unknown as Discord.DiscordApiClient,
			})

			const result = await runWorkerEffect(
				DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
					Effect.provide(layer),
				),
			)

					expect(result.status).toBe("synced")
				expect(result.externalMessageId).toBe(DISCORD_WEBHOOK_MESSAGE_ID)
				expect(persistedLinkId).toBe(CHANNEL_LINK_ID)
					const outboundIdentitySettings = (updatedSettings as
						| {
							outboundIdentity: {
								providers: { discord: { webhookId: string; webhookToken: string; kind: string } }
							}
						}
						| undefined | null)?.outboundIdentity
					expect(outboundIdentitySettings).toBeDefined()
				expect(outboundIdentitySettings?.providers?.discord?.kind).toBe("discord.webhook")
				expect(outboundIdentitySettings?.providers?.discord?.webhookId).toBe(DISCORD_WEBHOOK_ID)
				expect(outboundIdentitySettings?.providers?.discord?.webhookToken).toBe(DISCORD_WEBHOOK_TOKEN)
		} finally {
			if (originalToken === undefined) {
				delete process.env.DISCORD_BOT_TOKEN
			} else {
				process.env.DISCORD_BOT_TOKEN = originalToken
			}
		}
	})

	it("skips webhook provisioning when permission is denied in settings", async () => {
		const originalToken = process.env.DISCORD_BOT_TOKEN
		process.env.DISCORD_BOT_TOKEN = "unit-test-token"
		let createWebhookCalled = false
		let botApiCalled = false
		try {
			const layer = makeWorkerLayerWithOverrides({
				connectionRepo: {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: SYNC_CONNECTION_ID,
								organizationId: ORGANIZATION_ID,
								provider: "discord",
								status: "active",
							}),
						),
					updateLastSyncedAt: () => Effect.succeed([]),
				},
				channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							externalChannelId: DISCORD_CHANNEL_ID_SNOWFLAKE,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: DISCORD_WEBHOOK_DENIED_PERMISSION_SETTINGS,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
				updateSettings: () => {
					return Effect.succeed([{ id: CHANNEL_LINK_ID }] as any)
				},
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () => Effect.succeed(Option.none()),
				insert: () => Effect.succeed([{ id: "message-link-id" } as any]),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "hello from hazel",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: BOT_USER_ID,
							firstName: "Alex",
							lastName: "Doe",
							avatarUrl: "https://avatar.example/discord",
						}),
					),
			} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () =>
					Effect.succeed({
						provider: "discord",
						createMessage: () => {
							botApiCalled = true
							return Effect.succeed("bot-message-id")
						},
						updateMessage: () => Effect.succeed(undefined),
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			discordApiClient: {
				createMessage: () => {
					botApiCalled = true
					return Effect.succeed("bot-message-id")
				},
				createWebhook: () => {
					createWebhookCalled = true
					return Effect.fail(new Error("should not create webhook when denied"))
				},
				executeWebhookMessage: () => Effect.fail(new Error("should not execute webhook")),
				updateWebhookMessage: () => Effect.succeed(undefined),
				deleteWebhookMessage: () => Effect.succeed(undefined),
			} as unknown as Discord.DiscordApiClient,
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
				Effect.provide(layer),
			),
		)

		expect(result.status).toBe("synced")
		expect(result.externalMessageId).toBe("bot-message-id")
		expect(createWebhookCalled).toBe(false)
		expect(botApiCalled).toBe(true)
		} finally {
			if (originalToken === undefined) {
				delete process.env.DISCORD_BOT_TOKEN
			} else {
				process.env.DISCORD_BOT_TOKEN = originalToken
			}
		}
	})

		it("marks webhook permission as denied and falls back when Discord returns 403", async () => {
			const originalToken = process.env.DISCORD_BOT_TOKEN
			process.env.DISCORD_BOT_TOKEN = "unit-test-token"
			let webhookProvisioned = false
			let adapterCreateCalled = false
			let updatedSettings: Record<string, unknown> | null = null
			const checkedReason = "Webhook create forbidden (HTTP 403)"

			try {
				const layer = makeWorkerLayerWithOverrides({
					connectionRepo: {
						findById: () =>
							Effect.succeed(
							Option.some({
								id: SYNC_CONNECTION_ID,
								organizationId: ORGANIZATION_ID,
								provider: "discord",
								status: "active",
							}),
					),
					updateLastSyncedAt: () => Effect.succeed([]),
				} as unknown as ChatSyncConnectionRepo,
				channelLinkRepo: {
					findByHazelChannel: () =>
						Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							externalChannelId: DISCORD_CHANNEL_ID_SNOWFLAKE,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: DISCORD_WEBHOOK_EMPTY_SETTINGS,
						}),
						),
					updateLastSyncedAt: () => Effect.succeed([]),
					updateSettings: (id: SyncChannelLinkId, settings: Record<string, unknown> | null) => {
						updatedSettings = settings
						return Effect.succeed([{ id }] as any)
					},
				} as unknown as ChatSyncChannelLinkRepo,
				messageLinkRepo: {
					findByHazelMessage: () => Effect.succeed(Option.none()),
					insert: () => Effect.succeed([{ id: "message-link-id" } as any]),
				} as unknown as ChatSyncMessageLinkRepo,
				eventReceiptRepo: {
					claimByDedupeKey: () => Effect.succeed(true),
					updateByDedupeKey: () => Effect.succeed([]),
				} as unknown as ChatSyncEventReceiptRepo,
				messageRepo: {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: HAZEL_MESSAGE_ID,
								channelId: HAZEL_CHANNEL_ID,
								authorId: BOT_USER_ID,
								content: "hello from hazel",
								replyToMessageId: null,
								threadChannelId: null,
							}),
						),
				} as unknown as MessageRepo,
				messageReactionRepo: {} as unknown as MessageReactionRepo,
				channelRepo: {} as unknown as ChannelRepo,
				integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
				userRepo: {
					findById: () =>
						Effect.succeed(
							Option.some({
								id: BOT_USER_ID,
								firstName: "Alex",
								lastName: "Doe",
								avatarUrl: "https://avatar.example/discord",
							}),
						),
				} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () =>
					Effect.succeed({
						provider: "discord",
						createMessage: () => {
							adapterCreateCalled = true
							return Effect.succeed("bot-message-id")
						},
						updateMessage: () => Effect.succeed(undefined),
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			discordApiClient: {
				createMessage: () => {
					adapterCreateCalled = true
					return Effect.succeed("bot-message-id")
				},
							createWebhook: () => {
								webhookProvisioned = true
								return Effect.fail(
								new Discord.DiscordApiError({
									message: checkedReason,
									status: 403,
								}),
							)
						},
						executeWebhookMessage: () => Effect.fail(new Error("should not be called")),
						updateWebhookMessage: () => Effect.succeed(undefined),
						deleteWebhookMessage: () => Effect.succeed(undefined),
				} as unknown as Discord.DiscordApiClient,
			})

				const result = await runWorkerEffect(
					DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
						Effect.provide(layer),
					),
				)

				expect(result.status).toBe("synced")
				expect(result.externalMessageId).toBe("bot-message-id")
				expect(webhookProvisioned).toBe(true)
				expect(adapterCreateCalled).toBe(true)
				const webhookState = (updatedSettings as
					| {
						outboundIdentity?: { strategy?: string }
						webhookPermission?: { status?: string; checkedAt?: string; reason?: string }
					}
					| null | undefined)?.webhookPermission
				const outboundIdentity = (updatedSettings as { outboundIdentity?: { strategy?: string } } | null | undefined)
					?.outboundIdentity
				expect(outboundIdentity?.strategy).toBe("fallback_bot")
				expect(webhookState?.status).toBe("denied")
				expect(webhookState?.reason).toContain("403")
				expect(typeof webhookState?.checkedAt).toBe("string")
				expect(adapterCreateCalled).toBe(true)
				expect(webhookProvisioned).toBe(true)
			} finally {
				if (originalToken === undefined) {
					delete process.env.DISCORD_BOT_TOKEN
				} else {
					process.env.DISCORD_BOT_TOKEN = originalToken
				}
			}
		})

		it("falls back to bot API when webhook provisioning fails for non-403 errors", async () => {
			const originalToken = process.env.DISCORD_BOT_TOKEN
			process.env.DISCORD_BOT_TOKEN = "unit-test-token"
			let webhookProvisioned = false
			let adapterCreateCalled = false
			let updatedSettings: Record<string, unknown> | null = null

			try {
				const layer = makeWorkerLayerWithOverrides({
					connectionRepo: {
						findById: () =>
							Effect.succeed(
								Option.some({
									id: SYNC_CONNECTION_ID,
									organizationId: ORGANIZATION_ID,
									provider: "discord",
									status: "active",
								}),
						),
						updateLastSyncedAt: () => Effect.succeed([]),
					} as unknown as ChatSyncConnectionRepo,
					channelLinkRepo: {
						findByHazelChannel: () =>
							Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							externalChannelId: DISCORD_CHANNEL_ID_SNOWFLAKE,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: DISCORD_WEBHOOK_EMPTY_SETTINGS,
						}),
							),
						updateLastSyncedAt: () => Effect.succeed([]),
						updateSettings: (id: SyncChannelLinkId, settings: Record<string, unknown> | null) => {
							updatedSettings = settings
							return Effect.succeed([{ id }] as any)
						},
					} as unknown as ChatSyncChannelLinkRepo,
					messageLinkRepo: {
						findByHazelMessage: () => Effect.succeed(Option.none()),
						insert: () => Effect.succeed([{ id: "message-link-id" } as any]),
					} as unknown as ChatSyncMessageLinkRepo,
					eventReceiptRepo: {
						claimByDedupeKey: () => Effect.succeed(true),
						updateByDedupeKey: () => Effect.succeed([]),
					} as unknown as ChatSyncEventReceiptRepo,
					messageRepo: {
						findById: () =>
							Effect.succeed(
								Option.some({
									id: HAZEL_MESSAGE_ID,
									channelId: HAZEL_CHANNEL_ID,
									authorId: BOT_USER_ID,
									content: "hello from hazel",
									replyToMessageId: null,
									threadChannelId: null,
								}),
							),
					} as unknown as MessageRepo,
					messageReactionRepo: {} as unknown as MessageReactionRepo,
					channelRepo: {} as unknown as ChannelRepo,
					integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
					userRepo: {
						findById: () =>
							Effect.succeed(
								Option.some({
									id: BOT_USER_ID,
									firstName: "Alex",
									lastName: "Doe",
									avatarUrl: "https://avatar.example/discord",
								}),
							),
					} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () =>
					Effect.succeed({
						provider: "discord",
						createMessage: () => {
							adapterCreateCalled = true
							return Effect.succeed("bot-message-id")
						},
						updateMessage: () => Effect.succeed(undefined),
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			discordApiClient: {
				createMessage: () => {
					adapterCreateCalled = true
					return Effect.succeed("bot-message-id")
				},
							createWebhook: () => {
								webhookProvisioned = true
								return Effect.fail(new Error("webhook provisioning failed"))
							},
						executeWebhookMessage: () => Effect.fail(new Error("should not be called")),
						updateWebhookMessage: () => Effect.succeed(undefined),
						deleteWebhookMessage: () => Effect.succeed(undefined),
					} as unknown as Discord.DiscordApiClient,
				})

				const result = await runWorkerEffect(
					DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
						Effect.provide(layer),
					),
				)

				expect(result.status).toBe("synced")
				expect(result.externalMessageId).toBe("bot-message-id")
				expect(webhookProvisioned).toBe(true)
				expect(adapterCreateCalled).toBe(true)
				const webhookState = (updatedSettings as
					| {
						outboundIdentity?: { strategy?: string }
						webhookPermission?: { status?: string; checkedAt?: string; reason?: string }
					}
					| null | undefined)?.webhookPermission
				const outboundIdentity = (updatedSettings as { outboundIdentity?: { strategy?: string } } | null | undefined)
					?.outboundIdentity
				expect(outboundIdentity?.strategy).toBe("webhook")
				expect(webhookState?.status).toBe("unknown")
				expect(typeof webhookState?.checkedAt).toBe("string")
			} finally {
				if (originalToken === undefined) {
					delete process.env.DISCORD_BOT_TOKEN
				} else {
					process.env.DISCORD_BOT_TOKEN = originalToken
				}
			}
		})
})

describe("DiscordSyncWorker outbound attachments primitive", () => {
	it("uses createMessageWithAttachments when message has completed attachments", async () => {
		let createMessageCalled = false
		let createMessageWithAttachmentsCalled = false
		let receivedAttachmentCount = 0

		const layer = makeWorkerLayerWithOverrides({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							externalChannelId: DISCORD_CHANNEL_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: null,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () => Effect.succeed(Option.none()),
				insert: () =>
					Effect.succeed([
						{ id: "message-link-id", channelLinkId: CHANNEL_LINK_ID, externalMessageId: DISCORD_MESSAGE_ID } as any,
					]),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "attachment message",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {
				findById: () => Effect.succeed(Option.none()),
			} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () =>
					Effect.succeed({
						provider: "discord",
						createMessage: () => {
							createMessageCalled = true
							return Effect.succeed(DISCORD_MESSAGE_ID)
						},
						createMessageWithAttachments: ({ attachments }: { attachments: ReadonlyArray<unknown> }) => {
							createMessageWithAttachmentsCalled = true
							receivedAttachmentCount = attachments.length
							return Effect.succeed(DISCORD_MESSAGE_ID)
						},
						updateMessage: () => Effect.succeed(undefined),
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			databaseExecute: () =>
				Effect.succeed([
					{
						id: "00000000-0000-0000-0000-000000000101",
						fileName: "diagram.png",
						fileSize: 2048,
					},
				]),
		})

		const originalS3PublicUrl = process.env.S3_PUBLIC_URL
		process.env.S3_PUBLIC_URL = "https://cdn.example.com"
		try {
			const result = await runWorkerEffect(
				DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
					Effect.provide(layer),
				),
			)

			expect(result.status).toBe("synced")
			expect(createMessageWithAttachmentsCalled).toBe(true)
			expect(createMessageCalled).toBe(false)
			expect(receivedAttachmentCount).toBe(1)
		} finally {
			if (originalS3PublicUrl === undefined) {
				delete process.env.S3_PUBLIC_URL
			} else {
				process.env.S3_PUBLIC_URL = originalS3PublicUrl
			}
		}
	})

	it("keeps using createMessage when no attachments are present", async () => {
		let createMessageCalled = false
		let createMessageWithAttachmentsCalled = false

		const layer = makeWorkerLayerWithOverrides({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							externalChannelId: DISCORD_CHANNEL_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: null,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () => Effect.succeed(Option.none()),
				insert: () => Effect.succeed([{ id: "message-link-id", channelLinkId: CHANNEL_LINK_ID } as any]),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "plain text",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () =>
					Effect.succeed({
						provider: "discord",
						createMessage: () => {
							createMessageCalled = true
							return Effect.succeed(DISCORD_MESSAGE_ID)
						},
						createMessageWithAttachments: () => {
							createMessageWithAttachmentsCalled = true
							return Effect.succeed(DISCORD_MESSAGE_ID)
						},
						updateMessage: () => Effect.succeed(undefined),
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			databaseExecute: () => Effect.succeed([]),
		})

		const result = await runWorkerEffect(
			DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
				Effect.provide(layer),
			),
		)

		expect(result.status).toBe("synced")
		expect(createMessageCalled).toBe(true)
		expect(createMessageWithAttachmentsCalled).toBe(false)
	})

	it("falls back to attachment primitive when webhook send fails in webhook mode", async () => {
		let createMessageWithAttachmentsCalled = false
		let firstAttachmentUrl: string | null = null

		const layer = makeWorkerLayerWithOverrides({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							externalChannelId: DISCORD_CHANNEL_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: DISCORD_WEBHOOK_IDENTITY_SETTINGS,
						}),
					),
				updateLastSyncedAt: () => Effect.succeed([]),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () => Effect.succeed(Option.none()),
				insert: () =>
					Effect.succeed([
						{ id: "message-link-id", channelLinkId: CHANNEL_LINK_ID, externalMessageId: DISCORD_WEBHOOK_MESSAGE_ID } as any,
					]),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "with attachments",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: BOT_USER_ID,
							firstName: "Alex",
							lastName: "Doe",
							avatarUrl: "",
						}),
					),
			} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () =>
					Effect.succeed({
						provider: "discord",
						createMessage: () => Effect.fail(new Error("should not hit createMessage")),
						createMessageWithAttachments: ({ attachments }: { attachments: ReadonlyArray<{ publicUrl: string }> }) => {
							createMessageWithAttachmentsCalled = true
							firstAttachmentUrl = attachments[0]?.publicUrl ?? null
							return Effect.succeed(DISCORD_WEBHOOK_MESSAGE_ID)
						},
						updateMessage: () => Effect.succeed(undefined),
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			discordApiClient: {
				executeWebhookMessage: () => Effect.fail(new Error("webhook send failed")),
				createWebhook: () => Effect.fail(new Error("not expected")),
				updateWebhookMessage: () => Effect.succeed(undefined),
				deleteWebhookMessage: () => Effect.succeed(undefined),
			} as unknown as Discord.DiscordApiClient,
			databaseExecute: () =>
				Effect.succeed([
					{
						id: "00000000-0000-0000-0000-000000000201",
						fileName: "capture.jpg",
						fileSize: 5120,
					},
				]),
		})

		const originalS3PublicUrl = process.env.S3_PUBLIC_URL
		process.env.S3_PUBLIC_URL = "https://cdn.example.com"
		try {
			const result = await runWorkerEffect(
				DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID).pipe(
					Effect.provide(layer),
				),
			)

			expect(result.status).toBe("synced")
			expect(createMessageWithAttachmentsCalled).toBe(true)
			expect(firstAttachmentUrl).toBe("https://cdn.example.com/00000000-0000-0000-0000-000000000201")
		} finally {
			if (originalS3PublicUrl === undefined) {
				delete process.env.S3_PUBLIC_URL
			} else {
				process.env.S3_PUBLIC_URL = originalS3PublicUrl
			}
		}
	})

	it("fails with configuration error when attachments exist and S3_PUBLIC_URL is missing", async () => {
		const layer = makeWorkerLayerWithOverrides({
			connectionRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: SYNC_CONNECTION_ID,
							organizationId: ORGANIZATION_ID,
							provider: "discord",
							status: "active",
						}),
					),
			} as unknown as ChatSyncConnectionRepo,
			channelLinkRepo: {
				findByHazelChannel: () =>
					Effect.succeed(
						Option.some({
							id: CHANNEL_LINK_ID,
							externalChannelId: DISCORD_CHANNEL_ID,
							hazelChannelId: HAZEL_CHANNEL_ID,
							settings: null,
						}),
					),
			} as unknown as ChatSyncChannelLinkRepo,
			messageLinkRepo: {
				findByHazelMessage: () => Effect.succeed(Option.none()),
			} as unknown as ChatSyncMessageLinkRepo,
			eventReceiptRepo: {
				claimByDedupeKey: () => Effect.succeed(true),
				updateByDedupeKey: () => Effect.succeed([]),
			} as unknown as ChatSyncEventReceiptRepo,
			messageRepo: {
				findById: () =>
					Effect.succeed(
						Option.some({
							id: HAZEL_MESSAGE_ID,
							channelId: HAZEL_CHANNEL_ID,
							authorId: BOT_USER_ID,
							content: "missing env",
							replyToMessageId: null,
							threadChannelId: null,
						}),
					),
			} as unknown as MessageRepo,
			messageReactionRepo: {} as unknown as MessageReactionRepo,
			channelRepo: {} as unknown as ChannelRepo,
			integrationConnectionRepo: {} as unknown as IntegrationConnectionRepo,
			userRepo: {} as unknown as UserRepo,
			organizationMemberRepo: {} as unknown as OrganizationMemberRepo,
			integrationBotService: {
				getOrCreateBotUser: () => Effect.succeed({ id: BOT_USER_ID }),
			} as unknown as IntegrationBotService,
			channelAccessSyncService: {} as unknown as ChannelAccessSyncService,
			providerRegistry: {
				getAdapter: () =>
					Effect.succeed({
						provider: "discord",
						createMessage: () => Effect.succeed(DISCORD_MESSAGE_ID),
						createMessageWithAttachments: () => Effect.succeed(DISCORD_MESSAGE_ID),
						updateMessage: () => Effect.succeed(undefined),
						deleteMessage: () => Effect.succeed(undefined),
						addReaction: () => Effect.succeed(undefined),
						removeReaction: () => Effect.succeed(undefined),
						createThread: () => Effect.succeed("thread-id"),
					}),
			} as unknown as ChatSyncProviderRegistry,
			databaseExecute: () =>
				Effect.succeed([
					{
						id: "00000000-0000-0000-0000-000000000301",
						fileName: "missing-env.txt",
						fileSize: 10,
					},
				]),
		})

		const originalS3PublicUrl = process.env.S3_PUBLIC_URL
		delete process.env.S3_PUBLIC_URL
		try {
			const result = await runWorkerEffect(
				DiscordSyncWorker.syncHazelMessageToDiscord(SYNC_CONNECTION_ID, HAZEL_MESSAGE_ID)
					.pipe(Effect.provide(layer), Effect.either),
			)

			expect(result._tag).toBe("Left")
			if (result._tag === "Left") {
				expect((result.left as { _tag?: string })._tag).toBe("DiscordSyncConfigurationError")
			}
		} finally {
			if (originalS3PublicUrl === undefined) {
				delete process.env.S3_PUBLIC_URL
			} else {
				process.env.S3_PUBLIC_URL = originalS3PublicUrl
			}
		}
	})
})

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
	MessageId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	UserId,
} from "@hazel/schema"
import { Effect, Layer, Option } from "effect"
import { ChannelAccessSyncService } from "../channel-access-sync.ts"
import { IntegrationBotService } from "../integrations/integration-bot-service.ts"
import { ChatSyncCoreWorker } from "./chat-sync-core-worker.ts"
import { ChatSyncProviderRegistry } from "./chat-sync-provider-registry.ts"
import {
	DiscordSyncWorker,
	type DiscordIngressMessageCreate,
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

const PAYLOAD: DiscordIngressMessageCreate = {
	syncConnectionId: SYNC_CONNECTION_ID,
	externalChannelId: "discord-channel-1",
	externalMessageId: "discord-message-1",
	content: "hello",
}

const makeWorkerLayer = (deps: {
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
}) =>
	DiscordSyncWorker.DefaultWithoutDependencies.pipe(
		Layer.provide(ChatSyncCoreWorker.DefaultWithoutDependencies),
		Layer.provide(ChatSyncProviderRegistry.Default),
		Layer.provide(
			Layer.succeed(Database.Database, {
				execute: () => Effect.die("not used in this test"),
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

		const result = await Effect.runPromise(
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

		const result = await Effect.runPromise(
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
			externalChannelId: "discord-channel-1",
			externalMessageId: HAZEL_MESSAGE_ID,
			externalUserId: "discord-user-1",
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
							externalMessageId: HAZEL_MESSAGE_ID,
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

		const result = await Effect.runPromise(
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
			externalChannelId: "discord-channel-1",
			externalMessageId: HAZEL_MESSAGE_ID,
			externalUserId: "discord-user-2",
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
							externalMessageId: HAZEL_MESSAGE_ID,
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

		const result = await Effect.runPromise(
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
			externalChannelId: "discord-channel-1",
			externalMessageId: HAZEL_MESSAGE_ID,
			externalUserId: "discord-user-3",
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
							externalMessageId: HAZEL_MESSAGE_ID,
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

		const result = await Effect.runPromise(
			DiscordSyncWorker.ingestReactionRemove(payload).pipe(Effect.provide(layer)),
		)

		expect(result.status).toBe("deleted")
		const removePayload = upsertPayload as { firstName: string; avatarUrl: string } | null
		const removeOptions = upsertOptions as { syncAvatarUrl?: boolean } | null

		expect(removePayload?.firstName).toBe("Taylor")
		expect(removeOptions?.syncAvatarUrl).toBe(true)
	})
})

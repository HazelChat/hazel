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
import { DiscordSyncWorker, type DiscordIngressMessageCreate } from "./discord-sync-worker.ts"

const SYNC_CONNECTION_ID = "00000000-0000-0000-0000-000000000001" as SyncConnectionId
const CHANNEL_LINK_ID = "00000000-0000-0000-0000-000000000002" as SyncChannelLinkId
const HAZEL_CHANNEL_ID = "00000000-0000-0000-0000-000000000003" as ChannelId
const ORGANIZATION_ID = "00000000-0000-0000-0000-000000000004" as OrganizationId
const HAZEL_MESSAGE_ID = "00000000-0000-0000-0000-000000000005" as MessageId
const BOT_USER_ID = "00000000-0000-0000-0000-000000000006" as UserId

const PAYLOAD: DiscordIngressMessageCreate = {
	syncConnectionId: SYNC_CONNECTION_ID,
	externalChannelId: "discord-channel-1",
	externalMessageId: "discord-message-1",
	content: "hello",
}

const makeWorkerLayer = (deps: {
	connectionRepo: ChatSyncConnectionRepo
	channelLinkRepo: ChatSyncChannelLinkRepo
	messageLinkRepo: ChatSyncMessageLinkRepo
	eventReceiptRepo: ChatSyncEventReceiptRepo
	messageRepo: MessageRepo
	messageReactionRepo: MessageReactionRepo
	channelRepo: ChannelRepo
	integrationConnectionRepo: IntegrationConnectionRepo
	userRepo: UserRepo
	organizationMemberRepo: OrganizationMemberRepo
	integrationBotService: IntegrationBotService
	channelAccessSyncService: ChannelAccessSyncService
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
		Layer.provide(Layer.succeed(ChatSyncConnectionRepo, deps.connectionRepo)),
		Layer.provide(Layer.succeed(ChatSyncChannelLinkRepo, deps.channelLinkRepo)),
		Layer.provide(Layer.succeed(ChatSyncMessageLinkRepo, deps.messageLinkRepo)),
		Layer.provide(Layer.succeed(ChatSyncEventReceiptRepo, deps.eventReceiptRepo)),
		Layer.provide(Layer.succeed(MessageRepo, deps.messageRepo)),
		Layer.provide(Layer.succeed(MessageReactionRepo, deps.messageReactionRepo)),
		Layer.provide(Layer.succeed(ChannelRepo, deps.channelRepo)),
		Layer.provide(Layer.succeed(IntegrationConnectionRepo, deps.integrationConnectionRepo)),
		Layer.provide(Layer.succeed(UserRepo, deps.userRepo)),
		Layer.provide(Layer.succeed(OrganizationMemberRepo, deps.organizationMemberRepo)),
		Layer.provide(Layer.succeed(IntegrationBotService, deps.integrationBotService)),
		Layer.provide(Layer.succeed(ChannelAccessSyncService, deps.channelAccessSyncService)),
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

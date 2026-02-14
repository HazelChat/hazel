import { randomUUID } from "node:crypto"
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
import { and, Database, eq, isNull, schema } from "@hazel/db"
import {
	type ChannelId,
	type ExternalChannelId,
	type ExternalMessageId,
	type ExternalThreadId,
	type ExternalUserId,
	type MessageId,
	type OrganizationId,
	type SyncChannelLinkId,
	type SyncConnectionId,
	type UserId,
} from "@hazel/schema"
import { Discord } from "@hazel/integrations"
import { Effect, Layer } from "effect"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { createChatSyncDbHarness, type ChatSyncDbHarness } from "../../test/chat-sync-db-harness"
import { recordChatSyncDiagnostic } from "../../test/chat-sync-test-diagnostics"
import { ChannelAccessSyncService } from "../channel-access-sync"
import { IntegrationBotService } from "../integrations/integration-bot-service"
import { loadChatSyncLiveDiscordTestConfig } from "./chat-sync-live-test-config"
import { ChatSyncCoreWorker } from "./chat-sync-core-worker"
import { ChatSyncProviderRegistry } from "./chat-sync-provider-registry"

const liveConfig = loadChatSyncLiveDiscordTestConfig()
const describeLive = liveConfig.isConfigured ? describe : describe.skip

const runEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	Effect.runPromise((effect as Effect.Effect<A, E, never>).pipe(Effect.scoped))

const uuid = <T extends string>() => randomUUID() as T

const insertBaseContext = (harness: ChatSyncDbHarness) =>
	harness.run(
		Effect.gen(function* () {
			const db = yield* Database.Database
			const organizationId = uuid<OrganizationId>()
			const authorUserId = uuid<UserId>()
			const botUserId = uuid<UserId>()
			const channelId = uuid<ChannelId>()

			yield* db.execute((client) =>
				client.insert(schema.organizationsTable).values({
					id: organizationId,
					name: "Discord Live Sync Org",
					slug: `discord-live-${organizationId.slice(0, 8)}`,
					logoUrl: null,
					settings: null,
					isPublic: false,
					deletedAt: null,
				}),
			)

			yield* db.execute((client) =>
				client.insert(schema.usersTable).values([
					{
						id: authorUserId,
						externalId: `user-${authorUserId}`,
						email: `author-${authorUserId}@example.com`,
						firstName: "Live",
						lastName: "Author",
						avatarUrl: null,
						userType: "user",
						settings: null,
						isOnboarded: true,
						timezone: "UTC",
						deletedAt: null,
					},
					{
						id: botUserId,
						externalId: `bot-${botUserId}`,
						email: `bot-${botUserId}@example.com`,
						firstName: "Live",
						lastName: "Bot",
						avatarUrl: null,
						userType: "machine",
						settings: null,
						isOnboarded: true,
						timezone: "UTC",
						deletedAt: null,
					},
				]),
			)

			yield* db.execute((client) =>
				client.insert(schema.channelsTable).values({
					id: channelId,
					name: "live-sync",
					icon: null,
					type: "public",
					organizationId,
					parentChannelId: null,
					sectionId: null,
					deletedAt: null,
				}),
			)

			return {
				organizationId,
				authorUserId,
				botUserId,
				channelId,
			} as const
		}),
	)

const insertConnection = (
	harness: ChatSyncDbHarness,
	params: {
		organizationId: OrganizationId
		createdBy: UserId
		externalWorkspaceId: string
	},
) =>
	harness.run(
		Effect.gen(function* () {
			const db = yield* Database.Database
			const syncConnectionId = uuid<SyncConnectionId>()
			yield* db.execute((client) =>
				client.insert(schema.chatSyncConnectionsTable).values({
					id: syncConnectionId,
					organizationId: params.organizationId,
					integrationConnectionId: null,
					provider: "discord",
					externalWorkspaceId: params.externalWorkspaceId,
					externalWorkspaceName: "Discord Sandbox",
					status: "active",
					settings: null,
					metadata: null,
					errorMessage: null,
					lastSyncedAt: null,
					createdBy: params.createdBy,
					deletedAt: null,
				}),
			)
			return syncConnectionId
		}),
	)

const insertLink = (
	harness: ChatSyncDbHarness,
	params: {
		syncConnectionId: SyncConnectionId
		hazelChannelId: ChannelId
		externalChannelId: ExternalChannelId
		direction?: "both" | "hazel_to_external" | "external_to_hazel"
	},
) =>
	harness.run(
		Effect.gen(function* () {
			const db = yield* Database.Database
			yield* db.execute((client) =>
				client.insert(schema.chatSyncChannelLinksTable).values({
					id: uuid<SyncChannelLinkId>(),
					syncConnectionId: params.syncConnectionId,
					hazelChannelId: params.hazelChannelId,
					externalChannelId: params.externalChannelId,
					externalChannelName: "sandbox-channel",
					direction: params.direction ?? "both",
					isActive: true,
					settings: null,
					lastSyncedAt: null,
					deletedAt: null,
				}),
			)
		}),
	)

const insertMessage = (
	harness: ChatSyncDbHarness,
	params: {
		channelId: ChannelId
		authorId: UserId
		content: string
	},
) =>
	harness.run(
		Effect.gen(function* () {
			const db = yield* Database.Database
			const messageId = uuid<MessageId>()
			yield* db.execute((client) =>
				client.insert(schema.messagesTable).values({
					id: messageId,
					channelId: params.channelId,
					authorId: params.authorId,
					content: params.content,
					embeds: null,
					replyToMessageId: null,
					threadChannelId: null,
					deletedAt: null,
				}),
			)
			return messageId
		}),
	)

const makeWorkerLayer = (
	harness: ChatSyncDbHarness,
	params: {
		botUserId: UserId
	},
) => {
	const repoLayer = Layer.mergeAll(
		ChatSyncConnectionRepo.Default,
		ChatSyncChannelLinkRepo.Default,
		ChatSyncMessageLinkRepo.Default,
		ChatSyncEventReceiptRepo.Default,
		MessageRepo.Default,
		MessageReactionRepo.Default,
		ChannelRepo.Default,
		IntegrationConnectionRepo.Default,
		UserRepo.Default,
		OrganizationMemberRepo.Default,
	).pipe(Layer.provide(harness.dbLayer))

	const deps = Layer.mergeAll(
		harness.dbLayer,
		repoLayer,
		ChatSyncProviderRegistry.Default,
		Discord.DiscordApiClient.Default,
		Layer.succeed(IntegrationBotService, {
			getOrCreateBotUser: () => Effect.succeed({ id: params.botUserId }),
		} as unknown as IntegrationBotService),
		Layer.succeed(ChannelAccessSyncService, {
			syncChannel: () => Effect.void,
		} as unknown as ChannelAccessSyncService),
	)

	return ChatSyncCoreWorker.DefaultWithoutDependencies.pipe(Layer.provide(deps))
}

describeLive("Chat Sync live Discord nightly e2e", () => {
	let harness: ChatSyncDbHarness
	let outboundMessageId: ExternalMessageId | undefined
	let inboundMessageId: ExternalMessageId | undefined
	const activeChannelId = (liveConfig.channelId2 ?? liveConfig.channelId) as ExternalChannelId

	beforeAll(async () => {
		process.env.DISCORD_BOT_TOKEN = liveConfig.botToken
		harness = await createChatSyncDbHarness()
	}, 180_000)

	afterAll(async () => {
		if (inboundMessageId) {
			await runEffect(
				Discord.DiscordApiClient.deleteMessage({
					channelId: activeChannelId,
					messageId: inboundMessageId,
					botToken: liveConfig.botToken!,
				}).pipe(
					Effect.provide(Discord.DiscordApiClient.Default),
					Effect.catchAll(() => Effect.void),
				),
			)
		}
		if (outboundMessageId) {
			await runEffect(
				Discord.DiscordApiClient.deleteMessage({
					channelId: liveConfig.channelId!,
					messageId: outboundMessageId,
					botToken: liveConfig.botToken!,
				}).pipe(
					Effect.provide(Discord.DiscordApiClient.Default),
					Effect.catchAll(() => Effect.void),
				),
			)
		}
		await harness.stop()
	}, 60_000)

	beforeEach(async () => {
		await harness.reset()
	})

	it("validates Hazel -> Discord create/update/delete against live Discord API", async () => {
		const ctx = await insertBaseContext(harness)
		const workerLayer = makeWorkerLayer(harness, {
			botUserId: ctx.botUserId,
		})
		const connectionId = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
			externalWorkspaceId: liveConfig.guildId!,
		})
		await insertLink(harness, {
			syncConnectionId: connectionId,
			hazelChannelId: ctx.channelId,
			externalChannelId: liveConfig.channelId! as ExternalChannelId,
		})
		const hazelMessageId = await insertMessage(harness, {
			channelId: ctx.channelId,
			authorId: ctx.authorUserId,
			content: `live outbound ${Date.now()}`,
		})

		const createResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageToProvider(connectionId, hazelMessageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(createResult.status).toBe("synced")
		if (!createResult.externalMessageId) {
			throw new Error("syncHazelMessageToProvider did not return externalMessageId")
		}
		outboundMessageId = createResult.externalMessageId

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				yield* db.execute((client) =>
					client
						.update(schema.messagesTable)
						.set({
							content: `live outbound updated ${Date.now()}`,
							updatedAt: new Date(),
						})
						.where(eq(schema.messagesTable.id, hazelMessageId)),
				)
			}),
		)

		const updateResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageUpdateToProvider(connectionId, hazelMessageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(updateResult.status).toBe("updated")

		const deleteResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageDeleteToProvider(connectionId, hazelMessageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(deleteResult.status).toBe("deleted")

		recordChatSyncDiagnostic({
			suite: "chat-sync-live-discord",
			testCase: "hazel-to-discord",
			workerMethod: "syncHazelMessageToProvider",
			action: "create_update_delete",
			syncConnectionId: connectionId,
			expected: "synced/updated/deleted",
			actual: `${createResult.status}/${updateResult.status}/${deleteResult.status}`,
		})
	}, 180_000)

	it("validates Discord -> Hazel ingest for message/reaction/thread lifecycle with live ids", async () => {
		const ctx = await insertBaseContext(harness)
		const workerLayer = makeWorkerLayer(harness, {
			botUserId: ctx.botUserId,
		})
		const connectionId = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
			externalWorkspaceId: liveConfig.guildId!,
		})
		await insertLink(harness, {
			syncConnectionId: connectionId,
			hazelChannelId: ctx.channelId,
			externalChannelId: activeChannelId,
			direction: "both",
		})

		const createdInboundMessageId = (await runEffect(
			Discord.DiscordApiClient.createMessage({
				channelId: activeChannelId,
				content: `live inbound ${Date.now()}`,
				botToken: liveConfig.botToken!,
			}).pipe(Effect.provide(Discord.DiscordApiClient.Default)),
		)) as ExternalMessageId
		inboundMessageId = createdInboundMessageId

		const createResult = await runEffect(
			ChatSyncCoreWorker.ingestMessageCreate({
				syncConnectionId: connectionId,
				externalChannelId: activeChannelId,
				externalMessageId: createdInboundMessageId,
				externalAuthorId: "live-external-author" as ExternalUserId,
				externalAuthorDisplayName: "Live External",
				content: `ingest create ${Date.now()}`,
				dedupeKey: `live:ingest:create:${createdInboundMessageId}`,
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(createResult.status).toBe("created")

		const updateResult = await runEffect(
			ChatSyncCoreWorker.ingestMessageUpdate({
				syncConnectionId: connectionId,
				externalChannelId: activeChannelId,
				externalMessageId: createdInboundMessageId,
				content: `ingest update ${Date.now()}`,
				dedupeKey: `live:ingest:update:${createdInboundMessageId}`,
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(updateResult.status).toBe("updated")

		const reactionAdd = await runEffect(
			ChatSyncCoreWorker.ingestReactionAdd({
				syncConnectionId: connectionId,
				externalChannelId: activeChannelId,
				externalMessageId: createdInboundMessageId,
				externalUserId: "live-external-reactor" as ExternalUserId,
				externalAuthorDisplayName: "Live Reactor",
				emoji: "🔥",
				dedupeKey: `live:ingest:reaction:add:${createdInboundMessageId}`,
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(reactionAdd.status).toBe("created")

		const reactionDelete = await runEffect(
			ChatSyncCoreWorker.ingestReactionRemove({
				syncConnectionId: connectionId,
				externalChannelId: activeChannelId,
				externalMessageId: createdInboundMessageId,
				externalUserId: "live-external-reactor" as ExternalUserId,
				externalAuthorDisplayName: "Live Reactor",
				emoji: "🔥",
				dedupeKey: `live:ingest:reaction:remove:${createdInboundMessageId}`,
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(reactionDelete.status).toBe("deleted")

		const externalThreadId = await runEffect(
			Discord.DiscordApiClient.createThread({
				channelId: activeChannelId,
				messageId: createdInboundMessageId,
				name: `Hazel Live Thread ${Date.now()}`,
				botToken: liveConfig.botToken!,
			}).pipe(Effect.provide(Discord.DiscordApiClient.Default)),
		)

		const threadCreate = await runEffect(
			ChatSyncCoreWorker.ingestThreadCreate({
				syncConnectionId: connectionId,
				externalParentChannelId: activeChannelId,
				externalThreadId: externalThreadId as ExternalThreadId,
				externalRootMessageId: createdInboundMessageId,
				name: "Live Thread",
				dedupeKey: `live:ingest:thread:${externalThreadId}`,
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(threadCreate.status).toBe("created")

		const deleteResult = await runEffect(
			ChatSyncCoreWorker.ingestMessageDelete({
				syncConnectionId: connectionId,
				externalChannelId: activeChannelId,
				externalMessageId: createdInboundMessageId,
				dedupeKey: `live:ingest:delete:${createdInboundMessageId}`,
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(deleteResult.status).toBe("deleted")

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				const messageRows = yield* db.execute((client) =>
					client
						.select()
						.from(schema.messagesTable)
						.where(
							and(
								eq(schema.messagesTable.channelId, ctx.channelId),
								isNull(schema.messagesTable.deletedAt),
							),
						),
				)
				expect(messageRows.some((row) => row.content.includes("ingest update"))).toBe(false)

					const messageLinkRows = yield* db.execute((client) =>
						client
							.select()
							.from(schema.chatSyncMessageLinksTable)
							.where(
								eq(
									schema.chatSyncMessageLinksTable.externalMessageId,
									createdInboundMessageId,
								),
							),
					)
				expect(messageLinkRows.length).toBeGreaterThan(0)
			})
		)

		recordChatSyncDiagnostic({
			suite: "chat-sync-live-discord",
			testCase: "discord-to-hazel",
			workerMethod: "ingestMessageCreate/Update/Delete",
			action: "message_reaction_thread",
			syncConnectionId: connectionId,
			expected: "created/updated/created/deleted/created/deleted",
			actual: `${createResult.status}/${updateResult.status}/${reactionAdd.status}/${reactionDelete.status}/${threadCreate.status}/${deleteResult.status}`,
		})
	}, 240_000)
})

if (!liveConfig.isConfigured) {
	console.warn(
		`Skipping chat-sync live Discord e2e tests. Missing env vars: ${liveConfig.missing.join(", ")}`,
	)
}

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
import type {
	ChannelId,
	ExternalChannelId,
	ExternalMessageId,
	ExternalThreadId,
	ExternalUserId,
	ExternalWebhookId,
	MessageId,
	MessageReactionId,
	OrganizationId,
	SyncChannelLinkId,
	SyncConnectionId,
	UserId,
} from "@hazel/schema"
import { Discord } from "@hazel/integrations"
import { Effect, Layer } from "effect"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { createChatSyncDbHarness, type ChatSyncDbHarness } from "../../test/chat-sync-db-harness"
import { recordChatSyncDiagnostic } from "../../test/chat-sync-test-diagnostics"
import { ChannelAccessSyncService } from "../channel-access-sync"
import { IntegrationBotService } from "../integrations/integration-bot-service"
import { ChatSyncProviderRegistry, type ChatSyncProviderAdapter } from "./chat-sync-provider-registry"
import { ChatSyncCoreWorker } from "./chat-sync-core-worker"

type SeedContext = {
	organizationId: OrganizationId
	authorUserId: UserId
	botUserId: UserId
	channelId: ChannelId
}

type AdapterRecorder = {
	readonly calls: {
		createMessage: Array<{
			externalChannelId: ExternalChannelId
			content: string
			replyToExternalMessageId?: ExternalMessageId
		}>
		updateMessage: Array<{
			externalChannelId: ExternalChannelId
			externalMessageId: ExternalMessageId
			content: string
		}>
		deleteMessage: Array<{
			externalChannelId: ExternalChannelId
			externalMessageId: ExternalMessageId
		}>
		addReaction: Array<{
			externalChannelId: ExternalChannelId
			externalMessageId: ExternalMessageId
			emoji: string
		}>
		removeReaction: Array<{
			externalChannelId: ExternalChannelId
			externalMessageId: ExternalMessageId
			emoji: string
		}>
		createThread: Array<{
			externalChannelId: ExternalChannelId
			externalMessageId: ExternalMessageId
			name: string
		}>
	}
	readonly adapter: ChatSyncProviderAdapter
}

const runEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	Effect.runPromise((effect as Effect.Effect<A, E, never>).pipe(Effect.scoped))

const uuid = <T extends string>() => randomUUID() as T

const makeAdapterRecorder = (): AdapterRecorder => {
	let messageSeq = 0
	let threadSeq = 0

	const calls: AdapterRecorder["calls"] = {
		createMessage: [],
		updateMessage: [],
		deleteMessage: [],
		addReaction: [],
		removeReaction: [],
		createThread: [],
	}

	const adapter: ChatSyncProviderAdapter = {
		provider: "discord",
		createMessage: (params) =>
			Effect.sync(() => {
				calls.createMessage.push(params)
				messageSeq += 1
				return `20000000000000000${messageSeq}` as ExternalMessageId
			}),
		createMessageWithAttachments: (params) =>
			Effect.sync(() => {
				calls.createMessage.push({
					externalChannelId: params.externalChannelId,
					content: params.content,
					replyToExternalMessageId: params.replyToExternalMessageId,
				})
				messageSeq += 1
				return `20000000000000000${messageSeq}` as ExternalMessageId
			}),
		updateMessage: (params) =>
			Effect.sync(() => {
				calls.updateMessage.push(params)
			}),
		deleteMessage: (params) =>
			Effect.sync(() => {
				calls.deleteMessage.push(params)
			}),
		addReaction: (params) =>
			Effect.sync(() => {
				calls.addReaction.push(params)
			}),
		removeReaction: (params) =>
			Effect.sync(() => {
				calls.removeReaction.push(params)
			}),
		createThread: (params) =>
			Effect.sync(() => {
				calls.createThread.push(params)
				threadSeq += 1
				return `30000000000000000${threadSeq}` as ExternalThreadId
			}),
	}

	return { calls, adapter }
}

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
					name: "Chat Sync Org",
					slug: `chat-sync-${organizationId.slice(0, 8)}`,
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
						firstName: "Author",
						lastName: "User",
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
						firstName: "Bot",
						lastName: "User",
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
					name: "general",
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
		status?: "active" | "paused" | "error" | "disabled"
		externalWorkspaceId?: string
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
					externalWorkspaceId: params.externalWorkspaceId ?? "guild-1",
					externalWorkspaceName: "Guild",
					status: params.status ?? "active",
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
		settings?: Record<string, unknown> | null
		isActive?: boolean
	},
) =>
	harness.run(
		Effect.gen(function* () {
			const db = yield* Database.Database
			const linkId = uuid<SyncChannelLinkId>()
			yield* db.execute((client) =>
				client.insert(schema.chatSyncChannelLinksTable).values({
					id: linkId,
					syncConnectionId: params.syncConnectionId,
					hazelChannelId: params.hazelChannelId,
					externalChannelId: params.externalChannelId,
					externalChannelName: "external-general",
					direction: params.direction ?? "both",
					isActive: params.isActive ?? true,
					settings: params.settings ?? null,
					lastSyncedAt: null,
					deletedAt: null,
				}),
			)
			return linkId
		}),
	)

const insertMessage = (
	harness: ChatSyncDbHarness,
	params: {
		channelId: ChannelId
		authorId: UserId
		content: string
		replyToMessageId?: MessageId | null
		threadChannelId?: ChannelId | null
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
					replyToMessageId: params.replyToMessageId ?? null,
					threadChannelId: params.threadChannelId ?? null,
					deletedAt: null,
				}),
			)
			return messageId
		}),
	)

const insertReaction = (
	harness: ChatSyncDbHarness,
	params: {
		messageId: MessageId
		channelId: ChannelId
		userId: UserId
		emoji: string
	},
) =>
	harness.run(
		Effect.gen(function* () {
			const db = yield* Database.Database
			const reactionId = uuid<MessageReactionId>()
			yield* db.execute((client) =>
				client.insert(schema.messageReactionsTable).values({
					id: reactionId,
					messageId: params.messageId,
					channelId: params.channelId,
					userId: params.userId,
					emoji: params.emoji,
				}),
			)
			return reactionId
		}),
	)

const makeWorkerLayer = (
	harness: ChatSyncDbHarness,
	params: {
		botUserId: UserId
		providerAdapter: ChatSyncProviderAdapter
		onSyncChannel?: (channelId: ChannelId) => void
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
		Layer.succeed(ChatSyncProviderRegistry, {
			getAdapter: () => Effect.succeed(params.providerAdapter),
		} as unknown as ChatSyncProviderRegistry),
		Layer.succeed(IntegrationBotService, {
			getOrCreateBotUser: () => Effect.succeed({ id: params.botUserId }),
		} as unknown as IntegrationBotService),
		Layer.succeed(ChannelAccessSyncService, {
			syncChannel: (channelId: ChannelId) =>
				Effect.sync(() => {
					params.onSyncChannel?.(channelId)
				}),
		} as unknown as ChannelAccessSyncService),
		Layer.succeed(Discord.DiscordApiClient, {
			createWebhook: () => Effect.fail(new Error("not used in deterministic integration tests")),
			executeWebhookMessage: () => Effect.fail(new Error("not used in deterministic integration tests")),
			updateWebhookMessage: () => Effect.fail(new Error("not used in deterministic integration tests")),
			deleteWebhookMessage: () => Effect.fail(new Error("not used in deterministic integration tests")),
			createMessage: () => Effect.fail(new Error("not used in deterministic integration tests")),
			updateMessage: () => Effect.fail(new Error("not used in deterministic integration tests")),
			deleteMessage: () => Effect.fail(new Error("not used in deterministic integration tests")),
			addReaction: () => Effect.fail(new Error("not used in deterministic integration tests")),
			removeReaction: () => Effect.fail(new Error("not used in deterministic integration tests")),
			createThread: () => Effect.fail(new Error("not used in deterministic integration tests")),
		} as unknown as Discord.DiscordApiClient),
	)

	return ChatSyncCoreWorker.DefaultWithoutDependencies.pipe(Layer.provide(deps))
}

describe("ChatSyncCoreWorker integration", () => {
	let harness: ChatSyncDbHarness

	beforeAll(async () => {
		harness = await createChatSyncDbHarness()
	}, 120_000)

	afterAll(async () => {
		await harness.stop()
	}, 60_000)

	beforeEach(async () => {
		await harness.reset()
	})

	it("syncs Hazel message create/update/delete lifecycle and records receipts", async () => {
		const ctx = await insertBaseContext(harness)
		const recorder = makeAdapterRecorder()
		const workerLayer = makeWorkerLayer(harness, {
			botUserId: ctx.botUserId,
			providerAdapter: recorder.adapter,
		})

		const syncConnectionId = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
		})
		const linkId = await insertLink(harness, {
			syncConnectionId,
			hazelChannelId: ctx.channelId,
			externalChannelId: "11111111111111111" as ExternalChannelId,
		})
		const messageId = await insertMessage(harness, {
			channelId: ctx.channelId,
			authorId: ctx.authorUserId,
			content: "hello",
		})

		const createResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageToProvider(syncConnectionId, messageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		recordChatSyncDiagnostic({
			suite: "chat-sync-core-worker.integration",
			testCase: "hazel-message-create-update-delete",
			workerMethod: "syncHazelMessageToProvider",
			action: "create",
			syncConnectionId,
			expected: "synced",
			actual: createResult.status,
		})
		expect(createResult.status).toBe("synced")
		expect(recorder.calls.createMessage).toHaveLength(1)

		const dedupedResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageToProvider(syncConnectionId, messageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(dedupedResult.status).toBe("deduped")

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				yield* db.execute((client) =>
					client
						.update(schema.messagesTable)
						.set({ content: "hello-updated", updatedAt: new Date() })
						.where(eq(schema.messagesTable.id, messageId)),
				)
			}),
		)

		const updateResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageUpdateToProvider(syncConnectionId, messageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(updateResult.status).toBe("updated")
		expect(recorder.calls.updateMessage).toHaveLength(1)

		const deleteResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageDeleteToProvider(syncConnectionId, messageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(deleteResult.status).toBe("deleted")
		expect(recorder.calls.deleteMessage).toHaveLength(1)

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				const messageLinkRows = yield* db.execute((client) =>
					client
						.select()
						.from(schema.chatSyncMessageLinksTable)
						.where(eq(schema.chatSyncMessageLinksTable.channelLinkId, linkId)),
				)
				expect(messageLinkRows).toHaveLength(1)
				expect(messageLinkRows[0]?.deletedAt).not.toBeNull()

				const receiptRows = yield* db.execute((client) =>
					client
						.select()
						.from(schema.chatSyncEventReceiptsTable)
						.where(eq(schema.chatSyncEventReceiptsTable.syncConnectionId, syncConnectionId)),
				)
				expect(receiptRows.length).toBeGreaterThanOrEqual(3)
				expect(
					receiptRows.some((receipt) => receipt.status === "processed" && receipt.source === "hazel"),
				).toBe(true)
			}),
		)
	})

	it("syncs Hazel reactions and ignores delete while reaction still exists", async () => {
		const ctx = await insertBaseContext(harness)
		const recorder = makeAdapterRecorder()
		const workerLayer = makeWorkerLayer(harness, {
			botUserId: ctx.botUserId,
			providerAdapter: recorder.adapter,
		})

		const syncConnectionId = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
		})
		const linkId = await insertLink(harness, {
			syncConnectionId,
			hazelChannelId: ctx.channelId,
			externalChannelId: "11111111111111111" as ExternalChannelId,
		})
		const messageId = await insertMessage(harness, {
			channelId: ctx.channelId,
			authorId: ctx.authorUserId,
			content: "hello",
		})
		const createMessageResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageToProvider(syncConnectionId, messageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(createMessageResult.status).toBe("synced")
		const externalMessageId = createMessageResult.externalMessageId

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				const links = yield* db.execute((client) =>
					client
						.select()
						.from(schema.chatSyncMessageLinksTable)
						.where(
							eq(schema.chatSyncMessageLinksTable.channelLinkId, linkId),
						),
				)
				expect(links[0]?.externalMessageId).toBe(externalMessageId)
			}),
		)

		const reactionId = await insertReaction(harness, {
			messageId,
			channelId: ctx.channelId,
			userId: ctx.authorUserId,
			emoji: "🔥",
		})

		const createReactionResult = await runEffect(
			ChatSyncCoreWorker.syncHazelReactionCreateToProvider(syncConnectionId, reactionId).pipe(
				Effect.provide(workerLayer),
			),
		)
		expect(createReactionResult.status).toBe("created")
		expect(recorder.calls.addReaction).toHaveLength(1)

		const ignoredDelete = await runEffect(
			ChatSyncCoreWorker.syncHazelReactionDeleteToProvider(syncConnectionId, {
				hazelChannelId: ctx.channelId,
				hazelMessageId: messageId,
				emoji: "🔥",
				userId: ctx.authorUserId,
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(ignoredDelete.status).toBe("ignored_remaining_reactions")

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				yield* db.execute((client) =>
					client
						.delete(schema.messageReactionsTable)
						.where(eq(schema.messageReactionsTable.id, reactionId)),
				)
			}),
		)

		const deleteReactionResult = await runEffect(
			ChatSyncCoreWorker.syncHazelReactionDeleteToProvider(syncConnectionId, {
				hazelChannelId: ctx.channelId,
				hazelMessageId: messageId,
				emoji: "🔥",
				userId: ctx.authorUserId,
			}, "hazel:reaction:delete:second-pass").pipe(Effect.provide(workerLayer)),
		)
		expect(deleteReactionResult.status).toBe("deleted")
		expect(recorder.calls.removeReaction).toHaveLength(1)
	})

	it("syncs Discord ingress message/reaction/thread lifecycle into Hazel", async () => {
		const ctx = await insertBaseContext(harness)
		const recorder = makeAdapterRecorder()
		const syncedChannels: ChannelId[] = []
		const workerLayer = makeWorkerLayer(harness, {
			botUserId: ctx.botUserId,
			providerAdapter: recorder.adapter,
			onSyncChannel: (channelId) => syncedChannels.push(channelId),
		})

		const syncConnectionId = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
		})
		const externalParentChannelId = "11111111111111111" as ExternalChannelId
		const parentLinkId = await insertLink(harness, {
			syncConnectionId,
			hazelChannelId: ctx.channelId,
			externalChannelId: externalParentChannelId,
		})

		const ingressCreate = await runEffect(
			ChatSyncCoreWorker.ingestMessageCreate({
				syncConnectionId,
				externalChannelId: externalParentChannelId,
				externalMessageId: "22222222222222221" as ExternalMessageId,
				externalAuthorId: "ext-user-1" as ExternalUserId,
				externalAuthorDisplayName: "External User",
				content: "from discord",
				dedupeKey: "ext:create:1",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(ingressCreate.status).toBe("created")
		if (!ingressCreate.hazelMessageId) {
			throw new Error("ingestMessageCreate did not return hazelMessageId")
		}
		const hazelMessageId = ingressCreate.hazelMessageId

		const ingressUpdate = await runEffect(
			ChatSyncCoreWorker.ingestMessageUpdate({
				syncConnectionId,
				externalChannelId: externalParentChannelId,
				externalMessageId: "22222222222222221" as ExternalMessageId,
				content: "from discord updated",
				dedupeKey: "ext:update:1",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(ingressUpdate.status).toBe("updated")
		expect(ingressUpdate.hazelMessageId).toBe(hazelMessageId)

		const reactionAdd = await runEffect(
			ChatSyncCoreWorker.ingestReactionAdd({
				syncConnectionId,
				externalChannelId: externalParentChannelId,
				externalMessageId: "22222222222222221" as ExternalMessageId,
				externalUserId: "ext-user-2" as ExternalUserId,
				externalAuthorDisplayName: "React User",
				emoji: "🔥",
				dedupeKey: "ext:reaction:add:1",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(reactionAdd.status).toBe("created")

		const reactionDelete = await runEffect(
			ChatSyncCoreWorker.ingestReactionRemove({
				syncConnectionId,
				externalChannelId: externalParentChannelId,
				externalMessageId: "22222222222222221" as ExternalMessageId,
				externalUserId: "ext-user-2" as ExternalUserId,
				externalAuthorDisplayName: "React User",
				emoji: "🔥",
				dedupeKey: "ext:reaction:remove:1",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(reactionDelete.status).toBe("deleted")

		const threadCreate = await runEffect(
			ChatSyncCoreWorker.ingestThreadCreate({
				syncConnectionId,
				externalParentChannelId,
				externalThreadId: "33333333333333331" as ExternalThreadId,
				externalRootMessageId: "22222222222222221" as ExternalMessageId,
				name: "Thread From Discord",
				dedupeKey: "ext:thread:create:1",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(threadCreate.status).toBe("created")
		expect(syncedChannels).toContain(threadCreate.hazelThreadChannelId)

		const ingressDelete = await runEffect(
			ChatSyncCoreWorker.ingestMessageDelete({
				syncConnectionId,
				externalChannelId: externalParentChannelId,
				externalMessageId: "22222222222222221" as ExternalMessageId,
				dedupeKey: "ext:delete:1",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(ingressDelete.status).toBe("deleted")
		expect(ingressDelete.hazelMessageId).toBe(hazelMessageId)

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				const linkRows = yield* db.execute((client) =>
					client
						.select()
						.from(schema.chatSyncMessageLinksTable)
						.where(eq(schema.chatSyncMessageLinksTable.channelLinkId, parentLinkId)),
				)
				expect(linkRows).toHaveLength(1)
				expect(linkRows[0]?.hazelMessageId).toBe(hazelMessageId)

				const deletedMessageRows = yield* db.execute((client) =>
					client
						.select()
						.from(schema.messagesTable)
						.where(
							eq(schema.messagesTable.id, hazelMessageId),
						),
				)
				expect(deletedMessageRows[0]?.deletedAt).not.toBeNull()
			}),
		)
	})

	it("enforces direction/inactive/webhook-origin guards", async () => {
		const ctx = await insertBaseContext(harness)
		const recorder = makeAdapterRecorder()
		const workerLayer = makeWorkerLayer(harness, {
			botUserId: ctx.botUserId,
			providerAdapter: recorder.adapter,
		})

		const activeBothConnection = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
		})
		const activeInboundOnlyConnection = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
			externalWorkspaceId: "guild-2",
		})
		const inactiveConnection = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
			status: "paused",
			externalWorkspaceId: "guild-3",
		})

		await insertLink(harness, {
			syncConnectionId: activeBothConnection,
			hazelChannelId: ctx.channelId,
			externalChannelId: "11111111111111111" as ExternalChannelId,
			direction: "both",
		})
		await insertLink(harness, {
			syncConnectionId: activeInboundOnlyConnection,
			hazelChannelId: ctx.channelId,
			externalChannelId: "11111111111111112" as ExternalChannelId,
			direction: "external_to_hazel",
		})
		await insertLink(harness, {
			syncConnectionId: inactiveConnection,
			hazelChannelId: ctx.channelId,
			externalChannelId: "11111111111111113" as ExternalChannelId,
			direction: "both",
		})

		const outboundMessageId = await insertMessage(harness, {
			channelId: ctx.channelId,
			authorId: ctx.authorUserId,
			content: "direction-check",
		})

		const outboundResult = await runEffect(
			ChatSyncCoreWorker.syncHazelMessageCreateToAllConnections("discord", outboundMessageId).pipe(
				Effect.provide(workerLayer),
			),
		)
		recordChatSyncDiagnostic({
			suite: "chat-sync-core-worker.integration",
			testCase: "direction-inactive-webhook-origin-guards",
			workerMethod: "syncHazelMessageCreateToAllConnections",
			action: "direction_gate",
			expected: "1 synced",
			actual: `${outboundResult.synced} synced`,
		})
		expect(outboundResult.synced).toBe(1)
		expect(recorder.calls.createMessage).toHaveLength(1)

		const webhookSettings = {
			outboundIdentity: {
				enabled: true,
				strategy: "webhook",
				providers: {
					discord: {
						kind: "discord.webhook",
						webhookId: "99999999999999999",
						webhookToken: "token",
					},
				},
			},
		}
		const guardedLinkConnection = await insertConnection(harness, {
			organizationId: ctx.organizationId,
			createdBy: ctx.authorUserId,
			externalWorkspaceId: "guild-4",
		})
		await insertLink(harness, {
			syncConnectionId: guardedLinkConnection,
			hazelChannelId: ctx.channelId,
			externalChannelId: "11111111111111114" as ExternalChannelId,
			direction: "both",
			settings: webhookSettings,
		})

		const webhookIgnored = await runEffect(
			ChatSyncCoreWorker.ingestMessageCreate({
				syncConnectionId: guardedLinkConnection,
				externalChannelId: "11111111111111114" as ExternalChannelId,
				externalMessageId: "22222222222222224" as ExternalMessageId,
				externalWebhookId: "99999999999999999" as ExternalWebhookId,
				content: "from webhook",
				dedupeKey: "ext:webhook-origin",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(webhookIgnored.status).toBe("ignored_webhook_origin")

		const inactiveIgnored = await runEffect(
			ChatSyncCoreWorker.ingestMessageCreate({
				syncConnectionId: inactiveConnection,
				externalChannelId: "11111111111111113" as ExternalChannelId,
				externalMessageId: "22222222222222223" as ExternalMessageId,
				content: "ignored",
				dedupeKey: "ext:inactive",
			}).pipe(Effect.provide(workerLayer)),
		)
		expect(inactiveIgnored.status).toBe("ignored_connection_inactive")

		await harness.run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				const rows = yield* db.execute((client) =>
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
				const contents = rows.map((row) => row.content)
				expect(contents).toContain("direction-check")
				expect(contents).not.toContain("ignored")
			}),
		)
	})
})

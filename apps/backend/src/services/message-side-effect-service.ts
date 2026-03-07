import { HttpApiClient } from "@effect/platform"
import { and, Database, eq, isNull, schema, sql } from "@hazel/db"
import { Cluster, WorkflowInitializationError } from "@hazel/domain"
import { Config, Effect } from "effect"
import { TreeFormatter } from "effect/ParseResult"
import type {
	MessageCreatedPayload,
	MessageDeletedPayload,
	MessageUpdatedPayload,
	ReactionCreatedPayload,
	ReactionDeletedPayload,
} from "@hazel/backend-core"
import { DiscordSyncWorker } from "./chat-sync/discord-sync-worker"

export class MessageSideEffectService extends Effect.Service<MessageSideEffectService>()(
	"MessageSideEffectService",
	{
		accessors: true,
		dependencies: [DiscordSyncWorker.Default],
		effect: Effect.gen(function* () {
			const db = yield* Database.Database
			const discordSyncWorker = yield* DiscordSyncWorker
			const clusterUrl = yield* Config.string("CLUSTER_URL").pipe(Effect.orDie)
			const client = yield* HttpApiClient.make(Cluster.WorkflowApi, {
				baseUrl: clusterUrl,
			})

			const resolveIntegrationBotUserId = Effect.fn(
				"MessageSideEffectService.resolveIntegrationBotUserId",
			)(function* () {
				const integrationBotResult = yield* db
					.execute((dbClient) =>
						dbClient
							.select({ id: schema.usersTable.id })
							.from(schema.usersTable)
							.where(
								and(
									eq(schema.usersTable.externalId, "integration-bot-discord"),
									isNull(schema.usersTable.deletedAt),
								),
							)
							.limit(1),
					)
					.pipe(Effect.catchTag("DatabaseError", () => Effect.succeed([])))

				return integrationBotResult[0]?.id ?? null
			})

			const handleMessageCreated = Effect.fn("MessageSideEffectService.handleMessageCreated")(
				function* (payload: MessageCreatedPayload, dedupeKey: string) {
					const integrationBotUserId = yield* resolveIntegrationBotUserId()
					if (payload.authorId !== integrationBotUserId) {
						yield* discordSyncWorker
							.syncHazelMessageCreateToAllConnections(payload.messageId, dedupeKey)
							.pipe(
								Effect.catchAll((error) =>
									Effect.logWarning("Failed to sync outbox message create to Discord", {
										messageId: payload.messageId,
										channelId: payload.channelId,
										error: String(error),
									}),
								),
							)
					} else {
						yield* Effect.logDebug("Skipping outbox message create from integration bot", {
							messageId: payload.messageId,
							channelId: payload.channelId,
						})
					}

					const channelResult = yield* db
						.execute((dbClient) =>
							dbClient
								.select({
									type: schema.channelsTable.type,
									name: schema.channelsTable.name,
								})
								.from(schema.channelsTable)
								.where(eq(schema.channelsTable.id, payload.channelId))
								.limit(1),
						)
						.pipe(
							Effect.catchTag("DatabaseError", (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "Failed to query channel type",
										cause: err.message,
									}),
								),
							),
						)

					const channelType = channelResult[0]?.type ?? "public"

					yield* client.workflows
						.MessageNotificationWorkflowDiscard({
							payload: {
								messageId: payload.messageId,
								channelId: payload.channelId,
								authorId: payload.authorId,
								channelType,
								content: payload.content,
								replyToMessageId: payload.replyToMessageId,
							},
						})
						.pipe(
							Effect.catchTags({
								HttpApiDecodeError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute notification workflow",
											cause: err.message,
										}),
									),
								ParseError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute notification workflow",
											cause: TreeFormatter.formatErrorSync(err),
										}),
									),
								RequestError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute notification workflow",
											cause: err.message,
										}),
									),
								ResponseError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute notification workflow",
											cause: err.message,
										}),
									),
							}),
						)

					if (channelType !== "thread") {
						return
					}

					const messageCountResult = yield* db
						.execute((dbClient) =>
							dbClient
								.select({ count: sql<number>`count(*)::int` })
								.from(schema.messagesTable)
								.where(
									and(
										eq(schema.messagesTable.channelId, payload.channelId),
										isNull(schema.messagesTable.deletedAt),
									),
								),
						)
						.pipe(Effect.catchTag("DatabaseError", () => Effect.succeed([{ count: 0 }])))

					const count = messageCountResult[0]?.count ?? 0
					if (count <= 3 || channelResult[0]?.name !== "Thread") {
						return
					}

					const originalMessageResult = yield* db
						.execute((dbClient) =>
							dbClient
								.select({ id: schema.messagesTable.id })
								.from(schema.messagesTable)
								.where(eq(schema.messagesTable.threadChannelId, payload.channelId))
								.limit(1),
						)
						.pipe(Effect.catchTag("DatabaseError", () => Effect.succeed([])))

					if (originalMessageResult.length === 0) {
						return
					}

					yield* client.workflows
						.ThreadNamingWorkflowDiscard({
							payload: {
								threadChannelId: payload.channelId,
								originalMessageId: originalMessageResult[0]!.id,
							},
						})
						.pipe(
							Effect.tapError((err) =>
								Effect.logError("Failed to execute thread naming workflow", {
									error: err.message,
									threadChannelId: payload.channelId,
								}),
							),
							Effect.catchTags({
								HttpApiDecodeError: () => Effect.void,
								ParseError: () => Effect.void,
								RequestError: () => Effect.void,
								ResponseError: () => Effect.void,
							}),
						)
				},
			)

			const handleMessageUpdated = Effect.fn("MessageSideEffectService.handleMessageUpdated")(
				function* (payload: MessageUpdatedPayload, dedupeKey: string) {
					yield* discordSyncWorker
						.syncHazelMessageUpdateToAllConnections(payload.messageId, dedupeKey)
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to sync outbox message update to Discord", {
									messageId: payload.messageId,
									error: String(error),
								}),
							),
						)
				},
			)

			const handleMessageDeleted = Effect.fn("MessageSideEffectService.handleMessageDeleted")(
				function* (payload: MessageDeletedPayload, dedupeKey: string) {
					yield* discordSyncWorker
						.syncHazelMessageDeleteToAllConnections(payload.messageId, dedupeKey)
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to sync outbox message delete to Discord", {
									messageId: payload.messageId,
									error: String(error),
								}),
							),
						)
				},
			)

			const handleReactionCreated = Effect.fn("MessageSideEffectService.handleReactionCreated")(
				function* (payload: ReactionCreatedPayload, dedupeKey: string) {
					yield* discordSyncWorker
						.syncHazelReactionCreateToAllConnections(payload.reactionId, dedupeKey)
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to sync outbox reaction create to Discord", {
									reactionId: payload.reactionId,
									error: String(error),
								}),
							),
						)
				},
			)

			const handleReactionDeleted = Effect.fn("MessageSideEffectService.handleReactionDeleted")(
				function* (payload: ReactionDeletedPayload, dedupeKey: string) {
					yield* discordSyncWorker
						.syncHazelReactionDeleteToAllConnections(
							{
								hazelChannelId: payload.hazelChannelId,
								hazelMessageId: payload.hazelMessageId,
								emoji: payload.emoji,
								userId: payload.userId,
							},
							dedupeKey,
						)
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to sync outbox reaction delete to Discord", {
									hazelMessageId: payload.hazelMessageId,
									error: String(error),
								}),
							),
						)
				},
			)

			return {
				handleMessageCreated,
				handleMessageUpdated,
				handleMessageDeleted,
				handleReactionCreated,
				handleReactionDeleted,
			}
		}),
	},
) {}

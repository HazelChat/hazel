import { Database, PG, schema } from "@hazel/db"
import { WorkflowInitializationError } from "@hazel/domain"
import { Context, Array, Config, Effect, Layer, Option } from "effect"
import type {
	MessageCreatedPayload,
	MessageDeletedPayload,
	MessageUpdatedPayload,
	ReactionCreatedPayload,
	ReactionDeletedPayload,
} from "@hazel/backend-core"
import { formatError } from "../lib/format-error"
import { DiscordSyncWorker, DiscordSyncWorkerLayer } from "./chat-sync/discord-sync-worker"
import { makeClusterClient } from "../lib/cluster-client"

export class MessageSideEffectService extends Context.Service<MessageSideEffectService>()(
	"MessageSideEffectService",
	{
		make: Effect.gen(function* () {
			const db = yield* Database.Database
			const discordSyncWorker = yield* DiscordSyncWorker
			const clusterUrl = yield* Config.String("CLUSTER_URL")
			const client = yield* makeClusterClient(clusterUrl)

			const resolveIntegrationBotUserId = Effect.fn(
				"MessageSideEffectService.resolveIntegrationBotUserId",
			)(function* () {
				const integrationBot = yield* db
					.first(
						PG.from(schema.usersTable)
							.select("id")
							.where(($) => [$.externalId.eq("integration-bot-discord"), $.deletedAt.isNull()])
							.limit(1),
					)
					.pipe(Effect.catchTag("DatabaseError", () => Effect.succeed(Option.none())))

				return Option.getOrNull(Option.map(integrationBot, (row) => row.id))
			})

			const handleMessageCreated = Effect.fn("MessageSideEffectService.handleMessageCreated")(
				function* (payload: MessageCreatedPayload, dedupeKey: string) {
					const integrationBotUserId = yield* resolveIntegrationBotUserId()
					if (payload.authorId !== integrationBotUserId) {
						yield* discordSyncWorker
							.syncHazelMessageCreateToAllConnections(payload.messageId, dedupeKey)
							.pipe(
								Effect.catch((error) =>
									Effect.logWarning("Failed to sync outbox message create to Discord", {
										messageId: payload.messageId,
										channelId: payload.channelId,
										error: formatError(error),
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
						.run(
							PG.from(schema.channelsTable)
								.select("type", "name")
								.where(($) => [$.id.eq(payload.channelId)])
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

					const channelType = Array.head(channelResult).pipe(
						Option.map((row) => row.type),
						Option.getOrElse(() => "public" as const),
					)

					yield* client.workflows
						.MessageNotificationWorkflow({
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
							Effect.tapError((err) =>
								Effect.logError("MessageNotificationWorkflow dispatch failed", {
									messageId: payload.messageId,
									channelId: payload.channelId,
									errorTag:
										typeof err === "object" && err && "_tag" in err
											? (err as { _tag: string })._tag
											: "unknown",
									error: formatError(err),
								}),
							),
							Effect.catch((err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "Failed to execute notification workflow",
										cause: formatError(err),
									}),
								),
							),
						)

					if (channelType !== "thread") {
						return
					}

					const messageCountResult = yield* db
						.run(
							PG.from(schema.messagesTable)
								.select(() => ({ count: PG.count() }))
								.where(($) => [$.channelId.eq(payload.channelId), $.deletedAt.isNull()]),
						)
						.pipe(Effect.catchTag("DatabaseError", () => Effect.succeed([{ count: 0 }])))

					const count = Array.head(messageCountResult).pipe(
						Option.map((r) => r.count),
						Option.getOrElse(() => 0),
					)
					const channelName = Array.head(channelResult).pipe(
						Option.map((r) => r.name),
						Option.getOrNull,
					)
					if (count <= 3 || channelName !== "Thread") {
						return
					}

					const originalMessage = yield* db
						.first(
							PG.from(schema.messagesTable)
								.select("id")
								.where(($) => [$.threadChannelId.eq(payload.channelId)])
								.limit(1),
						)
						.pipe(Effect.catchTag("DatabaseError", () => Effect.succeed(Option.none())))
					if (Option.isNone(originalMessage)) {
						return
					}

					yield* client.workflows
						.ThreadNamingWorkflow({
							payload: {
								threadChannelId: payload.channelId,
								originalMessageId: originalMessage.value.id,
							},
						})
						.pipe(
							Effect.tapError((err) =>
								Effect.logError("Failed to execute thread naming workflow", {
									threadChannelId: payload.channelId,
									error: formatError(err),
								}),
							),
							Effect.catch(() => Effect.void),
						)
				},
			)

			const handleMessageUpdated = Effect.fn("MessageSideEffectService.handleMessageUpdated")(
				function* (payload: MessageUpdatedPayload, dedupeKey: string) {
					yield* discordSyncWorker
						.syncHazelMessageUpdateToAllConnections(payload.messageId, dedupeKey)
						.pipe(
							Effect.catch((error) =>
								Effect.logWarning("Failed to sync outbox message update to Discord", {
									messageId: payload.messageId,
									error: formatError(error),
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
							Effect.catch((error) =>
								Effect.logWarning("Failed to sync outbox message delete to Discord", {
									messageId: payload.messageId,
									error: formatError(error),
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
							Effect.catch((error) =>
								Effect.logWarning("Failed to sync outbox reaction create to Discord", {
									reactionId: payload.reactionId,
									error: formatError(error),
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
							Effect.catch((error) =>
								Effect.logWarning("Failed to sync outbox reaction delete to Discord", {
									hazelMessageId: payload.hazelMessageId,
									error: formatError(error),
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
) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(DiscordSyncWorkerLayer))
}

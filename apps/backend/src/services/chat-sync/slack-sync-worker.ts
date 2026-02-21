import { Effect } from "effect"
import { ChannelId, MessageId, MessageReactionId, SyncConnectionId, UserId } from "@hazel/schema"
import {
	DEFAULT_MAX_MESSAGES_PER_CHANNEL,
	ChatSyncCoreWorker,
	type ChatSyncIngressMessageCreate,
	type ChatSyncIngressMessageDelete,
	type ChatSyncIngressMessageUpdate,
	type ChatSyncIngressReactionAdd,
	type ChatSyncIngressReactionRemove,
	type ChatSyncIngressThreadCreate,
	DiscordSyncApiError,
	DiscordSyncChannelLinkNotFoundError,
	DiscordSyncConfigurationError,
	DiscordSyncConnectionNotFoundError,
	DiscordSyncMessageNotFoundError,
} from "./chat-sync-core-worker"

export type SlackIngressMessageCreate = ChatSyncIngressMessageCreate
export type SlackIngressMessageUpdate = ChatSyncIngressMessageUpdate
export type SlackIngressMessageDelete = ChatSyncIngressMessageDelete
export type SlackIngressReactionAdd = ChatSyncIngressReactionAdd
export type SlackIngressReactionRemove = ChatSyncIngressReactionRemove
export type SlackIngressThreadCreate = ChatSyncIngressThreadCreate

export {
	DiscordSyncApiError,
	DiscordSyncChannelLinkNotFoundError,
	DiscordSyncConfigurationError,
	DiscordSyncConnectionNotFoundError,
	DiscordSyncMessageNotFoundError,
}

export class SlackSyncWorker extends Effect.Service<SlackSyncWorker>()("SlackSyncWorker", {
	accessors: true,
	effect: Effect.gen(function* () {
		const coreWorker = yield* ChatSyncCoreWorker

		const syncConnection = Effect.fn("SlackSyncWorker.syncConnection")(function* (
			syncConnectionId: SyncConnectionId,
			maxMessagesPerChannel = DEFAULT_MAX_MESSAGES_PER_CHANNEL,
		) {
			return yield* coreWorker.syncConnection(syncConnectionId, maxMessagesPerChannel)
		})

		const syncAllActiveConnections = Effect.fn("SlackSyncWorker.syncAllActiveConnections")(function* (
			maxMessagesPerChannel = DEFAULT_MAX_MESSAGES_PER_CHANNEL,
		) {
			return yield* coreWorker.syncAllActiveConnections("slack", maxMessagesPerChannel)
		})

		const syncHazelMessageToSlack = Effect.fn("SlackSyncWorker.syncHazelMessageToSlack")(function* (
			syncConnectionId: SyncConnectionId,
			hazelMessageId: MessageId,
			dedupeKeyOverride?: string,
		) {
			return yield* coreWorker.syncHazelMessageToProvider(
				syncConnectionId,
				hazelMessageId,
				dedupeKeyOverride,
			)
		})

		const syncHazelMessageUpdateToSlack = Effect.fn("SlackSyncWorker.syncHazelMessageUpdateToSlack")(
			function* (
				syncConnectionId: SyncConnectionId,
				hazelMessageId: MessageId,
				dedupeKeyOverride?: string,
			) {
				return yield* coreWorker.syncHazelMessageUpdateToProvider(
					syncConnectionId,
					hazelMessageId,
					dedupeKeyOverride,
				)
			},
		)

		const syncHazelMessageDeleteToSlack = Effect.fn("SlackSyncWorker.syncHazelMessageDeleteToSlack")(
			function* (
				syncConnectionId: SyncConnectionId,
				hazelMessageId: MessageId,
				dedupeKeyOverride?: string,
			) {
				return yield* coreWorker.syncHazelMessageDeleteToProvider(
					syncConnectionId,
					hazelMessageId,
					dedupeKeyOverride,
				)
			},
		)

		const syncHazelReactionCreateToSlack = Effect.fn("SlackSyncWorker.syncHazelReactionCreateToSlack")(
			function* (
				syncConnectionId: SyncConnectionId,
				hazelReactionId: MessageReactionId,
				dedupeKeyOverride?: string,
			) {
				return yield* coreWorker.syncHazelReactionCreateToProvider(
					syncConnectionId,
					hazelReactionId,
					dedupeKeyOverride,
				)
			},
		)

		const syncHazelReactionDeleteToSlack = Effect.fn("SlackSyncWorker.syncHazelReactionDeleteToSlack")(
			function* (
				syncConnectionId: SyncConnectionId,
				payload: {
					hazelChannelId: ChannelId
					hazelMessageId: MessageId
					emoji: string
					userId?: UserId
				},
				dedupeKeyOverride?: string,
			) {
				return yield* coreWorker.syncHazelReactionDeleteToProvider(
					syncConnectionId,
					payload,
					dedupeKeyOverride,
				)
			},
		)

		const syncHazelMessageCreateToAllConnections = Effect.fn(
			"SlackSyncWorker.syncHazelMessageCreateToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelMessageCreateToAllConnections(
				"slack",
				hazelMessageId,
				dedupeKey,
			)
		})

		const syncHazelMessageUpdateToAllConnections = Effect.fn(
			"SlackSyncWorker.syncHazelMessageUpdateToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelMessageUpdateToAllConnections(
				"slack",
				hazelMessageId,
				dedupeKey,
			)
		})

		const syncHazelMessageDeleteToAllConnections = Effect.fn(
			"SlackSyncWorker.syncHazelMessageDeleteToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelMessageDeleteToAllConnections(
				"slack",
				hazelMessageId,
				dedupeKey,
			)
		})

		const syncHazelReactionCreateToAllConnections = Effect.fn(
			"SlackSyncWorker.syncHazelReactionCreateToAllConnections",
		)(function* (hazelReactionId: MessageReactionId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelReactionCreateToAllConnections(
				"slack",
				hazelReactionId,
				dedupeKey,
			)
		})

		const syncHazelReactionDeleteToAllConnections = Effect.fn(
			"SlackSyncWorker.syncHazelReactionDeleteToAllConnections",
		)(function* (
			payload: {
				hazelChannelId: ChannelId
				hazelMessageId: MessageId
				emoji: string
				userId?: UserId
			},
			dedupeKey?: string,
		) {
			return yield* coreWorker.syncHazelReactionDeleteToAllConnections("slack", payload, dedupeKey)
		})

		const ingestMessageCreate = Effect.fn("SlackSyncWorker.ingestMessageCreate")(function* (
			payload: SlackIngressMessageCreate,
		) {
			return yield* coreWorker.ingestMessageCreate(payload)
		})

		const ingestMessageUpdate = Effect.fn("SlackSyncWorker.ingestMessageUpdate")(function* (
			payload: SlackIngressMessageUpdate,
		) {
			return yield* coreWorker.ingestMessageUpdate(payload)
		})

		const ingestMessageDelete = Effect.fn("SlackSyncWorker.ingestMessageDelete")(function* (
			payload: SlackIngressMessageDelete,
		) {
			return yield* coreWorker.ingestMessageDelete(payload)
		})

		const ingestReactionAdd = Effect.fn("SlackSyncWorker.ingestReactionAdd")(function* (
			payload: SlackIngressReactionAdd,
		) {
			return yield* coreWorker.ingestReactionAdd(payload)
		})

		const ingestReactionRemove = Effect.fn("SlackSyncWorker.ingestReactionRemove")(function* (
			payload: SlackIngressReactionRemove,
		) {
			return yield* coreWorker.ingestReactionRemove(payload)
		})

		const ingestThreadCreate = Effect.fn("SlackSyncWorker.ingestThreadCreate")(function* (
			payload: SlackIngressThreadCreate,
		) {
			return yield* coreWorker.ingestThreadCreate(payload)
		})

		return {
			syncConnection,
			syncAllActiveConnections,
			syncHazelMessageToSlack,
			syncHazelMessageUpdateToSlack,
			syncHazelMessageDeleteToSlack,
			syncHazelReactionCreateToSlack,
			syncHazelReactionDeleteToSlack,
			syncHazelMessageCreateToAllConnections,
			syncHazelMessageUpdateToAllConnections,
			syncHazelMessageDeleteToAllConnections,
			syncHazelReactionCreateToAllConnections,
			syncHazelReactionDeleteToAllConnections,
			ingestMessageCreate,
			ingestMessageUpdate,
			ingestMessageDelete,
			ingestReactionAdd,
			ingestReactionRemove,
			ingestThreadCreate,
		}
	}),
	dependencies: [ChatSyncCoreWorker.Default],
}) {}

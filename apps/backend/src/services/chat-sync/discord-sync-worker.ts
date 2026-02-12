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

export type DiscordIngressMessageCreate = ChatSyncIngressMessageCreate
export type DiscordIngressMessageUpdate = ChatSyncIngressMessageUpdate
export type DiscordIngressMessageDelete = ChatSyncIngressMessageDelete
export type DiscordIngressReactionAdd = ChatSyncIngressReactionAdd
export type DiscordIngressReactionRemove = ChatSyncIngressReactionRemove
export type DiscordIngressThreadCreate = ChatSyncIngressThreadCreate

export {
	DiscordSyncApiError,
	DiscordSyncChannelLinkNotFoundError,
	DiscordSyncConfigurationError,
	DiscordSyncConnectionNotFoundError,
	DiscordSyncMessageNotFoundError,
}

export class DiscordSyncWorker extends Effect.Service<DiscordSyncWorker>()("DiscordSyncWorker", {
	accessors: true,
	effect: Effect.gen(function* () {
		const coreWorker = yield* ChatSyncCoreWorker

		const syncConnection = Effect.fn("DiscordSyncWorker.syncConnection")(function* (
			syncConnectionId: SyncConnectionId,
			maxMessagesPerChannel = DEFAULT_MAX_MESSAGES_PER_CHANNEL,
		) {
			return yield* coreWorker.syncConnection(syncConnectionId, maxMessagesPerChannel)
		})

		const syncAllActiveConnections = Effect.fn("DiscordSyncWorker.syncAllActiveConnections")(function* (
			maxMessagesPerChannel = DEFAULT_MAX_MESSAGES_PER_CHANNEL,
		) {
			return yield* coreWorker.syncAllActiveConnections("discord", maxMessagesPerChannel)
		})

		const syncHazelMessageToDiscord = Effect.fn("DiscordSyncWorker.syncHazelMessageToDiscord")(function* (
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

		const syncHazelMessageUpdateToDiscord = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageUpdateToDiscord",
		)(function* (
			syncConnectionId: SyncConnectionId,
			hazelMessageId: MessageId,
			dedupeKeyOverride?: string,
		) {
			return yield* coreWorker.syncHazelMessageUpdateToProvider(
				syncConnectionId,
				hazelMessageId,
				dedupeKeyOverride,
			)
		})

		const syncHazelMessageDeleteToDiscord = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageDeleteToDiscord",
		)(function* (
			syncConnectionId: SyncConnectionId,
			hazelMessageId: MessageId,
			dedupeKeyOverride?: string,
		) {
			return yield* coreWorker.syncHazelMessageDeleteToProvider(
				syncConnectionId,
				hazelMessageId,
				dedupeKeyOverride,
			)
		})

		const syncHazelReactionCreateToDiscord = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionCreateToDiscord",
		)(function* (
			syncConnectionId: SyncConnectionId,
			hazelReactionId: MessageReactionId,
			dedupeKeyOverride?: string,
		) {
			return yield* coreWorker.syncHazelReactionCreateToProvider(
				syncConnectionId,
				hazelReactionId,
				dedupeKeyOverride,
			)
		})

		const syncHazelReactionDeleteToDiscord = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionDeleteToDiscord",
		)(function* (
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
		})

		const syncHazelMessageCreateToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageCreateToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelMessageCreateToAllConnections(
				"discord",
				hazelMessageId,
				dedupeKey,
			)
		})

		const syncHazelMessageUpdateToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageUpdateToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelMessageUpdateToAllConnections(
				"discord",
				hazelMessageId,
				dedupeKey,
			)
		})

		const syncHazelMessageDeleteToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelMessageDeleteToAllConnections",
		)(function* (hazelMessageId: MessageId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelMessageDeleteToAllConnections(
				"discord",
				hazelMessageId,
				dedupeKey,
			)
		})

		const syncHazelReactionCreateToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionCreateToAllConnections",
		)(function* (hazelReactionId: MessageReactionId, dedupeKey?: string) {
			return yield* coreWorker.syncHazelReactionCreateToAllConnections(
				"discord",
				hazelReactionId,
				dedupeKey,
			)
		})

		const syncHazelReactionDeleteToAllConnections = Effect.fn(
			"DiscordSyncWorker.syncHazelReactionDeleteToAllConnections",
		)(function* (
			payload: {
				hazelChannelId: ChannelId
				hazelMessageId: MessageId
				emoji: string
				userId?: UserId
			},
			dedupeKey?: string,
		) {
			return yield* coreWorker.syncHazelReactionDeleteToAllConnections(
				"discord",
				payload,
				dedupeKey,
			)
		})

		const ingestMessageCreate = Effect.fn("DiscordSyncWorker.ingestMessageCreate")(function* (
			payload: DiscordIngressMessageCreate,
		) {
			return yield* coreWorker.ingestMessageCreate(payload)
		})

		const ingestMessageUpdate = Effect.fn("DiscordSyncWorker.ingestMessageUpdate")(function* (
			payload: DiscordIngressMessageUpdate,
		) {
			return yield* coreWorker.ingestMessageUpdate(payload)
		})

		const ingestMessageDelete = Effect.fn("DiscordSyncWorker.ingestMessageDelete")(function* (
			payload: DiscordIngressMessageDelete,
		) {
			return yield* coreWorker.ingestMessageDelete(payload)
		})

		const ingestReactionAdd = Effect.fn("DiscordSyncWorker.ingestReactionAdd")(function* (
			payload: DiscordIngressReactionAdd,
		) {
			return yield* coreWorker.ingestReactionAdd(payload)
		})

		const ingestReactionRemove = Effect.fn("DiscordSyncWorker.ingestReactionRemove")(function* (
			payload: DiscordIngressReactionRemove,
		) {
			return yield* coreWorker.ingestReactionRemove(payload)
		})

		const ingestThreadCreate = Effect.fn("DiscordSyncWorker.ingestThreadCreate")(function* (
			payload: DiscordIngressThreadCreate,
		) {
			return yield* coreWorker.ingestThreadCreate(payload)
		})

		return {
			syncConnection,
			syncAllActiveConnections,
			syncHazelMessageToDiscord,
			syncHazelMessageUpdateToDiscord,
			syncHazelMessageDeleteToDiscord,
			syncHazelReactionCreateToDiscord,
			syncHazelReactionDeleteToDiscord,
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

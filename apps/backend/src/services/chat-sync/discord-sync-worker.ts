import { Effect } from "effect"
import { MessageId, SyncConnectionId } from "@hazel/schema"
import {
	ChatSyncCoreWorker,
	type ChatSyncIngressMessageCreate,
	type ChatSyncIngressMessageDelete,
	type ChatSyncIngressMessageUpdate,
	DiscordSyncApiError,
	DiscordSyncChannelLinkNotFoundError,
	DiscordSyncConfigurationError,
	DiscordSyncConnectionNotFoundError,
	DiscordSyncMessageNotFoundError,
} from "./chat-sync-core-worker"

export type DiscordIngressMessageCreate = ChatSyncIngressMessageCreate
export type DiscordIngressMessageUpdate = ChatSyncIngressMessageUpdate
export type DiscordIngressMessageDelete = ChatSyncIngressMessageDelete

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
			maxMessagesPerChannel = 50,
		) {
			return yield* coreWorker.syncConnection(syncConnectionId, maxMessagesPerChannel)
		})

		const syncAllActiveConnections = Effect.fn("DiscordSyncWorker.syncAllActiveConnections")(function* (
			maxMessagesPerChannel = 50,
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

		return {
			syncConnection,
			syncAllActiveConnections,
			syncHazelMessageToDiscord,
			syncHazelMessageUpdateToDiscord,
			syncHazelMessageDeleteToDiscord,
			syncHazelMessageCreateToAllConnections,
			syncHazelMessageUpdateToAllConnections,
			syncHazelMessageDeleteToAllConnections,
			ingestMessageCreate,
			ingestMessageUpdate,
			ingestMessageDelete,
		}
	}),
	dependencies: [ChatSyncCoreWorker.Default],
}) {}

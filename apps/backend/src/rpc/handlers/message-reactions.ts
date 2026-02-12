import { MessageReactionRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { MessageReactionRpcs } from "@hazel/domain/rpc"
import type { ChannelId, MessageId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { MessageReactionPolicy } from "../../policies/message-reaction-policy"
import { DiscordSyncWorker } from "../../services/chat-sync/discord-sync-worker"

export const MessageReactionRpcLive = MessageReactionRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const discordSyncWorker = yield* DiscordSyncWorker

		return {
			"messageReaction.toggle": (payload) =>
				Effect.gen(function* () {
					const txResult = yield* db
						.transaction(
							Effect.gen(function* () {
								const user = yield* CurrentUser.Context
								const { messageId, channelId, emoji } = payload

								const existingReaction = yield* MessageReactionRepo.findByMessageUserEmoji(
									messageId,
									user.id,
									emoji,
								).pipe(policyUse(MessageReactionPolicy.canList(messageId)))

								const txid = yield* generateTransactionId()

								// If reaction exists, delete it
								if (Option.isSome(existingReaction)) {
									const deletedSyncPayload = {
										reactionId: existingReaction.value.id,
										hazelChannelId: existingReaction.value.channelId,
										hazelMessageId: existingReaction.value.messageId,
										emoji: existingReaction.value.emoji,
										userId: existingReaction.value.userId,
									} as const
									yield* MessageReactionRepo.deleteById(existingReaction.value.id).pipe(
										policyUse(MessageReactionPolicy.canDelete(existingReaction.value.id)),
									)

									return {
										wasCreated: false,
										data: undefined,
										transactionId: txid,
										deletedSyncPayload,
									}
								}

								// Otherwise, create a new reaction
								const createdMessageReaction = yield* MessageReactionRepo.insert({
									messageId,
									channelId,
									emoji,
									userId: user.id,
								}).pipe(
									Effect.map((res) => res[0]!),
									policyUse(MessageReactionPolicy.canCreate(messageId)),
								)

								return {
									wasCreated: true,
									data: createdMessageReaction,
									transactionId: txid,
									deletedSyncPayload: null,
								}
							}),
						)
						.pipe(withRemapDbErrors("MessageReaction", "create"))

					if (txResult.wasCreated && txResult.data) {
						yield* discordSyncWorker
							.syncHazelReactionCreateToAllConnections(
								txResult.data.id,
								`hazel:rpc:reaction:create:${txResult.data.id}:${txResult.transactionId}`,
							)
							.pipe(
								Effect.catchAll((error) =>
									Effect.logWarning("Failed to sync reaction create to Discord", {
										reactionId: txResult.data?.id,
										error: String(error),
									}),
								),
							)
					} else if (txResult.deletedSyncPayload) {
						yield* discordSyncWorker
							.syncHazelReactionDeleteToAllConnections(
								{
									hazelChannelId: txResult.deletedSyncPayload.hazelChannelId,
									hazelMessageId: txResult.deletedSyncPayload.hazelMessageId,
									emoji: txResult.deletedSyncPayload.emoji,
									userId: txResult.deletedSyncPayload.userId,
								},
								`hazel:rpc:reaction:delete:${txResult.deletedSyncPayload.reactionId}:${txResult.transactionId}`,
							)
							.pipe(
								Effect.catchAll((error) =>
									Effect.logWarning("Failed to sync reaction delete to Discord", {
										reactionId: txResult.deletedSyncPayload?.reactionId,
										error: String(error),
									}),
								),
							)
					}

					return {
						wasCreated: txResult.wasCreated,
						data: txResult.data,
						transactionId: txResult.transactionId,
					}
				}),

			"messageReaction.create": (payload) =>
				Effect.gen(function* () {
					const result = yield* db
						.transaction(
							Effect.gen(function* () {
								const user = yield* CurrentUser.Context

								const createdMessageReaction = yield* MessageReactionRepo.insert({
									...payload,
									userId: user.id,
								}).pipe(
									Effect.map((res) => res[0]!),
									policyUse(MessageReactionPolicy.canCreate(payload.messageId)),
								)

								const txid = yield* generateTransactionId()

								return {
									data: createdMessageReaction,
									transactionId: txid,
								}
							}),
						)
						.pipe(withRemapDbErrors("MessageReaction", "create"))

					yield* discordSyncWorker
						.syncHazelReactionCreateToAllConnections(
							result.data.id,
							`hazel:rpc:reaction:create:${result.data.id}:${result.transactionId}`,
						)
						.pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to sync reaction create to Discord", {
									reactionId: result.data.id,
									error: String(error),
								}),
							),
						)

					return result
				}),

			"messageReaction.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedMessageReaction = yield* MessageReactionRepo.update({
								id,
								...payload,
							}).pipe(policyUse(MessageReactionPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updatedMessageReaction,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("MessageReaction", "update")),

			"messageReaction.delete": ({ id }) =>
				Effect.gen(function* () {
					const txResult = yield* db
						.transaction(
							Effect.gen(function* () {
								const existing = yield* MessageReactionRepo.findById(id).pipe(
									withSystemActor,
								)
								const deletedSyncPayload = Option.match(existing, {
									onNone: () => null as null,
									onSome: (value) =>
										({
											hazelChannelId: value.channelId,
											hazelMessageId: value.messageId,
											emoji: value.emoji,
											userId: value.userId,
										}) as {
											hazelChannelId: ChannelId
											hazelMessageId: MessageId
											emoji: string
											userId: UserId
										},
								})

								yield* MessageReactionRepo.deleteById(id).pipe(
									policyUse(MessageReactionPolicy.canDelete(id)),
								)

								const txid = yield* generateTransactionId()

								return { transactionId: txid, deletedSyncPayload }
							}),
						)
						.pipe(withRemapDbErrors("MessageReaction", "delete"))

					if (txResult.deletedSyncPayload) {
						yield* discordSyncWorker
							.syncHazelReactionDeleteToAllConnections(
								{
									hazelChannelId: txResult.deletedSyncPayload.hazelChannelId,
									hazelMessageId: txResult.deletedSyncPayload.hazelMessageId,
									emoji: txResult.deletedSyncPayload.emoji,
									userId: txResult.deletedSyncPayload.userId,
								},
								`hazel:rpc:reaction:delete:${id}:${txResult.transactionId}`,
							)
							.pipe(
								Effect.catchAll((error) =>
									Effect.logWarning("Failed to sync reaction delete to Discord", {
										reactionId: id,
										error: String(error),
									}),
								),
							)
					}

					return { transactionId: txResult.transactionId }
				}),
		}
	}),
)

import { MessageOutboxRepo, MessageReactionRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, withRemapDbErrors } from "@hazel/domain"
import { MessageReactionRpcs } from "@hazel/domain/rpc"
import type { ChannelId, MessageId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { MessageReactionPolicy } from "../../policies/message-reaction-policy"

export const MessageReactionRpcLive = MessageReactionRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const outboxRepo = yield* MessageOutboxRepo

		return {
			"messageReaction.toggle": (payload) =>
				Effect.gen(function* () {
					const txResult = yield* db
						.transaction(
							Effect.gen(function* () {
								const user = yield* CurrentUser.Context
								const { messageId, channelId, emoji } = payload

								yield* MessageReactionPolicy.canList(messageId)
								const existingReaction = yield* MessageReactionRepo.findByMessageUserEmoji(
									messageId,
									user.id,
									emoji,
								)

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
									yield* MessageReactionPolicy.canDelete(existingReaction.value.id)
									yield* MessageReactionRepo.deleteById(existingReaction.value.id)
									yield* outboxRepo.insert({
										eventType: "reaction_deleted",
										aggregateId: existingReaction.value.id,
										channelId: existingReaction.value.channelId,
										payload: {
											hazelChannelId: existingReaction.value.channelId,
											hazelMessageId: existingReaction.value.messageId,
											emoji: existingReaction.value.emoji,
											userId: existingReaction.value.userId,
										},
									})

									return {
										wasCreated: false,
										data: undefined,
										transactionId: txid,
										deletedSyncPayload,
									}
								}

								// Otherwise, create a new reaction
								yield* MessageReactionPolicy.canCreate(messageId)
								const createdMessageReaction = yield* MessageReactionRepo.insert({
									messageId,
									channelId,
									emoji,
									userId: user.id,
								}).pipe(Effect.map((res) => res[0]!))

								yield* outboxRepo.insert({
									eventType: "reaction_created",
									aggregateId: createdMessageReaction.id,
									channelId: createdMessageReaction.channelId,
									payload: {
										reactionId: createdMessageReaction.id,
									},
								})

								return {
									wasCreated: true,
									data: createdMessageReaction,
									transactionId: txid,
									deletedSyncPayload: null,
								}
							}),
						)
						.pipe(withRemapDbErrors("MessageReaction", "create"))

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

								yield* MessageReactionPolicy.canCreate(payload.messageId)
								const createdMessageReaction = yield* MessageReactionRepo.insert({
									...payload,
									userId: user.id,
								}).pipe(Effect.map((res) => res[0]!))

								yield* outboxRepo.insert({
									eventType: "reaction_created",
									aggregateId: createdMessageReaction.id,
									channelId: createdMessageReaction.channelId,
									payload: {
										reactionId: createdMessageReaction.id,
									},
								})

								const txid = yield* generateTransactionId()

								return {
									data: createdMessageReaction,
									transactionId: txid,
								}
							}),
						)
						.pipe(withRemapDbErrors("MessageReaction", "create"))

					return result
				}),

			"messageReaction.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* MessageReactionPolicy.canUpdate(id)
							const updatedMessageReaction = yield* MessageReactionRepo.update({
								id,
								...payload,
							})

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
								const existing = yield* MessageReactionRepo.findById(id)
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

								yield* MessageReactionPolicy.canDelete(id)
								yield* MessageReactionRepo.deleteById(id)

								if (deletedSyncPayload !== null && Option.isSome(existing)) {
									yield* outboxRepo.insert({
										eventType: "reaction_deleted",
										aggregateId: existing.value.id,
										channelId: existing.value.channelId,
										payload: deletedSyncPayload,
									})
								}

								const txid = yield* generateTransactionId()

								return { transactionId: txid, deletedSyncPayload }
							}),
						)
						.pipe(withRemapDbErrors("MessageReaction", "delete"))

					return { transactionId: txResult.transactionId }
				}),
		}
	}),
)

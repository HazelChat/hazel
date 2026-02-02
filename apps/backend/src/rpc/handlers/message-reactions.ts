import { MessageReactionRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors } from "@hazel/domain"
import { MessageReactionRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { MessageReactionPolicy } from "../../policies/message-reaction-policy"

export const MessageReactionRpcLive = MessageReactionRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"messageReaction.toggle": (payload) =>
				db
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
								yield* MessageReactionRepo.deleteById(existingReaction.value.id).pipe(
									policyUse(MessageReactionPolicy.canDelete(existingReaction.value.id)),
								)

								return {
									wasCreated: false,
									data: undefined,
									transactionId: txid,
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
							}
						}),
					)
					.pipe(withRemapDbErrors("MessageReaction", "create")),

			"messageReaction.create": (payload) =>
				db
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
					.pipe(withRemapDbErrors("MessageReaction", "create")),

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
				db
					.transaction(
						Effect.gen(function* () {
							yield* MessageReactionRepo.deleteById(id).pipe(
								policyUse(MessageReactionPolicy.canDelete(id)),
							)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("MessageReaction", "delete")),
		}
	}),
)

import { AttachmentRepo, MessageRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, withRemapDbErrors } from "@hazel/domain"
import { MessageRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { AttachmentPolicy } from "../../policies/attachment-policy"
import { MessagePolicy } from "../../policies/message-policy"
import { BotGatewayService } from "../../services/bot-gateway-service"
import { checkMessageRateLimit } from "../../services/rate-limit-helpers"

/**
 * Message RPC Handlers
 *
 * Implements the business logic for all message-related RPC methods.
 * Each handler receives the payload and has access to CurrentUser via Effect context
 * (provided by AuthMiddleware).
 *
 * All handlers use:
 * - Rate limiting (60 requests/min per user)
 * - Database transactions for atomicity
 * - Policy checks for authorization
 * - Transaction IDs for optimistic updates
 * - Error remapping for consistent error handling
 */
export const MessageRpcLive = MessageRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const botGateway = yield* BotGatewayService

		return {
			"message.create": ({ attachmentIds, ...messageData }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Check rate limit before processing
					yield* checkMessageRateLimit(user.id)

					const response = yield* db
						.transaction(
							Effect.gen(function* () {
								yield* MessagePolicy.canCreate(messageData.channelId)
								const createdMessage = yield* MessageRepo.insert({
									...messageData,
									authorId: user.id,
									deletedAt: null,
								}).pipe(Effect.map((res) => res[0]!))

								// Update attachments with messageId if provided
								if (attachmentIds && attachmentIds.length > 0) {
									yield* Effect.forEach(attachmentIds, (attachmentId) =>
										Effect.gen(function* () {
											yield* AttachmentPolicy.canUpdate(attachmentId)
											yield* AttachmentRepo.update({
												id: attachmentId,
												messageId: createdMessage.id,
											})
										}),
									)
								}

								const txid = yield* generateTransactionId()

								return {
									data: createdMessage,
									transactionId: txid,
								}
							}),
						)
						.pipe(withRemapDbErrors("Message", "create"))

					yield* botGateway.publishMessageEvent("message.create", response.data).pipe(
						Effect.catchTag("DurableStreamRequestError", (error) =>
							Effect.logWarning("Failed to publish message.create to bot gateway", {
								error,
								messageId: response.data.id,
							}),
						),
					)

					return response
				}),

			"message.update": ({ id, ...payload }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Check rate limit before processing
					yield* checkMessageRateLimit(user.id)

					const response = yield* db
						.transaction(
							Effect.gen(function* () {
								yield* MessagePolicy.canUpdate(id)
								const updatedMessage = yield* MessageRepo.update({
									id,
									...payload,
								})

								const txid = yield* generateTransactionId()

								return {
									data: updatedMessage,
									transactionId: txid,
								}
							}),
						)
						.pipe(withRemapDbErrors("Message", "update"))

					yield* botGateway.publishMessageEvent("message.update", response.data).pipe(
						Effect.catchTag("DurableStreamRequestError", (error) =>
							Effect.logWarning("Failed to publish message.update to bot gateway", {
								error,
								messageId: response.data.id,
							}),
						),
					)

					return response
				}),

			"message.delete": ({ id }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context
					const existingMessage = yield* MessageRepo.findById(id).pipe(
						withRemapDbErrors("Message", "select"),
					)

					// Check rate limit before processing
					yield* checkMessageRateLimit(user.id)

					const response = yield* db
						.transaction(
							Effect.gen(function* () {
								yield* MessagePolicy.canDelete(id)
								yield* MessageRepo.deleteById(id)

								const txid = yield* generateTransactionId()

								return { transactionId: txid }
							}),
						)
						.pipe(withRemapDbErrors("Message", "delete"))

					if (Option.isSome(existingMessage)) {
						yield* botGateway.publishMessageEvent("message.delete", existingMessage.value).pipe(
							Effect.catchTag("DurableStreamRequestError", (error) =>
								Effect.logWarning("Failed to publish message.delete to bot gateway", {
									error,
									messageId: existingMessage.value.id,
								}),
							),
						)
					}

					return response
				}),
		}
	}),
)

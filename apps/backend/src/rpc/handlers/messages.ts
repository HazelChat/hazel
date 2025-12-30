import { HttpBody, HttpClient } from "@effect/platform"
import { Database } from "@hazel/db"
import type { MessageId } from "@hazel/domain/ids"
import { CurrentUser, policyUse, withRemapDbErrors } from "@hazel/domain"
import { MessageRpcs } from "@hazel/domain/rpc"
import { Config, Effect } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { AttachmentPolicy } from "../../policies/attachment-policy"
import { MessagePolicy } from "../../policies/message-policy"
import { AttachmentRepo } from "../../repositories/attachment-repo"
import { MessageRepo } from "../../repositories/message-repo"
import { checkMessageRateLimit } from "../../services/rate-limit-helpers"

// Service URLs for live streaming (configured via environment)
const RIVET_ACTORS_URL = Config.string("RIVET_ACTORS_URL").pipe(
	Config.withDefault("http://localhost:6420"),
)
const STREAMS_SERVER_URL = Config.string("STREAMS_SERVER_URL").pipe(
	Config.withDefault("http://localhost:8081"),
)

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

		return {
			"message.create": ({ attachmentIds, ...messageData }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Check rate limit before processing
					yield* checkMessageRateLimit(user.id)

					return yield* db
						.transaction(
							Effect.gen(function* () {
								const createdMessage = yield* MessageRepo.insert({
									...messageData,
									authorId: user.id,
									deletedAt: null,
								}).pipe(
									Effect.map((res) => res[0]!),
									policyUse(MessagePolicy.canCreate(messageData.channelId)),
								)

								// Update attachments with messageId if provided
								if (attachmentIds && attachmentIds.length > 0) {
									yield* Effect.forEach(attachmentIds, (attachmentId) =>
										AttachmentRepo.update({
											id: attachmentId,
											messageId: createdMessage.id,
										}).pipe(policyUse(AttachmentPolicy.canUpdate(attachmentId))),
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
				}),

			"message.update": ({ id, ...payload }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Check rate limit before processing
					yield* checkMessageRateLimit(user.id)

					return yield* db
						.transaction(
							Effect.gen(function* () {
								const updatedMessage = yield* MessageRepo.update({
									id,
									...payload,
								}).pipe(policyUse(MessagePolicy.canUpdate(id)))

								const txid = yield* generateTransactionId()

								return {
									data: updatedMessage,
									transactionId: txid,
								}
							}),
						)
						.pipe(withRemapDbErrors("Message", "update"))
				}),

			"message.delete": ({ id }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Check rate limit before processing
					yield* checkMessageRateLimit(user.id)

					return yield* db
						.transaction(
							Effect.gen(function* () {
								yield* MessageRepo.deleteById(id).pipe(policyUse(MessagePolicy.canDelete(id)))

								const txid = yield* generateTransactionId()

								return { transactionId: txid }
							}),
						)
						.pipe(withRemapDbErrors("Message", "delete"))
				}),

			"message.createAI": ({ channelId, prompt }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Check rate limit before processing
					yield* checkMessageRateLimit(user.id)

					// Get service URLs from config (orDie since these should always be configured)
					const rivetUrl = yield* RIVET_ACTORS_URL.pipe(Effect.orDie)
					const streamsUrl = yield* STREAMS_SERVER_URL.pipe(Effect.orDie)

					// Stream URLs for this channel (conversation)
					const promptStreamUrl = `${streamsUrl}/v1/stream/conversations/${channelId}/prompts`
					const responseStreamUrl = `${streamsUrl}/v1/stream/conversations/${channelId}/responses`

					return yield* db
						.transaction(
							Effect.gen(function* () {
								// Create message with live object reference
								const createdMessage = yield* MessageRepo.insert({
									channelId,
									authorId: user.id,
									content: "", // Empty initially, will be filled by the actor
									embeds: null,
									replyToMessageId: null,
									threadChannelId: null,
									liveObjectId: channelId, // Use channelId as the live object reference
									liveObjectType: "ai_streaming",
									liveObjectStatus: "streaming",
									deletedAt: null,
								}).pipe(
									Effect.map((res) => res[0]!),
									policyUse(MessagePolicy.canCreate(channelId)),
								)

								const messageId = createdMessage.id

								// Create both streams for this channel if they don't exist
								yield* HttpClient.HttpClient.pipe(
									Effect.flatMap((client) =>
										client.put(promptStreamUrl, {
											headers: { "Content-Type": "application/json" },
										}),
									),
									Effect.catchAll(() => Effect.void),
								)
								yield* HttpClient.HttpClient.pipe(
									Effect.flatMap((client) =>
										client.put(responseStreamUrl, {
											headers: { "Content-Type": "application/json" },
										}),
									),
									Effect.catchAll(() => Effect.void),
								)

								// Spawn actor with channelId as key (reuses existing actor if already running)
								yield* HttpClient.HttpClient.pipe(
									Effect.flatMap((client) =>
										client.post(`${rivetUrl}/actors?namespace=default`, {
											body: HttpBody.unsafeJson({
												name: "aiAgent",
												key: channelId,
												runner_name_selector: "default",
												crash_policy: "sleep",
												create_with_input: { conversationId: channelId },
											}),
										}),
									),
									Effect.catchAll((err) => {
										console.error("Failed to spawn Rivet actor:", err)
										return Effect.void
									}),
								)

								// Write prompt to the prompt stream (actor will consume it via onWake)
								const promptMessage =
									JSON.stringify([
										{
											id: messageId,
											content: prompt,
											timestamp: Date.now(),
										},
									]) + "\n"

								yield* HttpClient.HttpClient.pipe(
									Effect.flatMap((client) =>
										client.post(promptStreamUrl, {
											body: HttpBody.text(promptMessage),
											headers: { "Content-Type": "application/json" },
										}),
									),
									Effect.catchAll((err) => {
										console.error("Failed to write prompt to stream:", err)
										return Effect.void
									}),
								)

								const txid = yield* generateTransactionId()

								return {
									messageId: messageId as MessageId,
									transactionId: txid,
								}
							}),
						)
						.pipe(withRemapDbErrors("Message", "create"))
				}),
		}
	}),
)

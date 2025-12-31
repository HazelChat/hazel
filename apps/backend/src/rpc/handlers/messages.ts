import { Database, schema } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { MessageRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { eq } from "drizzle-orm"
import { generateTransactionId } from "../../lib/create-transactionId"
import { AttachmentPolicy } from "../../policies/attachment-policy"
import { MessagePolicy } from "../../policies/message-policy"
import { AttachmentRepo } from "../../repositories/attachment-repo"
import { ChannelMemberRepo } from "../../repositories/channel-member-repo"
import { ChannelRepo } from "../../repositories/channel-repo"
import { MessageRepo } from "../../repositories/message-repo"
import { AssistantBotService } from "../../services/assistant-bot-service"
import { checkMessageRateLimit } from "../../services/rate-limit-helpers"

const RIVET_ACTORS_URL = process.env.RIVET_ACTORS_URL ?? "http://localhost:6420"

/**
 * Handle @bot mention by creating a thread reply
 */
const handleBotMention = (
	messageId: typeof schema.messagesTable.$inferSelect.id,
	channelId: typeof schema.channelsTable.$inferSelect.id,
	content: string,
) =>
	Effect.gen(function* () {
		const db = yield* Database.Database
		// 1. Get channel to find organizationId
		const channel = yield* ChannelRepo.findById(channelId).pipe(withSystemActor)
		if (Option.isNone(channel)) {
			yield* Effect.logWarning("Channel not found for @bot mention")
			return
		}

		// Don't create nested threads
		if (channel.value.type === "thread") {
			yield* Effect.logInfo("Skipping @bot in thread - no nested threads")
			return
		}

		const organizationId = channel.value.organizationId

		// 2. Get or create thread for this message
		const existingMessage = yield* MessageRepo.findById(messageId).pipe(withSystemActor)
		if (Option.isNone(existingMessage)) {
			yield* Effect.logWarning("Message not found for @bot mention")
			return
		}

		let threadChannelId = existingMessage.value.threadChannelId

		if (!threadChannelId) {
			// Create thread channel
			const threadChannel = yield* ChannelRepo.insert({
				name: "Thread",
				icon: null,
				type: "thread",
				organizationId,
				parentChannelId: channelId,
				deletedAt: null,
			}).pipe(withSystemActor)

			threadChannelId = threadChannel[0]!.id

			// Link message to thread
			yield* db.execute((client) =>
				client
					.update(schema.messagesTable)
					.set({ threadChannelId })
					.where(eq(schema.messagesTable.id, messageId)),
			)
		}

		// 3. Get or create assistant bot user
		const assistantBot = yield* AssistantBotService
		const botUser = yield* assistantBot.getOrCreateBotUser(organizationId)

		// 4. Ensure bot is a member of the thread channel
		const existingMember = yield* ChannelMemberRepo.findByChannelAndUser(
			threadChannelId,
			botUser.id,
		).pipe(withSystemActor)

		if (Option.isNone(existingMember)) {
			yield* ChannelMemberRepo.insert({
				channelId: threadChannelId,
				userId: botUser.id,
				isHidden: false,
				isMuted: true,
				isFavorite: false,
				lastSeenMessageId: null,
				notificationCount: 0,
				joinedAt: new Date(),
				deletedAt: null,
			}).pipe(withSystemActor)
		}

		// 5. Generate stream ID for this response
		const streamId = `bot-response-${crypto.randomUUID()}`

		// 6. Create placeholder bot message with streaming status
		const botMessage = yield* MessageRepo.insert({
			channelId: threadChannelId,
			authorId: botUser.id,
			content: "", // Initially empty, will be filled by streaming
			embeds: null,
			replyToMessageId: null,
			threadChannelId: null,
			liveObjectId: streamId,
			liveObjectType: "ai_streaming",
			liveObjectStatus: "streaming",
			deletedAt: null,
		}).pipe(withSystemActor)

		const botMessageId = botMessage[0]!.id

		// 7. Call Rivet bot actor to start streaming
		yield* Effect.tryPromise({
			try: async () => {
				// Get or create bot actor
				const actorResponse = await fetch(`${RIVET_ACTORS_URL}/actors?namespace=default`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: "bot", key: ["default"] }),
				})

				if (!actorResponse.ok) {
					throw new Error(`Failed to get bot actor: ${actorResponse.status}`)
				}

				const { ports } = await actorResponse.json()
				const httpPort = ports.http

				// Call the streamReply action (fire and forget - streaming happens async)
				await fetch(`${httpPort.url}/rpc/streamReply`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify([
						{
							messageId: botMessageId,
							prompt: content,
							streamId,
						},
					]),
				})
			},
			catch: (error) => new Error(`Rivet bot call failed: ${error}`),
		}).pipe(
			Effect.catchAll((error) =>
				Effect.logWarning("Failed to start bot streaming", error).pipe(
					Effect.flatMap(() =>
						// Update message to error state if actor call fails
						db
							.execute((client) =>
								client
									.update(schema.messagesTable)
									.set({
										content: "Sorry, I couldn't process that request.",
										liveObjectStatus: "error",
									})
									.where(eq(schema.messagesTable.id, botMessageId)),
							)
							.pipe(Effect.map(() => undefined)),
					),
				),
			),
		)

		yield* Effect.logInfo("Bot streaming started", { messageId, streamId, botMessageId })
	})

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

					const result = yield* db
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

					// Check for @bot mention and handle in background
					if (messageData.content.toLowerCase().includes("@bot")) {
						yield* Effect.fork(
							handleBotMention(result.data.id, messageData.channelId, messageData.content).pipe(
								Effect.catchAll((error) =>
									Effect.logError("Failed to handle @bot mention", error),
								),
							),
						)
					}

					return result
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
		}
	}),
)

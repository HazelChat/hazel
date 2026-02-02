import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { AttachmentRepo, BotRepo, MessageReactionRepo, MessageRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import {
	CurrentUser,
	InternalServerError,
	type MessageId,
	policyUse,
	UnauthorizedError,
	withRemapDbErrors,
	withSystemActor,
} from "@hazel/domain"
import {
	ChannelNotFoundError,
	DeleteMessageResponse,
	InvalidPaginationError,
	ListMessagesResponse,
	MessageResponse,
	ToggleReactionResponse,
} from "@hazel/domain/http"
import { Effect, Option } from "effect"
import { HazelApi } from "../../api"
import { generateTransactionId } from "../../lib/create-transactionId"
import { AttachmentPolicy } from "../../policies/attachment-policy"
import { MessagePolicy } from "../../policies/message-policy"
import { MessageReactionPolicy } from "../../policies/message-reaction-policy"
import { checkMessageRateLimit } from "../../services/rate-limit-helpers"

/**
 * Hash a token using SHA-256 (Web Crypto API)
 */
async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(token)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Authenticate bot from Bearer token and return bot info
 */
const authenticateBotFromToken = Effect.gen(function* () {
	const request = yield* HttpServerRequest.HttpServerRequest
	const authHeader = request.headers.authorization

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return yield* Effect.fail(
			new UnauthorizedError({
				message: "Missing or invalid API token",
				detail: "Authorization header must be 'Bearer <token>'",
			}),
		)
	}

	const token = authHeader.slice(7)
	const tokenHash = yield* Effect.promise(() => hashToken(token))

	const botRepo = yield* BotRepo
	const botOption = yield* botRepo.findByTokenHash(tokenHash).pipe(withSystemActor)

	if (Option.isNone(botOption)) {
		return yield* Effect.fail(
			new UnauthorizedError({
				message: "Invalid API token",
				detail: "No bot found with this token",
			}),
		)
	}

	return botOption.value
})

/**
 * Create a CurrentUser context for the bot
 * Bots act as their associated user account
 */
const createBotUserContext = (bot: { userId: typeof import("@hazel/domain").UserId.Type; name: string }) =>
	new CurrentUser.Schema({
		id: bot.userId,
		role: "member",
		email: `bot-${bot.name}@hazel.bot`,
		isOnboarded: true,
		timezone: null,
		organizationId: null,
		settings: null,
	})

export const HttpMessagesApiLive = HttpApiBuilder.group(HazelApi, "api-v1-messages", (handlers) =>
	Effect.gen(function* () {
		const db = yield* Database.Database

		return (
			handlers
				// List Messages (with cursor-based pagination)
				.handle("listMessages", ({ urlParams }) =>
					Effect.gen(function* () {
						const bot = yield* authenticateBotFromToken
						const currentUser = createBotUserContext(bot)

						const { channel_id, starting_after, ending_before, limit } = urlParams

						// Validate: cannot specify both cursors
						if (starting_after && ending_before) {
							return yield* Effect.fail(
								new InvalidPaginationError({
									message: "Cannot specify both starting_after and ending_before",
								}),
							)
						}

						const effectiveLimit = limit ?? 25

						// First, check if user can read this channel (policy authorization)
						yield* MessagePolicy.canRead(channel_id).pipe(
							Effect.provideService(CurrentUser.Context, currentUser),
						)

						// Resolve cursor IDs to stable cursor tuples.
						let cursorBefore:
							| {
									id: MessageId
									createdAt: Date
							  }
							| undefined = undefined
						let cursorAfter:
							| {
									id: MessageId
									createdAt: Date
							  }
							| undefined = undefined

						if (starting_after) {
							const cursorMsg = yield* MessageRepo.findByIdForCursor({
								id: starting_after,
								channelId: channel_id,
							}).pipe(withSystemActor)
							if (Option.isNone(cursorMsg)) {
								return yield* Effect.fail(
									new InvalidPaginationError({
										message: "Invalid starting_after cursor for channel",
									}),
								)
							}
							cursorBefore = {
								id: cursorMsg.value.id,
								createdAt: cursorMsg.value.createdAt,
							}
						} else if (ending_before) {
							const cursorMsg = yield* MessageRepo.findByIdForCursor({
								id: ending_before,
								channelId: channel_id,
							}).pipe(withSystemActor)
							if (Option.isNone(cursorMsg)) {
								return yield* Effect.fail(
									new InvalidPaginationError({
										message: "Invalid ending_before cursor for channel",
									}),
								)
							}
							cursorAfter = {
								id: cursorMsg.value.id,
								createdAt: cursorMsg.value.createdAt,
							}
						}

						// Query messages (policy already checked, use system actor for db access)
						const messages = yield* MessageRepo.listByChannel({
							channelId: channel_id,
							cursorBefore,
							cursorAfter,
							limit: effectiveLimit,
						}).pipe(withSystemActor)

						const hasMore = messages.length > effectiveLimit
						const data = hasMore ? messages.slice(0, effectiveLimit) : messages

						return new ListMessagesResponse({
							data,
							has_more: hasMore,
						})
					}).pipe(
						Effect.catchTag("DatabaseError", (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while listing messages",
									detail: String(err),
								}),
							),
						),
					),
				)

				// Create Message
				.handle("createMessage", ({ payload }) =>
					Effect.gen(function* () {
						const bot = yield* authenticateBotFromToken
						const currentUser = createBotUserContext(bot)

						yield* checkMessageRateLimit(bot.userId)

						const { attachmentIds, embeds, replyToMessageId, threadChannelId, ...rest } = payload

						return yield* db
							.transaction(
								Effect.gen(function* () {
									const createdMessage = yield* MessageRepo.insert({
										...rest,
										embeds: embeds ?? null,
										replyToMessageId: replyToMessageId ?? null,
										threadChannelId: threadChannelId ?? null,
										authorId: bot.userId,
										deletedAt: null,
									}).pipe(
										Effect.map((res) => res[0]!),
										policyUse(MessagePolicy.canCreate(rest.channelId)),
									)

									// Link attachments if provided
									if (attachmentIds && attachmentIds.length > 0) {
										yield* Effect.forEach(attachmentIds, (attachmentId) =>
											AttachmentRepo.update({
												id: attachmentId,
												messageId: createdMessage.id,
											}).pipe(policyUse(AttachmentPolicy.canUpdate(attachmentId))),
										)
									}

									const txid = yield* generateTransactionId()

									return new MessageResponse({
										data: createdMessage,
										transactionId: txid,
									})
								}),
							)
							.pipe(
								withRemapDbErrors("Message", "create"),
								Effect.provideService(CurrentUser.Context, currentUser),
							)
					}).pipe(
						Effect.catchTag("DatabaseError", (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while creating message",
									detail: String(err),
								}),
							),
						),
					),
				)

				// Update Message
				.handle("updateMessage", ({ path, payload }) =>
					Effect.gen(function* () {
						const bot = yield* authenticateBotFromToken
						const currentUser = createBotUserContext(bot)

						yield* checkMessageRateLimit(bot.userId)

						const { embeds, ...rest } = payload

						return yield* db
							.transaction(
								Effect.gen(function* () {
									const updatedMessage = yield* MessageRepo.update({
										id: path.id,
										...rest,
										...(embeds !== undefined ? { embeds } : {}),
									}).pipe(policyUse(MessagePolicy.canUpdate(path.id)))

									const txid = yield* generateTransactionId()

									return new MessageResponse({
										data: updatedMessage,
										transactionId: txid,
									})
								}),
							)
							.pipe(
								withRemapDbErrors("Message", "update"),
								Effect.provideService(CurrentUser.Context, currentUser),
							)
					}).pipe(
						Effect.catchTag("DatabaseError", (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while updating message",
									detail: String(err),
								}),
							),
						),
					),
				)

				// Delete Message
				.handle("deleteMessage", ({ path }) =>
					Effect.gen(function* () {
						const bot = yield* authenticateBotFromToken
						const currentUser = createBotUserContext(bot)

						yield* checkMessageRateLimit(bot.userId)

						return yield* db
							.transaction(
								Effect.gen(function* () {
									yield* MessageRepo.deleteById(path.id).pipe(
										policyUse(MessagePolicy.canDelete(path.id)),
									)

									const txid = yield* generateTransactionId()

									return new DeleteMessageResponse({ transactionId: txid })
								}),
							)
							.pipe(
								withRemapDbErrors("Message", "delete"),
								Effect.provideService(CurrentUser.Context, currentUser),
							)
					}).pipe(
						Effect.catchTag("DatabaseError", (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while deleting message",
									detail: String(err),
								}),
							),
						),
					),
				)

				// Toggle Reaction
				.handle("toggleReaction", ({ path, payload }) =>
					Effect.gen(function* () {
						const bot = yield* authenticateBotFromToken
						const currentUser = createBotUserContext(bot)

						return yield* db
							.transaction(
								Effect.gen(function* () {
									const { emoji, channelId } = payload
									const messageId = path.id

									const existingReaction =
										yield* MessageReactionRepo.findByMessageUserEmoji(
											messageId,
											bot.userId,
											emoji,
										).pipe(policyUse(MessageReactionPolicy.canList(messageId)))

									const txid = yield* generateTransactionId()

									// If reaction exists, delete it
									if (Option.isSome(existingReaction)) {
										yield* MessageReactionRepo.deleteById(existingReaction.value.id).pipe(
											policyUse(
												MessageReactionPolicy.canDelete(existingReaction.value.id),
											),
										)

										return new ToggleReactionResponse({
											wasCreated: false,
											data: undefined,
											transactionId: txid,
										})
									}

									// Otherwise, create a new reaction
									const createdReaction = yield* MessageReactionRepo.insert({
										messageId,
										channelId,
										emoji,
										userId: bot.userId,
									}).pipe(
										Effect.map((res) => res[0]!),
										policyUse(MessageReactionPolicy.canCreate(messageId)),
									)

									return new ToggleReactionResponse({
										wasCreated: true,
										data: createdReaction,
										transactionId: txid,
									})
								}),
							)
							.pipe(
								withRemapDbErrors("MessageReaction", "create"),
								Effect.provideService(CurrentUser.Context, currentUser),
							)
					}).pipe(
						Effect.catchTag("DatabaseError", (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Database error while toggling reaction",
									detail: String(err),
								}),
							),
						),
					),
				)
		)
	}),
)

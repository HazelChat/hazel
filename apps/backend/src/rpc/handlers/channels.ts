import { Database, schema } from "@hazel/db"
import {
	CurrentUser,
	DmChannelAlreadyExistsError,
	InternalServerError,
	policyUse,
	withRemapDbErrors,
	withSystemActor,
} from "@hazel/domain"
import { ChannelId, OrganizationId } from "@hazel/domain/ids"
import { ChannelRpcs, MessageNotFoundError } from "@hazel/domain/rpc"
import { eq } from "drizzle-orm"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelPolicy } from "../../policies/channel-policy"
import { MessagePolicy } from "../../policies/message-policy"
import { UserPolicy } from "../../policies/user-policy"
import { ChannelMemberRepo } from "../../repositories/channel-member-repo"
import { ChannelRepo } from "../../repositories/channel-repo"
import { MessageRepo } from "../../repositories/message-repo"
import { UserRepo } from "../../repositories/user-repo"

export const ChannelRpcLive = ChannelRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"channel.create": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// Use client-provided id for optimistic updates, or let DB generate one
							const insertData = id
								? { id, ...payload, deletedAt: null }
								: { ...payload, deletedAt: null }

							const createdChannel = yield* ChannelRepo.insert(
								insertData as typeof payload & { deletedAt: null },
							).pipe(
								Effect.map((res) => res[0]!),
								policyUse(ChannelPolicy.canCreate(payload.organizationId)),
							)

							yield* ChannelMemberRepo.insert({
								channelId: createdChannel.id,
								userId: user.id,
								isHidden: false,
								isMuted: false,
								isFavorite: false,
								lastSeenMessageId: null,
								notificationCount: 0,
								joinedAt: new Date(),
								deletedAt: null,
							}).pipe(withSystemActor)

							const txid = yield* generateTransactionId()

							return {
								data: createdChannel,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Channel", "create")),

			"channel.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedChannel = yield* ChannelRepo.update({
								id,
								...payload,
							}).pipe(policyUse(ChannelPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updatedChannel,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Channel", "update")),

			"channel.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* ChannelRepo.deleteById(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(policyUse(ChannelPolicy.canDelete(id)), withRemapDbErrors("Channel", "delete")),

			"channel.createDm": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// Validate participant count for single DMs
							if (payload.type === "single" && payload.participantIds.length !== 1) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "DM channels must have exactly one other participant",
										cause: "Invalid participant count",
									}),
								)
							}

							// Check for existing DM channel
							if (payload.type === "single") {
								const existingChannel = yield* ChannelMemberRepo.findExistingSingleDmChannel(
									user.id,
									payload.participantIds[0],
									OrganizationId.make(payload.organizationId),
								).pipe(withSystemActor)

								if (Option.isSome(existingChannel)) {
									return yield* Effect.fail(
										new DmChannelAlreadyExistsError({
											message: "A direct message channel already exists with this user",
											detail: `Channel ID: ${existingChannel.value.id}`,
										}),
									)
								}
							}

							// Generate channel name for DMs
							let channelName = payload.name
							if (payload.type === "single") {
								const otherUser = yield* UserRepo.findById(payload.participantIds[0]).pipe(
									policyUse(UserPolicy.canRead(payload.participantIds[0]!)),
								)
								const currentUser = yield* UserRepo.findById(user.id).pipe(
									policyUse(UserPolicy.canRead(payload.participantIds[0]!)),
								)

								if (Option.isSome(otherUser) && Option.isSome(currentUser)) {
									// Create a consistent name for DMs using first and last name
									const currentUserName =
										`${currentUser.value.firstName} ${currentUser.value.lastName}`.trim()
									const otherUserName =
										`${otherUser.value.firstName} ${otherUser.value.lastName}`.trim()
									const names = [currentUserName, otherUserName].sort()
									channelName = names.join(", ")
								}
							}

							// Create channel
							const createdChannel = yield* ChannelRepo.insert({
								name: channelName || "Group Channel",
								icon: null,
								type: payload.type,
								organizationId: OrganizationId.make(payload.organizationId),
								parentChannelId: null,
								deletedAt: null,
							}).pipe(
								Effect.map((res) => res[0]!),
								policyUse(
									ChannelPolicy.canCreate(OrganizationId.make(payload.organizationId)),
								),
							)

							// Add creator as member
							yield* ChannelMemberRepo.insert({
								channelId: createdChannel.id,
								userId: user.id,
								isHidden: false,
								isMuted: false,
								isFavorite: false,
								lastSeenMessageId: null,
								notificationCount: 0,
								joinedAt: new Date(),
								deletedAt: null,
							}).pipe(withSystemActor)

							// Add all participants as members
							for (const participantId of payload.participantIds) {
								yield* ChannelMemberRepo.insert({
									channelId: createdChannel.id,
									userId: participantId,
									isHidden: false,
									isMuted: false,
									isFavorite: false,
									lastSeenMessageId: null,
									notificationCount: 0,
									joinedAt: new Date(),
									deletedAt: null,
								}).pipe(withSystemActor)
							}

							const txid = yield* generateTransactionId()

							return {
								data: createdChannel,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Channel", "create")),

			"channel.createThread": ({ id, messageId, organizationId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// 1. Find the message and get its channelId
							const message = yield* MessageRepo.findById(messageId)

							if (Option.isNone(message)) {
								return yield* Effect.fail(new MessageNotFoundError({ messageId }))
							}

							const parentChannelId = message.value.channelId

							// 2. Create thread channel - use same pattern as channel.create
							const insertData = id
								? {
										id,
										name: "Thread",
										icon: null,
										type: "thread" as const,
										organizationId,
										parentChannelId,
										deletedAt: null,
									}
								: {
										name: "Thread",
										icon: null,
										type: "thread" as const,
										organizationId,
										parentChannelId,
										deletedAt: null,
									}

							const createdChannel = yield* ChannelRepo.insert(insertData).pipe(
								Effect.map((res) => res[0]!),
								policyUse(ChannelPolicy.canCreate(organizationId)),
							)

							// 3. Add creator as member
							yield* ChannelMemberRepo.insert({
								channelId: createdChannel.id,
								userId: user.id,
								isHidden: false,
								isMuted: false,
								isFavorite: false,
								lastSeenMessageId: null,
								notificationCount: 0,
								joinedAt: new Date(),
								deletedAt: null,
							}).pipe(withSystemActor)

							// 4. Link message to thread (direct SQL update to bypass schema restrictions)
							yield* db
								.execute((client) =>
									client
										.update(schema.messagesTable)
										.set({ threadChannelId: createdChannel.id })
										.where(eq(schema.messagesTable.id, messageId)),
								)
								.pipe(
									Effect.mapError(
										() =>
											new InternalServerError({
												message: "Failed to link message to thread",
											}),
									),
								)

							const txid = yield* generateTransactionId()

							return {
								data: createdChannel,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Channel", "create")),
		}
	}),
)

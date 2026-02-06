import { HttpApiClient } from "@effect/platform"
import {
	ChannelMemberRepo,
	ChannelRepo,
	MessageRepo,
	OrganizationMemberRepo,
	UserRepo,
} from "@hazel/backend-core"
import { Database, schema } from "@hazel/db"
import {
	Cluster,
	CurrentUser,
	DmChannelAlreadyExistsError,
	InternalServerError,
	policyUse,
	withRemapDbErrors,
	withSystemActor,
	WorkflowServiceUnavailableError,
} from "@hazel/domain"
import { OrganizationId } from "@hazel/schema"
import { ChannelNotFoundError, ChannelRpcs, MessageNotFoundError } from "@hazel/domain/rpc"
import { eq } from "drizzle-orm"
import { Config, Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelPolicy } from "../../policies/channel-policy"
import { UserPolicy } from "../../policies/user-policy"
import { ChannelAccessSyncService } from "../../services/channel-access-sync"

export const ChannelRpcLive = ChannelRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"channel.create": ({ id, addAllMembers, ...payload }) =>
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

							// Add all organization members if requested
							if (addAllMembers) {
								const orgMembers = yield* OrganizationMemberRepo.findAllByOrganization(
									payload.organizationId,
								).pipe(withSystemActor)

								yield* Effect.forEach(
									orgMembers.filter((m) => m.userId !== user.id),
									(member) =>
										ChannelMemberRepo.insert({
											channelId: createdChannel.id,
											userId: member.userId,
											isHidden: false,
											isMuted: false,
											isFavorite: false,
											lastSeenMessageId: null,
											notificationCount: 0,
											joinedAt: new Date(),
											deletedAt: null,
										}).pipe(withSystemActor),
									{ concurrency: 10 },
								)
							}

							yield* ChannelAccessSyncService.syncChannel(createdChannel.id)

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

							yield* ChannelAccessSyncService.syncChannel(id)
							yield* ChannelAccessSyncService.syncChildThreads(id)

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
							yield* ChannelAccessSyncService.removeChannel(id)
							yield* ChannelAccessSyncService.syncChildThreads(id)

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
								sectionId: null,
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

							yield* ChannelAccessSyncService.syncChannel(createdChannel.id)

							const txid = yield* generateTransactionId()

							return {
								data: createdChannel,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Channel", "create")),

			"channel.createThread": ({ id, messageId, organizationId: requestedOrganizationId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// 1. Find the message and resolve thread context from authoritative DB data
							const message = yield* MessageRepo.findById(messageId).pipe(withSystemActor)

							if (Option.isNone(message)) {
								return yield* Effect.fail(new MessageNotFoundError({ messageId }))
							}

							// If the message already points to a thread, return that thread.
							if (message.value.threadChannelId) {
								const existingThread = yield* ChannelRepo.findById(
									message.value.threadChannelId,
								).pipe(withSystemActor)
								if (Option.isNone(existingThread)) {
									return yield* Effect.fail(
										new InternalServerError({
											message: "Thread channel linked to message was not found",
											detail: `messageId=${messageId} threadChannelId=${message.value.threadChannelId}`,
										}),
									)
								}

								yield* ChannelAccessSyncService.syncChannel(existingThread.value.id)

								const txid = yield* generateTransactionId()
								return {
									data: existingThread.value,
									transactionId: txid,
								}
							}

							const parentChannel = yield* ChannelRepo.findById(message.value.channelId).pipe(
								withSystemActor,
							)
							if (Option.isNone(parentChannel)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Parent channel for message was not found",
										detail: `messageId=${messageId} parentChannelId=${message.value.channelId}`,
									}),
								)
							}

							// If the message is already in a thread channel, return that thread.
							if (parentChannel.value.type === "thread") {
								yield* ChannelAccessSyncService.syncChannel(parentChannel.value.id)

								const txid = yield* generateTransactionId()
								return {
									data: parentChannel.value,
									transactionId: txid,
								}
							}

							// Derive organization from parent channel (source of truth).
							const organizationId = parentChannel.value.organizationId

							// Optional client org must match the derived parent channel org.
							if (requestedOrganizationId && requestedOrganizationId !== organizationId) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Thread creation organization mismatch",
										detail: `messageId=${messageId} parentOrganizationId=${organizationId} requestedOrganizationId=${requestedOrganizationId}`,
									}),
								)
							}

							// 2. Create thread channel only when no existing thread was resolved
							const insertData = id
								? {
										id,
										name: "Thread",
										icon: null,
										type: "thread" as const,
										organizationId,
										parentChannelId: parentChannel.value.id,
										sectionId: null,
										deletedAt: null,
									}
								: {
										name: "Thread",
										icon: null,
										type: "thread" as const,
										organizationId,
										parentChannelId: parentChannel.value.id,
										sectionId: null,
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
							yield* db.execute((client) =>
								client
									.update(schema.messagesTable)
									.set({ threadChannelId: createdChannel.id })
									.where(eq(schema.messagesTable.id, messageId)),
							)

							yield* ChannelAccessSyncService.syncChannel(createdChannel.id)

							const txid = yield* generateTransactionId()

							return {
								data: createdChannel,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Channel", "create")),

			"channel.generateName": ({ channelId }) =>
				Effect.gen(function* () {
					const channel = yield* ChannelRepo.findById(channelId).pipe(
						withSystemActor,
						Effect.catchTag("DatabaseError", (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Failed to query channel",
									cause: String(err),
								}),
							),
						),
					)

					if (Option.isNone(channel)) {
						return yield* Effect.fail(new ChannelNotFoundError({ channelId }))
					}

					if (channel.value.type !== "thread") {
						return yield* Effect.fail(
							new InternalServerError({
								message: "Channel is not a thread",
								cause: `Channel type: ${channel.value.type}`,
							}),
						)
					}

					const originalMessageResult = yield* db
						.execute((client) =>
							client
								.select({ id: schema.messagesTable.id })
								.from(schema.messagesTable)
								.where(eq(schema.messagesTable.threadChannelId, channelId))
								.limit(1),
						)
						.pipe(Effect.catchTag("DatabaseError", () => Effect.succeed([])))

					if (originalMessageResult.length === 0) {
						return yield* Effect.fail(
							new MessageNotFoundError({
								messageId:
									channelId as unknown as typeof schema.messagesTable.$inferSelect.id,
							}),
						)
					}

					const originalMessageId = originalMessageResult[0]!.id

					const clusterUrl = yield* Config.string("CLUSTER_URL").pipe(Effect.orDie)
					const client = yield* HttpApiClient.make(Cluster.WorkflowApi, {
						baseUrl: clusterUrl,
					})

					yield* client.workflows
						.ThreadNamingWorkflow({
							payload: {
								threadChannelId: channelId,
								originalMessageId,
							},
						})
						.pipe(
							Effect.tapError((err) =>
								Effect.logError("Failed to execute thread naming workflow", {
									threadChannelId: channelId,
									error: String(err),
									errorTag: "_tag" in err ? err._tag : "unknown",
								}),
							),
							// Workflow errors (ThreadChannelNotFoundError, AIProviderUnavailableError, etc.)
							// pass through directly since they're in the RPC union - only handle HTTP client errors
							Effect.catchTag("RequestError", (err) =>
								Effect.fail(
									new WorkflowServiceUnavailableError({
										message: "Cannot connect to workflow service",
										cause: String(err),
									}),
								),
							),
							Effect.catchTag("ResponseError", (err) =>
								Effect.fail(
									new InternalServerError({
										message: `Thread naming failed: ${err.reason}`,
										cause: String(err),
									}),
								),
							),
							Effect.catchTag("HttpApiDecodeError", (err) =>
								Effect.fail(
									new InternalServerError({
										message: "Failed to decode workflow response",
										cause: String(err),
									}),
								),
							),
							Effect.catchTag("ParseError", (err) =>
								Effect.fail(
									new InternalServerError({
										message: "Failed to parse workflow response",
										cause: String(err),
									}),
								),
							),
						)

					yield* Effect.logDebug("Triggered thread naming workflow", {
						threadChannelId: channelId,
						originalMessageId,
					})

					return {
						success: true,
					}
				}),
		}
	}),
)

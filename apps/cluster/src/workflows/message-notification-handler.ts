import { Activity } from "@effect/workflow"
import { and, Database, eq, inArray, isNull, ne, or, schema, sql } from "@hazel/db"
import { Cluster, type NotificationId, type UserId } from "@hazel/domain"
import { Effect, Schema } from "effect"

export const MessageNotificationWorkflowLayer = Cluster.MessageNotificationWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.MessageNotificationWorkflowPayload) {
		yield* Effect.logDebug(
			`Starting MessageNotificationWorkflow for message ${payload.messageId} in channel ${payload.channelId} (type: ${payload.channelType})`,
		)

		// Parse mentions from content
		const mentions = Cluster.parseMentions(payload.content)

		// Determine if this is a DM/group chat or regular channel
		const isDmOrGroup = payload.channelType === "direct" || payload.channelType === "single"
		const shouldNotifyAll = isDmOrGroup || mentions.hasChannelMention || mentions.hasHereMention

		yield* Effect.logDebug(
			`Notification mode: ${isDmOrGroup ? "DM/Group" : "Regular channel"}, notify all: ${shouldNotifyAll}`,
		)

		// Activity 1: Get notification targets based on channel type and mentions
		const membersResult = yield* Activity.make({
			name: "GetChannelMembers",
			success: Cluster.GetChannelMembersResult,
			error: Cluster.GetChannelMembersError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				if (shouldNotifyAll) {
					// DM/group or broadcast mention - notify all members (existing logic)
					yield* Effect.logDebug(`Querying all channel members for channel ${payload.channelId}`)

					const channelMembers = yield* db
						.execute((client) =>
							client
								.select({
									id: schema.channelMembersTable.id,
									channelId: schema.channelMembersTable.channelId,
									userId: schema.channelMembersTable.userId,
									isMuted: schema.channelMembersTable.isMuted,
									notificationCount: schema.channelMembersTable.notificationCount,
								})
								.from(schema.channelMembersTable)
								.leftJoin(
									schema.userPresenceStatusTable,
									eq(
										schema.channelMembersTable.userId,
										schema.userPresenceStatusTable.userId,
									),
								)
								.where(
									and(
										eq(schema.channelMembersTable.channelId, payload.channelId),
										eq(schema.channelMembersTable.isMuted, false),
										ne(schema.channelMembersTable.userId, payload.authorId),
										isNull(schema.channelMembersTable.deletedAt),
										or(
											// No presence record - send notification
											isNull(schema.userPresenceStatusTable.userId),
											// Has presence record - check suppressNotifications and activeChannel/status
											and(
												eq(
													schema.userPresenceStatusTable.suppressNotifications,
													false,
												),
												or(
													ne(
														schema.userPresenceStatusTable.activeChannelId,
														payload.channelId,
													),
													ne(schema.userPresenceStatusTable.status, "online"),
												),
											),
										),
									),
								),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									Effect.fail(
										new Cluster.GetChannelMembersError({
											channelId: payload.channelId,
											message: "Failed to query channel members",
											cause: err,
										}),
									),
							}),
						)

					yield* Effect.logDebug(
						`Found ${channelMembers.length} members to notify (all members mode)`,
					)

					return {
						members: channelMembers,
						totalCount: channelMembers.length,
					}
				}

				// Regular channel - only notify mentioned users and reply-to author
				yield* Effect.logDebug(
					`Smart notification mode: ${mentions.userMentions.length} user mentions, reply to: ${payload.replyToMessageId ?? "none"}`,
				)

				const usersToNotify: UserId[] = [...mentions.userMentions]

				// If this is a reply, get the original message author
				if (payload.replyToMessageId) {
					const replyToMessage = yield* db
						.execute((client) =>
							client
								.select({ authorId: schema.messagesTable.authorId })
								.from(schema.messagesTable)
								.where(eq(schema.messagesTable.id, payload.replyToMessageId!))
								.limit(1),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									Effect.fail(
										new Cluster.GetChannelMembersError({
											channelId: payload.channelId,
											message: "Failed to query reply-to message author",
											cause: err,
										}),
									),
							}),
						)

					if (replyToMessage.length > 0 && replyToMessage[0]!.authorId !== payload.authorId) {
						yield* Effect.logDebug(
							`Adding reply-to author ${replyToMessage[0]!.authorId} to notification list`,
						)
						usersToNotify.push(replyToMessage[0]!.authorId)
					}
				}

				// Remove duplicates and the author
				const uniqueUsersToNotify = [...new Set(usersToNotify)].filter(
					(userId) => userId !== payload.authorId,
				) as UserId[]

				yield* Effect.logDebug(`Unique users to notify: ${uniqueUsersToNotify.length}`)

				if (uniqueUsersToNotify.length === 0) {
					yield* Effect.logDebug("No users to notify in smart mode")
					return { members: [], totalCount: 0 }
				}

				// Query only the members who should be notified
				const channelMembers = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.channelMembersTable.id,
								channelId: schema.channelMembersTable.channelId,
								userId: schema.channelMembersTable.userId,
								isMuted: schema.channelMembersTable.isMuted,
								notificationCount: schema.channelMembersTable.notificationCount,
							})
							.from(schema.channelMembersTable)
							.leftJoin(
								schema.userPresenceStatusTable,
								eq(schema.channelMembersTable.userId, schema.userPresenceStatusTable.userId),
							)
							.where(
								and(
									eq(schema.channelMembersTable.channelId, payload.channelId),
									inArray(schema.channelMembersTable.userId, uniqueUsersToNotify),
									eq(schema.channelMembersTable.isMuted, false),
									isNull(schema.channelMembersTable.deletedAt),
									or(
										// No presence record - send notification
										isNull(schema.userPresenceStatusTable.userId),
										// Has presence record - check suppressNotifications and activeChannel/status
										and(
											eq(schema.userPresenceStatusTable.suppressNotifications, false),
											or(
												ne(
													schema.userPresenceStatusTable.activeChannelId,
													payload.channelId,
												),
												ne(schema.userPresenceStatusTable.status, "online"),
											),
										),
									),
								),
							),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.GetChannelMembersError({
										channelId: payload.channelId,
										message: "Failed to query channel members for mentions",
										cause: err,
									}),
								),
						}),
					)

				yield* Effect.logDebug(`Found ${channelMembers.length} members to notify (smart mode)`)

				return {
					members: channelMembers,
					totalCount: channelMembers.length,
				}
			}),
		}).pipe(Effect.orDie)

		// If no members to notify, we're done
		if (membersResult.totalCount === 0) {
			yield* Effect.logDebug("No members to notify, workflow complete")
			return
		}

		// Activity 2: Create notifications for all members
		const notificationsResult = yield* Activity.make({
			name: "CreateNotifications",
			success: Cluster.CreateNotificationsResult,
			error: Schema.Union(Cluster.CreateNotificationError),
			execute: Effect.gen(function* () {
				const db = yield* Database.Database
				const notificationIds: NotificationId[] = []

				yield* Effect.logDebug(`Creating notifications for ${membersResult.members.length} members`)

				// Process each member
				for (const member of membersResult.members) {
					// First, get the organization member ID for this user
					// We need to join channel -> organization -> organization_members
					const orgMemberResult = yield* db
						.execute((client) =>
							client
								.select({
									orgMemberId: schema.organizationMembersTable.id,
									organizationId: schema.channelsTable.organizationId,
								})
								.from(schema.channelsTable)
								.innerJoin(
									schema.organizationMembersTable,
									eq(
										schema.organizationMembersTable.organizationId,
										schema.channelsTable.organizationId,
									),
								)
								.where(
									and(
										eq(schema.channelsTable.id, payload.channelId),
										eq(schema.organizationMembersTable.userId, member.userId),
										isNull(schema.organizationMembersTable.deletedAt),
									),
								)
								.limit(1),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									Effect.fail(
										new Cluster.CreateNotificationError({
											messageId: payload.messageId,
											userId: member.userId,
											message: "Failed to query organization member",
											cause: err,
										}),
									),
							}),
						)

					if (orgMemberResult.length === 0) {
						yield* Effect.logDebug(`Skipping user ${member.userId} - not found in organization`)
						continue
					}

					const orgMemberId = orgMemberResult[0]!.orgMemberId

					// Insert notification
					const notificationResult = yield* db
						.execute((client) =>
							client
								.insert(schema.notificationsTable)
								.values({
									memberId: orgMemberId,
									targetedResourceId: payload.channelId,
									targetedResourceType: "channel",
									resourceId: payload.messageId,
									resourceType: "message",
									createdAt: new Date(),
								})
								.returning({ id: schema.notificationsTable.id }),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									Effect.fail(
										new Cluster.CreateNotificationError({
											messageId: payload.messageId,
											memberId: orgMemberId,
											message: "Failed to insert notification",
											cause: err,
										}),
									),
							}),
						)

					const notificationId = notificationResult[0]!.id
					notificationIds.push(notificationId)

					// Increment notification count for the channel member
					yield* db
						.execute((client) =>
							client
								.update(schema.channelMembersTable)
								.set({
									notificationCount: sql`${schema.channelMembersTable.notificationCount} + 1`,
								})
								.where(eq(schema.channelMembersTable.id, member.id)),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									Effect.fail(
										new Cluster.CreateNotificationError({
											messageId: payload.messageId,
											memberId: orgMemberId,
											message: "Failed to increment notification count",
											cause: err,
										}),
									),
							}),
						)

					yield* Effect.logDebug(
						`Created notification ${notificationId} for member ${member.userId}`,
					)
				}

				return {
					notificationIds,
					notifiedCount: notificationIds.length,
				}
			}),
		}).pipe(Effect.orDie)

		yield* Effect.logDebug(
			`MessageNotificationWorkflow completed: ${notificationsResult.notifiedCount} notifications created`,
		)
	}),
)

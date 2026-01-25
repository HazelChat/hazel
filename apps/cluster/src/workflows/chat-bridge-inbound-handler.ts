import { Activity } from "@effect/workflow"
import { and, Database, eq, isNull, schema } from "@hazel/db"
import { Cluster, type UserId } from "@hazel/domain"
import { Effect } from "effect"

/**
 * ChatBridgeInboundWorkflowLayer
 *
 * Handles incoming messages from external platforms (Discord, Slack)
 * and creates corresponding messages in linked Hazel channels.
 */
export const ChatBridgeInboundWorkflowLayer = Cluster.ChatBridgeInboundWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.ChatBridgeInboundWorkflowPayload) {
		yield* Effect.logInfo(
			`Starting ChatBridgeInboundWorkflow for ${payload.provider} message ${payload.externalMessageId}`,
		)

		// Skip delete events for now (can be implemented later)
		if (payload.eventType === "delete") {
			yield* Effect.logDebug("Skipping delete event - not yet implemented")
			return
		}

		// Activity 1: Find all Hazel channels linked to this external channel
		const linksResult = yield* Activity.make({
			name: "FindLinkedChannels",
			success: Cluster.FindLinkedChannelsResult,
			error: Cluster.FindLinkedChannelsError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				const links = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.externalChannelLinksTable.id,
								channelId: schema.externalChannelLinksTable.channelId,
								organizationId: schema.externalChannelLinksTable.organizationId,
								provider: schema.externalChannelLinksTable.provider,
								syncDirection: schema.externalChannelLinksTable.syncDirection,
								isEnabled: schema.externalChannelLinksTable.isEnabled,
							})
							.from(schema.externalChannelLinksTable)
							.where(
								and(
									eq(schema.externalChannelLinksTable.provider, payload.provider),
									eq(
										schema.externalChannelLinksTable.externalChannelId,
										payload.externalChannelId,
									),
									eq(schema.externalChannelLinksTable.isEnabled, true),
									isNull(schema.externalChannelLinksTable.deletedAt),
								),
							),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.FindLinkedChannelsError({
										provider: payload.provider,
										externalChannelId: payload.externalChannelId,
										message: "Failed to query linked channels",
										cause: err,
									}),
								),
						}),
					)

				// Filter links that allow inbound messages
				const inboundLinks = links.filter(
					(link) => link.syncDirection === "inbound" || link.syncDirection === "bidirectional",
				)

				yield* Effect.logDebug(`Found ${inboundLinks.length} channels linked for inbound sync`)

				return {
					links: inboundLinks,
					count: inboundLinks.length,
				}
			}),
		})

		if (linksResult.count === 0) {
			yield* Effect.logDebug("No linked channels found for this external channel")
			return
		}

		// Activity 2: Get or create a machine user for the external author
		const bridgeUserId = yield* Activity.make({
			name: "GetOrCreateBridgeUser",
			success: Cluster.CreateBridgedMessageResult,
			error: Cluster.GetBridgedUserError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				// Use a consistent external ID for bridge users
				const externalId = `bridge-${payload.provider}-${payload.authorId}`

				// Try to find existing user
				const existingUsers = yield* db
					.execute((client) =>
						client
							.select({ id: schema.usersTable.id })
							.from(schema.usersTable)
							.where(eq(schema.usersTable.externalId, externalId))
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.GetBridgedUserError({
										provider: payload.provider,
										externalAuthorId: payload.authorId,
										message: "Failed to query existing bridge user",
										cause: err,
									}),
								),
						}),
					)

				if (existingUsers.length > 0) {
					return {
						messageId: "" as any, // Not used in this context
						channelId: "" as any,
						authorId: existingUsers[0]!.id as UserId,
					}
				}

				// Create new machine user for this bridge author
				const defaultAvatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(payload.authorId)}`
				const newUsers = yield* db
					.execute((client) =>
						client
							.insert(schema.usersTable)
							.values({
								externalId,
								email: `${payload.provider}-${payload.authorId}@bridge.internal`,
								firstName: payload.authorName,
								lastName: "",
								avatarUrl: payload.authorAvatarUrl ?? defaultAvatarUrl,
								userType: "machine",
								settings: null,
								isOnboarded: true,
								timezone: null,
								deletedAt: null,
							})
							.returning({ id: schema.usersTable.id }),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.GetBridgedUserError({
										provider: payload.provider,
										externalAuthorId: payload.authorId,
										message: "Failed to create bridge user",
										cause: err,
									}),
								),
						}),
					)

				yield* Effect.logDebug(
					`Created bridge user ${newUsers[0]!.id} for ${payload.provider} author ${payload.authorId}`,
				)

				return {
					messageId: "" as any,
					channelId: "" as any,
					authorId: newUsers[0]!.id as UserId,
				}
			}),
		})

		// Activity 3: Create messages in each linked Hazel channel
		// Note: Workflow-level idempotency prevents duplicate processing
		for (const link of linksResult.links) {
			yield* Activity.make({
				name: `CreateMessageInChannel-${link.channelId}`,
				success: Cluster.CreateBridgedMessageResult,
				error: Cluster.CreateBridgedMessageError,
				execute: Effect.gen(function* () {
					const db = yield* Database.Database

					// Create the message with sourceProvider set for loop prevention
					const newMessages = yield* db
						.execute((client) =>
							client
								.insert(schema.messagesTable)
								.values({
									channelId: link.channelId,
									authorId: bridgeUserId.authorId,
									content: payload.content,
									embeds: null,
									replyToMessageId: null,
									threadChannelId: null,
									sourceProvider: payload.provider,
									deletedAt: null,
								})
								.returning({ id: schema.messagesTable.id }),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									Effect.fail(
										new Cluster.CreateBridgedMessageError({
											provider: payload.provider,
											externalMessageId: payload.externalMessageId,
											channelId: link.channelId,
											message: "Failed to create message",
											cause: err,
										}),
									),
							}),
						)

					const messageId = newMessages[0]!.id

					yield* Effect.logInfo(
						`Created message ${messageId} in channel ${link.channelId} from ${payload.provider} message ${payload.externalMessageId}`,
					)

					return {
						messageId: messageId as any,
						channelId: link.channelId,
						authorId: bridgeUserId.authorId,
					}
				}),
			})
		}

		yield* Effect.logInfo(
			`ChatBridgeInboundWorkflow completed: created messages in ${linksResult.count} channels`,
		)
	}),
)

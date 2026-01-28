import { Activity } from "@effect/workflow"
import { and, Database, eq, isNull, schema } from "@hazel/db"
import { Cluster, type MessageId, type UserId } from "@hazel/domain"
import { Effect } from "effect"

/**
 * ChatBridgeOutboundWorkflowLayer
 *
 * Handles messages created in Hazel and syncs them to linked external platforms.
 * Implements loop prevention to avoid echoing bridged messages back.
 */
export const ChatBridgeOutboundWorkflowLayer = Cluster.ChatBridgeOutboundWorkflow.toLayer(
	Effect.fn(function* (payload: Cluster.ChatBridgeOutboundWorkflowPayload) {
		yield* Effect.logInfo(
			`Starting ChatBridgeOutboundWorkflow for message ${payload.messageId} (${payload.eventType})`,
		)

		// Skip delete events for now (can be implemented later)
		if (payload.eventType === "delete") {
			yield* Effect.logDebug("Skipping delete event - not yet implemented")
			return
		}

		// Activity 1: Check if message originated from an external platform (loop prevention)
		const message = yield* Activity.make({
			name: "GetMessageForLoopCheck",
			success: Cluster.FindLinkedChannelsResult,
			error: Cluster.LoopPreventionError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				const messages = yield* db
					.execute((client) =>
						client
							.select({
								id: schema.messagesTable.id,
								sourceProvider: schema.messagesTable.sourceProvider,
								content: schema.messagesTable.content,
								authorId: schema.messagesTable.authorId,
							})
							.from(schema.messagesTable)
							.where(eq(schema.messagesTable.id, payload.messageId))
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.LoopPreventionError({
										messageId: payload.messageId,
										provider: "discord", // Will be overridden
										reason: `Failed to query message: ${String(err)}`,
									}),
								),
						}),
					)

				if (messages.length === 0) {
					return yield* Effect.fail(
						new Cluster.LoopPreventionError({
							messageId: payload.messageId,
							provider: "discord",
							reason: "Message not found",
						}),
					)
				}

				const msg = messages[0]!

				// If message has a sourceProvider, it came from an external platform
				// We shouldn't echo it back to prevent loops
				if (msg.sourceProvider) {
					yield* Effect.logDebug(
						`Message ${payload.messageId} originated from ${msg.sourceProvider}, skipping outbound sync`,
					)
					return { links: [], count: 0 }
				}

				// Message is native to Hazel, continue with sync
				return { links: [], count: -1 } // -1 signals to continue
			}),
		})

		// If message came from external platform, skip outbound sync
		if (message.count === 0) {
			yield* Effect.logDebug("Skipping outbound sync - message originated from external platform")
			return
		}

		// Activity 2: Find all external links for this Hazel channel
		const linksResult = yield* Activity.make({
			name: "FindExternalLinks",
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
								externalChannelId: schema.externalChannelLinksTable.externalChannelId,
								config: schema.externalChannelLinksTable.config,
							})
							.from(schema.externalChannelLinksTable)
							.where(
								and(
									eq(schema.externalChannelLinksTable.channelId, payload.channelId),
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
										provider: "discord",
										externalChannelId: "",
										message: "Failed to query external links",
										cause: err,
									}),
								),
						}),
					)

				// Filter links that allow outbound messages
				const outboundLinks = links.filter(
					(link) => link.syncDirection === "outbound" || link.syncDirection === "bidirectional",
				)

				yield* Effect.logDebug(`Found ${outboundLinks.length} external links for outbound sync`)

				return {
					links: outboundLinks as any,
					count: outboundLinks.length,
				}
			}),
		})

		if (linksResult.count === 0) {
			yield* Effect.logDebug("No external links found for this channel")
			return
		}

		// Activity 3: Get message author info for formatting
		const authorInfo = yield* Activity.make({
			name: "GetMessageAuthor",
			success: Cluster.CreateBridgedMessageResult,
			error: Cluster.SendExternalMessageError,
			execute: Effect.gen(function* () {
				const db = yield* Database.Database

				const messageWithAuthor = yield* db
					.execute((client) =>
						client
							.select({
								content: schema.messagesTable.content,
								authorFirstName: schema.usersTable.firstName,
								authorLastName: schema.usersTable.lastName,
								authorAvatarUrl: schema.usersTable.avatarUrl,
							})
							.from(schema.messagesTable)
							.innerJoin(
								schema.usersTable,
								eq(schema.messagesTable.authorId, schema.usersTable.id),
							)
							.where(eq(schema.messagesTable.id, payload.messageId))
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								Effect.fail(
									new Cluster.SendExternalMessageError({
										provider: "discord",
										channelLinkId: "" as any,
										messageId: payload.messageId,
										message: "Failed to query message author",
										cause: err,
									}),
								),
						}),
					)

				if (messageWithAuthor.length === 0) {
					return yield* Effect.fail(
						new Cluster.SendExternalMessageError({
							provider: "discord",
							channelLinkId: "" as any,
							messageId: payload.messageId,
							message: "Message or author not found",
						}),
					)
				}

				return messageWithAuthor[0] as any
			}),
		})

		// Activity 4: Send to each linked external platform
		// Uses Discord REST API via the discord-bot service
		let successCount = 0
		let failureCount = 0

		for (const link of (linksResult as any).links) {
			yield* Activity.make({
				name: `SendToExternal-${link.provider}-${link.id}`,
				success: Cluster.SendExternalMessageResult,
				error: Cluster.SendExternalMessageError,
				execute: Effect.gen(function* () {
					// TODO: Call discord-bot service to send message via Discord REST API
					// POST to discord-bot service: /send-message
					// {
					//   channelId: link.externalChannelId,
					//   content: authorInfo.content,
					//   authorName: `${authorInfo.authorFirstName} ${authorInfo.authorLastName}`.trim()
					// }
					yield* Effect.logInfo(
						`Would send message ${payload.messageId} to ${link.provider} channel ${link.externalChannelId}`,
					)

					successCount++
					return {
						externalMessageId: `placeholder-${Date.now()}`,
						provider: link.provider,
						channelLinkId: link.id,
					}
				}),
			})
		}

		yield* Effect.logInfo(
			`ChatBridgeOutboundWorkflow completed: ${successCount} sent, ${failureCount} failed`,
		)
	}),
)

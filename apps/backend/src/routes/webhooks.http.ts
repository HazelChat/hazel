import { createHmac, timingSafeEqual } from "node:crypto"
import { HttpApiBuilder, HttpApiClient, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { and, Database, eq, isNull, schema, sql } from "@hazel/db"
import { ChatSyncConnectionRepo } from "@hazel/backend-core"
import { Cluster, WorkflowInitializationError, withSystemActor } from "@hazel/domain"
import { GitHubWebhookResponse, InvalidGitHubWebhookSignature } from "@hazel/domain/http"
import { Slack } from "@hazel/integrations"
import type {
	SequinWebhookEvent,
	SequinMessageReactionRecord,
	SequinMessageRecord,
	SequinWebhookRecord,
} from "@hazel/domain/http"
import type { Event } from "@workos-inc/node"
import { Config, Effect, pipe, Redacted } from "effect"
import { TreeFormatter } from "effect/ParseResult"
import type { ExternalChannelId, ExternalMessageId, ExternalThreadId, ExternalUserId } from "@hazel/schema"
import { HazelApi, InvalidWebhookSignature, WebhookResponse } from "../api"
import { WorkOSSync } from "@hazel/backend-core/services"
import { WorkOSWebhookVerifier } from "../services/workos-webhook"
import { DiscordSyncWorker } from "../services/chat-sync/discord-sync-worker"
import { SlackSyncWorker } from "../services/chat-sync/slack-sync-worker"

const isSequinMessageRecord = (record: SequinWebhookRecord): record is SequinMessageRecord =>
	"authorId" in record

const isSequinMessageReactionRecord = (record: SequinWebhookRecord): record is SequinMessageReactionRecord =>
	"userId" in record

type SequinWebhookSyncWorker = {
	syncHazelMessageCreateToAllConnections: (
		hazelMessageId: string,
		dedupeKey?: string,
	) => Effect.Effect<{ synced: number; failed: number }, unknown, never>
	syncHazelMessageDeleteToAllConnections: (
		hazelMessageId: string,
		dedupeKey?: string,
	) => Effect.Effect<{ synced: number; failed: number }, unknown, never>
	syncHazelMessageUpdateToAllConnections: (
		hazelMessageId: string,
		dedupeKey?: string,
	) => Effect.Effect<{ synced: number; failed: number }, unknown, never>
	syncHazelReactionCreateToAllConnections: (
		hazelReactionId: string,
		dedupeKey?: string,
	) => Effect.Effect<{ synced: number; failed: number }, unknown, never>
	syncHazelReactionDeleteToAllConnections: (
		payload: {
			hazelChannelId: string
			hazelMessageId: string
			emoji: string
			userId?: string
		},
		dedupeKey?: string,
	) => Effect.Effect<{ synced: number; failed: number }, unknown, never>
}

export const compareSequinWebhookEventsByCommitOrder = (
	left: SequinWebhookEvent,
	right: SequinWebhookEvent,
): number => {
	const leftTimestamp = Date.parse(left.metadata.commit_timestamp)
	const rightTimestamp = Date.parse(right.metadata.commit_timestamp)

	if (leftTimestamp < rightTimestamp) return -1
	if (leftTimestamp > rightTimestamp) return 1

	if (left.metadata.commit_lsn < right.metadata.commit_lsn) return -1
	if (left.metadata.commit_lsn > right.metadata.commit_lsn) return 1

	if (left.metadata.commit_idx < right.metadata.commit_idx) return -1
	if (left.metadata.commit_idx > right.metadata.commit_idx) return 1

	return left.record.id.localeCompare(right.record.id)
}

export const sortSequinWebhookEventsByCommitOrder = (events: ReadonlyArray<SequinWebhookEvent>) => {
	return [...events].sort(compareSequinWebhookEventsByCommitOrder)
}

export const processSequinWebhookEventsInCommitOrder = <A, E>(
	events: ReadonlyArray<SequinWebhookEvent>,
	processEvent: (event: SequinWebhookEvent) => Effect.Effect<A, E, never>,
) => Effect.forEach(sortSequinWebhookEventsByCommitOrder(events), processEvent, { concurrency: 1 })

export const syncSequinWebhookEventToProvider = (
	event: SequinWebhookEvent,
	integrationBotUserId: string | null,
	syncWorker: SequinWebhookSyncWorker,
	provider: "discord" | "slack",
) =>
	Effect.gen(function* () {
		// Drive Hazel -> provider sync from Sequin events.
		if (event.metadata.table_name === "messages" && isSequinMessageRecord(event.record)) {
			if (event.record.authorId === integrationBotUserId) {
				yield* Effect.logDebug("Skipping Sequin message event from integration bot", {
					provider,
					tableName: event.metadata.table_name,
					messageId: event.record.id,
					channelId: event.record.channelId,
				})
			} else {
				const dedupeKey = `hazel:sequin:${event.metadata.table_name}:${event.action}:${event.record.id}:${event.metadata.idempotency_key}`
				const isSoftDeleteUpdate = event.action === "update" && event.record.deletedAt !== null

				yield* (
					event.action === "insert"
						? syncWorker.syncHazelMessageCreateToAllConnections(event.record.id, dedupeKey)
						: event.action === "delete" || isSoftDeleteUpdate
							? syncWorker.syncHazelMessageDeleteToAllConnections(event.record.id, dedupeKey)
							: syncWorker.syncHazelMessageUpdateToAllConnections(event.record.id, dedupeKey)
				).pipe(
					Effect.catchAll((error) =>
						Effect.logWarning("Failed to sync Sequin message event to provider", {
							provider,
							action: event.action,
							messageId: event.record.id,
							channelId: event.record.channelId,
							error: String(error),
						}),
					),
				)
			}
		}

		if (
			event.metadata.table_name === "message_reactions" &&
			isSequinMessageReactionRecord(event.record)
		) {
			if (event.record.userId === integrationBotUserId) {
				yield* Effect.logDebug("Skipping Sequin reaction event from integration bot", {
					provider,
					tableName: event.metadata.table_name,
					reactionId: event.record.id,
					channelId: event.record.channelId,
				})
			} else {
				const dedupeKey = `hazel:sequin:${event.metadata.table_name}:${event.action}:${event.record.id}:${event.metadata.idempotency_key}`

				yield* (
					event.action === "insert"
						? syncWorker.syncHazelReactionCreateToAllConnections(event.record.id, dedupeKey)
						: event.action === "delete"
							? syncWorker.syncHazelReactionDeleteToAllConnections(
									{
										hazelChannelId: event.record.channelId,
										hazelMessageId: event.record.messageId,
										emoji: event.record.emoji,
										userId: event.record.userId,
									},
									dedupeKey,
								)
							: Effect.succeed({
									synced: 0,
									failed: 0,
								})
				).pipe(
					Effect.catchAll((error) =>
						Effect.logWarning("Failed to sync Sequin reaction event to provider", {
							provider,
							action: event.action,
							reactionId: event.record.id,
							channelId: event.record.channelId,
							error: String(error),
						}),
					),
				)
			}
		}
	})

export const syncSequinWebhookEventToDiscord = (
	event: SequinWebhookEvent,
	integrationBotUserId: string | null,
	discordSyncWorker: SequinWebhookSyncWorker,
) => syncSequinWebhookEventToProvider(event, integrationBotUserId, discordSyncWorker, "discord")

export const HttpWebhookLive = HttpApiBuilder.group(HazelApi, "webhooks", (handlers) =>
	handlers
		.handle("workos", (_args) =>
			Effect.gen(function* () {
				// Get the raw request to access headers and body
				const request = yield* HttpServerRequest.HttpServerRequest

				// Get the signature header
				const signatureHeader = request.headers["workos-signature"]
				if (!signatureHeader) {
					return yield* Effect.fail(
						new InvalidWebhookSignature({
							message: "Missing workos-signature header",
						}),
					)
				}

				// Get the raw body as string for signature verification
				// The body should be the raw JSON string
				const rawBody = yield* pipe(
					request.text,
					Effect.orElseFail(
						() =>
							new InvalidWebhookSignature({
								message: "Invalid request body",
							}),
					),
				)

				// Verify the webhook signature
				const verifier = yield* WorkOSWebhookVerifier
				yield* pipe(
					verifier.verifyWebhook(signatureHeader, rawBody),
					Effect.mapError((error) => {
						if (
							error._tag === "WebhookVerificationError" ||
							error._tag === "WebhookTimestampError"
						) {
							return new InvalidWebhookSignature({
								message: error.message,
							})
						}
						return error
					}),
				)

				// Parse the webhook payload
				const payload = JSON.parse(rawBody) as Event

				// Log the incoming webhook event
				yield* Effect.logInfo(`Processing WorkOS webhook event: ${payload.event}`, {
					eventId: payload.id,
					eventType: payload.event,
				})

				// Process the webhook event using the sync service
				const syncService = yield* WorkOSSync
				const result = yield* syncService.processWebhookEvent(payload)

				if (!result.success) {
					const errorMessage = "error" in result ? result.error : "Unknown error"
					yield* Effect.logError(`Failed to process webhook event: ${errorMessage}`, {
						eventId: payload.id,
						eventType: payload.event,
						error: errorMessage,
					})
				} else {
					yield* Effect.logDebug(`Successfully processed webhook event`, {
						eventId: payload.id,
						eventType: payload.event,
					})
				}

				// Return success response quickly (WorkOS expects 200 OK)
				return new WebhookResponse({
					success: result.success,
					message: result.success
						? "Event processed successfully"
						: "error" in result
							? result.error
							: "Unknown error",
				})
			}).pipe(withSystemActor),
		)
		.handle("sequinWebhook", ({ payload }) =>
			Effect.gen(function* () {
				// Log the incoming webhook batch
				yield* Effect.logInfo("Received Sequin webhook batch", {
					eventCount: payload.data.length,
				})

				// Get cluster URL from config
				const clusterUrl = yield* Config.string("CLUSTER_URL").pipe(Effect.orDie)

				// Get database for channel type lookup
				const db = yield* Database.Database
				const discordSyncWorker = yield* DiscordSyncWorker
				const slackSyncWorker = yield* SlackSyncWorker
				const sequinDiscordSyncWorker = discordSyncWorker as unknown as SequinWebhookSyncWorker
				const sequinSlackSyncWorker = slackSyncWorker as unknown as SequinWebhookSyncWorker

				// Get the Cluster API client once for all events
				const client = yield* HttpApiClient.make(Cluster.WorkflowApi, {
					baseUrl: clusterUrl,
				})

				const findIntegrationBotUserId = (provider: "discord" | "slack") =>
					db
						.execute((client) =>
							client
								.select({ id: schema.usersTable.id })
								.from(schema.usersTable)
								.where(
									and(
										eq(schema.usersTable.externalId, `integration-bot-${provider}`),
										isNull(schema.usersTable.deletedAt),
									),
								)
								.limit(1),
						)
						.pipe(
							Effect.map((rows) => rows[0]?.id ?? null),
							Effect.catchTags({
								DatabaseError: () => Effect.succeed(null),
							}),
						)

				const discordIntegrationBotUserId = yield* findIntegrationBotUserId("discord")
				const slackIntegrationBotUserId = yield* findIntegrationBotUserId("slack")

				// Process each event in deterministic commit order.
				yield* processSequinWebhookEventsInCommitOrder(payload.data, (event) =>
					Effect.gen(function* () {
						// Log each event
						yield* Effect.logDebug("Processing Sequin event", {
							action: event.action,
							tableName: event.metadata.table_name,
							recordId: event.record.id,
							channelId: event.record.channelId,
						})

						yield* syncSequinWebhookEventToProvider(
							event,
							discordIntegrationBotUserId,
							sequinDiscordSyncWorker,
							"discord",
						)

						yield* syncSequinWebhookEventToProvider(
							event,
							slackIntegrationBotUserId,
							sequinSlackSyncWorker,
							"slack",
						)

						// Notification and thread-naming workflows are insert-only.
						if (event.metadata.table_name !== "messages" || event.action !== "insert") {
							yield* Effect.logDebug("Skipping non-insert workflow actions", {
								action: event.action,
								tableName: event.metadata.table_name,
								recordId: event.record.id,
							})
							return
						}
						if (!isSequinMessageRecord(event.record)) {
							yield* Effect.logWarning(
								"Skipping unexpected Sequin payload for message workflow",
								{
									tableName: event.metadata.table_name,
									recordId: event.record.id,
								},
							)
							return
						}
						const messageRecord = event.record

						// Fetch channel type for smart notifications
						const channelResult = yield* db
							.execute((client) =>
								client
									.select({
										type: schema.channelsTable.type,
										name: schema.channelsTable.name,
									})
									.from(schema.channelsTable)
									.where(eq(schema.channelsTable.id, messageRecord.channelId))
									.limit(1),
							)
							.pipe(
								Effect.catchTags({
									DatabaseError: (err) =>
										Effect.fail(
											new WorkflowInitializationError({
												message: "Failed to query channel type",
												cause: err.message,
											}),
										),
								}),
							)

						const channelType = channelResult[0]?.type ?? "public"

						// Execute the MessageNotificationWorkflow via HTTP
						// The WorkflowProxy creates an endpoint named after the workflow
						yield* client.workflows
							.MessageNotificationWorkflowDiscard({
								payload: {
									messageId: messageRecord.id,
									channelId: messageRecord.channelId,
									authorId: messageRecord.authorId,
									channelType,
									content: messageRecord.content ?? "",
									replyToMessageId: messageRecord.replyToMessageId ?? null,
								},
							})
							.pipe(
								Effect.tapError((err) =>
									Effect.logError("Failed to execute notification workflow", {
										error: err.message,
										messageId: messageRecord.id,
										channelId: messageRecord.channelId,
										authorId: messageRecord.authorId,
									}),
								),
								Effect.catchTags({
									HttpApiDecodeError: (err) =>
										Effect.fail(
											new WorkflowInitializationError({
												message: "Failed to execute notification workflow",
												cause: err.message,
											}),
										),
									ParseError: (err) =>
										Effect.fail(
											new WorkflowInitializationError({
												message: "Failed to execute notification workflow",
												cause: TreeFormatter.formatErrorSync(err),
											}),
										),
									RequestError: (err) =>
										Effect.fail(
											new WorkflowInitializationError({
												message: "Failed to execute notification workflow",
												cause: err.message,
											}),
										),
									ResponseError: (err) =>
										Effect.fail(
											new WorkflowInitializationError({
												message: "Failed to execute notification workflow",
												cause: err.message,
											}),
										),
								}),
							)

						// Check if this message is in a thread and should trigger auto-naming
						if (channelType === "thread") {
							// Count messages in thread
							const messageCountResult = yield* db
								.execute((client) =>
									client
										.select({ count: sql<number>`count(*)::int` })
										.from(schema.messagesTable)
										.where(
											and(
												eq(schema.messagesTable.channelId, messageRecord.channelId),
												isNull(schema.messagesTable.deletedAt),
											),
										),
								)
								.pipe(
									Effect.catchTags({
										DatabaseError: () => Effect.succeed([{ count: 0 }]),
									}),
								)

							const count = messageCountResult[0]?.count ?? 0

							if (count > 3 && channelResult[0]?.name === "Thread") {
								const originalMessageResult = yield* db
									.execute((client) =>
										client
											.select({ id: schema.messagesTable.id })
											.from(schema.messagesTable)
											.where(
												eq(
													schema.messagesTable.threadChannelId,
													messageRecord.channelId,
												),
											)
											.limit(1),
									)
									.pipe(
										Effect.catchTags({
											DatabaseError: () => Effect.succeed([]),
										}),
									)

								if (originalMessageResult.length > 0) {
									yield* client.workflows
										.ThreadNamingWorkflowDiscard({
											payload: {
												threadChannelId: messageRecord.channelId,
												originalMessageId: originalMessageResult[0]!.id,
											},
										})
										.pipe(
											Effect.tapError((err) =>
												Effect.logError("Failed to execute thread naming workflow", {
													error: err.message,
													threadChannelId: messageRecord.channelId,
												}),
											),
											// Don't fail the main flow - catch all workflow errors
											Effect.catchTags({
												HttpApiDecodeError: () => Effect.void,
												ParseError: () => Effect.void,
												RequestError: () => Effect.void,
												ResponseError: () => Effect.void,
											}),
										)

									yield* Effect.logDebug("Triggered thread naming workflow", {
										threadChannelId: messageRecord.channelId,
										originalMessageId: originalMessageResult[0]!.id,
									})
								}
							}
						}

						yield* Effect.logDebug("Event processed successfully", {
							messageId: messageRecord.id,
						})
					}),
				)

				yield* Effect.logDebug("Sequin webhook batch processed successfully", {
					eventCount: payload.data.length,
				})
			}),
		)
		.handle("slackEvents", (_args) =>
			Effect.gen(function* () {
				const request = yield* HttpServerRequest.HttpServerRequest
				const signatureHeader = request.headers["x-slack-signature"]
				const timestampHeader = request.headers["x-slack-request-timestamp"]
				if (!signatureHeader || !timestampHeader) {
					return yield* Effect.fail(
						new InvalidWebhookSignature({
							message: "Missing Slack signature headers",
						}),
					)
				}

				const rawBody = yield* pipe(
					request.text,
					Effect.orElseFail(
						() =>
							new InvalidWebhookSignature({
								message: "Invalid request body",
							}),
					),
				)

				const signingSecret = yield* Config.redacted("SLACK_SIGNING_SECRET").pipe(
					Effect.map(Redacted.value),
					Effect.mapError(
						() =>
							new InvalidWebhookSignature({
								message: "SLACK_SIGNING_SECRET is not configured",
							}),
					),
				)

				const timestampSeconds = Number(timestampHeader)
				if (!Number.isFinite(timestampSeconds)) {
					return yield* Effect.fail(
						new InvalidWebhookSignature({
							message: "Invalid Slack timestamp",
						}),
					)
				}

				if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 60 * 5) {
					return yield* Effect.fail(
						new InvalidWebhookSignature({
							message: "Slack signature timestamp is outside allowed window",
						}),
					)
				}

				const baseString = `v0:${timestampHeader}:${rawBody}`
				const computedSignature = `v0=${createHmac("sha256", signingSecret).update(baseString).digest("hex")}`

				if (
					signatureHeader.length !== computedSignature.length ||
					!timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(computedSignature))
				) {
					return yield* Effect.fail(
						new InvalidWebhookSignature({
							message: "Invalid Slack webhook signature",
						}),
					)
				}

				const body = yield* Effect.try({
					try: () => JSON.parse(rawBody) as Record<string, unknown>,
					catch: () =>
						new InvalidWebhookSignature({
							message: "Slack webhook payload must be valid JSON",
						}),
				})

				if (body.type === "url_verification" && typeof body.challenge === "string") {
					return yield* HttpServerResponse.json({ challenge: body.challenge })
				}

				if (body.type !== "event_callback") {
					return new WebhookResponse({
						success: true,
						message: "Ignored non-event Slack callback",
					})
				}

				const eventId = typeof body.event_id === "string" ? body.event_id : `evt-${Date.now()}`
				const workspaceId = typeof body.team_id === "string" ? body.team_id : null
				const event =
					typeof body.event === "object" && body.event !== null
						? (body.event as Record<string, unknown>)
						: null
				if (!workspaceId || !event) {
					return new WebhookResponse({
						success: true,
						message: "Ignored malformed Slack event callback",
					})
				}

				const connectionRepo = yield* ChatSyncConnectionRepo
				const slackSyncWorker = yield* SlackSyncWorker
				const connections = yield* connectionRepo.findActiveByProvider("slack").pipe(withSystemActor)
				const targetConnections = connections.filter(
					(connection) => connection.externalWorkspaceId === workspaceId,
				)
				if (targetConnections.length === 0) {
					return new WebhookResponse({
						success: true,
						message: "No active Slack sync connections for this workspace",
					})
				}

				const eventType = typeof event.type === "string" ? event.type : null
				const isRecord = (value: unknown): value is Record<string, unknown> =>
					typeof value === "object" && value !== null
				const asString = (value: unknown): string | undefined =>
					typeof value === "string" && value.trim().length > 0 ? value : undefined
				const normalizeSlackAttachments = (value: unknown) => {
					if (!Array.isArray(value)) {
						return [] as Array<{
							externalAttachmentId?: string
							fileName: string
							fileSize: number
							publicUrl: string
						}>
					}
					const attachments: Array<{
						externalAttachmentId?: string
						fileName: string
						fileSize: number
						publicUrl: string
					}> = []
					for (const item of value) {
						if (!isRecord(item)) continue
						const fileName = asString(item.name)
						const publicUrl = asString(item.permalink_public) ?? asString(item.permalink)
						if (!fileName || !publicUrl) continue
						const fileSize = typeof item.size === "number" && item.size >= 0 ? item.size : 0
						const externalAttachmentId = asString(item.id)
						attachments.push({
							fileName,
							fileSize,
							publicUrl,
							...(externalAttachmentId ? { externalAttachmentId } : {}),
						})
					}
					return attachments
				}
				const toThreadChannelId = (
					channelId: string,
					threadTs: string | undefined,
					messageTs?: string,
				) =>
					threadTs && threadTs !== messageTs
						? Slack.createSlackThreadChannelRef(channelId, threadTs)
						: channelId
				const asExternalChannelId = (value: string) => value as ExternalChannelId
				const asExternalMessageId = (value: string) => value as ExternalMessageId
				const asExternalThreadId = (value: string) => value as ExternalThreadId
				const asExternalUserId = (value: string) => value as ExternalUserId

				yield* Effect.forEach(
					targetConnections,
					(connection) =>
						Effect.gen(function* () {
							if (eventType === "message") {
								const subtype = asString(event.subtype)
								const channelId = asString(event.channel)
								if (!channelId) {
									return
								}

								if (subtype === "message_deleted") {
									const previousMessage = isRecord(event.previous_message)
										? event.previous_message
										: undefined
									const deletedTs =
										asString(event.deleted_ts) ?? asString(previousMessage?.ts)
									if (!deletedTs) {
										return
									}
									const threadTs = asString(previousMessage?.thread_ts)
									yield* slackSyncWorker.ingestMessageDelete({
										syncConnectionId: connection.id,
										externalChannelId: asExternalChannelId(
											toThreadChannelId(channelId, threadTs, deletedTs),
										),
										externalMessageId: asExternalMessageId(deletedTs),
										dedupeKey: `slack:${eventId}:message_deleted:${connection.id}`,
									})
									return
								}

								if (subtype === "message_changed") {
									const changedMessage = isRecord(event.message) ? event.message : undefined
									const changedTs = asString(changedMessage?.ts)
									if (!changedTs) {
										return
									}
									const changedText = asString(changedMessage?.text) ?? ""
									const threadTs = asString(changedMessage?.thread_ts)
									const changedBotId = asString(changedMessage?.bot_id)
									if (changedBotId) {
										return
									}
									yield* slackSyncWorker.ingestMessageUpdate({
										syncConnectionId: connection.id,
										externalChannelId: asExternalChannelId(
											toThreadChannelId(channelId, threadTs, changedTs),
										),
										externalMessageId: asExternalMessageId(changedTs),
										content: changedText,
										dedupeKey: `slack:${eventId}:message_changed:${connection.id}`,
									})
									return
								}

								if (subtype && subtype !== "thread_broadcast") {
									return
								}

								const botId = asString(event.bot_id)
								if (botId) {
									return
								}

								const messageTs = asString(event.ts)
								if (!messageTs) {
									return
								}
								const threadTs = asString(event.thread_ts)
								const externalChannelId = toThreadChannelId(channelId, threadTs, messageTs)

								if (threadTs && threadTs !== messageTs) {
									yield* slackSyncWorker.ingestThreadCreate({
										syncConnectionId: connection.id,
										externalParentChannelId: asExternalChannelId(channelId),
										externalThreadId: asExternalThreadId(
											Slack.createSlackThreadChannelRef(channelId, threadTs),
										),
										externalRootMessageId: asExternalMessageId(threadTs),
										name: "Thread",
										dedupeKey: `slack:${eventId}:thread_create:${connection.id}`,
									})
								}

								yield* slackSyncWorker.ingestMessageCreate({
									syncConnectionId: connection.id,
									externalChannelId: asExternalChannelId(externalChannelId),
									externalMessageId: asExternalMessageId(messageTs),
									content: asString(event.text) ?? "",
									externalAuthorId: asString(event.user)
										? asExternalUserId(asString(event.user)!)
										: undefined,
									externalAuthorDisplayName: asString(event.username),
									externalReplyToMessageId: null,
									externalThreadId:
										threadTs && threadTs !== messageTs
											? asExternalThreadId(
													Slack.createSlackThreadChannelRef(channelId, threadTs),
												)
											: null,
									externalAttachments: normalizeSlackAttachments(event.files),
									dedupeKey: `slack:${eventId}:message_create:${connection.id}`,
								})
								return
							}

							if (eventType === "reaction_added" || eventType === "reaction_removed") {
								const item = isRecord(event.item) ? event.item : null
								const channelId = asString(item?.channel)
								const messageTs = asString(item?.ts)
								const externalUserId = asString(event.user)
								const reactionName = asString(event.reaction)
								if (
									!item ||
									asString(item.type) !== "message" ||
									!channelId ||
									!messageTs ||
									!externalUserId ||
									!reactionName
								) {
									return
								}

								const payload = {
									syncConnectionId: connection.id,
									externalChannelId: asExternalChannelId(channelId),
									externalMessageId: asExternalMessageId(messageTs),
									externalUserId: asExternalUserId(externalUserId),
									emoji: `:${reactionName}:`,
									dedupeKey: `slack:${eventId}:${eventType}:${connection.id}`,
								}

								if (eventType === "reaction_added") {
									yield* slackSyncWorker.ingestReactionAdd(payload)
								} else {
									yield* slackSyncWorker.ingestReactionRemove(payload)
								}
							}
						}).pipe(
							Effect.catchAll((error) =>
								Effect.logWarning("Failed to process Slack event for chat sync connection", {
									eventId,
									eventType: eventType ?? "unknown",
									syncConnectionId: connection.id,
									error: String(error),
								}),
							),
						),
					{ concurrency: 1 },
				)

				return new WebhookResponse({
					success: true,
					message: "Slack event processed",
				})
			}).pipe(
				withSystemActor,
				Effect.mapError((error) =>
					error instanceof InvalidWebhookSignature
						? error
						: new InvalidWebhookSignature({
								message: `Failed to process Slack event: ${String(error)}`,
							}),
				),
			),
		)
		.handle("github", (_args) =>
			Effect.gen(function* () {
				// Get the raw request to access headers and body
				const request = yield* HttpServerRequest.HttpServerRequest

				// Get GitHub webhook headers
				const eventType = request.headers["x-github-event"] as string | undefined
				const signature = request.headers["x-hub-signature-256"] as string | undefined
				const deliveryId = request.headers["x-github-delivery"] as string | undefined

				if (!eventType || !deliveryId) {
					return yield* Effect.fail(
						new InvalidGitHubWebhookSignature({
							message: "Missing required GitHub webhook headers",
						}),
					)
				}

				// Get the raw body as string for signature verification
				const rawBody = yield* pipe(
					request.text,
					Effect.orElseFail(
						() =>
							new InvalidGitHubWebhookSignature({
								message: "Invalid request body",
							}),
					),
				)

				// Verify the webhook signature
				// SECURITY: Require GITHUB_WEBHOOK_SECRET in production
				const skipSignatureVerification = yield* Config.boolean("GITHUB_WEBHOOK_SKIP_SIGNATURE").pipe(
					Effect.orElseSucceed(() => false),
				)

				const webhookSecret = yield* Config.redacted("GITHUB_WEBHOOK_SECRET").pipe(
					Effect.catchTag("ConfigError", () =>
						skipSignatureVerification
							? Effect.succeed(Redacted.make(""))
							: Effect.fail(
									new InvalidGitHubWebhookSignature({
										message:
											"GITHUB_WEBHOOK_SECRET not configured. Set GITHUB_WEBHOOK_SKIP_SIGNATURE=true to disable in development.",
									}),
								),
					),
				)

				const secretValue = Redacted.value(webhookSecret)
				if (secretValue) {
					// Secret is configured, verify signature
					if (!signature) {
						yield* Effect.logWarning("Missing GitHub webhook signature header")
						return yield* Effect.fail(
							new InvalidGitHubWebhookSignature({
								message: "Missing x-hub-signature-256 header",
							}),
						)
					}

					const expected = `sha256=${createHmac("sha256", secretValue).update(rawBody).digest("hex")}`
					const sig = Buffer.from(signature)
					const exp = Buffer.from(expected)

					if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
						yield* Effect.logWarning("Invalid GitHub webhook signature")
						return yield* Effect.fail(
							new InvalidGitHubWebhookSignature({
								message: "Invalid webhook signature",
							}),
						)
					}
				} else {
					// No secret configured and skip is enabled (dev mode)
					yield* Effect.logWarning(
						"GitHub webhook signature verification skipped (GITHUB_WEBHOOK_SKIP_SIGNATURE=true)",
					)
				}

				// Parse the webhook payload
				const payload = JSON.parse(rawBody)

				// Log the incoming webhook event
				yield* Effect.logInfo("Received GitHub webhook", {
					eventType,
					deliveryId,
					repository: payload.repository?.full_name,
					action: payload.action,
				})

				// Get cluster URL and create client once
				const clusterUrl = yield* Config.string("CLUSTER_URL").pipe(Effect.orDie)
				const client = yield* HttpApiClient.make(Cluster.WorkflowApi, {
					baseUrl: clusterUrl,
				})

				// Handle installation lifecycle events (uninstall, suspend, unsuspend)
				if (eventType === "installation") {
					const installation = payload.installation as
						| { id: number; account: { login: string; type: string } }
						| undefined
					const action = payload.action as string | undefined
					const sender = payload.sender as { login: string } | undefined

					// Validate required fields for installation events
					if (
						!installation?.id ||
						!installation?.account ||
						!action ||
						!["created", "deleted", "suspend", "unsuspend"].includes(action)
					) {
						yield* Effect.logDebug(
							"Skipping installation webhook - missing fields or unsupported action",
							{
								hasInstallation: !!installation?.id,
								hasAccount: !!installation?.account,
								action,
							},
						)
						return new GitHubWebhookResponse({ processed: false })
					}

					yield* Effect.logDebug("Processing GitHub installation event", {
						deliveryId,
						action,
						installationId: installation.id,
						accountLogin: installation.account.login,
						accountType: installation.account.type,
						senderLogin: sender?.login,
					})

					yield* client.workflows
						.GitHubInstallationWorkflow({
							payload: {
								deliveryId,
								action: action as "created" | "deleted" | "suspend" | "unsuspend",
								installationId: installation.id,
								accountLogin: installation.account.login,
								accountType: installation.account.type as "User" | "Organization",
								senderLogin: sender?.login ?? "unknown",
							},
						})
						.pipe(
							Effect.tapError((err) =>
								Effect.logError("Failed to execute GitHub installation workflow", {
									error: err.message,
									deliveryId,
									action,
									installationId: installation.id,
								}),
							),
							Effect.catchTags({
								HttpApiDecodeError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute GitHub installation workflow",
											cause: err.message,
										}),
									),
								ParseError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute GitHub installation workflow",
											cause: String(err),
										}),
									),
								RequestError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute GitHub installation workflow",
											cause: err.message,
										}),
									),
								ResponseError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "Failed to execute GitHub installation workflow",
											cause: err.message,
										}),
									),
								// Workflow activity errors
								FindConnectionByInstallationError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "GitHub installation workflow failed",
											cause: err.message,
										}),
									),
								UpdateConnectionStatusError: (err) =>
									Effect.fail(
										new WorkflowInitializationError({
											message: "GitHub installation workflow failed",
											cause: err.message,
										}),
									),
							}),
						)

					yield* Effect.logDebug("GitHub installation event processed successfully", {
						deliveryId,
						action,
						installationId: installation.id,
					})

					return new GitHubWebhookResponse({ processed: true })
				}

				// Handle repository-based events (push, pull_request, issues, etc.)
				// Extract required info from payload
				const installationId = payload.installation?.id as number | undefined
				const repositoryId = payload.repository?.id as number | undefined
				const repositoryFullName = payload.repository?.full_name as string | undefined

				// Skip if missing required fields
				if (!installationId || !repositoryId || !repositoryFullName) {
					yield* Effect.logDebug("Skipping GitHub webhook - missing required fields", {
						hasInstallation: !!installationId,
						hasRepository: !!repositoryId,
					})
					return new GitHubWebhookResponse({ processed: false })
				}

				yield* client.workflows
					.GitHubWebhookWorkflow({
						payload: {
							deliveryId,
							eventType,
							installationId,
							repositoryId,
							repositoryFullName,
							eventPayload: payload,
						},
					})
					.pipe(
						Effect.tapError((err) =>
							Effect.logError("Failed to execute GitHub webhook workflow", {
								error: err.message,
								deliveryId,
								eventType,
								repository: repositoryFullName,
							}),
						),
						Effect.catchTags({
							HttpApiDecodeError: (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "Failed to execute GitHub webhook workflow",
										cause: err.message,
									}),
								),
							ParseError: (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "Failed to execute GitHub webhook workflow",
										cause: String(err),
									}),
								),
							RequestError: (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "Failed to execute GitHub webhook workflow",
										cause: err.message,
									}),
								),
							ResponseError: (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "Failed to execute GitHub webhook workflow",
										cause: err.message,
									}),
								),
							// Workflow activity errors
							GetGitHubSubscriptionsError: (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "GitHub webhook workflow failed",
										cause: err.message,
									}),
								),
							CreateGitHubMessageError: (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "GitHub webhook workflow failed",
										cause: err.message,
									}),
								),
							BotUserQueryError: (err) =>
								Effect.fail(
									new WorkflowInitializationError({
										message: "GitHub webhook workflow failed",
										cause: err.message,
									}),
								),
						}),
					)

				yield* Effect.logDebug("GitHub webhook processed successfully", {
					deliveryId,
					eventType,
					repository: repositoryFullName,
				})

				return new GitHubWebhookResponse({ processed: true })
			}),
		),
)

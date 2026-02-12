import { createHmac, timingSafeEqual } from "node:crypto"
import { HttpApiBuilder, HttpApiClient, HttpServerRequest } from "@effect/platform"
import { and, Database, eq, isNull, schema, sql } from "@hazel/db"
import { Cluster, WorkflowInitializationError, withSystemActor } from "@hazel/domain"
import {
	GitHubWebhookResponse,
	InvalidGitHubWebhookSignature,
} from "@hazel/domain/http"
import type {
	SequinMessageReactionRecord,
	SequinMessageRecord,
	SequinWebhookRecord,
} from "@hazel/domain/http"
import type { Event } from "@workos-inc/node"
import { Config, Effect, pipe, Redacted } from "effect"
import { TreeFormatter } from "effect/ParseResult"
import { HazelApi, InvalidWebhookSignature, WebhookResponse } from "../api"
import { WorkOSSync } from "@hazel/backend-core/services"
import { WorkOSWebhookVerifier } from "../services/workos-webhook"
import { DiscordSyncWorker } from "../services/chat-sync/discord-sync-worker"

const isSequinMessageRecord = (record: SequinWebhookRecord): record is SequinMessageRecord =>
	"authorId" in record

const isSequinMessageReactionRecord = (
	record: SequinWebhookRecord,
): record is SequinMessageReactionRecord => "userId" in record

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

				// Get the Cluster API client once for all events
				const client = yield* HttpApiClient.make(Cluster.WorkflowApi, {
					baseUrl: clusterUrl,
				})

				// Resolve Discord integration bot user once to avoid feedback loops.
				const integrationBotResult = yield* db
					.execute((client) =>
						client
							.select({ id: schema.usersTable.id })
							.from(schema.usersTable)
							.where(
								and(
									eq(schema.usersTable.externalId, "integration-bot-discord"),
									isNull(schema.usersTable.deletedAt),
								),
							)
							.limit(1),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: () => Effect.succeed([]),
						}),
					)
				const integrationBotUserId = integrationBotResult[0]?.id ?? null

				// Process each event in the batch
				yield* Effect.forEach(
					payload.data,
					(event) =>
						Effect.gen(function* () {
							// Log each event
							yield* Effect.logDebug("Processing Sequin event", {
								action: event.action,
								tableName: event.metadata.table_name,
								recordId: event.record.id,
								channelId: event.record.channelId,
							})

							// Drive Hazel -> Discord sync from Sequin events.
							if (event.metadata.table_name === "messages" && isSequinMessageRecord(event.record)) {
								if (event.record.authorId === integrationBotUserId) {
									yield* Effect.logDebug("Skipping Sequin message event from integration bot", {
										tableName: event.metadata.table_name,
										messageId: event.record.id,
										channelId: event.record.channelId,
									})
								} else {
									const dedupeKey = `hazel:sequin:${event.metadata.table_name}:${event.action}:${event.record.id}:${event.metadata.idempotency_key}`
									const isSoftDeleteUpdate =
										event.action === "update" && event.record.deletedAt !== null

									yield* (
										event.action === "insert"
											? discordSyncWorker.syncHazelMessageCreateToAllConnections(
													event.record.id,
													dedupeKey,
												)
											: event.action === "delete" || isSoftDeleteUpdate
												? discordSyncWorker.syncHazelMessageDeleteToAllConnections(
														event.record.id,
														dedupeKey,
													)
												: discordSyncWorker.syncHazelMessageUpdateToAllConnections(
														event.record.id,
														dedupeKey,
													)
									).pipe(
										Effect.catchAll((error) =>
											Effect.logWarning("Failed to sync Sequin message event to Discord", {
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
										tableName: event.metadata.table_name,
										reactionId: event.record.id,
										channelId: event.record.channelId,
									})
								} else {
									const dedupeKey = `hazel:sequin:${event.metadata.table_name}:${event.action}:${event.record.id}:${event.metadata.idempotency_key}`

									yield* (
										event.action === "insert"
											? discordSyncWorker.syncHazelReactionCreateToAllConnections(
													event.record.id,
													dedupeKey,
												)
											: event.action === "delete"
												? discordSyncWorker.syncHazelReactionDeleteToAllConnections(
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
											Effect.logWarning("Failed to sync Sequin reaction event to Discord", {
												action: event.action,
												reactionId: event.record.id,
												channelId: event.record.channelId,
												error: String(error),
											}),
										),
									)
								}
							}

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
								yield* Effect.logWarning("Skipping unexpected Sequin payload for message workflow", {
									tableName: event.metadata.table_name,
									recordId: event.record.id,
								})
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
												eq(
													schema.messagesTable.channelId,
													messageRecord.channelId,
												),
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
														Effect.logError(
															"Failed to execute thread naming workflow",
															{
																error: err.message,
																threadChannelId: messageRecord.channelId,
															},
														),
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
					{ concurrency: "unbounded" },
				)

				yield* Effect.logDebug("Sequin webhook batch processed successfully", {
					eventCount: payload.data.length,
				})
			}),
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

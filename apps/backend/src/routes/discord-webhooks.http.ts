import { HttpApiBuilder, HttpApiClient, HttpServerRequest } from "@effect/platform"
import { Cluster, WorkflowInitializationError } from "@hazel/domain"
import {
	DiscordWebhookProcessingError,
	DiscordWebhookResponse,
	InvalidDiscordWebhookSignature,
} from "@hazel/domain/http"
import { Config, DateTime, Effect, pipe } from "effect"
import { HazelApi } from "../api"
import { createDiscordAdapter } from "../services/chat-bridge/discord-adapter"

// Discord interaction types
const INTERACTION_TYPE_PING = 1

/**
 * Verify Discord Ed25519 signature
 *
 * Discord uses Ed25519 for webhook signature verification.
 * The signature is verified against: timestamp + body
 */
const verifyDiscordSignature = (
	publicKey: string,
	signature: string,
	timestamp: string,
	body: string,
): Effect.Effect<boolean, InvalidDiscordWebhookSignature> =>
	Effect.gen(function* () {
		try {
			// Import the signature and public key as CryptoKey
			const publicKeyBytes = hexToBytes(publicKey)
			const signatureBytes = hexToBytes(signature)

			// Create the message to verify (timestamp + body)
			const encoder = new TextEncoder()
			const message = encoder.encode(timestamp + body)

			// Import the public key for Ed25519 verification
			const cryptoKey = yield* Effect.tryPromise({
				try: () =>
					crypto.subtle.importKey(
						"raw",
						publicKeyBytes.buffer as ArrayBuffer,
						{ name: "Ed25519" },
						false,
						["verify"],
					),
				catch: (error) =>
					new InvalidDiscordWebhookSignature({
						message: `Failed to import public key: ${String(error)}`,
					}),
			})

			// Verify the signature
			const isValid = yield* Effect.tryPromise({
				try: () =>
					crypto.subtle.verify("Ed25519", cryptoKey, signatureBytes.buffer as ArrayBuffer, message),
				catch: (error) =>
					new InvalidDiscordWebhookSignature({
						message: `Signature verification failed: ${String(error)}`,
					}),
			})

			return isValid
		} catch (error) {
			return yield* Effect.fail(
				new InvalidDiscordWebhookSignature({
					message: `Signature verification error: ${String(error)}`,
				}),
			)
		}
	})

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2)
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
	}
	return bytes
}

/**
 * Discord Webhook Handler
 *
 * Handles incoming Discord interactions/webhooks for bidirectional sync.
 * Supports both PING verification and actual message events.
 */
export const HttpDiscordWebhooksLive = HttpApiBuilder.group(HazelApi, "discord-webhooks", (handlers) =>
	handlers.handle("receiveInteraction", ({ payload }) =>
		Effect.gen(function* () {
			const request = yield* HttpServerRequest.HttpServerRequest

			// Get Discord signature headers
			const signature = request.headers["x-signature-ed25519"] as string | undefined
			const timestamp = request.headers["x-signature-timestamp"] as string | undefined

			// Get the raw body for signature verification
			const rawBody = yield* pipe(
				request.text,
				Effect.orElseFail(
					() =>
						new InvalidDiscordWebhookSignature({
							message: "Invalid request body",
						}),
				),
			)

			// Get Discord public key from config
			const skipSignatureVerification = yield* Config.boolean("DISCORD_WEBHOOK_SKIP_SIGNATURE").pipe(
				Effect.orElseSucceed(() => false),
			)

			const publicKey = yield* Config.string("DISCORD_PUBLIC_KEY").pipe(
				Effect.catchAll(() =>
					skipSignatureVerification
						? Effect.succeed("")
						: Effect.fail(
								new InvalidDiscordWebhookSignature({
									message:
										"DISCORD_PUBLIC_KEY not configured. Set DISCORD_WEBHOOK_SKIP_SIGNATURE=true to disable in development.",
								}),
							),
				),
			)

			// Verify signature if public key is configured
			if (publicKey && !skipSignatureVerification) {
				if (!signature || !timestamp) {
					return yield* Effect.fail(
						new InvalidDiscordWebhookSignature({
							message: "Missing Discord signature headers",
						}),
					)
				}

				const isValid = yield* verifyDiscordSignature(publicKey, signature, timestamp, rawBody)
				if (!isValid) {
					return yield* Effect.fail(
						new InvalidDiscordWebhookSignature({
							message: "Invalid Discord webhook signature",
						}),
					)
				}
			} else if (!skipSignatureVerification) {
				yield* Effect.logWarning("Discord webhook signature verification skipped (no public key)")
			}

			// Parse the full payload
			const fullPayload = JSON.parse(rawBody)

			// Handle PING verification (type 1)
			if (payload.type === INTERACTION_TYPE_PING) {
				yield* Effect.logInfo("Received Discord PING verification request")
				return new DiscordWebhookResponse({ type: 1 })
			}

			// For other interaction types, process via the chat bridge
			yield* Effect.logInfo("Received Discord webhook event", {
				type: fullPayload.t,
				guildId: fullPayload.d?.guild_id,
				channelId: fullPayload.d?.channel_id,
			})

			// Parse the inbound payload using the Discord adapter
			const adapter = createDiscordAdapter()
			const inboundMessage = adapter.parseInboundPayload(fullPayload)

			if (!inboundMessage) {
				yield* Effect.logDebug("Skipping Discord event - not a processable message")
				return new DiscordWebhookResponse({ type: 1 })
			}

			// Get cluster URL and trigger the inbound workflow
			const clusterUrl = yield* Config.string("CLUSTER_URL").pipe(
				Effect.orElseFail(
					() =>
						new DiscordWebhookProcessingError({
							message: "CLUSTER_URL not configured",
						}),
				),
			)

			const client = yield* HttpApiClient.make(Cluster.WorkflowApi, {
				baseUrl: clusterUrl,
			})

			yield* client.workflows
				.ChatBridgeInboundWorkflow({
					payload: {
						provider: "discord",
						eventType: inboundMessage.isDelete
							? "delete"
							: inboundMessage.isEdit
								? "update"
								: "create",
						externalWorkspaceId: fullPayload.d?.guild_id ?? "",
						externalChannelId: inboundMessage.externalChannelId,
						externalMessageId: inboundMessage.externalMessageId,
						externalThreadId: inboundMessage.externalThreadId ?? null,
						externalParentMessageId: inboundMessage.externalParentMessageId ?? null,
						authorId: inboundMessage.authorId,
						authorName: inboundMessage.authorName,
						authorAvatarUrl: inboundMessage.authorAvatarUrl ?? null,
						content: inboundMessage.content,
						timestamp: DateTime.unsafeFromDate(inboundMessage.timestamp),
						rawPayload: inboundMessage.rawPayload,
					},
				})
				.pipe(
					Effect.tapError((err) =>
						Effect.logError("Failed to execute ChatBridgeInboundWorkflow", {
							error: err.message,
							externalMessageId: inboundMessage.externalMessageId,
						}),
					),
					Effect.catchTags({
						HttpApiDecodeError: (err) =>
							Effect.fail(
								new WorkflowInitializationError({
									message: "Failed to execute chat bridge workflow",
									cause: err.message,
								}),
							),
						ParseError: (err) =>
							Effect.fail(
								new WorkflowInitializationError({
									message: "Failed to execute chat bridge workflow",
									cause: String(err),
								}),
							),
						RequestError: (err) =>
							Effect.fail(
								new WorkflowInitializationError({
									message: "Failed to execute chat bridge workflow",
									cause: err.message,
								}),
							),
						ResponseError: (err) =>
							Effect.fail(
								new WorkflowInitializationError({
									message: "Failed to execute chat bridge workflow",
									cause: err.message,
								}),
							),
						// Workflow activity errors
						FindLinkedChannelsError: (err) =>
							Effect.fail(
								new WorkflowInitializationError({
									message: "Chat bridge workflow failed",
									cause: err.message,
								}),
							),
						CreateBridgedMessageError: (err) =>
							Effect.fail(
								new WorkflowInitializationError({
									message: "Chat bridge workflow failed",
									cause: err.message,
								}),
							),
						GetBridgedUserError: (err) =>
							Effect.fail(
								new WorkflowInitializationError({
									message: "Chat bridge workflow failed",
									cause: err.message,
								}),
							),
					}),
				)

			yield* Effect.logDebug("Discord webhook processed successfully", {
				externalMessageId: inboundMessage.externalMessageId,
			})

			return new DiscordWebhookResponse({ type: 1 })
		}).pipe(
			Effect.catchTag("WorkflowInitializationError", (err) =>
				Effect.fail(
					new DiscordWebhookProcessingError({
						message: "Failed to process Discord webhook",
						detail: err.cause,
					}),
				),
			),
		),
	),
)

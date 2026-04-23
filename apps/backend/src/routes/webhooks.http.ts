import { createHmac, timingSafeEqual } from "node:crypto"
import { verifyWebhook as verifyClerkWebhook } from "@clerk/backend/webhooks"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { HttpServerRequest } from "effect/unstable/http"
import { InternalServerError } from "@hazel/domain"
import { GitHubWebhookResponse, InvalidGitHubWebhookSignature } from "@hazel/domain/http"
import { Config, Effect, pipe, Redacted } from "effect"
import { HazelApi, InvalidWebhookSignature, WebhookResponse } from "../api"
import { ClerkSync } from "@hazel/backend-core/services"
import { ChannelAccessSyncService } from "../services/channel-access-sync"

export const HttpWebhookLive = HttpApiBuilder.group(HazelApi, "webhooks", (handlers) =>
	handlers
		.handle("clerk", (_args) =>
			Effect.gen(function* () {
				const request = yield* HttpServerRequest.HttpServerRequest

				const rawBody = yield* pipe(
					request.text,
					Effect.mapError(
						() =>
							new InvalidWebhookSignature({
								message: "Invalid request body",
							}),
					),
				)

				const signingSecret = yield* Effect.gen(function* () {
					return yield* Config.string("CLERK_WEBHOOK_SECRET")
				}).pipe(
					Effect.catchTag("ConfigError", (err) =>
						Effect.fail(
							new InternalServerError({
								message: "CLERK_WEBHOOK_SECRET not configured",
								detail: String(err),
							}),
						),
					),
				)

				// Reconstruct a WHATWG Request so @clerk/backend's verifyWebhook can read Svix headers.
				const stdRequest = new Request("https://webhooks.local/clerk", {
					method: "POST",
					headers: request.headers as unknown as HeadersInit,
					body: rawBody,
				})

				const event = yield* Effect.tryPromise({
					try: () => verifyClerkWebhook(stdRequest, { signingSecret }),
					catch: (error) =>
						new InvalidWebhookSignature({
							message: `Clerk webhook verification failed: ${error}`,
						}),
				})

				const syncService = yield* ClerkSync
				const channelAccessSync = yield* ChannelAccessSyncService
				const result = yield* syncService.processWebhookEvent(event)

				if (!result.success) {
					yield* Effect.logError("Failed to process Clerk webhook event", {
						type: event.type,
						error: result.error,
					})
				}

				// Re-sync channel access when membership changes come in via webhook (e.g. after
				// a Clerk invitation is accepted). The RPC-backed membership path does this
				// inline; Clerk-originated changes arrive here instead, so we replicate it.
				if (result.success && result.membershipChange) {
					yield* channelAccessSync
						.syncUserInOrganization(
							result.membershipChange.userId,
							result.membershipChange.organizationId,
						)
						.pipe(
							Effect.catch((err) =>
								Effect.logError("Failed to sync channel access after Clerk membership event", {
									userId: result.membershipChange!.userId,
									organizationId: result.membershipChange!.organizationId,
									removed: result.membershipRemoved,
									error: String(err),
								}),
							),
						)
				}

				return new WebhookResponse({
					success: result.success,
					message: result.success ? "Event processed successfully" : result.error,
				})
			}),
		)
		.handle("github", (_args) =>
			Effect.gen(function* () {
				const request = yield* HttpServerRequest.HttpServerRequest

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

				const rawBody = yield* pipe(
					request.text,
					Effect.mapError(
						() =>
							new InvalidGitHubWebhookSignature({
								message: "Invalid request body",
							}),
					),
				)

				const skipSignatureVerification = yield* Config.boolean("GITHUB_WEBHOOK_SKIP_SIGNATURE").pipe(
					Config.withDefault(false),
				)

				const webhookSecret = yield* Effect.gen(function* () {
					return yield* Config.redacted("GITHUB_WEBHOOK_SECRET")
				}).pipe(
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
					if (!signature) {
						yield* Effect.logWarning("Missing GitHub webhook signature header")
						return yield* Effect.fail(
							new InvalidGitHubWebhookSignature({
								message: "Missing x-hub-signature-256 header",
							}),
						)
					}

					const bodyHmac = createHmac("sha256", secretValue)
					bodyHmac.update(rawBody)
					const expectedSignature = `sha256=${bodyHmac.digest("hex")}`

					const signatureBuffer = Buffer.from(signature)
					const expectedBuffer = Buffer.from(expectedSignature)

					if (
						signatureBuffer.length !== expectedBuffer.length ||
						!timingSafeEqual(signatureBuffer, expectedBuffer)
					) {
						yield* Effect.logWarning("Invalid GitHub webhook signature", {
							eventType,
							deliveryId,
						})
						return yield* Effect.fail(
							new InvalidGitHubWebhookSignature({
								message: "Invalid webhook signature",
							}),
						)
					}
				}

				yield* Effect.logInfo("Received GitHub webhook", {
					eventType,
					deliveryId,
				})

				return new GitHubWebhookResponse({
					processed: true,
					messagesCreated: 0,
				})
			}).pipe(
				Effect.catchTag("ConfigError", (err) =>
					Effect.fail(
						new InternalServerError({ message: "Missing configuration", detail: String(err) }),
					),
				),
			),
		),
)

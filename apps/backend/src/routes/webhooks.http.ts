import { createHmac, timingSafeEqual } from "node:crypto"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { HttpServerRequest } from "effect/unstable/http"
import { GitHubWebhookResponse, InvalidGitHubWebhookSignature } from "@hazel/domain/http"
import type { Event } from "@workos-inc/node"
import { Config, Effect, pipe, Redacted } from "effect"
import { HazelApi, InvalidWebhookSignature, WebhookResponse } from "../api"
import { WorkOSSync } from "@hazel/backend-core/services"
import { WorkOSWebhookVerifier } from "../services/workos-webhook"

export const HttpWebhookLive = HttpApiBuilder.group(HazelApi, "webhooks", (handlers) =>
	handlers
		.handle("workos", (_args) =>
			Effect.gen(function* () {
				const request = yield* HttpServerRequest.HttpServerRequest

				const signatureHeader = request.headers["workos-signature"]
				if (!signatureHeader) {
					return yield* Effect.fail(
						new InvalidWebhookSignature({
							message: "Missing workos-signature header",
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

				const payload = JSON.parse(rawBody) as Event

				yield* Effect.logInfo(`Processing WorkOS webhook event: ${payload.event}`, {
					eventId: payload.id,
					eventType: payload.event,
				})

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
					yield* Effect.logDebug("Successfully processed webhook event", {
						eventId: payload.id,
						eventType: payload.event,
					})
				}

				return new WebhookResponse({
					success: result.success,
					message: result.success
						? "Event processed successfully"
						: "error" in result
							? result.error
							: "Unknown error",
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
					Effect.orElseFail(
						() =>
							new InvalidGitHubWebhookSignature({
								message: "Invalid request body",
							}),
					),
				)

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
			}),
		),
)
